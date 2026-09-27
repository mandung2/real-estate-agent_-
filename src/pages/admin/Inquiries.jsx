import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { dateTime, telHref } from '../../lib/format'
import { useApi, NBadge, Spinner, ErrorBox, Empty, toast } from '../../components/ui'
import { PageHeader, Card } from '../../components/AdminLayout'
import Icon from '../../components/icons'

export default function Inquiries() {
  const { data, loading, error, setData, reload } = useApi('/inquiries')

  // 문의함을 열면 모두 읽음 처리 → 메뉴의 N 표시가 사라집니다.
  // 화면에 받아 온 목록은 그대로 두어, 방금 읽은 새 문의에는 이번에만 N이 보입니다.
  const unreadUpto = Math.max(0, ...(data?.items || []).filter((q) => !q.is_read).map((q) => q.id))
  useEffect(() => {
    if (!unreadUpto) return
    api
      .post('/inquiries/read-all', { upto: unreadUpto })
      .then(() => window.dispatchEvent(new Event('jh-inquiries-changed')))
      .catch(() => {})
  }, [unreadUpto])

  const toggle = async (q) => {
    const prev = data.items
    setData({ ...data, items: prev.map((x) => (x.id === q.id ? { ...x, is_handled: x.is_handled ? 0 : 1 } : x)) })
    try {
      await api.put(`/inquiries/${q.id}`, { is_handled: !q.is_handled })
    } catch (e) {
      setData({ ...data, items: prev })
      toast(e.message, 'error')
    }
  }

  // 문의자를 고객 목록에 바로 등록
  const toClient = async (q) => {
    try {
      await api.post('/clients', {
        name: q.name,
        phone: q.phone,
        memo: `[사이트 문의 ${q.created_at.slice(0, 10)}]\n${q.message}`,
        listing_id: q.listing_id,
      })
      if (!q.is_handled) await api.put(`/inquiries/${q.id}`, { is_handled: true })
      toast('고객 목록에 추가했습니다.')
      reload()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const remove = async (q) => {
    if (!window.confirm('이 문의를 삭제할까요?')) return
    await api.del(`/inquiries/${q.id}`).catch((e) => toast(e.message, 'error'))
    reload()
  }

  return (
    <>
      <PageHeader title="문의함" desc="사이트 방문자가 남긴 상담 문의입니다." />
      <ErrorBox error={error} />
      {loading ? (
        <Spinner />
      ) : !data?.items?.length ? (
        <Empty>아직 들어온 문의가 없습니다.</Empty>
      ) : (
        <div className="space-y-2">
          {data.items.map((q) => (
            <Card key={q.id} className={`p-4 ${q.is_handled ? 'opacity-60' : 'border-l-4 border-l-gold-500'}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {!q.is_read && <NBadge />}
                <span className="font-bold">{q.name}</span>
                <a href={telHref(q.phone)} className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-gold-700">
                  <Icon name="phone" className="size-3.5" /> {q.phone}
                </a>
                <span className="text-xs text-navy-600">{dateTime(q.created_at)}</span>
                {q.listing_id && (
                  <Link to={`/admin/listings/${q.listing_id}`} className="text-xs font-semibold text-gold-700 hover:underline">
                    매물 #{q.listing_id} {q.listing_title}
                  </Link>
                )}
              </div>
              {q.message && <p className="mt-2 whitespace-pre-wrap text-sm text-navy-800">{q.message}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => toggle(q)} className={`btn px-3 py-1.5 text-xs ${q.is_handled ? 'btn-ghost' : 'btn-primary'}`}>
                  <Icon name="check" className="size-3.5" /> {q.is_handled ? '처리 취소' : '처리 완료'}
                </button>
                <button onClick={() => toClient(q)} className="btn btn-ghost px-3 py-1.5 text-xs">
                  <Icon name="users" className="size-3.5" /> 고객으로 등록
                </button>
                <button onClick={() => remove(q)} className="btn btn-danger ml-auto px-3 py-1.5 text-xs">
                  삭제
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
