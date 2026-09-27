import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, qs, photoUrl } from '../../lib/api'
import { DEAL_TYPES, PROPERTY_TYPES, STATUSES } from '../../lib/constants'
import { priceLabel, areaLabel, date, telHref, todayKST } from '../../lib/format'
import { downloadCsv } from '../../lib/csv'
import { useApi, Spinner, ErrorBox, Empty, Toggle, toast } from '../../components/ui'
import { PageHeader, Card } from '../../components/AdminLayout'
import Icon from '../../components/icons'

// done=true 이면 거래완료 매물 페이지, 아니면 진행 중인 매물 관리 페이지
export default function ListingsAdmin({ done = false }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const status = done ? '거래완료' : params.get('status') || ''
  const deal = params.get('deal_type') || ''
  const type = params.get('property_type') || ''
  const q = params.get('q') || ''
  const [text, setText] = useState(q)
  const [visibility, setVisibility] = useState('')
  useEffect(() => setText(q), [q])

  const { data, loading, error, setData, reload } = useApi(
    '/listings' + qs({ admin: 1, status, exclude_done: done ? '' : '1', deal_type: deal, property_type: type, q })
  )

  const items = useMemo(() => {
    const all = data?.items || []
    if (visibility === 'public') return all.filter((l) => l.is_public)
    if (visibility === 'private') return all.filter((l) => !l.is_public)
    return all
  }, [data, visibility])

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  // 목록에서 바로 상태/공개/추천 변경
  const patch = async (l, change) => {
    const prev = data.items
    // 거래완료로 바꾸거나(매물 관리) 거래완료에서 되돌리면(거래완료 페이지) 이 목록에서 빠집니다
    const leaves = 'status' in change && (change.status === '거래완료') !== done
    const next = leaves ? prev.filter((x) => x.id !== l.id) : prev.map((x) => (x.id === l.id ? { ...x, ...change } : x))
    setData({ ...data, items: next })
    try {
      await api.put(`/listings/${l.id}`, { _patch: true, ...change })
      if (leaves) toast(done ? `'${l.title}' 을(를) 매물 관리로 되돌렸습니다.` : `'${l.title}' 거래완료 — 고객 화면에서 숨기고 거래완료 페이지로 옮겼습니다.`)
    } catch (e) {
      setData({ ...data, items: prev })
      toast(e.message, 'error')
    }
  }

  const duplicate = async (l) => {
    try {
      const { item } = await api.get(`/listings/${l.id}?admin=1`)
      const { id } = await api.post('/listings', { ...item, title: item.title + ' (복사본)', is_public: 0, is_featured: 0 })
      toast('복사본을 만들었습니다. (사진은 복사되지 않아요)')
      navigate(`/admin/listings/${id}`)
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const remove = async (l) => {
    if (!window.confirm(`'${l.title}' 매물을 삭제할까요?\n사진까지 모두 지워지며 되돌릴 수 없습니다.`)) return
    try {
      await api.del(`/listings/${l.id}`)
      toast('삭제했습니다.')
      reload()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const exportCsv = () =>
    downloadCsv(`${done ? '거래완료' : '매물목록'}_${todayKST()}.csv`, [
      { label: '번호', value: 'id' },
      { label: '제목', value: 'title' },
      { label: '거래', value: 'deal_type' },
      { label: '종류', value: 'property_type' },
      { label: '상태', value: 'status' },
      { label: '공개', value: (r) => (r.is_public ? '공개' : '비공개') },
      { label: '가격(만원)', value: 'price' },
      { label: '월세(만원)', value: 'monthly_rent' },
      { label: '월 평균 관리비', value: 'maintenance' },
      { label: '공급면적㎡', value: 'area_supply' },
      { label: '전용면적㎡', value: 'area_exclusive' },
      { label: '층', value: 'floor' },
      { label: '공개주소', value: 'address_public' },
      { label: '상세주소', value: 'address_detail' },
      { label: '소유주', value: 'owner_name' },
      { label: '소유주 연락처', value: 'owner_phone' },
      { label: '메모', value: 'private_memo' },
      { label: '등록일', value: 'created_at' },
      { label: '수정일', value: 'updated_at' },
      { label: '거래완료일', value: 'completed_at' },
    ], items)

  const selectCls = 'input w-auto py-2 text-sm'

  return (
    <>
      <PageHeader
        title={done ? '거래완료 매물' : '매물 관리'}
        desc={done ? '거래가 끝난 매물 기록입니다. 고객 화면에는 보이지 않습니다. 상태를 바꾸면 매물 관리로 되돌아갑니다.' : '진행 중인 매물입니다. 상태를 거래완료로 바꾸면 고객 화면에서 바로 숨겨지고 거래완료 페이지로 옮겨집니다.'}
      >
        <button onClick={exportCsv} className="btn btn-ghost" disabled={!items.length}>
          <Icon name="download" /> 엑셀(CSV)
        </button>
        <Link to="/admin/listings/new" className="btn btn-gold">
          <Icon name="plus" /> 매물 등록
        </Link>
      </PageHeader>

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap gap-2">
          <form
            className="relative min-w-[200px] flex-1"
            onSubmit={(e) => {
              e.preventDefault()
              set('q', text.trim())
            }}
          >
            <Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-600" />
            <input className="input py-2 pl-9" value={text} onChange={(e) => setText(e.target.value)} placeholder="제목·주소·소유주·연락처·메모 검색" />
          </form>
          {!done && (
            <select className={selectCls} value={status} onChange={(e) => set('status', e.target.value)}>
              <option value="">모든 상태</option>
              {STATUSES.filter((s) => s !== '거래완료').map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
          <select className={selectCls} value={deal} onChange={(e) => set('deal_type', e.target.value)}>
            <option value="">모든 거래</option>
            {DEAL_TYPES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className={selectCls} value={type} onChange={(e) => set('property_type', e.target.value)}>
            <option value="">모든 종류</option>
            {PROPERTY_TYPES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className={selectCls} value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="">공개+비공개</option>
            <option value="public">공개만</option>
            <option value="private">비공개만</option>
          </select>
        </div>
      </Card>

      <ErrorBox error={error} />
      {loading ? (
        <Spinner />
      ) : !items.length ? (
        <Empty>
          {done ? (
            '거래완료된 매물이 없습니다.'
          ) : (
            <>
              매물이 없습니다.{' '}
              <Link to="/admin/listings/new" className="font-semibold text-gold-700 underline">
                새 매물 등록
              </Link>
            </>
          )}
        </Empty>
      ) : (
        <>
          <p className="mb-2 text-sm text-navy-600">
            <b className="text-navy-900">{items.length}</b>건
          </p>
          <div className="space-y-2">
            {items.map((l) => (
              <Card key={l.id} className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
                <Link to={`/admin/listings/${l.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gold-100">
                    {l.cover_photo_id ? (
                      <img src={photoUrl(l.cover_photo_id, true)} alt="" className="size-full object-cover" />
                    ) : (
                      <Icon name="image" className="m-auto mt-5 size-6 text-gold-400" />
                    )}
                    {l.photo_count > 0 && (
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-navy-950/70 px-1 text-[10px] font-bold text-white">{l.photo_count}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[15px] font-bold">
                      {!l.is_public && <Icon name="eyeOff" className="size-3.5 shrink-0 text-navy-600" />}
                      <span className="line-clamp-1">{l.title}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gold-700">{l.deal_type}</span> {priceLabel(l)}
                      <span className="text-navy-600"> · {l.property_type}{areaLabel(l) && ` · ${areaLabel(l)}`}</span>
                    </p>
                    <p className="line-clamp-1 text-xs text-navy-600">
                      {l.address_detail || l.address_public || '주소 미입력'}
                      {l.owner_name && ` · ${l.owner_name}`}
                      {done && l.completed_at ? <b className="text-navy-800"> · 거래완료 {date(l.completed_at)}</b> : ` · 수정 ${date(l.updated_at)}`}
                    </p>
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {l.owner_phone && (
                    <a href={telHref(l.owner_phone)} className="btn btn-ghost px-2.5 py-1.5 text-xs" title="소유주에게 전화">
                      <Icon name="phone" className="size-3.5" /> {l.owner_phone}
                    </a>
                  )}
                  <select
                    className="input w-auto py-1.5 text-xs font-semibold"
                    value={l.status}
                    onChange={(e) => patch(l, { status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {!done && <Toggle checked={!!l.is_public} onChange={(v) => patch(l, { is_public: v ? 1 : 0 })} label={<span className="text-xs">공개</span>} />}
                  {!done && (
                    <button
                      onClick={() => patch(l, { is_featured: l.is_featured ? 0 : 1 })}
                      className={`rounded-md p-1.5 ${l.is_featured ? 'text-gold-600' : 'text-slate-300 hover:text-gold-500'}`}
                      title="홈 화면 추천 매물"
                    >
                      <Icon name="star" className={`size-4 ${l.is_featured ? 'fill-current' : ''}`} />
                    </button>
                  )}
                  <button onClick={() => duplicate(l)} className="rounded-md p-1.5 text-navy-600 hover:bg-slate-100" title="복제">
                    <Icon name="copy" />
                  </button>
                  <button onClick={() => remove(l)} className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50" title="삭제">
                    <Icon name="trash" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  )
}
