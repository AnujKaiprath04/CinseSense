import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Movie, User, Rating, Watchlist
from app.services.retriever import retriever_agent
from app.services.explainer import explainer_agent

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()

    # Seed test dataset
    m1 = Movie(id=1, title="Inception", genres="Action,Sci-Fi", average_rating=4.8, rating_count=100)
    m2 = Movie(id=2, title="The Matrix", genres="Action,Sci-Fi", average_rating=4.7, rating_count=90)
    m3 = Movie(id=3, title="La La Land", genres="Romance,Drama", average_rating=4.5, rating_count=80)
    m4 = Movie(id=4, title="The Dark Knight", genres="Action,Crime", average_rating=4.9, rating_count=110)
    db.add_all([m1, m2, m3, m4])

    u1 = User(id=1, username="WarmUser", email="warm@test.com")
    u2 = User(id=2, username="ColdUser", email="cold@test.com")
    db.add_all([u1, u2])

    # WarmUser rated Inception 5.0
    r1 = Rating(user_id=1, movie_id=1, rating=5.0)
    db.add(r1)
    db.commit()

    yield db
    db.close()

def test_retriever_excludes_already_watched(db_session):
    candidates = retriever_agent.get_candidates(db_session, user_id=1, top_n=5)
    candidate_ids = [c[0].id for c in candidates]
    # Movie 1 (Inception) was watched, so it must be excluded
    assert 1 not in candidate_ids
    assert len(candidates) > 0

def test_retriever_cold_start_fallback(db_session):
    candidates = retriever_agent.get_candidates(db_session, user_id=2, top_n=5)
    # Cold start user should get highest rated candidates
    assert len(candidates) == 4
    top_movie = candidates[0][0]
    assert top_movie.title == "The Dark Knight"  # rating 4.9

def test_explainer_confidence_scoring(db_session):
    # 0 ratings -> LOW
    lvl, badge, is_exp = explainer_agent.determine_confidence(0)
    assert lvl == "LOW"
    assert is_exp is True

    # 3 ratings -> MEDIUM
    lvl, badge, is_exp = explainer_agent.determine_confidence(3)
    assert lvl == "MEDIUM"
    assert is_exp is False

    # 6 ratings -> HIGH
    lvl, badge, is_exp = explainer_agent.determine_confidence(6)
    assert lvl == "HIGH"
    assert is_exp is False
