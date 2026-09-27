import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSite } from '../site'
import { telHref } from '../lib/format'
import Logo from './Logo'
import Icon from './icons'

const NAV = [
  { to: '/listings', label: '매물 보기' },
  { to: '/posts', label: '소식' },
  { to: '/contact', label: '상담 문의' },
]

export default function PublicLayout() {
  const { settings: s, admin } = useSite()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const phone = s.mobile || s.phone

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-[#ebe6dc] bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 text-[15px] font-semibold transition ${isActive ? 'text-gold-700' : 'text-navy-800 hover:text-gold-700'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            {phone && (
              <a href={telHref(phone)} className="btn btn-primary ml-3">
                <Icon name="phone" /> {phone}
              </a>
            )}
            {admin && (
              <Link to="/admin" className="btn btn-gold ml-2">
                관리자
              </Link>
            )}
          </nav>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="메뉴">
            <Icon name={open ? 'x' : 'menu'} className="size-6" />
          </button>
        </div>
        {open && (
          <nav className="border-t border-[#ebe6dc] bg-cream px-4 pb-4 pt-2 md:hidden">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className="block rounded-lg px-3 py-3 text-base font-semibold text-navy-800 active:bg-gold-100">
                {n.label}
              </NavLink>
            ))}
            {phone && (
              <a href={telHref(phone)} className="btn btn-primary mt-2 w-full">
                <Icon name="phone" /> 전화 상담 {phone}
              </a>
            )}
            {admin && (
              <Link to="/admin" className="btn btn-gold mt-2 w-full">
                관리자 페이지
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 bg-navy-900 text-[13px] text-white/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <Logo light sub={s.office_name} />
            {/* 공인중개사법상 중개대상물 표시·광고 시 필수 기재사항 */}
            <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {[
                ['상호', s.office_name],
                ['대표 공인중개사', s.ceo_name],
                ['중개사무소 등록번호', s.reg_number],
                ['소재지', s.address],
                ['대표전화', s.phone],
                ['휴대전화', s.mobile],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="shrink-0 text-white/40">{k}</dt>
                    <dd className="text-white/75">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            {s.hours && <p className="text-white/70">{s.hours}</p>}
            <p>© {new Date().getFullYear()} 정교한 우리집. All rights reserved.</p>
            <Link to={admin ? '/admin' : '/admin/login'} className="inline-flex items-center gap-1 text-white/35 hover:text-gold-400">
              <Icon name="lock" className="size-3.5" /> 관리자
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
