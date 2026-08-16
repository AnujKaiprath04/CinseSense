import random
import os
import sys
from datetime import datetime, timedelta

# Ensure backend root is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal, engine, Base
from app.models import Movie, User, Rating, Watchlist, InteractionLog

# Seed for reproducibility
random.seed(42)

GENRES_LIST = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
    "Romance", "Sci-Fi", "Thriller", "War", "Western"
]

DIRECTORS = [
    "Christopher Nolan", "Denis Villeneuve", "Greta Gerwig", "Quentin Tarantino",
    "Martin Scorsese", "Steven Spielberg", "Guillermo del Toro", "Hayao Miyazaki",
    "Bong Joon-ho", "Ridley Scott", "Damien Chazelle", "Jordan Peele", "David Fincher",
    "James Cameron", "Spike Lee", "Wes Anderson", "Chloe Zhao", "Taika Waititi"
]

CAST_MEMBERS = [
    "Leonardo DiCaprio", "Cillian Murphy", "Florence Pugh", "Timothée Chalamet",
    "Zendaya", "Ryan Gosling", "Emma Stone", "Christian Bale", "Margot Robbie",
    "Keanu Reeves", "Pedro Pascal", "Oscar Isaac", "Ana de Armas", "Viola Davis",
    "Joaquin Phoenix", "Daniel Kaluuya", "Lupita Nyong'o", "Michael B. Jordan"
]

PREFIXES = [
    "The", "A", "Beyond the", "Secrets of the", "Chronicles of", "Return of the",
    "Shadow over", "Legend of the", "Journey to", "Echoes from the", "Flight of the",
    "Rise of the", "Fall of the", "Kingdom of", "Tales from", "Guardians of the",
    "Agent of", "Night of the", "Search for the", "Master of", "Voices of the"
]

NOUNS = [
    "Odyssey", "Eclipse", "Cyberpunk", "Paradox", "Horizon", "Cipher", "Vortex",
    "Serenade", "Dynasty", "Empire", "Labyrinth", "Requiem", "Spectre", "Phoenix",
    "Infinity", "Sanctuary", "Avalanche", "Titan", "Matrix", "Illusion", "Cataclysm",
    "Protocol", "Legacy", "Starlight", "Obsidian", "Sentinel", "Nebula", "Lighthouse",
    "Velocity", "Mirage", "Thunder", "Vanguard", "Prophecy", "Dominion", "Solitude"
]

ADJECTIVES = [
    "Dark", "Golden", "Silent", "Quantum", "Lost", "Rogue", "Neon", "Cosmic",
    "Crimson", "Frozen", "Endless", "Celestial", "Secret", "Hidden", "Eternal",
    "Shattered", "Wild", "Brave", "Stolen", "Furious", "Radiant", "Iron", "Forgotten"
]

UNSPLASH_POSTERS = [
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
    "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=500&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80",
]

UNSPLASH_BACKDROPS = [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
    "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80",
]

OVERVIEW_TEMPLATES = [
    "In a world where {noun} threatens stability, a rogue team must embark on a high-stakes mission across {setting}.",
    "When a long-buried secret about {noun} surfaces, an unlikely hero is forced to choose between loyalty and justice.",
    "A gripping story set in {setting}, following a protagonist determined to unlock the secrets of {noun}.",
    "Against the backdrop of {setting}, two rivals must unite to prevent catastrophic disruption of the {noun}.",
    "An epic cinematic journey exploring the boundaries of courage, destiny, and the mysterious power of {noun}."
]

SETTINGS = [
    "a futuristic metropolis", "the deep reaches of space", "a forgotten ancient empire",
    "a high-tech cyber underworld", "the quiet countryside of Europe", "a war-torn frontier zone",
    "an isolated orbital research facility", "the bustling streets of Tokyo", "a dystopian desert wasteland"
]

def generate_movie_data(movie_id: int):
    prefix = random.choice(PREFIXES)
    adj = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)

    title_pattern = random.randint(1, 3)
    if title_pattern == 1:
        title = f"{prefix} {adj} {noun}"
    elif title_pattern == 2:
        title = f"{adj} {noun}"
    else:
        title = f"{prefix} {noun}"

    title = f"{title} #{movie_id}" if movie_id > 2000 else title

    num_genres = random.choice([1, 2, 3])
    selected_genres = random.sample(GENRES_LIST, num_genres)
    genres_str = ",".join(selected_genres)

    release_year = random.randint(1975, 2025)
    setting = random.choice(SETTINGS)
    overview = random.choice(OVERVIEW_TEMPLATES).format(noun=noun.lower(), setting=setting)

    director = random.choice(DIRECTORS)
    cast_str = ", ".join(random.sample(CAST_MEMBERS, random.choice([2, 3])))
    duration = random.randint(88, 175)

    poster = UNSPLASH_POSTERS[(movie_id - 1) % len(UNSPLASH_POSTERS)]
    backdrop = UNSPLASH_BACKDROPS[(movie_id - 1) % len(UNSPLASH_BACKDROPS)]

    return {
        "id": movie_id,
        "title": title,
        "genres": genres_str,
        "release_year": release_year,
        "overview": overview,
        "director": director,
        "cast": cast_str,
        "duration_minutes": duration,
        "poster_url": poster,
        "backdrop_url": backdrop,
        "average_rating": round(random.uniform(3.0, 4.9), 1),
        "rating_count": random.randint(5, 500)
    }

def generate_large_dataset(target_movies=5200, target_users=100, target_ratings=12500):
    print("=" * 60)
    print(f"  GENERATING CINESENSE 5K+ DATASET")
    print(f"  Movies: {target_movies} | Users: {target_users} | Ratings: {target_ratings}")
    print("=" * 60)

    db = SessionLocal()
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        print(f"Generating {target_movies} movie records...")
        movies_to_insert = []
        
        from scripts.seed_db import MOVIES_DATA, DEMO_USERS, INITIAL_RATINGS
        for m in MOVIES_DATA:
            m_dict = dict(m)
            m_dict["director"] = m_dict.get("director", "Christopher Nolan")
            m_dict["cast"] = m_dict.get("cast", "Leonardo DiCaprio, Joseph Gordon-Levitt")
            m_dict["duration_minutes"] = m_dict.get("duration_minutes", 148)
            movies_to_insert.append(Movie(**m_dict))

        start_id = len(MOVIES_DATA) + 1
        for m_id in range(start_id, target_movies + 1):
            m_data = generate_movie_data(m_id)
            movies_to_insert.append(Movie(**m_data))

        db.bulk_save_objects(movies_to_insert)
        db.commit()
        print(f"[SUCCESS] Successfully seeded {target_movies} movies!")

        print(f"Generating {target_users} user profiles...")
        users_to_insert = []
        for u in DEMO_USERS:
            users_to_insert.append(User(**u))

        names = ["Aria", "Ben", "Chloe", "David", "Emma", "Felix", "Grace", "Henry", "Isla", "Jack", "Kira", "Leo", "Maya", "Noah", "Olivia", "Paul", "Quinn", "Rachel", "Sam", "Tess"]
        for u_id in range(len(DEMO_USERS) + 1, target_users + 1):
            first = random.choice(names)
            username = f"{first}{u_id} (CineSense User)"
            email = f"user{u_id}@cinesense.ai"
            users_to_insert.append(User(id=u_id, username=username, email=email))

        db.bulk_save_objects(users_to_insert)
        db.commit()
        print(f"[SUCCESS] Successfully seeded {target_users} user profiles!")

        print(f"Generating {target_ratings} synthetic rating records...")
        ratings_to_insert = []

        for r in INITIAL_RATINGS:
            ratings_to_insert.append(Rating(**r))

        for r_id in range(len(INITIAL_RATINGS) + 1, target_ratings + 1):
            user_id = random.randint(1, target_users)
            if user_id == 3:
                user_id = random.choice([1, 2, 4, random.randint(5, target_users)])

            movie_id = random.randint(1, target_movies)
            rating_val = random.choice([3.0, 3.5, 4.0, 4.5, 5.0, 5.0, 4.0])

            ratings_to_insert.append(Rating(
                user_id=user_id,
                movie_id=movie_id,
                rating=rating_val,
                timestamp=datetime.utcnow() - timedelta(days=random.randint(1, 180))
            ))

        db.bulk_save_objects(ratings_to_insert)
        db.commit()
        print(f"[SUCCESS] Successfully seeded {target_ratings} user ratings!")

        print("Recalculating average ratings and rating counts across 5,000+ movies...")
        from sqlalchemy import func
        stats = db.query(
            Rating.movie_id,
            func.avg(Rating.rating).label("avg_rating"),
            func.count(Rating.id).label("count")
        ).group_by(Rating.movie_id).all()

        for movie_id, avg_r, cnt in stats:
            m = db.query(Movie).filter(Movie.id == movie_id).first()
            if m:
                m.average_rating = round(float(avg_r), 1)
                m.rating_count = int(cnt)

        db.commit()
        print("[SUCCESS] All movie statistics updated!")
        print("=" * 60)
        print("  CINESENSE 5K+ DATASET GENERATION COMPLETE!")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    generate_large_dataset(target_movies=5200, target_users=100, target_ratings=12500)
