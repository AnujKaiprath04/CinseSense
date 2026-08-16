import re
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Rating, Movie
from app.schemas import RecommendationSchema, ContextualRowSchema, VibeSearchQuery, VibeSearchResponse, CinePartyQuery, CinePartyResponse, RAGQuerySchema, RAGResponseSchema
from app.services.retriever import retriever_agent
from app.services.explainer import explainer_agent
from app.services.engagement import engagement_agent
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/contextual", response_model=List[ContextualRowSchema])
def get_contextual_rows(
    user_id: int = Query(..., description="ID of active demo user"),
    db: Session = Depends(get_db)
):
    """Get fast contextual recommendation rows."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Fetch top candidates once
    all_recs = get_recommendations(user_id=user_id, limit=12, db=db)
    if not all_recs:
        return []

    rows = []

    # Row 1: Primary Recommendations
    rows.append(ContextualRowSchema(
        row_title="Top AI Agent Picks for You",
        context_type="primary_recs",
        recommendations=all_recs[:4]
    ))

    # Row 2: "Because You Watched [Top Movie]"
    user_top_rating = db.query(Rating).filter(Rating.user_id == user_id).order_by(Rating.rating.desc()).first()
    anchor_title = "your favorite genres"
    if user_top_rating:
        anchor_movie = db.query(Movie).filter(Movie.id == user_top_rating.movie_id).first()
        if anchor_movie:
            anchor_title = anchor_movie.title

    row_2_recs = all_recs[4:8] if len(all_recs) >= 8 else all_recs[:4]
    rows.append(ContextualRowSchema(
        row_title=f"Because You Watched '{anchor_title}'",
        context_type="because_you_watched",
        reference_movie_title=anchor_title,
        recommendations=row_2_recs
    ))

    # Row 3: Exploratory & High-Rated Picks
    row_3_recs = all_recs[8:12] if len(all_recs) >= 12 else all_recs[:4]
    rows.append(ContextualRowSchema(
        row_title="Exploratory & Trending Hits",
        context_type="trending",
        recommendations=row_3_recs
    ))

    return rows

@router.post("/rag-assistant", response_model=RAGResponseSchema)
def grounded_rag_assistant(
    data: RAGQuerySchema,
    db: Session = Depends(get_db)
):
    """
    Grounded RAG (Retrieval-Augmented Generation) AI Assistant.
    Retrieves dense vector document chunks from database, injects into Groq LLaMA-3.3-70B,
    and returns grounded AI synthesis with source document citations.
    """
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = rag_engine.query(db=db, user_id=data.user_id, user_prompt=data.prompt)
    return RAGResponseSchema(
        ai_answer=result["ai_answer"],
        retrieved_documents=result["retrieved_documents"],
        recommendations=result["recommendations"]
    )

@router.post("/cineparty", response_model=CinePartyResponse)
def cineparty_group_recommendations(
    data: CinePartyQuery,
    db: Session = Depends(get_db)
):
    """CineParty Multi-User Taste Matcher."""
    users = db.query(User).filter(User.id.in_(data.user_ids)).all()
    if len(users) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least 2 valid users required for CineParty match")

    usernames = [u.username for u in users]
    user_names_str = " & ".join(usernames)

    user_genre_counts = {}
    all_recs_lists = []

    for u_id in data.user_ids:
        recs = get_recommendations(user_id=u_id, limit=6, db=db)
        all_recs_lists.append(recs)

        ratings = db.query(Rating).filter(Rating.user_id == u_id).all()
        for r in ratings:
            m = db.query(Movie).filter(Movie.id == r.movie_id).first()
            if m:
                for g in m.genres.split(","):
                    g_clean = g.strip()
                    user_genre_counts[g_clean] = user_genre_counts.get(g_clean, 0) + 1

    shared_genres = sorted(user_genre_counts, key=user_genre_counts.get, reverse=True)[:3]

    movie_scores = {}
    movie_objs = {}
    for rec_list in all_recs_lists:
        for r in rec_list:
            m_id = r.movie.id
            movie_scores[m_id] = movie_scores.get(m_id, 0.0) + r.retrieval_score
            movie_objs[m_id] = r.movie

    sorted_movie_ids = sorted(movie_scores, key=movie_scores.get, reverse=True)[:6]

    consensus_recs = []
    for m_id in sorted_movie_ids:
        m = movie_objs[m_id]
        score = min(0.98, round(movie_scores[m_id] / len(data.user_ids), 3))
        rec = RecommendationSchema(
            movie=m,
            retrieval_score=score,
            explanation=f"Consensus match for {user_names_str}! Blends shared interest in {', '.join(shared_genres[:2])}.",
            confidence_level="HIGH",
            confidence_badge="Joint Match",
            is_exploratory=False,
            context_reference=f"CineParty Group Match ({user_names_str})"
        )
        consensus_recs.append(rec)

    compatibility_score = min(98.5, max(75.0, round(84.0 + (len(shared_genres) * 4.5), 1)))
    group_rationale = (
        f"CineParty Multi-Agent Matcher analyzed watch profiles for {user_names_str}. "
        f"Found a high joint compatibility score of {compatibility_score}% with shared love for {', '.join(shared_genres)}."
    )

    return CinePartyResponse(
        compatibility_score=compatibility_score,
        shared_genres=shared_genres,
        group_rationale=group_rationale,
        recommendations=consensus_recs
    )

@router.post("/vibe-search", response_model=VibeSearchResponse)
def vibe_search_copilot(
    data: VibeSearchQuery,
    db: Session = Depends(get_db)
):
    """AI Conversational Co-Pilot Vibe Search."""
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    prompt_lower = data.prompt.lower().strip()

    extracted_genres = []
    for g in ["action", "sci-fi", "comedy", "drama", "thriller", "romance", "horror", "animation", "crime", "adventure"]:
        if g in prompt_lower:
            extracted_genres.append(g.capitalize())

    max_duration = 180
    if "under 2 hours" in prompt_lower or "short" in prompt_lower or "120" in prompt_lower:
        max_duration = 120
    elif "under 90" in prompt_lower or "quick" in prompt_lower:
        max_duration = 90

    q = db.query(Movie)
    if extracted_genres:
        q = q.filter(Movie.genres.ilike(f"%{extracted_genres[0]}%"))
    
    words = [w for w in prompt_lower.split() if len(w) > 3 and w not in ["like", "movie", "movies", "show", "find", "under", "hours"]]
    if words:
        keyword = words[0]
        q = q.filter(Movie.overview.ilike(f"%{keyword}%") | Movie.genres.ilike(f"%{keyword}%"))

    movies = q.filter(Movie.duration_minutes <= max_duration).order_by(Movie.average_rating.desc()).limit(4).all()
    if not movies:
        movies = db.query(Movie).order_by(Movie.average_rating.desc()).limit(4).all()

    recommendations = []
    for m in movies:
        expl_data = explainer_agent.generate_explanation(
            db=db,
            user_id=data.user_id,
            movie=m,
            retrieval_score=0.88,
            context_reference=f"Vibe Search Match: '{data.prompt}'"
        )
        recommendations.append(RecommendationSchema(
            movie=m,
            retrieval_score=0.88,
            explanation=expl_data["explanation"],
            confidence_level=expl_data["confidence_level"],
            confidence_badge=expl_data["confidence_badge"],
            is_exploratory=expl_data["is_exploratory"],
            context_reference=f"Vibe Search Match: '{data.prompt}'"
        ))

    genre_str = ", ".join(extracted_genres) if extracted_genres else "movie catalog"
    ai_reply = (
        f"I analyzed your request '{data.prompt}' and found top matches in {genre_str} "
        f"matching your vibe! Check out these recommendations:"
    )

    return VibeSearchResponse(
        ai_reply=ai_reply,
        recommendations=recommendations,
        extracted_intent={
            "genres": extracted_genres,
            "max_duration": max_duration,
            "prompt": data.prompt
        }
    )

@router.get("", response_model=List[RecommendationSchema])
def get_recommendations(
    user_id: int = Query(..., description="ID of active demo user"),
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get personalized recommendations for user_id."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    candidates = retriever_agent.get_candidates(db, user_id=user_id, top_n=limit)

    recommendations = []
    for movie, retrieval_score, context_ref in candidates:
        expl_data = explainer_agent.generate_explanation(
            db=db,
            user_id=user_id,
            movie=movie,
            retrieval_score=retrieval_score,
            context_reference=context_ref
        )

        rec = RecommendationSchema(
            movie=movie,
            retrieval_score=retrieval_score,
            explanation=expl_data["explanation"],
            confidence_level=expl_data["confidence_level"],
            confidence_badge=expl_data["confidence_badge"],
            is_exploratory=expl_data["is_exploratory"],
            context_reference=context_ref
        )
        recommendations.append(rec)

        engagement_agent.log_action(
            db=db,
            user_id=user_id,
            movie_id=movie.id,
            action_type="recommendation_shown",
            retrieval_score=retrieval_score,
            explanation_text=expl_data["explanation"],
            confidence_level=expl_data["confidence_level"],
            details=f"Context: {context_ref}"
        )

    return recommendations
