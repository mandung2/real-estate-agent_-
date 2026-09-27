import { Link } from 'react-router-dom'
import { photoUrl } from '../../lib/api'
import { priceLabel, dateTime, telHref } from '../../lib/format'
import { useApi, Spinner, ErrorBox, StatusBadge } from '../../components/ui'
import { PageHeader, Card } from '../../components/AdminLayout'
import Icon from '../../components/icons'

function Stat({ label, value, to, accent }) {
  return (
    <Link to={to} className="rounded-xl border border-[#e7e2d8] bg-white p-4 transition hover:border-gold-400">
      <p className="text-xs font-semibold text-navy-600">{label}</p>
      <p className={`mt-1 text-2xl font-black tabular-nums ${accent && value > 0 ? 'text-gold-700' : 'text-navy-900'}`}>{value ?? 0}</p>
    </Link>
  )
}

export default function Dashboard() {
  const { data, loading, error } = useApi('/stats')
  if (loading) return <Spinner />
  if (error) return <ErrorBox error={error} />
  const c = data.counts

  return (
    <>
      <PageHeader title="대시보드" desc={`오늘 ${data.today}`}>
        <Link to="/admin/listings/new" className="btn btn-gold">
          <Icon name="plus" /> 매물 등록
        </Link>
        <Link to="/admin/clients?new=1" className="btn btn-ghost">
          <Icon name="plus" /> 고객 추가
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="광고중 매물" value={c.active} to="/admin/listings?status=광고중" />
        <Stat label="계약 진행중" value={c.in_contract} to="/admin/listings?status=계약진행" />
        <Stat label="이번 달 거래완료" value={c.done_this_month} to="/admin/completed" />
        <Stat label="비공개 매물" value={c.private_count} to="/admin/listings" />
        <Stat label="새 문의" value={c.open_inquiries} to="/admin/inquiries" accent />
        <Stat label="연락할 고객 (오늘까지)" value={c.due_contacts} to="/admin/clients" accent />
        <Stat label="진행중 고객" value={c.active_clients} to="/admin/clients" />
        <Stat label="누적 거래완료" value={c.done_total} to="/admin/completed" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-bold">연락 일정 (7일 이내)</h2>
            <Link to="/admin/clients" className="text-xs font-semibold text-gold-700">
              고객 관리 →
            </Link>
          </div>
          {data.contacts.length ? (
            <ul className="divide-y divide-slate-100">
              {data.contacts.map((cl) => {
                const overdue = cl.next_contact <= data.today
                return (
                  <li key={cl.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <span className={`w-20 shrink-0 text-xs font-bold ${overdue ? 'text-rose-600' : 'text-navy-600'}`}>
                      {cl.next_contact === data.today ? '오늘' : cl.next_contact.slice(5).replace('-', '/')}
                      {cl.next_contact < data.today && ' (지남)'}
                    </span>
                    <span className="font-semibold">{cl.name}</span>
                    <span className="text-xs text-navy-600">{cl.client_type}</span>
                    <span className="line-clamp-1 flex-1 text-xs text-navy-600">{cl.budget}</span>
                    {cl.phone && (
                      <a href={telHref(cl.phone)} className="shrink-0 text-xs font-semibold text-navy-800 hover:text-gold-700">
                        {cl.phone}
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-navy-600">예정된 연락이 없습니다.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-bold">새 문의</h2>
            <Link to="/admin/inquiries" className="text-xs font-semibold text-gold-700">
              문의함 →
            </Link>
          </div>
          {data.inquiries.length ? (
            <ul className="divide-y divide-slate-100">
              {data.inquiries.map((q) => (
                <li key={q.id} className="px-5 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{q.name}</span>
                    <a href={telHref(q.phone)} className="text-xs text-navy-700">
                      {q.phone}
                    </a>
                    <span className="ml-auto text-xs text-navy-600">{dateTime(q.created_at)}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-navy-600">
                    {q.listing_title && <b className="text-gold-700">[{q.listing_title}] </b>}
                    {q.message}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-navy-600">처리할 문의가 없습니다.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-bold">최근 수정한 매물</h2>
          <Link to="/admin/listings" className="text-xs font-semibold text-gold-700">
            매물 관리 →
          </Link>
        </div>
        {data.recent.length ? (
          <ul className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
            {data.recent.map((l) => (
              <li key={l.id} className="bg-white">
                <Link to={`/admin/listings/${l.id}`} className="flex items-center gap-3 p-3 hover:bg-gold-100/40">
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-gold-100">
                    {l.cover_photo_id && <img src={photoUrl(l.cover_photo_id, true)} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">{l.title}</p>
                    <p className="text-xs text-navy-600">
                      {l.deal_type} {priceLabel(l)}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <StatusBadge status={l.status} />
                      {!l.is_public && <span className="text-[11px] font-semibold text-navy-600">비공개</span>}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-navy-600">
            아직 등록된 매물이 없습니다.{' '}
            <Link to="/admin/listings/new" className="font-semibold text-gold-700 underline">
              첫 매물 등록하기
            </Link>
          </div>
        )}
      </Card>
    </>
  )
}
