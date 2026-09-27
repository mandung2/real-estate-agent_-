import { useState } from 'react'
import { api } from '../lib/api'
import { Field } from './ui'

export default function InquiryForm({ listingId, defaultMessage = '' }) {
  const [f, setF] = useState({ name: '', phone: '', message: defaultMessage, agree: false, website: '' })
  const [state, setState] = useState({ busy: false, done: false, error: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setState({ busy: true, done: false, error: '' })
    try {
      await api.post('/inquiries', { ...f, listing_id: listingId })
      setState({ busy: false, done: true, error: '' })
    } catch (err) {
      setState({ busy: false, done: false, error: err.message })
    }
  }

  if (state.done)
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-bold">문의가 접수되었습니다.</p>
        <p className="mt-1 text-sm text-navy-600">확인 후 빠르게 연락드리겠습니다.</p>
      </div>
    )

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="성함">
          <input className="input" value={f.name} onChange={set('name')} required maxLength={50} />
        </Field>
        <Field label="연락처">
          <input className="input" type="tel" value={f.phone} onChange={set('phone')} required placeholder="010-0000-0000" maxLength={50} />
        </Field>
      </div>
      <Field label="문의 내용">
        <textarea className="input" rows={4} value={f.message} onChange={set('message')} placeholder="원하시는 지역, 예산, 입주 시기 등을 적어주세요." maxLength={3000} />
      </Field>
      {/* 봇 차단용 숨은 칸 */}
      <input type="text" value={f.website} onChange={set('website')} className="hidden" tabIndex={-1} autoComplete="off" />
      <label className="flex items-start gap-2 text-xs leading-relaxed text-navy-600">
        <input type="checkbox" checked={f.agree} onChange={set('agree')} className="mt-0.5 accent-gold-600" required />
        <span>상담을 위해 성함과 연락처를 수집·이용하는 데 동의합니다. (상담 완료 후 요청 시 즉시 파기)</span>
      </label>
      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <button className="btn btn-gold w-full py-3" disabled={state.busy}>
        {state.busy ? '보내는 중…' : '문의 남기기'}
      </button>
    </form>
  )
}
