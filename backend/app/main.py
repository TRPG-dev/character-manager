import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, characters, share, images, dice
from alembic.config import Config
from alembic import command

logger = logging.getLogger(__name__)


def run_migrations():
    """Run database migrations on startup."""
    try:
        logger.info("Running database migrations...")
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully")
    except Exception as e:
        logger.error(f"Failed to run migrations: {e}")
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    run_migrations()
    yield


app = FastAPI(
    title="Character Manager API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS設定
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
)
allow_origins = [origin.strip() for origin in CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ルーターの登録
app.include_router(auth.router)
app.include_router(characters.router)
app.include_router(share.router)
app.include_router(images.router)
app.include_router(dice.router)


@app.get("/")
def read_root():
    return {"message": "Character Manager API", "version": "1.0.0"}
