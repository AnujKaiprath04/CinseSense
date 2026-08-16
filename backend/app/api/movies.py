from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Movie
from app.schemas import MovieSchema

router = APIRouter(prefix="/movies", tags=["movies"])

@router.get("", response_model=List[MovieSchema])
def get_movies(
    db: Session = Depends(get_db),
    query: Optional[str] = Query(None, description="Search by title, director, cast, or overview"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    mood: Optional[str] = Query(None, description="Filter by emotional mood (mind_bending, adrenaline, cozy, dark_gritty, thought_provoking)"),
    sort_by: Optional[str] = Query("rating", description="rating, year_newest, year_oldest, title"),
    skip: int = 0,
    limit: int = 24
):
    """Browse, search, and sort movie catalog with mood filtering."""
    q = db.query(Movie)
    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            Movie.title.ilike(search_pattern) |
            Movie.overview.ilike(search_pattern) |
            Movie.director.ilike(search_pattern) |
            Movie.cast.ilike(search_pattern)
        )
    if genre:
        q = q.filter(Movie.genres.ilike(f"%{genre}%"))
    if mood:
        q = q.filter((Movie.mood == mood) | (Movie.genres.ilike(f"%{mood}%")))

    # Sorting
    if sort_by == "year_newest":
        q = q.order_by(Movie.release_year.desc().nullslast())
    elif sort_by == "year_oldest":
        q = q.order_by(Movie.release_year.asc().nullslast())
    elif sort_by == "title":
        q = q.order_by(Movie.title.asc())
    else:
        q = q.order_by(Movie.average_rating.desc())

    movies = q.offset(skip).limit(limit).all()
    return movies

@router.get("/genres", response_model=List[str])
def get_all_genres(db: Session = Depends(get_db)):
    """Get list of unique genres present in movie database."""
    movies = db.query(Movie).limit(1000).all()
    genres_set = set()
    for m in movies:
        for g in m.genres.split(","):
            genres_set.add(g.strip())
    return sorted(list(genres_set))

@router.get("/{movie_id}", response_model=MovieSchema)
def get_movie_detail(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    return movie
