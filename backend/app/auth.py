import os
import httpx
import uuid
from functools import lru_cache
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.constants import ALGORITHMS
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

security = HTTPBearer()

# 環境変数からAuth0設定を取得
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE", "")
AUTH0_ALGORITHM = "RS256"

# JWKS URL
JWKS_URL = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json" if AUTH0_DOMAIN else ""


@lru_cache(maxsize=1)
def get_jwks():
    """JWKSを取得してキャッシュ"""
    if not JWKS_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth0 configuration is missing"
        )
    
    try:
        response = httpx.get(JWKS_URL, timeout=10.0)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch JWKS: {str(e)}"
        )


def get_rsa_key(token: str):
    """JWTトークンからRSA公開鍵を取得"""
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token header"
        )
    
    jwks = get_jwks()
    rsa_key = None
    
    for key in jwks.get("keys", []):
        if key.get("kid") == unverified_header.get("kid"):
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }
            break
    
    if not rsa_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to find appropriate key"
        )
    
    try:
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.backends import default_backend
        from jose.utils import base64url_decode
        import base64
        
        # RSA鍵を構築
        exponent = base64url_decode(rsa_key["e"].encode("utf-8"))
        modulus = base64url_decode(rsa_key["n"].encode("utf-8"))
        
        public_numbers = rsa.RSAPublicNumbers(
            int.from_bytes(exponent, byteorder="big"),
            int.from_bytes(modulus, byteorder="big")
        )
        public_key = public_numbers.public_key(default_backend())
        
        return public_key
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unable to parse key: {str(e)}"
        )


def verify_token(token: str) -> dict:
    """JWTトークンを検証してペイロードを返す"""
    if not AUTH0_DOMAIN or not AUTH0_AUDIENCE:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth0 configuration is missing"
        )
    
    try:
        rsa_key = get_rsa_key(token)
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=[AUTH0_ALGORITHM],
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        return payload
    except JWTError as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """現在の認証ユーザーを取得"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        token = credentials.credentials
        payload = verify_token(token)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
    
    # Auth0から取得した情報
    auth0_id = payload.get("sub")  # "auth0|xxxxx" 形式
    email = payload.get("email")
    
    # トークンのペイロードをログ出力（デバッグ用）
    logger.info(f"Token payload keys: {list(payload.keys())}")
    logger.info(f"Token payload email: {email}")
    logger.info(f"Token payload sub: {auth0_id}")
    
    # emailが存在しない場合の処理
    if not email:
        # emailが存在しない場合、subをベースにemailを生成
        # ただし、これは一時的な対応で、Auth0の設定を確認する必要がある
        logger.warning(f"Email not found in token. Available keys: {list(payload.keys())}")
        logger.warning(f"Full payload: {payload}")
        
        # subからemailを推測（実際の運用では推奨されない）
        if auth0_id and "|" in auth0_id:
            # auth0_idが "auth0|xxxxx" または "google-oauth2|xxxxx" 形式の場合
            parts = auth0_id.split("|")
            if len(parts) > 1:
                # 一時的なemailとして使用（実際の運用ではAuth0の設定を確認）
                email = f"{parts[1]}@auth0.local"
                logger.warning(f"Using temporary email: {email}")
            else:
                email = f"{auth0_id}@auth0.local"
                logger.warning(f"Using temporary email: {email}")
        elif auth0_id:
            email = f"{auth0_id}@auth0.local"
            logger.warning(f"Using temporary email: {email}")
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email not found in token and unable to generate from sub"
            )
    
    # display_nameの決定
    display_name = payload.get("name") or payload.get("nickname") or (email.split("@")[0] if email else "User")
    
    # データベースからユーザーを検索または作成
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # 新規ユーザーの場合は作成
        user = User(
            id=uuid.uuid4(),
            auth_provider="auth0",
            email=email,
            display_name=display_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # 既存ユーザーの表示名を更新（必要に応じて）
        if user.display_name != display_name:
            user.display_name = display_name
            db.commit()
            db.refresh(user)
    
    return user

