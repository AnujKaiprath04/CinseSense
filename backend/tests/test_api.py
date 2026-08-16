import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db
from scripts.seed_db import seed_database

# Create shared in-memory test engine with StaticPool
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

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_demo_users_list():
    res = client.get("/api/auth/users")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4

def test_recommendations_endpoint():
    res = client.get("/api/recommendations?user_id=1&limit=3")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) > 0
    assert "explanation" in recs[0]
    assert "confidence_level" in recs[0]

def test_watchlist_operations():
    # Add
    res = client.post("/api/watchlist", json={"user_id": 1, "movie_id": 14})
    assert res.status_code == 201

    # Get
    res_get = client.get("/api/watchlist?user_id=1")
    assert res_get.status_code == 200
    assert len(res_get.json()) > 0

    # Delete
    res_del = client.delete("/api/watchlist?user_id=1&movie_id=14")
    assert res_del.status_code == 204

def test_admin_audit_logs():
    client.get("/api/recommendations?user_id=1&limit=2")
    res = client.get("/api/admin/audit-logs")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
