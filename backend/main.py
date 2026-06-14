from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import create_db
from routers import users, categories, pins

app = FastAPI(
    title="Lookbook API",
    description="API de backend para la aplicación web estilo Pinterest con moderación ética e integración de almacenamiento S3",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Cambiado a False para evitar conflictos CORS con el origen comodín "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    create_db()

api_prefix = "/api"

app.include_router(users.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(pins.router, prefix=api_prefix)
