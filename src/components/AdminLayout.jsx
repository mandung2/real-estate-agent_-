import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSite } from '../site'
import { Spinner, NBadge, useUnreadInquiries } from './ui'
import Logo from './Logo'
import Icon from './icons'

const NAV = [
  { to: '/admin', label: '대시보드', icon: 'dashboard', end: true },
  { to: '/admin/listings', label: '매물 관리', icon: 'building' },
  { to: '/admin/completed', label: '거래완료', icon: 'check' },
  { to: '/admin/clients', label: '고객 관리', icon: 'users' },
  { to: '/admin/inquiries', label: '문의함', icon: 'inbox' },
  { to: '/admin/posts', label: '게시글', icon: 'doc' },
  { to: '/admin/settings', label: '사무소 정보', icon: 'settings' },
]

// 휴대폰 하단 탭바: 자주 쓰는 4개 + 나머지는 '더보기'
const TABS = [
  { to: '/admin', label: '홈', icon: 'dashboard', end: true },
  { to: '/admin/listings', label: '매물', icon: 'building' },
  { to: '/admin/clients', label: '고객', icon: 'users' },
  { to: '/admin/inquiries', label: '문의함', icon: 'inbox' },
]
const MORE = NAV.filter((n) => !TABS.some((t) => t.to === n.to))

export default function AdminLayout() {
  const { admin, logout } = useSite()
  const location = useLocation()
  const navigate = useNavigate()
  const unread = useUnreadInquiries(!!admin)
  const [moreOpen, setMoreOpen] = useState(false)
  const badge = (n) => n.to === '/admin/inquiries' && unread > 0

  useEffect(() => {
    setMoreOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (admin === null) return <Spinner label="로그인 확인 중…" />
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />

  const doLogout = async () => {
    await logout()
    navigate('/')
  }

  const linkCls = ({ isActive }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
      isActive ? 'bg-white/10 text-gold-400' : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`
  const moreActive = MORE.some((n) => location.pathname.startsWith(n.to))

  return (
    <div className="min-h-screen bg-[#f4f2ee] lg:pl-60">
      {/* 데스크톱 사이드바 */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-navy-900 p-4 lg:flex">
        <div className="px-1 pb-6 pt-1">
          <Logo to="/admin" light sub="관리자" />
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
              <Icon name={n.icon} /> {n.label}
              {badge(n) && <NBadge className="-ml-1" />}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 pt-3">
          <Link to="/" target="_blank" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 hover:text-white">
            <Icon name="external" /> 사이트 보기
          </Link>
          <button onClick={doLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 hover:text-white">
            <Icon name="logout" /> 로그아웃
          </button>
        </div>
      </aside>

      {/* 모바일 상단바 */}
      <header className="sticky top-0 z-30 bg-navy-900 lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo to="/admin" light sub="관리자" />
          <div className="flex items-center">
            <Link to="/" target="_blank" className="grid size-10 place-items-center rounded-lg text-white/80" aria-label="사이트 보기">
              <Icon name="external" className="size-5" />
            </Link>
            <button onClick={doLogout} className="grid size-10 place-items-center rounded-lg text-white/80" aria-label="로그아웃">
              <Icon name="logout" className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-[calc(var(--tabbar-h)+1.5rem)] pt-5 sm:px-6 lg:py-8">
        <Outlet />
      </main>

      {/* 모바일 하단 탭바 */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy-900 lg:hidden">
        <div className="grid h-16 grid-cols-5">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${isActive ? 'text-gold-400' : 'text-white/60'}`
              }
            >
              <span className="relative">
                <Icon name={t.icon} className="size-6" />
                {badge(t) && <NBadge className="absolute -right-3 -top-1.5 ring-2 ring-navy-900" />}
              </span>
              {t.label}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${moreActive ? 'text-gold-400' : 'text-white/60'}`}
          >
            <Icon name="menu" className="size-6" />
            더보기
          </button>
        </div>
      </nav>

      {/* 더보기 시트 */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="pb-safe absolute inset-x-0 bottom-0 rounded-t-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-slate-200" />
            <div className="p-3">
              {MORE.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-semibold ${isActive ? 'bg-gold-100 text-gold-700' : 'text-navy-800 active:bg-slate-100'}`
                  }
                >
                  <Icon name={n.icon} className="size-5" /> {n.label}
                </NavLink>
              ))}
              <div className="my-2 border-t border-slate-100" />
              <Link to="/" target="_blank" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-semibold text-navy-800 active:bg-slate-100">
                <Icon name="external" className="size-5" /> 사이트 보기
              </Link>
              <button onClick={doLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-semibold text-rose-600 active:bg-rose-50">
                <Icon name="logout" className="size-5" /> 로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function PageHeader({ title, desc, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
        {desc && <p className="mt-1 text-sm text-navy-600">{desc}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-xl border border-[#e7e2d8] bg-white ${className}`}>{children}</div>
}
