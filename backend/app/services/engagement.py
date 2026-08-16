import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import InteractionLog, Movie, User, Rating, Watchlist

logger = logging.getLogger(__name__)

class EngagementAgent:
    """
    Engagement Agent: Records every recommendation shown, user click, watchlist addition, dismissal, or rating.
    Provides Responsible AI audit logging and analytics calculations.
    """

    def log_action(
        self,
        db: Session,
        user_id: int,
        action_type: str,
        movie_id: Optional[int] = None,
        retrieval_score: Optional[float] = None,
        explanation_text: Optional[str] = None,
        confidence_level: Optional[str] = None,
        details: Optional[str] = None
    ) -> InteractionLog:
        """Log agent decision or user interaction to interaction_logs table."""
        log_entry = InteractionLog(
            user_id=user_id,
            movie_id=movie_id,
            action_type=action_type,
            retrieval_score=retrieval_score,
            explanation_text=explanation_text,
            confidence_level=confidence_level,
            details=details,
            timestamp=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        logger.info(f"EngagementAgent: Logged action '{action_type}' for user_id={user_id}, movie_id={movie_id}")
        return log_entry

    def get_audit_logs(
        self,
        db: Session,
        limit: int = 50,
        offset: int = 0,
        confidence_filter: Optional[str] = None,
        action_filter: Optional[str] = None
    ) -> Tuple[List[InteractionLog], int]:
        """Fetch audit logs with optional filters."""
        query = db.query(InteractionLog)
        if confidence_filter:
            query = query.filter(InteractionLog.confidence_level == confidence_filter.upper())
        if action_filter:
            query = query.filter(InteractionLog.action_type == action_filter)

        total_count = query.count()
        logs = query.order_by(InteractionLog.timestamp.desc()).offset(offset).limit(limit).all()
        return logs, total_count

    def get_analytics_summary(self, db: Session) -> Dict[str, Any]:
        """Compute aggregate engagement metrics & analytics for Responsible AI dashboard."""
        total_recs = db.query(InteractionLog).filter(InteractionLog.action_type == "recommendation_shown").count()
        total_clicks = db.query(InteractionLog).filter(InteractionLog.action_type == "click").count()
        total_watchlist_adds = db.query(InteractionLog).filter(InteractionLog.action_type == "watchlist_add").count()
        total_interactions = db.query(InteractionLog).count()

        ctr = round((total_clicks / max(total_recs, 1)) * 100, 2)
        watchlist_rate = round((total_watchlist_adds / max(total_recs, 1)) * 100, 2)

        # Confidence breakdown
        high_count = db.query(InteractionLog).filter(InteractionLog.confidence_level == "HIGH").count()
        medium_count = db.query(InteractionLog).filter(InteractionLog.confidence_level == "MEDIUM").count()
        low_count = db.query(InteractionLog).filter(InteractionLog.confidence_level == "LOW").count()

        confidence_breakdown = {
            "HIGH": high_count,
            "MEDIUM": medium_count,
            "LOW": low_count
        }

        # Top recommended genres
        recs = db.query(InteractionLog).filter(InteractionLog.movie_id.isnot(None)).limit(200).all()
        genre_counts: Dict[str, int] = {}
        for log in recs:
            if log.movie:
                for g in log.movie.genres.split(","):
                    g_clean = g.strip()
                    genre_counts[g_clean] = genre_counts.get(g_clean, 0) + 1

        sorted_genres = dict(sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:5])

        # Rating distribution stats
        r_5 = db.query(Rating).filter(Rating.rating >= 4.5).count()
        r_4 = db.query(Rating).filter(Rating.rating >= 3.5, Rating.rating < 4.5).count()
        r_3 = db.query(Rating).filter(Rating.rating >= 2.5, Rating.rating < 3.5).count()

        return {
            "total_recommendations_served": total_recs,
            "total_user_interactions": total_interactions,
            "click_through_rate": ctr,
            "watchlist_add_rate": watchlist_rate,
            "confidence_breakdown": confidence_breakdown,
            "top_recommended_genres": sorted_genres,
            "user_ratings_distribution": {
                "5 Stars": r_5,
                "4 Stars": r_4,
                "3 Stars": r_3
            }
        }

engagement_agent = EngagementAgent()
