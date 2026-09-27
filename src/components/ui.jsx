import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { STATUS_STYLE } from '../lib/constants'

// ---- 데이터 불러오기 훅 --------------------------------------------------
export function useApi(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!path) return
    let alive = true
    setLoading(true)
    api
      .get(path)
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [path, tick])

  return { data, error, loading, reload, setData }
}

// ---- 토스트 알림 ---------------------------------------------------------
export function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('jh-toast', { detail: { message, type, id: Math.random() } }))
}

export function Toaster() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const on = (e) => {
      const t = e.detail
      setItems((prev) => [...prev, t])
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 2800)
    }
    window.addEventListener('jh-toast', on)
    return () => window.removeEventListener('jh-toast', on)
  }, [])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${
            t.type === 'error' ? 'bg-rose-600 text-white' : 'bg-navy-900 text-white'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ---- 작은 UI 조각들 ------------------------------------------------------
export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLE[status] || 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
      {status}
    </span>
  )
}

export function Spinner({ label = '불러오는 중…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-navy-600">
      <span className="size-4 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
      {label}
    </div>
  )
}

export function ErrorBox({ error }) {
  if (!error) return null
  return <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error.message}</div>
}

export function Empty({ children }) {
  return <div className="rounded-xl border border-dashed border-[#d9d5cc] bg-white/60 px-4 py-14 text-center text-sm text-navy-600">{children}</div>
}

// error: 저장은 막지 않고 칸 아래에 빨간 경고만 띄웁니다.
export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-semibold text-navy-800">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-navy-600/80">{hint}</span>
      )}
    </label>
  )
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-navy-800 disabled:opacity-50"
    >
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-gold-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  )
}

export function Select({ value, onChange, options, placeholder, className = '' }) {
  return (
    <select className={`input ${className}`} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-navy-600 hover:bg-slate-100" aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ---- 안 읽은 문의 'N' 표시 ------------------------------------------------
// 관리자일 때만 1분마다 확인하고, 창으로 돌아오거나 문의함을 열면 즉시 다시 셉니다.
export function useUnreadInquiries(enabled) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!enabled) return setCount(0)
    let alive = true
    const load = () =>
      api
        .get('/inquiries/unread')
        .then((d) => alive && setCount(d.unread))
        .catch(() => {})
    const onVisible = () => document.visibilityState === 'visible' && load()
    load()
    const timer = setInterval(load, 60000)
    window.addEventListener('jh-inquiries-changed', load)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      clearInterval(timer)
      window.removeEventListener('jh-inquiries-changed', load)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [enabled])
  return count
}

export function NBadge({ className = '' }) {
  return (
    <span className={`inline-grid size-[18px] shrink-0 place-items-center rounded-full bg-rose-500 text-[10px] font-black leading-none text-white ${className}`} aria-label="새 문의">
      N
    </span>
  )
}
