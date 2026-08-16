from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class MovieBase(BaseModel):
    title: str
    genres: str
    release_year: Optional[int] = None
    overview: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    duration_minutes: Optional[int] = 120
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    trailer_url: Optional[str] = None
    mood: Optional[str] = "mind_bending"

class MovieSchema(MovieBase):
    id: int
    average_rating: float = 0.0
    rating_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    username: str
    email: str
    password: Optional[str] = "cinesense123"

class UserRegisterSchema(BaseModel):
    username: str
    email: str
    password: str = Field(..., min_length=4)

class UserLoginSchema(BaseModel):
    email_or_username: str
    password: str

class UserSchema(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AuthResponseSchema(BaseModel):
    user: UserSchema
    token: str
    message: str

class NotificationSchema(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    category: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RatingCreate(BaseModel):
    user_id: int
    movie_id: int
    rating: float = Field(..., ge=0.5, le=5.0)

class RatingSchema(RatingCreate):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class WatchlistCreate(BaseModel):
    user_id: int
    movie_id: int

class WatchlistSchema(WatchlistCreate):
    id: int
    added_at: datetime
    movie: Optional[MovieSchema] = None

    model_config = ConfigDict(from_attributes=True)

class RecommendationSchema(BaseModel):
    movie: MovieSchema
    retrieval_score: float
    explanation: str
    confidence_level: str  # HIGH, MEDIUM, LOW
    confidence_badge: str  # e.g., "High Match", "Exploratory Pick"
    is_exploratory: bool = False
    context_reference: Optional[str] = None  # e.g., "Because you watched Inception"

    model_config = ConfigDict(from_attributes=True)

class ContextualRowSchema(BaseModel):
    row_title: str
    context_type: str  # e.g., "because_you_watched", "top_rated_genre", "trending"
    reference_movie_title: Optional[str] = None
    recommendations: List[RecommendationSchema]

class VibeSearchQuery(BaseModel):
    user_id: int
    prompt: str = Field(..., min_length=2)

class VibeSearchResponse(BaseModel):
    ai_reply: str
    recommendations: List[RecommendationSchema]
    extracted_intent: Dict[str, Any]

class CinePartyQuery(BaseModel):
    user_ids: List[int] = Field(..., min_length=2)

class CinePartyResponse(BaseModel):
    compatibility_score: float
    shared_genres: List[str]
    group_rationale: str
    recommendations: List[RecommendationSchema]

class RAGQuerySchema(BaseModel):
    user_id: int
    prompt: str = Field(..., min_length=2)

class RAGResponseSchema(BaseModel):
    ai_answer: str
    retrieved_documents: List[Dict[str, Any]]
    recommendations: List[RecommendationSchema]

class InteractionCreate(BaseModel):
    user_id: int
    movie_id: Optional[int] = None
    action_type: str  # recommendation_shown, click, watchlist_add, dismiss, rate
    retrieval_score: Optional[float] = None
    explanation_text: Optional[str] = None
    confidence_level: Optional[str] = None
    details: Optional[str] = None

class InteractionLogSchema(BaseModel):
    id: int
    timestamp: datetime
    user_id: int
    movie_id: Optional[int] = None
    action_type: str
    retrieval_score: Optional[float] = None
    explanation_text: Optional[str] = None
    confidence_level: Optional[str] = None
    details: Optional[str] = None
    movie: Optional[MovieSchema] = None
    user: Optional[UserSchema] = None

    model_config = ConfigDict(from_attributes=True)

class AnalyticsSummary(BaseModel):
    total_recommendations_served: int
    total_user_interactions: int
    click_through_rate: float
    watchlist_add_rate: float
    confidence_breakdown: dict
    top_recommended_genres: dict
    user_ratings_distribution: dict
