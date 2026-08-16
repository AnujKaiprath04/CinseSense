import sys
import os
import logging
from sqlalchemy.orm import Session

# Ensure app package is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal, engine, Base
from app.models import Movie, User, Rating, Watchlist, InteractionLog

logger = logging.getLogger(__name__)

MOVIES_DATA = [
    {
        "id": 1,
        "title": "Inception",
        "genres": "Action,Sci-Fi,Thriller",
        "release_year": 2010,
        "overview": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        "poster_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
        "average_rating": 4.8,
        "rating_count": 1250
    },
    {
        "id": 2,
        "title": "The Dark Knight",
        "genres": "Action,Crime,Drama",
        "release_year": 2008,
        "overview": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        "poster_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80",
        "average_rating": 4.9,
        "rating_count": 1800
    },
    {
        "id": 3,
        "title": "Interstellar",
        "genres": "Adventure,Drama,Sci-Fi",
        "release_year": 2014,
        "overview": "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
        "poster_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
        "average_rating": 4.7,
        "rating_count": 1400
    },
    {
        "id": 4,
        "title": "Blade Runner 2049",
        "genres": "Drama,Mystery,Sci-Fi",
        "release_year": 2017,
        "overview": "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
        "poster_url": "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80",
        "average_rating": 4.6,
        "rating_count": 920
    },
    {
        "id": 5,
        "title": "The Matrix",
        "genres": "Action,Sci-Fi",
        "release_year": 1999,
        "overview": "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
        "poster_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80",
        "average_rating": 4.8,
        "rating_count": 1650
    },
    {
        "id": 6,
        "title": "Dune: Part One",
        "genres": "Action,Adventure,Sci-Fi",
        "release_year": 2021,
        "overview": "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future.",
        "poster_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80",
        "average_rating": 4.5,
        "rating_count": 1100
    },
    {
        "id": 7,
        "title": "La La Land",
        "genres": "Comedy,Drama,Music,Romance",
        "release_year": 2016,
        "overview": "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for their future.",
        "poster_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
        "average_rating": 4.6,
        "rating_count": 890
    },
    {
        "id": 8,
        "title": "The Shawshank Redemption",
        "genres": "Drama",
        "release_year": 1994,
        "overview": "Over the course of several years, two convicts form a friendship, seeking solace and eventual redemption through basic compassion.",
        "poster_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
        "average_rating": 4.9,
        "rating_count": 2100
    },
    {
        "id": 9,
        "title": "Pride & Prejudice",
        "genres": "Drama,Romance",
        "release_year": 2005,
        "overview": "Sparks fly when spirited Elizabeth Bennet meets single, rich, and proud Mr. Darcy. But Mr. Darcy reluctantly finds himself falling in love with a woman beneath his class.",
        "poster_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
        "average_rating": 4.4,
        "rating_count": 650
    },
    {
        "id": 10,
        "title": "Spider-Man: Into the Spider-Verse",
        "genres": "Action,Animation,Adventure",
        "release_year": 2018,
        "overview": "Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
        "poster_url": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80",
        "average_rating": 4.8,
        "rating_count": 1300
    },
    {
        "id": 11,
        "title": "Spirited Away",
        "genres": "Animation,Adventure,Family",
        "release_year": 2001,
        "overview": "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches and spirits, a world where humans are changed into beasts.",
        "poster_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80",
        "average_rating": 4.9,
        "rating_count": 1500
    },
    {
        "id": 12,
        "title": "Wall-E",
        "genres": "Animation,Adventure,Family,Sci-Fi",
        "release_year": 2008,
        "overview": "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind.",
        "poster_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
        "average_rating": 4.7,
        "rating_count": 1200
    },
    {
        "id": 13,
        "title": "Pulp Fiction",
        "genres": "Crime,Drama",
        "release_year": 1994,
        "overview": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        "poster_url": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80",
        "average_rating": 4.7,
        "rating_count": 1750
    },
    {
        "id": 14,
        "title": "The Grand Budapest Hotel",
        "genres": "Adventure,Comedy,Crime",
        "release_year": 2014,
        "overview": "A writer encounters the owner of a high-class hotel who tells of his early years as a lobby boy during the hotel's glorious years under an exceptional concierge.",
        "poster_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
        "average_rating": 4.5,
        "rating_count": 980
    },
    {
        "id": 15,
        "title": "Parasite",
        "genres": "Drama,Thriller,Comedy",
        "release_year": 2019,
        "overview": "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        "poster_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
        "average_rating": 4.8,
        "rating_count": 1600
    }
]

DEMO_USERS = [
    {
        "id": 1,
        "username": "Alex (Action & Sci-Fi Fan)",
        "email": "alex.action@cinesense.ai"
    },
    {
        "id": 2,
        "username": "Sarah (Drama & Romance Enthusiast)",
        "email": "sarah.drama@cinesense.ai"
    },
    {
        "id": 3,
        "username": "Taylor (Cold-Start New User)",
        "email": "taylor.coldstart@cinesense.ai"
    },
    {
        "id": 4,
        "username": "Jordan (Animation Fan)",
        "email": "jordan.animation@cinesense.ai"
    }
]

INITIAL_RATINGS = [
    # Alex (User 1): Action & Sci-Fi Heavy history (6 ratings -> HIGH confidence)
    {"user_id": 1, "movie_id": 1, "rating": 5.0}, # Inception
    {"user_id": 1, "movie_id": 2, "rating": 5.0}, # Dark Knight
    {"user_id": 1, "movie_id": 3, "rating": 4.5}, # Interstellar
    {"user_id": 1, "movie_id": 4, "rating": 4.5}, # Blade Runner 2049
    {"user_id": 1, "movie_id": 5, "rating": 5.0}, # Matrix
    {"user_id": 1, "movie_id": 6, "rating": 4.5}, # Dune

    # Sarah (User 2): Moderate Drama history (3 ratings -> MEDIUM confidence)
    {"user_id": 2, "movie_id": 7, "rating": 5.0}, # La La Land
    {"user_id": 2, "movie_id": 8, "rating": 4.5}, # Shawshank
    {"user_id": 2, "movie_id": 9, "rating": 4.0}, # Pride & Prejudice

    # Taylor (User 3): 0 ratings -> LOW confidence Cold-Start user

    # Jordan (User 4): Animation history (3 ratings -> MEDIUM confidence)
    {"user_id": 4, "movie_id": 10, "rating": 5.0}, # Spider-Verse
    {"user_id": 4, "movie_id": 11, "rating": 5.0}, # Spirited Away
    {"user_id": 4, "movie_id": 12, "rating": 4.5}, # Wall-E
]

def seed_database(db: Session):
    """Seed movies, demo users, and initial ratings into database if empty."""
    Base.metadata.create_all(bind=engine)

    movie_count = db.query(Movie).count()
    if movie_count == 0:
        logger.info("Seeding movie catalog...")
        for m_data in MOVIES_DATA:
            m = Movie(**m_data)
            db.add(m)
        db.commit()
        logger.info(f"Seeded {len(MOVIES_DATA)} movies.")
    else:
        logger.info(f"Database already contains {movie_count} movies. Skipping movie seed.")

    user_count = db.query(User).count()
    if user_count == 0:
        logger.info("Seeding demo users...")
        for u_data in DEMO_USERS:
            u = User(**u_data)
            db.add(u)
        db.commit()
        logger.info(f"Seeded {len(DEMO_USERS)} demo users.")

    rating_count = db.query(Rating).count()
    if rating_count == 0:
        logger.info("Seeding initial ratings history...")
        for r_data in INITIAL_RATINGS:
            r = Rating(**r_data)
            db.add(r)
        db.commit()
        logger.info(f"Seeded {len(INITIAL_RATINGS)} initial ratings.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database seeding completed successfully!")
    finally:
        db.close()
