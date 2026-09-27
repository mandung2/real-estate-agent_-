import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, qs } from '../../lib/api'
import { CLIENT_TYPES, CLIENT_STATUSES } from '../../lib/constants'
import { dateTime, telHref, todayKST } from '../../lib/format'
import { downloadCsv } from '../../lib/csv'
import { useApi, Spinner, ErrorBox, Empty, Field, Select, Modal, StatusBadge, toast } from '../../components/ui'
import { PageHeader, Card } from '../../components/AdminLayout'
import Icon from '../../components/icons'

const EMPTY = { name: '', phone: '', client_type: '매수', status: '상담중', budget: '', preference: '', memo: '', listing_id: '', next_contact: '' }

function ClientForm({ initial, listings, onSaved, onClose }) {
  const [f, setF] = useState(initial)
  const [busy, setBusy] = useState(false)
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }))
  const inp = (k, props) => <input className="input" value={f[k] ?? ''} onChange={(e) => set(k)(e.target.value)} {...props} />

  // 메모에 오늘 날짜 도장을 찍어 상담 기록처럼 쓸 수 있게
  const stamp = () => set('memo')(`[${todayKST()}] \n` + (f.memo || ''))

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (f.id) await api.put(`/clients/${f.id}`, f)
      else await api.post('/clients', f)
      toast('저장했습니다.')
      onSaved()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm(`'${f.name}' 고객 정보를 삭제할까요?`)) return
    await api.del(`/clients/${f.id}`)
    toast('삭제했습니다.')
    onSaved()
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="이름 *">{inp('name', { required: true, maxLength: 50, autoFocus: !f.id })}</Field>
        <Field label="연락처">{inp('phone', { type: 'tel', placeholder: '010-0000-0000' })}</Field>
        <Field label="구분">
          <Select value={f.client_type} onChange={set('client_type')} options={CLIENT_TYPES} />
        </Field>
        <Field label="진행 상태">
          <Select value={f.status} onChange={set('status')} options={CLIENT_STATUSES} />
        </Field>
        <Field label="예산 / 희망 가격" className="sm:col-span-2">
          {inp('budget', { placeholder: '예) 전세 3억 이하, 대출 가능' })}
        </Field>
        <Field label="희망 조건" className="sm:col-span-2">
          <textarea className="input" rows={2} value={f.preference ?? ''} onChange={(e) => set('preference')(e.target.value)} placeholder="지역, 평수, 방 개수, 입주 시기 등" />
        </Field>
        <Field label="관련 매물">
          <select className="input" value={f.listing_id ?? ''} onChange={(e) => set('listing_id')(e.target.value)}>
            <option value="">없음</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                #{l.id} {l.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="다음 연락일" hint="대시보드에 알림으로 표시됩니다.">
          {inp('next_contact', { type: 'date' })}
        </Field>
      </div>
      <Field label="상담 메모">
        <div className="mb-1.5 flex justify-end">
          <button type="button" onClick={stamp} className="text-xs font-semibold text-gold-700 hover:underline">
            + 오늘 날짜로 기록 추가
          </button>
        </div>
        <textarea className="input" rows={7} value={f.memo ?? ''} onChange={(e) => set('memo')(e.target.value)} />
      </Field>
      <div className="flex gap-2 border-t border-slate-100 pt-4">
        {f.id && (
          <button type="button" onClick={remove} className="btn btn-danger">
            삭제
          </button>
        )}
        <button type="button" onClick={onClose} className="btn btn-ghost ml-auto">
          취소
        </button>
        <button className="btn btn-primary px-6" disabled={busy}>
          {busy ? '저장 중…' : '저장'}
        </button>
      </div>
    </form>
  )
}

export default function Clients() {
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState({ client_type: '', status: '', q: '' })
  const [text, setText] = useState('')
  const [editing, setEditing] = useState(null)
  const { data, loading, error, reload } = useApi('/clients' + qs(filter))
  const listings = useApi('/listings')
  const today = todayKST()

  // 대시보드의 '고객 추가' 버튼에서 넘어온 경우 바로 입력창 열기
  useEffect(() => {
    if (params.get('new')) {
      setEditing(EMPTY)
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const exportCsv = () =>
    downloadCsv(`고객목록_${today}.csv`, [
      { label: '이름', value: 'name' },
      { label: '연락처', value: 'phone' },
      { label: '구분', value: 'client_type' },
      { label: '상태', value: 'status' },
      { label: '예산', value: 'budget' },
      { label: '희망조건', value: 'preference' },
      { label: '관련매물', value: 'listing_title' },
      { label: '다음연락일', value: 'next_contact' },
      { label: '메모', value: 'memo' },
      { label: '등록일', value: 'created_at' },
    ], data?.items || [])

  const closeModal = () => setEditing(null)

  return (
    <>
      <PageHeader title="고객 관리" desc="매수·매도·임차·임대 고객과 상담 내용을 기록합니다. (관리자만 볼 수 있음)">
        <button onClick={exportCsv} className="btn btn-ghost" disabled={!data?.items?.length}>
          <Icon name="download" /> 엑셀(CSV)
        </button>
        <button onClick={() => setEditing(EMPTY)} className="btn btn-gold">
          <Icon name="plus" /> 고객 추가
        </button>
      </PageHeader>

      <Card className="mb-4 flex flex-wrap gap-2 p-3">
        <form
          className="relative min-w-[200px] flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            setFilter({ ...filter, q: text.trim() })
          }}
        >
          <Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-600" />
          <input className="input py-2 pl-9" value={text} onChange={(e) => setText(e.target.value)} placeholder="이름·연락처·조건·메모 검색" />
        </form>
        <select className="input w-auto py-2" value={filter.client_type} onChange={(e) => setFilter({ ...filter, client_type: e.target.value })}>
          <option value="">모든 구분</option>
          {CLIENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className="input w-auto py-2" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">모든 상태</option>
          {CLIENT_STATUSES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Card>

      <ErrorBox error={error} />
      {loading ? (
        <Spinner />
      ) : !data?.items?.length ? (
        <Empty>등록된 고객이 없습니다.</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.items.map((c) => {
            const due = c.next_contact && c.next_contact <= today && !['계약완료', '보류'].includes(c.status)
            return (
              <Card key={c.id} className={`p-4 ${due ? 'border-gold-400 ring-1 ring-gold-400' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => setEditing({ ...EMPTY, ...c })} className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold">{c.name}</span>
                      <span className="rounded bg-navy-900 px-1.5 py-0.5 text-[11px] font-bold text-white">{c.client_type}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    {c.budget && <p className="mt-1 text-sm font-medium text-navy-800">{c.budget}</p>}
                    {c.preference && <p className="mt-0.5 line-clamp-2 text-xs text-navy-600">{c.preference}</p>}
                    {c.memo && <p className="mt-2 line-clamp-2 whitespace-pre-line rounded-md bg-slate-50 px-2 py-1.5 text-xs text-navy-700">{c.memo}</p>}
                  </button>
                  {c.phone && (
                    <a href={telHref(c.phone)} className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-700 hover:bg-gold-200" title={c.phone}>
                      <Icon name="phone" />
                    </a>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-xs text-navy-600">
                  {c.phone && <span>{c.phone}</span>}
                  {c.next_contact && (
                    <span className={due ? 'font-bold text-rose-600' : ''}>
                      <Icon name="clock" className="mr-0.5 inline size-3" />
                      다음 연락 {c.next_contact}
                    </span>
                  )}
                  {c.listing_id && (
                    <Link to={`/admin/listings/${c.listing_id}`} className="font-semibold text-gold-700 hover:underline">
                      #{c.listing_id} {c.listing_title}
                    </Link>
                  )}
                  <span className="ml-auto">수정 {dateTime(c.updated_at)}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={closeModal} title={editing?.id ? '고객 정보 수정' : '고객 추가'} wide>
        {editing && (
          <ClientForm
            key={editing.id || 'new'}
            initial={editing}
            listings={listings.data?.items || []}
            onClose={closeModal}
            onSaved={() => {
              closeModal()
              reload()
            }}
          />
        )}
      </Modal>
    </>
  )
}
