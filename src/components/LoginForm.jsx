import { useState } from 'react'
import { useSite } from '../site'
import { api } from '../lib/api'
import { Field } from './ui'

// 관리자 로그인 폼 — 로그인 페이지(/admin/login)와 사이트 헤더의 로그인 팝업에서 함께 씁니다.
export default function LoginForm({ onSuccess, autoFocus = true }) {
  const { setAdmin } = useSite()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post('/auth/login', { id, password })
      setAdmin(true)
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="아이디">
        <input className="input" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" required autoFocus={autoFocus} />
      </Field>
      <Field label="비밀번호">
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </Field>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button className="btn btn-primary w-full py-3" disabled={busy}>
        {busy ? '확인 중…' : '로그인'}
      </button>
    </form>
  )
}
