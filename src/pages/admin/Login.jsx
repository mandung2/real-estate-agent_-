import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSite } from '../../site'
import { api } from '../../lib/api'
import { Field } from '../../components/ui'

export default function Login() {
  const { admin, setAdmin } = useSite()
  const navigate = useNavigate()
  const location = useLocation()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (admin) return <Navigate to="/admin" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post('/auth/login', { id, password })
      setAdmin(true)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-3xl bg-cream shadow-xl">
            <img src="/logo-mark.png" alt="" className="w-16" />
          </div>
          <h1 className="mt-5 text-xl font-extrabold text-white">정교한 우리집 관리자</h1>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
          <Field label="아이디">
            <input className="input" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" required autoFocus />
          </Field>
          <Field label="비밀번호">
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </Field>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button className="btn btn-primary w-full py-3" disabled={busy}>
            {busy ? '확인 중…' : '로그인'}
          </button>
        </form>
        <Link to="/" className="mt-6 block text-center text-sm text-white/50 hover:text-white">
          ← 사이트로 돌아가기
        </Link>
      </div>
    </div>
  )
}
