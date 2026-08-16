from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Watchlist, Movie, User
from app.schemas import WatchlistSchema, WatchlistCreate
from app.services.engagement import engagement_agent

router = APIRouter(prefix="/watchlist", tags=["watchlist"])

@router.get("", response_model=List[WatchlistSchema])
def get_user_watchlist(user_id: int = Query(...), db: Session = Depends(get_db)):
    """Fetch all saved watchlist items for user."""
    items = db.query(Watchlist).filter(Watchlist.user_id == user_id).order_by(Watchlist.added_at.desc()).all()
    return items

@router.post("", response_model=WatchlistSchema, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(data: WatchlistCreate, db: Session = Depends(get_db)):
    """Add a movie to user's watchlist."""
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == data.user_id,
        Watchlist.movie_id == data.movie_id
    ).first()
    if existing:
        return existing

    watchlist_item = Watchlist(user_id=data.user_id, movie_id=data.movie_id)
    db.add(watchlist_item)
    db.commit()
    db.refresh(watchlist_item)

    # Audit Log interaction
    engagement_agent.log_action(
        db=db,
        user_id=data.user_id,
        movie_id=data.movie_id,
        action_type="watchlist_add",
        details="Movie added to personal watchlist"
    )

    return watchlist_item

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(user_id: int = Query(...), movie_id: int = Query(...), db: Session = Depends(get_db)):
    """Remove a movie from user's watchlist."""
    item = db.query(Watchlist).filter(
        Watchlist.user_id == user_id,
        Watchlist.movie_id == movie_id
    ).first()
    if item:
        db.delete(item)
        db.commit()

        # Audit Log interaction
        engagement_agent.log_action(
            db=db,
            user_id=user_id,
            movie_id=movie_id,
            action_type="watchlist_remove",
            details="Movie removed from watchlist"
        )
    return None
