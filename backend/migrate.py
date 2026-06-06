import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "pinterest.db")

def run_migration():
    if not os.path.exists(db_path):
        print(f"La base de datos no existe en {db_path}. Se creará al iniciar la API.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Agregar bio y profile_pic a la tabla user si no existen
    cursor.execute("PRAGMA table_info(user);")
    columns = [col[1] for col in cursor.fetchall()]

    if "bio" not in columns:
        print("Migración: Agregando columna 'bio' a la tabla 'user'")
        cursor.execute("ALTER TABLE user ADD COLUMN bio TEXT;")
    
    if "profile_pic" not in columns:
        print("Migración: Agregando columna 'profile_pic' a la tabla 'user'")
        cursor.execute("ALTER TABLE user ADD COLUMN profile_pic TEXT;")

    # Crear tablas follow, comment y savedpin si no existen
    print("Migración: Creando tablas auxiliares si no existen...")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS follow (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        followed_id INTEGER NOT NULL,
        FOREIGN KEY(follower_id) REFERENCES user(id),
        FOREIGN KEY(followed_id) REFERENCES user(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS comment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        creationAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        pin_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY(pin_id) REFERENCES pin(id),
        FOREIGN KEY(user_id) REFERENCES user(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS savedpin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        pin_id INTEGER NOT NULL,
        creationAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES user(id),
        FOREIGN KEY(pin_id) REFERENCES pin(id)
    );
    """)

    conn.commit()
    conn.close()
    print("Migración completada con éxito.")

if __name__ == "__main__":
    run_migration()
