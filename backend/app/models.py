from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    watchlist_items = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    interaction_logs = relationship("InteractionLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    genres = Column(String(255), nullable=False)  # Comma separated (e.g., Action,Sci-Fi)
    release_year = Column(Integer, nullable=True)
    overview = Column(Text, nullable=True)
    director = Column(String(255), nullable=True)
    cast = Column(String(512), nullable=True)
    duration_minutes = Column(Integer, nullable=True, default=120)
    poster_url = Column(String(512), nullable=True)
    backdrop_url = Column(String(512), nullable=True)
    trailer_url = Column(String(512), nullable=True)
    mood = Column(String(100), nullable=True, default="mind_bending")
    average_rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)

    ratings = relationship("Rating", back_populates="movie", cascade="all, delete-orphan")
    watchlist_items = relationship("Watchlist", back_populates="movie", cascade="all, delete-orphan")
    interaction_logs = relationship("InteractionLog", back_populates="movie", cascade="all, delete-orphan")

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False, index=True)
    rating = Column(Float, nullable=False)  # 0.5 to 5.0
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ratings")
    movie = relationship("Movie", back_populates="ratings")

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False, index=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="watchlist_items")
    movie = relationship("Movie", back_populates="watchlist_items")

class InteractionLog(Base):
    __tablename__ = "interaction_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=True, index=True)
    action_type = Column(String(50), nullable=False)  # recommendation_shown, click, watchlist_add, dismiss, rate
    retrieval_score = Column(Float, nullable=True)
    explanation_text = Column(Text, nullable=True)
    confidence_level = Column(String(20), nullable=True)  # HIGH, MEDIUM, LOW
    details = Column(Text, nullable=True)  # JSON or descriptive text

    user = relationship("User", back_populates="interaction_logs")
    movie = relationship("Movie", back_populates="interaction_logs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="recommendation")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
