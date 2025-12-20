import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiEdit3, FiImage, FiLayers, FiLogIn, FiShare2 } from 'react-icons/fi';
import { useAuth } from '../auth/useAuth';
import { IconText } from '../components/IconText';
import { LoadingSpinner } from '../components/LoadingSpinner';

const parseShareToken = (raw: string): string | null => {
  const value = raw.trim();
  if (!value) return null;

  // token only
  if (/^[A-Za-z0-9_-]+$/.test(value)) return value;

  // try URL parsing
  try {
    const url = new URL(value);
    const m = url.pathname.match(/\/share\/([^/?#]+)/);
    if (m?.[1]) return m[1];
  } catch {
    // ignore
  }

  // fallback: plain text that includes /share/<token>
  const m = value.match(/\/share\/([^/?#]+)/);
  return m?.[1] ?? null;
};

export const Landing = () => {
  const { isLoading, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [shareInput, setShareInput] = useState('');
  const [shareError, setShareError] = useState<string | null>(null);

  const shareToken = useMemo(() => parseShareToken(shareInput), [shareInput]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen message="認証状態を確認中..." />;
  }

  const handleOpenShare = () => {
    const token = parseShareToken(shareInput);
    if (!token) {
      setShareError('共有リンク（URL）またはトークンを入力してください。');
      return;
    }
    setShareError(null);
    navigate(`/share/${token}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
          <Link to="/" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.02em' }}>きゃらまね</span>
              <span className="text-xs text-muted">TRPGキャラクターシート管理</span>
            </div>
          </Link>
          <button className="btn btn-primary btn-lg" onClick={login} type="button">
            <IconText icon={<FiLogIn />}>ログインして始める</IconText>
          </button>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section style={{ padding: '3rem 0 2rem' }}>
          <div className="container">
            <div
              style={{
                display: 'grid',
                gap: '2rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                alignItems: 'center',
              }}
            >
              <div>
                <div className="tag tag-secondary mb-sm" style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-border-light)' }}>
                作って、見返して、共有する
                </div>
                <h1 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.4rem)', marginBottom: '0.75rem' }}>
                キャラシ管理を一つに
                </h1>
                <p className="text-muted" style={{ fontSize: '1rem', margin: 0 }}>
                  クトゥルフ / シノビガミ / SW2.5 に対応
                  <br></br>
                  COCOFOLIA連携や共有リンク発行で、セッション準備と運用をスムーズに
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary btn-lg" onClick={login} type="button">
                    <IconText icon={<FiLogIn />}>ログインして始める</IconText>
                  </button>
                </div>

                <p className="text-xs text-muted mt-sm" style={{ marginBottom: 0 }}>
                  ログインは Auth0 を利用します。
                </p>
              </div>

              <div
                className="card"
                style={{
                  padding: '1.25rem',
                  background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-muted) 100%)',
                }}
              >
                <h2 style={{ marginBottom: '0.75rem' }}>できること</h2>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span aria-hidden style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }}><FiEdit3 /></span>
                    <div>
                      <div className="font-bold">キャラシ作成 / 編集</div>
                      <div className="text-small text-muted">フォームで入力し、シートとして表示</div>
                    </div>
                  </div>
                  <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span aria-hidden style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }}><FiImage /></span>
                    <div>
                      <div className="font-bold">キャラシ一覧 / 詳細</div>
                      <div className="text-small text-muted">作成したキャラクターを一覧管理・詳細を確認</div>
                    </div>
                  </div>
                  <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span aria-hidden style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }}><FiLayers /></span>
                    <div>
                      <div className="font-bold">システム別シート対応</div>
                      <div className="text-small text-muted">クトゥルフ / シノビガミ / SW2.5</div>
                    </div>
                  </div>
                  <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span aria-hidden style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }}><FiShare2 /></span>
                    <div>
                      <div className="font-bold">共有リンク発行</div>
                      <div className="text-small text-muted">GM/同卓に URL を渡すだけで閲覧が可能</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '1rem 0 2.5rem' }}>
          <div className="container">
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>始め方</h2>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: '0.5rem' }}>
                <li><span className="font-bold">ログイン</span>（ボタンから Auth0 ログイン）</li>
                <li><span className="font-bold">新規作成</span>（マイページからシートを作る）</li>
                <li><span className="font-bold">必要に応じて共有</span>（共有リンクを発行してURLを渡す）</li>
              </ol>
            </div>
          </div>
        </section>

        <section id="share" style={{ padding: '0 0 2.5rem' }}>
          <div className="container">
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>共有リンクをお持ちの方</h2>
              <p className="text-muted" style={{ marginTop: 0 }}>
                ログイン不要で閲覧できます。共有された URL（`/share/...`）またはトークンを貼り付けてください。
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  className="input"
                  style={{ minWidth: 260, flex: '1 1 360px' }}
                  placeholder="例: https://.../share/xxxxxxxx  または xxxxxxxx"
                  value={shareInput}
                  onChange={(e) => {
                    setShareInput(e.target.value);
                    if (shareError) setShareError(null);
                  }}
                />
                <button className="btn btn-secondary" onClick={handleOpenShare} type="button" disabled={!shareToken}>
                  開く
                </button>
              </div>
              {shareError && <div className="text-small" style={{ color: 'var(--color-danger)', marginTop: '0.5rem' }}>{shareError}</div>}
            </div>
          </div>
        </section>

        <section style={{ padding: '0 0 3rem' }}>
          <div className="container">
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>よくある質問</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <details className="card" style={{ padding: '0.75rem 1rem' }}>
                  <summary className="font-bold" style={{ cursor: 'pointer' }}>何が保存されますか？</summary>
                  <div className="text-small text-muted" style={{ marginTop: '0.5rem' }}>
                    キャラクターの基本情報、タグ、シート内容、アップロードした画像などを保存します。
                  </div>
                </details>
                <details className="card" style={{ padding: '0.75rem 1rem' }}>
                  <summary className="font-bold" style={{ cursor: 'pointer' }}>共有リンクは誰でも見られますか？</summary>
                  <div className="text-small text-muted" style={{ marginTop: '0.5rem' }}>
                    共有リンク（URL）を知っている人は閲覧できます。共有したくないキャラはリンクを発行しないでください。
                  </div>
                </details>
                <details className="card" style={{ padding: '0.75rem 1rem' }}>
                  <summary className="font-bold" style={{ cursor: 'pointer' }}>ログインしないと何もできませんか？</summary>
                  <div className="text-small text-muted" style={{ marginTop: '0.5rem' }}>
                    キャラの作成/編集/マイページ閲覧にはログインが必要です。共有リンクの閲覧はログイン不要です。
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '1.25rem 0 2rem' }}>
        <div className="container">
          <div className="text-xs text-muted" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <span>© きゃらまね</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

