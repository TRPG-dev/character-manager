import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

def _load_env() -> None:
    """
    `.env` を確実に読み込む。

    - `uvicorn app.main:app` をプロジェクトルートから実行した場合でも `backend/.env` を拾えるようにする
    - 既に環境変数が設定されている場合は上書きしない（override=False）
    """
    backend_env = Path(__file__).resolve().parents[1] / ".env"  # backend/.env
    if backend_env.exists():
        load_dotenv(dotenv_path=backend_env, override=False)
    else:
        # 互換: 従来通り、カレントディレクトリの .env を探す
        load_dotenv(override=False)


_load_env()

# 環境変数から接続文字列を取得
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/char_manager")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
