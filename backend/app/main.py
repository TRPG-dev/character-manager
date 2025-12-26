import os
import logging
import sys
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from alembic.config import Config
from alembic import command

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# アプリケーションの起動状態を追跡
_startup_complete = False


def run_migrations():
    """Run database migrations on startup."""
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except Exception as e:
        logger.error(f"Failed to run migrations: {e}")
        logger.error(traceback.format_exc())
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    global _startup_complete
    try:
        run_migrations()
        _startup_complete = True
        yield
    except Exception as e:
        logger.error(f"Application startup failed: {e}")
        logger.error(traceback.format_exc())
        sys.exit(1)


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
allow_origins = [
    origin.strip() 
    for origin in CORS_ORIGINS.replace("\n", "").split(",") 
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=[],
)

# ルーターの登録
from app.routers import auth, characters, share, images, dice, export

app.include_router(auth.router)
app.include_router(characters.router)
app.include_router(share.router)
app.include_router(images.router)
app.include_router(dice.router)
app.include_router(export.router)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """HTTP例外ハンドラー"""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """バリデーション例外ハンドラー"""
    logger.error(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """一般的な例外ハンドラー"""
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal server error: {str(exc)}"}
    )


@app.get("/")
def read_root():
    return {"message": "Character Manager API", "version": "1.0.0"}


@app.get("/health")
@app.get("/healthz")
async def health_check():
    """ヘルスチェックエンドポイント（Cloud RunのSTARTUP probe用）"""
    global _startup_complete
    if not _startup_complete:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "starting", "message": "Application is starting up"}
        )
    return {"status": "healthy", "message": "Application is ready"}
