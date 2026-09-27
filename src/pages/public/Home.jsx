import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSite } from '../../site'
import { useApi, Spinner } from '../../components/ui'
import ListingCard from '../../components/ListingCard'
import Icon from '../../components/icons'
import { DEAL_TYPES, PROPERTY_ICONS } from '../../lib/constants'
import { date } from '../../lib/format'

export default function Home() {
  const { settings: s } = useSite()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const featured = useApi('/listings?featured=1&limit=6')
  const latest = useApi('/listings?limit=6')
  const posts = useApi('/posts?limit=4')

  // 추천 매물이 없으면 최신 매물로 대체
  const showcase = featured.data?.items?.length ? featured.data.items : latest.data?.items
  const loading = featured.loading || latest.loading

  const search = (e) => {
    e.preventDefault()
    navigate('/listings' + (q ? `?q=${encodeURIComponent(q)}` : ''))
  }

  return (
    <>
      {/* 히어로 */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-gold-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 size-[360px] rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/40 px-3 py-1 text-xs font-semibold tracking-wide text-gold-400">
              {s.office_name || '정교한 우리집 공인중개사사무소'}
            </p>
            <h1 className="whitespace-pre-line text-3xl font-extrabold leading-[1.3] tracking-tight sm:text-[44px]">
              {s.hero_title || '꼼꼼하게, 정교하게.\n당신의 집을 찾아드립니다.'}
            </h1>
            {s.hero_subtitle && <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/70 sm:text-base">{s.hero_subtitle}</p>}

            <form onSubmit={search} className="mt-8 flex max-w-lg gap-2 rounded-xl bg-white p-1.5 shadow-xl">
              <div className="flex flex-1 items-center gap-2 px-3 text-navy-600">
                <Icon name="search" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="동네, 단지명으로 검색"
                  className="w-full bg-transparent py-2 text-[15px] text-navy-900 outline-none placeholder:text-navy-600/60"
                />
              </div>
              <button className="btn btn-gold px-5">검색</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {DEAL_TYPES.slice(0, 3).map((d) => (
                <Link key={d} to={`/listings?deal_type=${d}`} className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/85 hover:bg-white/20">
                  {d}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="grid size-72 place-items-center rounded-[2.5rem] bg-cream shadow-2xl ring-1 ring-gold-400/30">
              <img src="/logo-full.png" alt="정교한 우리집" className="h-56 object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* 매물 종류 바로가기 */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8">
          {Object.keys(PROPERTY_ICONS).map((t) => (
            <Link
              key={t}
              to={`/listings?property_type=${encodeURIComponent(t)}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-[#ebe6dc] bg-white px-1 py-4 transition hover:-translate-y-0.5 hover:border-gold-400 sm:py-6"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-gold-100 text-gold-700 transition group-hover:bg-navy-900 group-hover:text-gold-400 sm:size-14">
                <Icon name={PROPERTY_ICONS[t]} className="size-6 sm:size-7" strokeWidth={1.6} />
              </span>
              <span className="text-[13px] font-bold text-navy-800 sm:text-[15px]">{t}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 추천 매물 */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-gold-700">직접 확인한 매물</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">추천 매물</h2>
          </div>
          <Link to="/listings" className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-gold-700">
            전체 보기 <Icon name="chevronRight" />
          </Link>
        </div>
        {loading ? (
          <Spinner />
        ) : showcase?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#d9d5cc] bg-white px-6 py-14 text-center text-navy-600">
            현재 준비 중인 매물이 곧 올라옵니다. 찾으시는 조건이 있다면 <Link to="/contact" className="font-semibold text-gold-700 underline">상담 문의</Link>를 남겨주세요.
          </div>
        )}
      </section>

      {/* 약속 */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['직접 확인', '현장을 직접 보고 확인한 매물만 소개합니다. 사진과 실제가 다르지 않도록.'],
            ['정확한 정보', '권리관계, 관리비, 입주 가능일까지 계약 전에 꼼꼼히 설명드립니다.'],
            ['끝까지 책임', '계약 이후 잔금·입주까지 필요한 절차를 함께 챙겨드립니다.'],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-2xl border border-[#ebe6dc] bg-white p-6">
              <span className="gold-text text-3xl font-black">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 소식 */}
      {posts.data?.items?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight">사무소 소식</h2>
            <Link to="/posts" className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-gold-700">
              더 보기 <Icon name="chevronRight" />
            </Link>
          </div>
          <ul className="divide-y divide-[#ebe6dc] overflow-hidden rounded-2xl border border-[#ebe6dc] bg-white">
            {posts.data.items.map((p) => (
              <li key={p.id}>
                <Link to={`/posts/${p.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-gold-100/40">
                  <span className="shrink-0 rounded bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-700">{p.category}</span>
                  <span className="line-clamp-1 flex-1 font-medium">{p.title}</span>
                  <span className="shrink-0 text-xs text-navy-600">{date(p.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-gold-500 to-gold-700 px-8 py-10 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold">원하시는 조건을 알려주세요</h2>
            <p className="mt-2 text-white/85">사이트에 올라오지 않은 매물도 조건에 맞춰 찾아드립니다.</p>
          </div>
          <Link to="/contact" className="btn bg-white px-6 py-3 text-base text-navy-900 hover:bg-cream">
            상담 문의하기
          </Link>
        </div>
      </section>
    </>
  )
}
