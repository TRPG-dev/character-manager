# TRPGキャラクターシート保管・作成サービス

複数TRPG（クトゥルフ神話TRPG・シノビガミ）に対応したモダンなキャラクターシート作成・保管・閲覧サービス。

## システム概要

- **目的:** 複数TRPG（MVPではクトゥルフ神話TRPG・シノビガミ）に対応したモダンなキャラクターシート作成・保管・閲覧サービス。
- **差別化:** モダンUI、複数システム対応、公開／非公開の共有リンク、自由タグ検索。
- **対象TRPG（MVP/将来）:**
    - MVP: クトゥルフ神話TRPG、シノビガミ
    - 将来追加: ソードワールド2.5、アジアンパンクTRPGサタスペ

## 技術構成

- **フロントエンド:** React（SPA）
    - 優先度低: 共有ページSSR（Next.js）導入、OGタグ最適化、SEO強化
- **バックエンド:** Python（FastAPI、REST API）
- **DB:** PostgreSQL（JSONB活用でシステム固有データを柔軟管理）
- **認証:** Auth0（Google SSO対応、X SSOは優先度低）
- **インフラ:** さくらのVPS（スタンダードプラン）、Dockerコンテナ運用
- **配信/ネットワーク:** Nginxリバースプロキシ、TLS終端、HTTP/2、静的資産配信
- **ストレージ:** 画像はオブジェクトストレージ相当（署名付きURLで直接アップロード）
- **監視/ログ:** Google Analytics、LogRocket、API構造化ログ
- **広告:** Google AdSense（一覧・新規作成画面のみ表示）

## 機能設計

### 認証・ユーザー

- **ログイン:** メール＋パスワード（Auth0）、Google SSO
- **優先度低:** X（旧Twitter）SSO

### キャラシ管理

- **作成:** システム選択→テンプレ生成→入力
- **編集/削除:** 所有者のみ可能
- **画像:** PNG/JPEG、最大5MB（署名付きURLでアップロード）
- **タグ:** 自由入力（text[]）、検索対応

### ダイス

- **内製ダイスAPI:** 汎用式（例: 3d6）とシステム別一括振り
- **能力値生成:** クトゥルフは基本作成ルールを適用（INT/SIZ/EDUは2d6+6など、派生値SAN/HP/MP算出）
- **優先度低:** 外部Webダイス連携

### 閲覧・共有

- **公開設定:** is_public + share_token（公開URL）、非公開は所有者のみ閲覧
- **優先度低:** SSRで共有ページOGタグ/SEO最適化

### 出力・連携（優先度低）

- **PDF出力:** キャラ閲覧からPDF生成
- **ココフォリア:** クトゥルフのみ対応でテンプレ出力
- **インポート/エクスポート:** JSON形式（1キャラ単位／アカウント単位は将来）

### 広告

- **表示範囲:** ダッシュボード（一覧）、新規作成画面のみ

## データ設計（PostgreSQL）

### テーブル定義（主要）

#### users
- **id:** UUID（PK）
- **auth_provider:** string（例: 'auth0'）
- **email:** unique
- **display_name:** string
- **created_at / updated_at:** timestamp

#### characters
- **id:** UUID（PK）
- **user_id:** UUID（FK → users.id）
- **system:** enum（'cthulhu' | 'shinobigami' | 'sw25' | 'satasupe'）
- **name:** string
- **profile_image_url:** string
- **tags:** text[]（自由入力）
- **is_public:** boolean
- **share_token:** string（unique, nullable）
- **sheet_data:** JSONB（システム固有）
- **created_at / updated_at:** timestamp

#### audit_logs
- **id:** UUID（PK）
- **user_id:** UUID
- **character_id:** UUID
- **action:** enum（create/update/publish/unpublish/delete）
- **metadata:** JSONB
- **created_at:** timestamp

### JSONB例

#### クトゥルフ（cthulhu）
```json
{
  "attributes": { "STR": 50, "CON": 60, "POW": 55, "DEX": 65, "APP": 50, "INT": 70, "EDU": 75, "SIZ": 60 },
  "derived": { "SAN_current": 55, "SAN_max": 99, "HP_current": 12, "HP_max": 12, "MP_current": 11, "MP_max": 11 },
  "skills": [{ "name": "図書館", "value": 60 }],
  "backstory": "..."
}
```

#### シノビガミ（shinobigami）
```json
{
  "attributes": { "体術": 3, "忍術": 2, "謀術": 1, "戦術": 2, "器術": 3, "心術": 1 },
  "skills": [{ "name": "隠密", "value": 5, "domain": "忍術" }],
  "secret_flag": true,
  "background": "..."
}
```

### インデックス

- **idx_characters_user_id**
- **idx_characters_system**
- **GIN(tags)**
- **必要に応じてGIN(sheet_data)** の部分インデックス

## APIスキーマ（エンドポイント定義）

### 認証/ユーザー

- **GET /me**
    - **説明:** 現在のユーザー情報取得（Auth0 JWT検証）
    - **レスポンス:** { id, email, display_name }

### キャラクター

- **GET /characters**
    - **クエリ:** query, tags[], system, page, limit
    - **説明:** 所有キャラ一覧・検索
    - **レスポンス:** ページネーションされたリスト
- **POST /characters**
    - **ボディ:** { system, name, tags[], profile_image_url?, sheet_data? }
    - **説明:** 新規作成（systemに応じて初期テンプレ付与）
    - **レスポンス:** 作成されたcharacter
- **GET /characters/{id}**
    - **説明:** 詳細取得（所有者のみ／公開なら一般も可）
    - **レスポンス:** character
- **PUT /characters/{id}**
    - **ボディ:** { name?, tags?, profile_image_url?, sheet_data? }
    - **説明:** 更新（所有者のみ）
- **DELETE /characters/{id}**
    - **説明:** 削除（所有者のみ）
- **POST /characters/{id}/publish**
    - **ボディ:** { is_public: boolean }
    - **説明:** 公開切替。公開時にshare_token発行、非公開時は無効化
    - **レスポンス:** { is_public, share_token? }
- **GET /share/{token}**
    - **説明:** 公開閲覧用取得（認証不要、読み取り専用）
    - **レスポンス:** 公開character

### 画像アップロード

- **POST /characters/{id}/image/upload-url**
    - **ボディ:** { mime_type }
    - **説明:** 署名付きURL発行（PNG/JPEG、≤5MB、期限付き）
    - **レスポンス:** { upload_url, public_url, expires_at }

### ダイス

- **POST /dice/roll**
    - **ボディ:** { formula: "3d6" }
    - **説明:** 汎用ダイスロール
    - **レスポンス:** { rolls: [..], total }
- **POST /characters/{id}/attributes/auto-roll**
    - **ボディ:** { system }
    - **説明:** システム別一括振り（クトゥルフの生成ルール適用、シノビガミは含めない）
    - **レスポンス:** { attributes, derived }

### 出力・連携（優先度低）

- **GET /characters/{id}/export/pdf**
    - **説明:** PDF出力（サーバレンダリング）
- **GET /characters/{id}/export/chatpalette?system=cthulhu**
    - **説明:** ココフォリア用チャットパレット出力（まずクトゥルフ対応）
- **POST /import/json**
    - **ボディ:** { data: JSON }
    - **説明:** JSONからインポート（1キャラ）
- **GET /characters/{id}/export/json**
    - **説明:** JSONでエクスポート

### エラーレスポンス（共通）

- **形式:** { error: { code, message } }
- **例:** 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity

## 画面遷移図

```
[Landing]
   |
   | Login (Auth0)
   v
[Dashboard: Character List] -- New Character --> [Create: System Select -> Form]
   |  (search/tags/system filter, ads)                | (upload image, tags, dice auto-roll)
   |                                                  |
   | Edit --> [Edit Character Form] <------------------
   |             | publish toggle
   |             v
   |        [Share Link Generated]
   |
   | View (own) --> [Character View (owner)]
   |
   | Open Share URL --> [Public Character View]  (優先度低: SSR/OG)
   |
   v
[Logout]
```

## 非機能設計

### セキュリティ
- **HTTPS:** 常時TLS、HSTS
- **JWT検証:** Auth0 RS256
- **CORS:** 許可オリジン限定
- **レート制限:** 公開エンドポイント
- **画像検証:** MIME/サイズ（≤5MB, PNG/JPEG）

### パフォーマンス
- Nginxキャッシュ、gzip/HTTP/2、静的資産長期キャッシュ
- DB索引とページネーション最適化

### 可観測性
- 構造化ログ（request_id、user_id）
- エラーレート、レイテンシ監視
- フロントのセッション再現（LogRocket）

### テスト/運用
- ユニット（ダイスロジック、JSONB検証）
- 統合（認証、公開リンク）
- E2E（作成→編集→公開→閲覧）
- CI/CD（GitHub Actions）、DBマイグレーション（Alembic）

## 優先度低（明示）

- **SSR（Next.js）導入による共有ページSEO/OG最適化**
- **X（旧Twitter）SSO**
- **PDF出力**
- **ココフォリア出力（まずクトゥルフ対応）**
- **JSONインポート/エクスポート拡張（アカウント単位）**
- **スマホ専用UI**
- **ダークモード**

## システム構成図

```
[Internet]
    |
    v
[ Nginx (HTTPS, HTTP/2, TLS, WAF設定) ]
    |                 \
    |                  \ (static assets: JS/CSS)
    v                   \
[ React SPA (frontend) ] \
    |                      \
    | (JWT via Auth0)       \
    v                        v
[ FastAPI (api) ]        [ Object Storage ]
    |                         (signed URL PUT)
    v
[ PostgreSQL (JSONB) ]

External:
- Auth0 (Hosted Login, Google SSO)
- Google Analytics / LogRocket (frontend)
- Google AdSense (frontend: listing/create pages)

Future (優先度低):
- Next.js SSR service for share pages (OG/SEO)
- External dice / Cocofolia adapter
```

## 開発環境のセットアップ

### 必要な環境
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### 起動方法

```bash
# リポジトリのクローン
git clone git@github.com:1010kazu/character-manager.git
cd character-manager

# Dockerコンテナの起動
docker compose up -d

# サービスの確認
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
# Database: PostgreSQL on port 5432
```

### 開発用コマンド

```bash
# ログの確認
docker compose logs -f

# コンテナの停止
docker compose down

# コンテナの再ビルド
docker compose up -d --build
```

## ライセンス

未定
