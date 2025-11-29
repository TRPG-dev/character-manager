import { useEffect, useState } from 'react'
import './App.css'
import { useAuth } from './auth/useAuth'
import { getUser, User } from './services/api'

function App() {
  const { isAuthenticated, isLoading, login, logout, getAccessToken } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && !loadingUser) {
        setLoadingUser(true)
        try {
          const token = await getAccessToken()
          if (token) {
            const userData = await getUser(token)
            setUser(userData)
          }
        } catch (error) {
          console.error('Failed to fetch user:', error)
        } finally {
          setLoadingUser(false)
        }
      }
    }
    fetchUser()
  }, [isAuthenticated, loadingUser, getAccessToken])

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>TRPGキャラクターシート保管・作成サービス</h1>
        <p>ログインしてご利用ください</p>
        <button onClick={login} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          ログイン
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>TRPGキャラクターシート保管・作成サービス</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <span>こんにちは、{user.display_name}さん</span>
          )}
          <button onClick={logout} style={{ padding: '0.5rem 1rem' }}>
            ログアウト
          </button>
        </div>
      </header>
      
      {loadingUser ? (
        <div>ユーザー情報を取得中...</div>
      ) : user ? (
        <div>
          <h2>ダッシュボード</h2>
          <p>メールアドレス: {user.email}</p>
          <p>表示名: {user.display_name}</p>
        </div>
      ) : (
        <div>ユーザー情報の取得に失敗しました</div>
      )}
    </div>
  )
}

export default App
