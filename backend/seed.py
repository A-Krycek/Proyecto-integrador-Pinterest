from sqlmodel import Session, select
from db import engine
from models import Category, User, Pin

def seed():
    with Session(engine) as session:
        # Check if users already exist
        if session.exec(select(User)).first():
            print("Database already has data. Skipping seed.")
            return

        print("Seeding database...")
        # 1. Create categories
        cat1 = Category(name="Arquitectura", slug="arquitectura", image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300")
        cat2 = Category(name="Diseño", slug="diseno", image="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300")
        cat3 = Category(name="Mascotas", slug="mascotas", image="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300")
        session.add(cat1)
        session.add(cat2)
        session.add(cat3)
        session.commit()
        session.refresh(cat1)
        session.refresh(cat2)
        session.refresh(cat3)

        # 2. Create users
        user1 = User(username="danixdy8", email="danixdy8@gmail.com", password="password", bio="Amante de la arquitectura moderna", avatar_url=None)
        user2 = User(username="krycek", email="krycek@gmail.com", password="password", bio="Curador de diseño minimalista", avatar_url=None)
        session.add(user1)
        session.add(user2)
        session.commit()
        session.refresh(user1)
        session.refresh(user2)

        # 3. Create pins
        pin1 = Pin(title="Casa de Campo Moderna", slug="casa-de-campo-moderna", description="Un hermoso diseño de vivienda campestre con acabados de madera y hormigón expuesto.", image_url="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500&auto=format&fit=crop", tags="arquitectura,moderno", category_id=cat1.id, user_id=user1.id)
        pin2 = Pin(title="Apartamento Minimalista", slug="apartamento-minimalista", description="Decoración nórdica y optimización del espacio en un loft citadino.", image_url="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop", tags="diseno,minimalista", category_id=cat2.id, user_id=user2.id)
        pin3 = Pin(title="Perrito en el Parque", slug="perrito-en-el-parque", description="Un adorable cachorro golden retriever jugando en el pasto.", image_url="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop", tags="mascotas,golden", category_id=cat3.id, user_id=user1.id)
        
        session.add(pin1)
        session.add(pin2)
        session.add(pin3)
        session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
