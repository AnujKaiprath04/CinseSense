import logging
import numpy as np
from typing import List, Tuple, Dict
from sqlalchemy.orm import Session
from app.models import Movie, Rating, InteractionLog, Watchlist
from app.services.custom_ml_model import cinesense_ml_model

logger = logging.getLogger(__name__)

class RetrieverAgent:
    """
    Retriever Agent: Powered by custom CineSenseMLModel (SVD Matrix Factorization + Multi-Feature TF-IDF).
    """

    def __init__(self):
        self._is_indexed = False

    def build_content_index(self, db: Session):
        """Train custom ML model."""
        cinesense_ml_model.fit(db)
        self._is_indexed = True

    def get_candidates(self, db: Session, user_id: int, top_n: int = 10) -> List[Tuple[Movie, float, str]]:
        """
        Get candidate recommendations for user_id using custom ML model.
        Returns tuples of: (Movie, retrieval_score, context_reference)
        """
        if not self._is_indexed:
            self.build_content_index(db)

        all_movies = db.query(Movie).all()
        if not all_movies:
            return []

        # Find user's existing ratings and watchlist
        user_ratings = db.query(Rating).filter(Rating.user_id == user_id).all()
        user_watchlist = db.query(Watchlist).filter(Watchlist.user_id == user_id).all()

        rated_movie_ids = {r.movie_id for r in user_ratings}
        watchlist_movie_ids = {w.movie_id for w in user_watchlist}
        exclude_movie_ids = rated_movie_ids.union(watchlist_movie_ids)

        # Get user dismissals
        dismissed_logs = db.query(InteractionLog).filter(
            InteractionLog.user_id == user_id,
            InteractionLog.action_type == "dismiss"
        ).all()
        dismissed_ids = {log.movie_id for log in dismissed_logs if log.movie_id}
        exclude_movie_ids = exclude_movie_ids.union(dismissed_ids)

        # Interaction re-ranking boost
        recent_interactions = db.query(InteractionLog).filter(
            InteractionLog.user_id == user_id,
            InteractionLog.action_type.in_(["click", "watchlist_add"])
        ).order_by(InteractionLog.timestamp.desc()).limit(20).all()

        boosted_genres: Dict[str, float] = {}
        for log in recent_interactions:
            if log.movie_id:
                m = db.query(Movie).filter(Movie.id == log.movie_id).first()
                if m:
                    for g in m.genres.split(","):
                        g_clean = g.strip()
                        boosted_genres[g_clean] = boosted_genres.get(g_clean, 0.0) + 0.15

        # COLD START HANDLER (0 ratings)
        if not user_ratings:
            logger.info(f"RetrieverAgent: Cold-start user_id={user_id}. Returning top exploratory picks.")
            available_movies = [m for m in all_movies if m.id not in exclude_movie_ids]
            available_movies.sort(key=lambda m: (m.average_rating * 0.7 + min(m.rating_count, 500) * 0.001), reverse=True)
            return [(m, round(m.average_rating / 5.0, 3), "Trending on CineSense") for m in available_movies[:top_n]]

        # WARM USER HANDLER (Custom SVD + Multi-Feature TF-IDF)
        top_liked = sorted(user_ratings, key=lambda r: r.rating, reverse=True)[:5]
        anchor_movie = db.query(Movie).filter(Movie.id == top_liked[0].movie_id).first() if top_liked else None
        anchor_title = anchor_movie.title if anchor_movie else "your favorites"

        scored_candidates = []
        for m in all_movies:
            if m.id in exclude_movie_ids:
                continue

            # Predict custom model score
            ml_score = cinesense_ml_model.predict_score(user_id=user_id, movie=m)

            # Add interaction boost
            genre_boost = 0.0
            for g in m.genres.split(","):
                genre_boost += boosted_genres.get(g.strip(), 0.0)

            final_score = min(max(ml_score + genre_boost, 0.1), 0.99)
            scored_candidates.append((m, round(final_score, 3), f"Because you enjoyed {anchor_title}"))

        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        return scored_candidates[:top_n]

retriever_agent = RetrieverAgent()
