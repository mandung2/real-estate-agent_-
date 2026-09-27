import { useSite } from '../../site'
import { telHref } from '../../lib/format'
import InquiryForm from '../../components/InquiryForm'
import Icon from '../../components/icons'

export default function Contact() {
  const { settings: s } = useSite()
  const rows = [
    ['phone', '대표전화', s.phone, s.phone && telHref(s.phone)],
    ['phone', '휴대전화', s.mobile, s.mobile && telHref(s.mobile)],
    ['map', '주소', s.address],
    ['clock', '상담 시간', s.hours],
  ].filter((r) => r[2])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">상담 문의</h1>
      <p className="mt-1 text-sm text-navy-600">남겨주신 내용 확인 후 직접 연락드립니다.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <div className="rounded-2xl bg-navy-900 p-7 text-white">
            <img src="/logo-mark.png" alt="" className="mb-4 w-14 rounded-lg bg-cream p-1.5" />
            <h2 className="text-xl font-bold">{s.office_name || '정교한 우리집 공인중개사사무소'}</h2>
            {s.ceo_name && <p className="mt-1 text-sm text-gold-400">대표 공인중개사 {s.ceo_name}</p>}
            <ul className="mt-6 space-y-3 text-sm">
              {rows.map(([icon, label, value, href]) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon name={icon} className="mt-0.5 size-4 shrink-0 text-gold-400" />
                  <span className="w-16 shrink-0 text-white/50">{label}</span>
                  {href ? (
                    <a href={href} className="font-semibold hover:text-gold-400">
                      {value}
                    </a>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {s.intro && <div className="whitespace-pre-wrap rounded-2xl border border-[#ebe6dc] bg-white p-6 text-[15px] leading-relaxed text-navy-800">{s.intro}</div>}
        </div>
        <div className="rounded-2xl border border-[#ebe6dc] bg-white p-6">
          <InquiryForm />
        </div>
      </div>
    </div>
  )
}
