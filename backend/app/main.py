import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, characters, share, images, dice

app = FastAPI(title="Character Manager API", version="1.0.0")

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
