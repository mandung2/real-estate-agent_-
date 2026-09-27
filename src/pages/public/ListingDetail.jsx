import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSite } from '../../site'
import { photoUrl } from '../../lib/api'
import { priceLabel, won, pyeong, floorLabel, telHref } from '../../lib/format'
import { DEAL_STYLE } from '../../lib/constants'
import { useApi, Spinner, ErrorBox, StatusBadge } from '../../components/ui'
import InquiryForm from '../../components/InquiryForm'
import Icon from '../../components/icons'

export default function ListingDetail() {
  const { id } = useParams()
  const { settings: s, admin } = useSite()
  const { data, loading, error } = useApi(`/listings/${id}`)
  const [idx, setIdx] = useState(0)

  if (loading) return <Spinner />
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-bold">매물을 찾을 수 없습니다.</p>
        <p className="mt-2 text-sm text-navy-600">거래가 완료되었거나 비공개로 전환된 매물일 수 있습니다.</p>
        <Link to="/listings" className="btn btn-primary mt-6">
          다른 매물 보기
        </Link>
      </div>
    )

  const l = data.item
  const photos = l.photos || []
  const cur = photos[idx]
  const phone = s.mobile || s.phone
  const specs = [
    ['거래 유형', l.deal_type],
    ['매물 종류', l.property_type],
    ['가격', priceLabel(l) + (l.price != null ? ' 만원' : '')],
    ['관리비', l.maintenance_fee != null ? `${won(l.maintenance_fee)} 만원` : ''],
    ['공급면적', l.area_supply ? `${l.area_supply}㎡ (${pyeong(l.area_supply)}평)` : ''],
    ['전용면적', l.area_exclusive ? `${l.area_exclusive}㎡ (${pyeong(l.area_exclusive)}평)` : ''],
    ['층', floorLabel(l)],
    ['방 / 욕실', l.rooms || l.bathrooms ? `${l.rooms ?? '-'}개 / ${l.bathrooms ?? '-'}개` : ''],
    ['방향', l.direction],
    ['입주 가능일', l.move_in],
    ['주차', l.parking],
    ['사용승인', l.built_year ? `${l.built_year}년` : ''],
    ['위치', l.address_public],
  ].filter(([, v]) => v)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/listings" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:text-navy-900">
          <Icon name="chevronLeft" /> 매물 목록
        </Link>
        {admin && (
          <Link to={`/admin/listings/${l.id}`} className="btn btn-gold">
            이 매물 수정
          </Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* 사진 */}
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gold-100">
            {cur ? (
              <img src={photoUrl(cur.id)} alt={l.title} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center">
                <img src="/logo-full.png" alt="" className="h-40 opacity-25" />
              </div>
            )}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setIdx((idx - 1 + photos.length) % photos.length)}
                  className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow hover:bg-white"
                  aria-label="이전 사진"
                >
                  <Icon name="chevronLeft" className="size-5" />
                </button>
                <button
                  onClick={() => setIdx((idx + 1) % photos.length)}
                  className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow hover:bg-white"
                  aria-label="다음 사진"
                >
                  <Icon name="chevronRight" className="size-5" />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-navy-950/70 px-2.5 py-1 text-xs font-semibold text-white">
                  {idx + 1} / {photos.length}
                </span>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setIdx(i)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 ${i === idx ? 'ring-gold-600' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={photoUrl(p.id, true)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 요약 */}
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md px-2 py-1 text-xs font-bold ${DEAL_STYLE[l.deal_type]}`}>{l.deal_type}</span>
              <span className="rounded-md bg-gold-100 px-2 py-1 text-xs font-bold text-gold-700">{l.property_type}</span>
              {l.status !== '광고중' && <StatusBadge status={l.status} />}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">{l.title}</h1>
            <p className="mt-2 text-3xl font-black tracking-tight text-navy-900">
              {priceLabel(l)}
              {l.price != null && <span className="ml-1 text-lg font-bold text-navy-600">만원</span>}
            </p>
            {l.address_public && (
              <p className="mt-2 flex items-center gap-1 text-sm text-navy-600">
                <Icon name="map" /> {l.address_public}
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#ebe6dc] bg-[#ebe6dc] text-sm">
            {specs.map(([k, v]) => (
              <div key={k} className="bg-white px-4 py-3">
                <dt className="text-xs text-navy-600">{k}</dt>
                <dd className="mt-0.5 font-semibold">{v}</dd>
              </div>
            ))}
            {specs.length % 2 === 1 && <div className="bg-white" />}
          </dl>

          {phone && (
            <a href={telHref(phone)} className="btn btn-primary w-full py-3 text-base">
              <Icon name="phone" /> 전화로 문의 {phone}
            </a>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="mb-3 text-lg font-bold">상세 설명</h2>
          <div className="whitespace-pre-wrap rounded-2xl border border-[#ebe6dc] bg-white p-6 text-[15px] leading-relaxed text-navy-800">
            {l.description || '상세 설명은 문의 주시면 안내드리겠습니다.'}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold">이 매물 문의하기</h2>
          <div className="rounded-2xl border border-[#ebe6dc] bg-white p-5">
            <InquiryForm listingId={l.id} defaultMessage={`[${l.title}] 매물 문의드립니다.`} />
          </div>
        </section>
      </div>
    </div>
  )
}
