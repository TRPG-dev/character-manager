# Auth0 トラブルシューティングガイド

## よくあるエラーと解決方法

### エラー: "Initiate login uri must be https"

**エラーメッセージ:**
```
Payload validation error: 'Object didn't pass validation for format absolute-https-uri-with-placeholders-or-empty: http://localhost:5173' on property initiate_login_uri
```

**原因:**
`Application Login URI`（Initiate Login URI）フィールドに`http://localhost:5173`を設定しようとしているため。

**解決方法:**
1. Auth0ダッシュボードでアプリケーション設定を開く
2. **Application Login URI**フィールドを**空欄のまま**にする
3. このフィールドは本番環境用の設定で、開発環境では必須ではありません
4. HTTPは許可されていないため、開発環境（`http://localhost`）では設定できません

**重要:**
- 開発環境では`Application Login URI`は空欄で問題ありません
- `Allowed Callback URLs`、`Allowed Logout URLs`、`Allowed Web Origins`のみ設定すればOKです

---

### エラー: "AUTH0_AUDIENCE"の設定が間違っている

**よくある間違い:**
```bash
# ❌ 間違い: Management APIのエンドポイント
AUTH0_AUDIENCE=https://dev-xxxxx.us.auth0.com/api/v2/

# ✅ 正しい: 自分で作成したAPIのIdentifier
AUTH0_AUDIENCE=https://character-manager-api
```

**確認方法:**
1. Auth0ダッシュボード → **Applications** → **APIs**
2. 自分で作成したAPI（例: `Character Manager API`）を選択
3. **Settings**タブの**Identifier**を確認
4. このIdentifierが`AUTH0_AUDIENCE`の値です

**正しい設定例:**
```bash
# backend/.env
AUTH0_AUDIENCE=https://character-manager-api

# frontend/.env
VITE_AUTH0_AUDIENCE=https://character-manager-api
```

---

### エラー: "Callback URL mismatch"

**エラーメッセージ:**
```
The provided redirect_uri is not in the list of allowed callback URLs.
```

**原因:**
Auth0側で設定した`Allowed Callback URLs`と、アプリケーションから送信される`redirect_uri`が一致していない。

**解決方法:**
1. Auth0ダッシュボード → アプリケーション設定 → **Allowed Callback URLs**
2. 以下を追加（1行に1つずつ）:
   ```
   http://localhost:5173
   http://localhost:5173/
   ```
3. **Allowed Logout URLs**にも同じURLを追加
4. **Allowed Web Origins**にも同じURLを追加
5. **設定を保存**

**注意:**
- URLの末尾の`/`（スラッシュ）の有無でもエラーになることがあります
- 念のため、両方のパターン（`/`ありとなし）を追加しておくことを推奨

---

### エラー: "Invalid client_id"

**原因:**
フロントエンドの`.env`ファイルの`VITE_AUTH0_CLIENT_ID`が正しく設定されていない。

**解決方法:**
1. Auth0ダッシュボード → アプリケーション → **Settings**タブ
2. **Client ID**をコピー
3. `frontend/.env`ファイルに正しく設定:
   ```bash
   VITE_AUTH0_CLIENT_ID=正しいClient IDをここに貼り付け
   ```
4. Dockerコンテナを再起動:
   ```bash
   docker compose restart frontend
   ```

---

### エラー: "Invalid audience"

**原因:**
バックエンドとフロントエンドで`AUTH0_AUDIENCE`の値が異なるか、正しく設定されていない。

**解決方法:**
1. バックエンドとフロントエンドで**同じ値**を使用しているか確認
2. 値は、作成したAPIの**Identifier**であることを確認
3. 両方の`.env`ファイルを確認:
   ```bash
   # backend/.env
   AUTH0_AUDIENCE=https://character-manager-api
   
   # frontend/.env
   VITE_AUTH0_AUDIENCE=https://character-manager-api
   ```
4. Dockerコンテナを再起動:
   ```bash
   docker compose restart backend frontend
   ```

---

### 環境変数が読み込まれない

**原因:**
`.env`ファイルが正しく配置されていない、またはコンテナが再起動されていない。

**解決方法:**
1. `.env`ファイルの場所を確認:
   ```bash
   # バックエンド
   ls -la backend/.env
   
   # フロントエンド
   ls -la frontend/.env
   ```
2. ファイルが存在することを確認
3. Dockerコンテナを再起動:
   ```bash
   docker compose restart backend frontend
   ```
4. 環境変数が読み込まれているか確認:
   ```bash
   # バックエンド
   docker compose exec backend env | grep AUTH0
   
   # フロントエンド（VITE_プレフィックス付きのみ表示）
   docker compose exec frontend env | grep VITE_AUTH0
   ```

---

## 設定チェックリスト

認証が動作しない場合、以下を確認してください:

- [ ] Auth0アカウントを作成済み
- [ ] APIを作成し、Identifierを取得済み
- [ ] Single Page Application（SPA）タイプのアプリケーションを作成済み
- [ ] `Allowed Callback URLs`に`http://localhost:5173`を設定済み
- [ ] `Allowed Logout URLs`に`http://localhost:5173`を設定済み
- [ ] `Allowed Web Origins`に`http://localhost:5173`を設定済み
- [ ] `Application Login URI`は**空欄**
- [ ] `backend/.env`ファイルに`AUTH0_DOMAIN`と`AUTH0_AUDIENCE`を設定済み
- [ ] `frontend/.env`ファイルに`VITE_AUTH0_DOMAIN`、`VITE_AUTH0_CLIENT_ID`、`VITE_AUTH0_AUDIENCE`を設定済み
- [ ] バックエンドとフロントエンドの`AUTH0_AUDIENCE`の値が**同じ**
- [ ] Dockerコンテナを再起動済み

---

## 参考リンク

- [Auth0 Single Page App クイックスタート](https://auth0.com/docs/quickstart/spa/react)
- [Auth0 API設定ガイド](https://auth0.com/docs/apis)

