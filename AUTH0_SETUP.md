# Auth0設定ガイド

このプロジェクトでAuth0認証を使用するために必要な設定手順です。

## 必要な環境変数

### バックエンド（`backend/.env`）
- `AUTH0_DOMAIN`: Auth0テナントドメイン
- `AUTH0_AUDIENCE`: API識別子（Identifier）

### フロントエンド（`frontend/.env`）
- `VITE_AUTH0_DOMAIN`: Auth0テナントドメイン
- `VITE_AUTH0_CLIENT_ID`: アプリケーションのClient ID
- `VITE_AUTH0_AUDIENCE`: API識別子（Identifier）

## Auth0ダッシュボードでの設定手順

### 1. Auth0アカウントの作成

1. https://auth0.com/ にアクセス
2. 無料アカウントを作成（Free tierで利用可能）

### 2. APIの作成（バックエンド用）

1. Auth0ダッシュボードにログイン
2. 左サイドバーから「**Applications**」→「**APIs**」を選択
3. 「**Create API**」ボタンをクリック
4. 以下の情報を入力：
   - **Name**: `Character Manager API`（任意の名前）
   - **Identifier**: `https://character-manager-api`（この値を`AUTH0_AUDIENCE`に使用）
     - 重要: このIdentifierは後で変更できないため、慎重に設定
   - **Signing Algorithm**: `RS256`（デフォルトのまま）
5. 「**Create**」をクリック
6. 作成されたAPIの詳細ページで、**Identifier**の値をコピー
   - これが`AUTH0_AUDIENCE`の値になります

### 3. アプリケーションの作成（フロントエンド用）

1. 左サイドバーから「**Applications**」を選択
2. 「**Create Application**」ボタンをクリック
3. 以下の情報を入力：
   - **Name**: `Character Manager Frontend`（任意の名前）
   - **Application Type**: `Single Page Web Applications`
4. 「**Create**」をクリック

### 4. アプリケーション設定

作成されたアプリケーションの詳細ページで以下を設定：

#### Settings タブ

1. **Allowed Callback URLs**
   - `http://localhost:5173`
   - 本番環境のURLも追加（例: `https://yourdomain.com`）

2. **Allowed Logout URLs**
   - `http://localhost:5173`
   - 本番環境のURLも追加

3. **Allowed Web Origins**
   - `http://localhost:5173`
   - 本番環境のURLも追加

4. **Application URIs**セクション
   - **Application Login URI**: **空欄のまま**（開発環境では設定不要）
     - ⚠️ **重要**: このフィールドはHTTPSが必須のため、開発環境の`http://localhost`は設定できません
     - 本番環境用の設定なので、開発中は空欄で問題ありません
   - **Allowed Origins (CORS)**: 上記と同じURLを設定

#### Advanced Settings タブ

1. **Grant Types**で以下を有効化：
   - ☑ Authorization Code
   - ☑ Refresh Token

### 5. 必要な値を取得

#### AUTH0_DOMAIN（テナントドメイン）
1. 右上のユーザーアイコンをクリック
2. 「**Settings**」を選択
3. 「**Domain**」セクションの値をコピー
   - 例: `dev-xxxxxxxx.us.auth0.com`
   - これが`AUTH0_DOMAIN`の値になります

#### VITE_AUTH0_CLIENT_ID（アプリケーションのClient ID）
1. 「**Applications**」→ 作成したアプリケーションを選択
2. 「**Settings**」タブの「**Client ID**」をコピー
   - これが`VITE_AUTH0_CLIENT_ID`の値になります

#### AUTH0_AUDIENCE（API識別子）
- 手順2で作成したAPIのIdentifierをコピー
- バックエンドとフロントエンドの両方で同じ値を使用

### 6. Google SSOの設定（オプション）

Googleでログインできるようにするには：

1. 左サイドバーから「**Authentication**」→「**Social**」を選択
2. 「**Google**」をクリック
3. Google Cloud Consoleでプロジェクトを作成し、OAuth 2.0認証情報を取得
4. Client IDとClient SecretをAuth0に入力
5. 「**Applications**」タブで、作成したアプリケーションを有効化

## 環境変数ファイルの作成

### バックエンド（`backend/.env`）

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/char_manager

# Auth0 Configuration
AUTH0_DOMAIN=dev-xxxxxxxx.us.auth0.com
AUTH0_AUDIENCE=https://character-manager-api
```

### フロントエンド（`frontend/.env`）

```bash
VITE_AUTH0_DOMAIN=dev-xxxxxxxx.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
VITE_AUTH0_AUDIENCE=https://character-manager-api
```

## 設定値の例

実際の設定例：

```bash
# バックエンド .env
AUTH0_DOMAIN=dev-abc123xyz.us.auth0.com
AUTH0_AUDIENCE=https://character-manager-api

# フロントエンド .env
VITE_AUTH0_DOMAIN=dev-abc123xyz.us.auth0.com
VITE_AUTH0_CLIENT_ID=abc123XYZdef456GHI789
VITE_AUTH0_AUDIENCE=https://character-manager-api
```

## 設定後の動作確認

1. 環境変数ファイルを作成後、Dockerコンテナを再起動：
   ```bash
   docker compose restart backend frontend
   ```

2. フロントエンドにアクセス: http://localhost:5173
3. 「ログイン」ボタンをクリック
4. Auth0のログインページが表示されることを確認

## トラブルシューティング

### エラー: "Invalid redirect_uri"
- 「Allowed Callback URLs」に正確なURLが設定されているか確認
- URLの末尾にスラッシュがないか確認

### エラー: "Invalid client_id"
- Client IDが正しくコピーされているか確認
- フロントエンドの`.env`ファイルが正しく読み込まれているか確認

### エラー: "Invalid audience"
- APIのIdentifierが正しく設定されているか確認
- バックエンドとフロントエンドで同じ値を使用しているか確認

## 参考リンク

- [Auth0公式ドキュメント](https://auth0.com/docs)
- [Single Page Application SDK](https://auth0.com/docs/quickstart/spa/react)
- [API設定ガイド](https://auth0.com/docs/apis)

