import { Link } from 'react-router-dom'
import { photoUrl } from '../lib/api'
import { priceLabel, areaLabel, floorLabel } from '../lib/format'
import { DEAL_STYLE } from '../lib/constants'
import Icon from './icons'

export default function ListingCard({ l }) {
  const done = l.status === '거래완료'
  const facts = [l.property_type, areaLabel(l), floorLabel(l), l.rooms ? `방 ${l.rooms}` : ''].filter(Boolean)
  return (
    <Link
      to={`/listings/${l.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#ebe6dc] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgb(31_39_54/0.25)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gold-100">
        {l.cover_photo_id ? (
          <img
            src={photoUrl(l.cover_photo_id, true)}
            alt={l.title}
            loading="lazy"
            className={`size-full object-cover transition duration-500 group-hover:scale-[1.03] ${done ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="grid size-full place-items-center">
            <img src="/logo-mark.png" alt="" className="w-16 opacity-30" />
          </div>
        )}
        <span className={`absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-bold ${DEAL_STYLE[l.deal_type] || 'bg-navy-900 text-white'}`}>
          {l.deal_type}
        </span>
        {l.status !== '광고중' && (
          <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-navy-800">{l.status}</span>
        )}
        {done && <div className="absolute inset-0 bg-white/30" />}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-lg font-extrabold tracking-tight text-navy-900">{priceLabel(l)}</p>
        <p className="line-clamp-1 text-[15px] font-semibold text-navy-800">{l.title}</p>
        <p className="line-clamp-1 text-[13px] text-navy-600">{facts.join(' · ')}</p>
        {l.address_public && (
          <p className="mt-auto flex items-center gap-1 pt-2 text-xs text-navy-600/80">
            <Icon name="map" className="size-3.5" />
            {l.address_public}
          </p>
        )}
      </div>
    </Link>
  )
}
