from sqlmodel import SQLModel, Session, create_engine

sqlite_url = "sqlite:///pinterest.db"
engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})

def create_db():
    SQLModel.metadata.create_all(engine)
    try:
        from migrate import run_migration
        run_migration()
    except Exception as e:
        print(f"Error al ejecutar migración: {e}")

def get_session():
    with Session(engine) as session:
        yield session
