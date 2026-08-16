from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Notification, User
from app.schemas import NotificationSchema

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationSchema])
def get_user_notifications(
    user_id: int = Query(..., description="ID of active user"),
    db: Session = Depends(get_db)
):
    """Get list of notifications for user."""
    notifications = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
    if not notifications:
        # Auto-seed sample notifications for demo
        sample1 = Notification(
            user_id=user_id,
            title="🎬 New Arrival in Sci-Fi",
            message="Dune Part Two is now streaming! Matches your high interest in Sci-Fi.",
            category="new_arrival",
            is_read=False
        )
        sample2 = Notification(
            user_id=user_id,
            title="✨ AI Agent Insight",
            message="Based on your top rating of Parasite, we found 3 hidden gems.",
            category="recommendation",
            is_read=False
        )
        db.add_all([sample1, sample2])
        db.commit()
        notifications = [sample1, sample2]

    return notifications

@router.post("/{notification_id}/read", response_model=NotificationSchema)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Mark a notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
