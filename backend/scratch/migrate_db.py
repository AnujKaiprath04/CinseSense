import sqlite3

conn = sqlite3.connect("cinesense.db")
cursor = conn.cursor()

# Check movies table columns
cursor.execute("PRAGMA table_info(movies)")
cols = [row[1] for row in cursor.fetchall()]

if "trailer_url" not in cols:
    print("Adding trailer_url column...")
    cursor.execute("ALTER TABLE movies ADD COLUMN trailer_url TEXT")

if "mood" not in cols:
    print("Adding mood column...")
    cursor.execute("ALTER TABLE movies ADD COLUMN mood TEXT DEFAULT 'mind_bending'")

# Check users table columns
cursor.execute("PRAGMA table_info(users)")
u_cols = [row[1] for row in cursor.fetchall()]
if "hashed_password" not in u_cols:
    print("Adding hashed_password column...")
    cursor.execute("ALTER TABLE users ADD COLUMN hashed_password TEXT")

# Create notifications table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'recommendation',
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

conn.commit()
conn.close()
print("Database schema migration completed successfully!")
