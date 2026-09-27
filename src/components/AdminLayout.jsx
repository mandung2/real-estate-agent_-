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

export default function AdminLayout() {
  const { admin, logout } = useSite()
  const location = useLocation()
  const navigate = useNavigate()
  const unread = useUnreadInquiries(!!admin)
  const badge = (n) => n.to === '/admin/inquiries' && unread > 0

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
          <div className="flex items-center gap-1">
            <Link to="/" target="_blank" className="rounded-lg p-2 text-white/80" aria-label="사이트 보기">
              <Icon name="external" className="size-5" />
            </Link>
            <button onClick={doLogout} className="rounded-lg p-2 text-white/80" aria-label="로그아웃">
              <Icon name="logout" className="size-5" />
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={(s) => linkCls(s) + ' shrink-0 !gap-1 !py-1.5'}>
              {n.label}
              {badge(n) && <NBadge />}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}

export function PageHeader({ title, desc, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
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
