import { LockKeyhole } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'

function AdminLogin() {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    axiosInstance
      .get('/auth/me')
      .then(() => navigate('/admin', { replace: true }))
      .catch(() => {})
  }, [navigate])

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await axiosInstance.post('/auth/login', { login, password })
      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Не удалось войти.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section-pad flex min-h-screen items-center pt-36">
      <div className="page-shell max-w-xl">
        <form onSubmit={onSubmit} className="glass-panel rounded-lg p-6 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-white shadow-soft">
            <LockKeyhole size={23} />
          </span>
          <p className="eyebrow mt-6">Закрытый вход</p>
          <h1 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">
            Админ-панель
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted">
            Этот раздел не отображается в навигации и доступен только после
            серверной авторизации.
          </p>

          <div className="mt-6 grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-semibold text-text">Логин</span>
              <input
                className="field-input"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                autoComplete="username"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-text">Пароль</span>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
          </div>

          {error && (
            <p className="mt-5 rounded-lg bg-coral/12 px-4 py-3 text-sm font-medium text-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring mt-6 inline-flex w-full items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Проверяем...' : 'Войти'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default AdminLogin
