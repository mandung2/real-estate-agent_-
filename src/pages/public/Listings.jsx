import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { qs } from '../../lib/api'
import { DEAL_TYPES, PROPERTY_TYPES } from '../../lib/constants'
import { useApi, Spinner, ErrorBox, Empty } from '../../components/ui'
import ListingCard from '../../components/ListingCard'
import Icon from '../../components/icons'

export default function Listings() {
  const [params, setParams] = useSearchParams()
  const deal = params.get('deal_type') || ''
  const type = params.get('property_type') || ''
  const q = params.get('q') || ''
  const [text, setText] = useState(q)
  useEffect(() => setText(q), [q])

  const { data, loading, error } = useApi('/listings' + qs({ deal_type: deal, property_type: type, q }))

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const chip = (active) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 ring-1 ring-[#e3ddd1] hover:ring-navy-600'}`

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">매물 보기</h1>
      <p className="mt-1 text-sm text-navy-600">직접 확인하고 등록한 매물입니다.</p>

      <div className="mt-6 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            set('q', text.trim())
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-600" />
            <input className="input pl-9" value={text} onChange={(e) => setText(e.target.value)} placeholder="동네, 단지명, 키워드" />
          </div>
          <button className="btn btn-primary">검색</button>
        </form>
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-xs font-bold text-navy-600">거래 유형</span>
          <div className="no-scrollbar -m-1 flex gap-2 overflow-x-auto p-1">
            <button className={chip(!deal) + ' shrink-0'} onClick={() => set('deal_type', '')}>
              전체
            </button>
            {DEAL_TYPES.map((d) => (
              <button key={d} className={chip(deal === d) + ' shrink-0'} onClick={() => set('deal_type', d)}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-xs font-bold text-navy-600">매물 종류</span>
          <div className="no-scrollbar -m-1 flex gap-2 overflow-x-auto p-1">
            <button className={chip(!type) + ' shrink-0'} onClick={() => set('property_type', '')}>
              전체
            </button>
            {PROPERTY_TYPES.map((t) => (
              <button key={t} className={chip(type === t) + ' shrink-0'} onClick={() => set('property_type', t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ErrorBox error={error} />
        {loading ? (
          <Spinner />
        ) : data?.items?.length ? (
          <>
            <p className="mb-4 text-sm text-navy-600">
              총 <b className="text-navy-900">{data.items.length}</b>건
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((l) => (
                <ListingCard key={l.id} l={l} />
              ))}
            </div>
          </>
        ) : (
          !error && <Empty>조건에 맞는 매물이 없습니다. 상담 문의를 남겨주시면 맞춤으로 찾아드려요.</Empty>
        )}
      </div>
    </div>
  )
}
