import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db
from scripts.seed_db import seed_database

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize schema and seed data immediately
Base.metadata.create_all(bind=engine)
db_init = TestingSessionLocal()
seed_database(db_init)
db_init.close()

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_full_recommend_explain_log_flow():
    """
    Integration Test:
    1. Request recommendations for User 1 (Retriever + Explainer).
    2. Verify returned items have rationale and confidence level.
    3. Click on a recommended movie (Engagement logger).
    4. Save to Watchlist.
    5. Verify decision and interactions are present in Admin Audit Log.
    """
    # 1. Fetch Recommendations
    rec_res = client.get("/api/recommendations?user_id=1&limit=3")
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) > 0
    target_movie = recs[0]["movie"]

    # 2. Record Click Interaction
    click_res = client.post("/api/engagement/interact", json={
        "user_id": 1,
        "movie_id": target_movie["id"],
        "action_type": "click",
        "retrieval_score": recs[0]["retrieval_score"],
        "explanation_text": recs[0]["explanation"],
        "confidence_level": recs[0]["confidence_level"],
        "details": "User clicked recommendation card"
    })
    assert click_res.status_code == 200

    # 3. Save to Watchlist
    w_res = client.post("/api/watchlist", json={
        "user_id": 1,
        "movie_id": target_movie["id"]
    })
    assert w_res.status_code == 201

    # 4. Verify Admin Audit Logs contain all logged events
    audit_res = client.get("/api/admin/audit-logs")
    assert audit_res.status_code == 200
    logs = audit_res.json()["logs"]

    action_types = [log["action_type"] for log in logs]
    assert "recommendation_shown" in action_types
    assert "click" in action_types
    assert "watchlist_add" in action_types
