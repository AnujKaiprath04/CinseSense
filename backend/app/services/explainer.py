import logging
import os
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
import anthropic
from app.config import settings
from app.models import Movie, Rating

logger = logging.getLogger(__name__)

# Try importing groq if installed
GROQ_AVAILABLE = False
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

class ExplainerAgent:
    """
    Explainer Agent: Responsible AI LLM-based explanation generator.
    Supports Groq AI (Llama-3.3 / Llama-3) for fast LPU inference,
    Anthropic Claude API, and grounded rule-based explainability fallbacks.
    """

    def __init__(self):
        self.groq_key = settings.GROQ_API_KEY
        self.anthropic_key = settings.ANTHROPIC_API_KEY

        self.groq_client = None
        self.anthropic_client = None

        if self.groq_key and GROQ_AVAILABLE:
            try:
                self.groq_client = Groq(api_key=self.groq_key)
                logger.info("ExplainerAgent: Initialized Groq AI client successfully.")
            except Exception as e:
                logger.warning(f"ExplainerAgent: Failed to initialize Groq client: {e}")

        if self.anthropic_key:
            try:
                self.anthropic_client = anthropic.Anthropic(api_key=self.anthropic_key)
                logger.info("ExplainerAgent: Initialized Anthropic Claude client successfully.")
            except Exception as e:
                logger.warning(f"ExplainerAgent: Failed to initialize Anthropic client: {e}")

    def determine_confidence(self, rating_count: int) -> Tuple[str, str, bool]:
        """
        Returns (confidence_level, confidence_badge, is_exploratory)
        - HIGH: >= 5 ratings ("High Match - Personalized")
        - MEDIUM: 1-4 ratings ("Good Match - Preference Fit")
        - LOW: 0 ratings ("Low Confidence — Exploratory Pick", is_exploratory=True)
        """
        if rating_count >= 5:
            return "HIGH", "High Match", False
        elif rating_count >= 1:
            return "MEDIUM", "Good Match", False
        else:
            return "LOW", "Low Confidence — Exploratory Pick", True

    def generate_explanation(
        self,
        db: Session,
        user_id: int,
        movie: Movie,
        retrieval_score: float,
        context_reference: str = None
    ) -> Dict[str, str]:
        """
        Generates explanation and metadata for a candidate movie recommendation.
        Returns dict with:
          - explanation: str
          - confidence_level: str
          - confidence_badge: str
          - is_exploratory: bool
        """
        ratings = db.query(Rating).filter(Rating.user_id == user_id).all()
        rating_count = len(ratings)

        confidence_level, confidence_badge, is_exploratory = self.determine_confidence(rating_count)

        # COLD START HANDLER
        if confidence_level == "LOW" or rating_count == 0:
            genres_list = [g.strip() for g in movie.genres.split(",")]
            genre_str = ", ".join(genres_list[:2]) if genres_list else "Popular Movies"
            explanation = (
                f"Suggested as a top-rated exploratory pick in {genre_str}. "
                "Rate a few titles in your feed to personalize your profile!"
            )
            return {
                "explanation": explanation,
                "confidence_level": confidence_level,
                "confidence_badge": confidence_badge,
                "is_exploratory": True
            }

        # Warm User history summary for grounded LLM prompt
        watched_items = []
        user_genres = {}
        for r in ratings:
            m = db.query(Movie).filter(Movie.id == r.movie_id).first()
            if m:
                watched_items.append({"title": m.title, "rating": r.rating, "genres": m.genres})
                for g in m.genres.split(","):
                    g_clean = g.strip()
                    user_genres[g_clean] = user_genres.get(g_clean, 0) + 1

        top_watched = sorted(watched_items, key=lambda x: x["rating"], reverse=True)[:3]
        top_titles_str = ", ".join([f"'{item['title']}' ({item['rating']}/5⭐)" for item in top_watched])
        top_genres_str = ", ".join(sorted(user_genres, key=user_genres.get, reverse=True)[:3])

        # Rule-based fallback template
        fallback_explanation = (
            f"Because you enjoyed {top_watched[0]['title'] if top_watched else 'similar titles'} "
            f"and frequently watch {top_genres_str or movie.genres}, '{movie.title}' is a strong match for your taste."
        )

        prompt = f"""You are the CineSense Explainer Agent, a Responsible AI movie recommendation guide.

Task: Write a concise 1-2 sentence plain-English rationale explaining why '{movie.title}' (Genres: {movie.genres}, Overview: {movie.overview[:150] if movie.overview else 'N/A'}) was recommended to User {user_id}.

STRICT GROUNDING RULES:
1. ONLY reference titles or genres from the user's real watch history provided below:
   - User's Top Rated Movies: {top_titles_str}
   - User's Favorite Genres: {top_genres_str}
2. NEVER fabricate or invent viewing history, movies, or genres that are not listed above.
3. Write naturally, directly addressing the user (e.g. "Because you enjoyed [Title]...").
4. Keep it under 35 words.

Explanation:"""

        # 1. Try Groq AI (Fast LPU Inference)
        if self.groq_client and self.groq_key:
            try:
                response = self.groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=100,
                    temperature=0.3,
                )
                explanation_text = response.choices[0].message.content.strip()
                if explanation_text:
                    logger.info(f"ExplainerAgent: Groq AI generated rationale for user_id={user_id}, movie_id={movie.id}")
                    return {
                        "explanation": explanation_text,
                        "confidence_level": confidence_level,
                        "confidence_badge": confidence_badge,
                        "is_exploratory": is_exploratory
                    }
            except Exception as e:
                logger.error(f"ExplainerAgent: Groq AI call note ({e}). Trying fallback.")

        # 2. Try Anthropic Claude API
        if self.anthropic_client and self.anthropic_key:
            try:
                response = self.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=100,
                    temperature=0.3,
                    messages=[{"role": "user", "content": prompt}]
                )
                explanation_text = response.content[0].text.strip()
                if explanation_text:
                    logger.info(f"ExplainerAgent: Claude generated explanation for user_id={user_id}, movie_id={movie.id}")
                    return {
                        "explanation": explanation_text,
                        "confidence_level": confidence_level,
                        "confidence_badge": confidence_badge,
                        "is_exploratory": is_exploratory
                    }
            except Exception as e:
                logger.error(f"ExplainerAgent: Claude API call note ({e}). Falling back to rule engine.")

        # 3. Rule-based grounded explanation fallback
        return {
            "explanation": fallback_explanation,
            "confidence_level": confidence_level,
            "confidence_badge": confidence_badge,
            "is_exploratory": is_exploratory
        }

explainer_agent = ExplainerAgent()
