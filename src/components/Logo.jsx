import { Link } from 'react-router-dom'

export default function Logo({ to = '/', light = false, sub }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className={`grid size-10 place-items-center rounded-lg ${light ? 'bg-white/95' : ''}`}>
        <img src="/logo-mark.png" alt="" className="size-9 object-contain" />
      </span>
      <span className="leading-tight">
        <span className={`block text-[17px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy-900'}`}>정교한 우리집</span>
        <span className={`block text-[11px] font-medium tracking-wide ${light ? 'text-gold-400' : 'text-gold-700'}`}>
          {sub || '공인중개사사무소'}
        </span>
      </span>
    </Link>
  )
}
