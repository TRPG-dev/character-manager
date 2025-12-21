import os
from datetime import timedelta
from pathlib import Path
from typing import Optional, Tuple
from urllib.parse import urlparse, unquote

from google.cloud import storage


def normalize_google_application_credentials_env() -> None:
    """
    GOOGLE_APPLICATION_CREDENTIALS の値を起動環境に合わせて正規化する。

    - 空文字で設定されているとADCが壊れるため無効化
    - 相対パスの場合、`backend/` ディレクトリ基準で絶対パスに解決
    """
    gac = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if gac is not None and not gac.strip():
        os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)
        return

    if gac and not os.path.isabs(gac):
        backend_root = Path(__file__).resolve().parents[2]  # backend/
        resolved = (backend_root / gac).resolve()
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(resolved)


def extract_gcs_bucket_and_object(url: str) -> Optional[Tuple[str, str]]:
    """
    `gs://bucket/object` または `https://storage.googleapis.com/bucket/object` から
    (bucket_name, object_name) を抽出する。抽出できなければ None。
    """
    if not url:
        return None

    if url.startswith("gs://"):
        rest = url[len("gs://") :]
        if "/" not in rest:
            return None
        bucket, obj = rest.split("/", 1)
        return bucket, obj

    try:
        u = urlparse(url)
    except Exception:
        return None

    host = (u.netloc or "").lower()
    path = u.path or ""
    # https://storage.googleapis.com/<bucket>/<object>
    if host in {"storage.googleapis.com"}:
        parts = path.lstrip("/").split("/", 1)
        if len(parts) != 2:
            return None
        bucket = parts[0]
        obj = unquote(parts[1])
        return bucket, obj

    # https://<bucket>.storage.googleapis.com/<object>
    if host.endswith(".storage.googleapis.com"):
        bucket = host[: -len(".storage.googleapis.com")]
        obj = unquote(path.lstrip("/"))
        if not bucket or not obj:
            return None
        return bucket, obj

    return None


def generate_signed_get_url(
    bucket_name: str,
    object_name: str,
    expires_delta: timedelta,
) -> str:
    """
    非公開GCSオブジェクトをブラウザ表示できるようにするための署名付きURL（GET）を生成する。
    """
    normalize_google_application_credentials_env()
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(object_name)
    return blob.generate_signed_url(
        version="v4",
        expiration=expires_delta,
        method="GET",
    )


def maybe_sign_read_url(original_url: Optional[str]) -> Optional[str]:
    """
    `original_url` がGCS URLなら、署名付きGET URLに差し替えて返す。
    失敗した場合は元のURLを返す（表示を壊さないため）。
    """
    if not original_url:
        return original_url

    extracted = extract_gcs_bucket_and_object(original_url)
    if not extracted:
        return original_url

    bucket_name, object_name = extracted
    expiration_minutes = int(os.getenv("GCS_SIGNED_URL_EXP_MINUTES", "15"))
    expires_delta = timedelta(minutes=expiration_minutes)

    try:
        return generate_signed_get_url(bucket_name, object_name, expires_delta)
    except Exception:
        # 署名生成に失敗しても、元のURL（公開設定の環境では表示できる）にフォールバック
        return original_url


