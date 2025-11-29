from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, characters, share, images

app = FastAPI(title="Character Manager API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # フロントエンドのオリジン
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(auth.router)
app.include_router(characters.router)
app.include_router(share.router)
app.include_router(images.router)


@app.get("/")
def read_root():
    return {"message": "Character Manager API", "version": "1.0.0"}
