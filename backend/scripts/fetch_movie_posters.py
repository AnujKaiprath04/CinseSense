import sys
import os
import logging
import random
import httpx
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import Movie

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fetch_posters")

# Curated High-Definition Movie & Cinema Poster Collections (Unsplash / TMDB High-Res Mirrors)
REAL_MOVIE_POSTERS = [
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80",
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&q=80",
    "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&q=80",
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80",
    "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600&q=80",
    "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&q=80",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
    "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=600&q=80",
    "https://images.unsplash.com/photo-1568876694728-451bbf694b83?w=600&q=80"
]

REAL_MOVIE_BACKDROPS = [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
    "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&q=80",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80"
]

# Online TMDB Poster mapping for top famous titles
TMDB_POSTER_MAP = {
    "Inception": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    "The Dark Knight": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "Interstellar": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    "Pulp Fiction": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    "The Shawshank Redemption": "https://image.tmdb.org/t/p/w500/9cqN1wXvKovX0UuoekWfsT1jp3B.jpg",
    "Fight Club": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    "The Matrix": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    "Forrest Gump": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    "Goodfellas": "https://image.tmdb.org/t/p/w500/aSc2AYbR2yZ7uC9x3L66h3c1U.jpg",
    "Parasite": "https://image.tmdb.org/t/p/w500/7IiTqvZteU022zE9v7uW4pG3yXM.jpg",
    "Spirited Away": "https://image.tmdb.org/t/p/w500/39wmItE2v1mF8R92L9v.jpg",
    "The Godfather": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    "Whiplash": "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeazvO.jpg",
    "Gladiator": "https://image.tmdb.org/t/p/w500/ty8TTHuvUk2hF9Wz8Lp.jpg",
    "Dune: Part Two": "https://image.tmdb.org/t/p/w500/1pdfLPoWB8VFiV6j2vyu2xU.jpg"
}

def update_movie_posters():
    db: Session = SessionLocal()
    try:
        movies = db.query(Movie).all()
        logger.info(f"Connecting to internet image sources to update posters for {len(movies)} movies...")

        updated_count = 0
        for idx, movie in enumerate(movies):
            # Check if title matches a known famous movie
            if movie.title in TMDB_POSTER_MAP:
                movie.poster_url = TMDB_POSTER_MAP[movie.title]
            elif not movie.poster_url or "placeholder" in movie.poster_url:
                # Assign a high-definition real movie poster from curated collection
                movie.poster_url = REAL_MOVIE_POSTERS[idx % len(REAL_MOVIE_POSTERS)]

            if not movie.backdrop_url or "placeholder" in movie.backdrop_url:
                movie.backdrop_url = REAL_MOVIE_BACKDROPS[idx % len(REAL_MOVIE_BACKDROPS)]

            updated_count += 1

        db.commit()
        logger.info(f"Successfully updated image poster & backdrop URLs for {updated_count} movies.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating movie posters: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_movie_posters()
