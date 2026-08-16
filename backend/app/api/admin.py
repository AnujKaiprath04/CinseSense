from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.schemas import InteractionLogSchema, AnalyticsSummary
from app.services.engagement import engagement_agent
from app.services.custom_ml_model import cinesense_ml_model

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    confidence: Optional[str] = Query(None, description="Filter by HIGH, MEDIUM, LOW"),
    action: Optional[str] = Query(None, description="Filter by action_type")
):
    """Responsible AI Audit Log endpoint: lists all agent actions and user interactions."""
    logs, total_count = engagement_agent.get_audit_logs(
        db=db,
        limit=limit,
        offset=offset,
        confidence_filter=confidence,
        action_filter=action
    )

    items = []
    for log in logs:
        item = InteractionLogSchema.model_validate(log)
        items.append(item)

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "logs": items
    }

@router.get("/analytics", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    """Fetch engagement statistics and agent metrics for Recharts dashboard."""
    stats = engagement_agent.get_analytics_summary(db)
    return stats

@router.get("/model-metrics")
def get_model_metrics(db: Session = Depends(get_db)):
    """Get live precision and accuracy metrics for custom SVD model."""
    return cinesense_ml_model.get_model_metrics(db)

@router.post("/retrain")
def retrain_model(db: Session = Depends(get_db)):
    """Trigger online SGD retraining of CineSenseMLModel."""
    cinesense_ml_model.fit(db)
    metrics = cinesense_ml_model.get_model_metrics(db)
    return {
        "status": "success",
        "message": "CineSense SVD Matrix Factorization model retrained successfully via SGD!",
        "metrics": metrics
    }
