from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Rating, Movie
from app.schemas import InteractionCreate, InteractionLogSchema, RatingCreate
from app.services.engagement import engagement_agent

router = APIRouter(prefix="/engagement", tags=["engagement"])

@router.post("/interact", response_model=InteractionLogSchema)
def record_interaction(data: InteractionCreate, db: Session = Depends(get_db)):
    """Log user interactions (clicks, dismissals, detail opens)."""
    log_entry = engagement_agent.log_action(
        db=db,
        user_id=data.user_id,
        movie_id=data.movie_id,
        action_type=data.action_type,
        retrieval_score=data.retrieval_score,
        explanation_text=data.explanation_text,
        confidence_level=data.confidence_level,
        details=data.details
    )
    return log_entry

@router.post("/rate", status_code=status.HTTP_201_CREATED)
def rate_movie(data: RatingCreate, db: Session = Depends(get_db)):
    """Rate a movie (used in onboarding flow or movie detail panel)."""
    existing_rating = db.query(Rating).filter(
        Rating.user_id == data.user_id,
        Rating.movie_id == data.movie_id
    ).first()

    if existing_rating:
        existing_rating.rating = data.rating
    else:
        new_rating = Rating(user_id=data.user_id, movie_id=data.movie_id, rating=data.rating)
        db.add(new_rating)

    db.commit()

    # Recalculate movie average rating
    all_ratings = db.query(Rating).filter(Rating.movie_id == data.movie_id).all()
    if all_ratings:
        movie = db.query(Movie).filter(Movie.id == data.movie_id).first()
        if movie:
            movie.average_rating = round(sum(r.rating for r in all_ratings) / len(all_ratings), 1)
            movie.rating_count = len(all_ratings)
            db.commit()

    # Log interaction
    engagement_agent.log_action(
        db=db,
        user_id=data.user_id,
        movie_id=data.movie_id,
        action_type="rate",
        details=f"Rated {data.rating}/5.0"
    )

    return {"message": "Rating saved successfully", "movie_id": data.movie_id, "rating": data.rating}
