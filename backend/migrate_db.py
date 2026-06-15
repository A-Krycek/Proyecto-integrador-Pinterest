import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "pinterest.db")

def migrate():
    print(f"Iniciando migración en {db_path}...")
    if not os.path.exists(db_path):
        print("La base de datos pinterest.db no existe aún. Se creará al iniciar la API.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE pin ADD COLUMN status VARCHAR DEFAULT 'approved'")
        print("Columna 'status' agregada exitosamente con valor predeterminado 'approved'.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e) or "already exists" in str(e).lower():
            print("La columna 'status' ya existe.")
        else:
            print(f"Error al agregar la columna 'status': {e}")

    try:
        cursor.execute("ALTER TABLE pin ADD COLUMN moderation_reason VARCHAR DEFAULT NULL")
        print("Columna 'moderation_reason' agregada exitosamente.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e) or "already exists" in str(e).lower():
            print("La columna 'moderation_reason' ya existe.")
        else:
            print(f"Error al agregar la columna 'moderation_reason': {e}")

    try:
        cursor.execute("ALTER TABLE user ADD COLUMN avatar_url VARCHAR DEFAULT NULL")
        print("Columna 'avatar_url' agregada exitosamente en la tabla user.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e) or "already exists" in str(e).lower():
            print("La columna 'avatar_url' ya existe en user.")
        else:
            print(f"Error al agregar 'avatar_url': {e}")

    try:
        cursor.execute("ALTER TABLE user ADD COLUMN bio VARCHAR DEFAULT NULL")
        print("Columna 'bio' agregada exitosamente en la tabla user.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e) or "already exists" in str(e).lower():
            print("La columna 'bio' ya existe en user.")
        else:
            print(f"Error al agregar 'bio': {e}")

    conn.commit()
    conn.close()
    print("Migración de base de datos finalizada.")

if __name__ == "__main__":
    migrate()