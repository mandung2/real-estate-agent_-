import { useEffect, useState } from 'react'
import { useSite } from '../../site'
import { api } from '../../lib/api'
import { Field, toast } from '../../components/ui'
import { PageHeader, Card } from '../../components/AdminLayout'

const GROUPS = [
  {
    title: '사무소 정보',
    desc: '사이트 하단과 상담 문의 페이지에 표시됩니다. 공인중개사법상 광고 시 상호·소재지·연락처·등록번호·대표자 성명 표시가 필요합니다.',
    fields: [
      ['office_name', '상호'],
      ['ceo_name', '대표 공인중개사'],
      ['reg_number', '중개사무소 등록번호'],
      ['phone', '대표전화'],
      ['mobile', '휴대전화'],
      ['email', '이메일'],
      ['address', '소재지', true],
      ['hours', '상담 시간', true],
    ],
  },
  {
    title: '홈 화면 문구',
    fields: [
      ['hero_title', '큰 제목 (줄바꿈 가능)', true, 2],
      ['hero_subtitle', '작은 설명', true, 2],
      ['intro', '사무소 소개 (상담 문의 페이지)', true, 5],
    ],
  },
]

export default function Settings() {
  const { settings, reloadSettings } = useSite()
  const [f, setF] = useState(settings)
  const [busy, setBusy] = useState(false)
  useEffect(() => setF(settings), [settings])

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.put('/settings', f)
      reloadSettings()
      toast('저장했습니다.')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader title="사무소 정보">
        <button className="btn btn-primary px-6" disabled={busy}>
          {busy ? '저장 중…' : '저장하기'}
        </button>
      </PageHeader>
      <div className="space-y-5">
        {GROUPS.map((g) => (
          <Card key={g.title} className="p-5">
            <h2 className="font-bold">{g.title}</h2>
            {g.desc && <p className="mt-0.5 text-xs text-navy-600">{g.desc}</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {g.fields.map(([k, label, wide, rows]) => (
                <Field key={k} label={label} className={wide ? 'sm:col-span-2' : ''}>
                  {rows ? (
                    <textarea className="input" rows={rows} value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
                  ) : (
                    <input className="input" value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
                  )}
                </Field>
              ))}
            </div>
          </Card>
        ))}
        <Card className="p-5 text-sm text-navy-700">
          <h2 className="font-bold text-navy-900">관리자 비밀번호 변경</h2>
          <p className="mt-1 leading-relaxed">
            보안을 위해 비밀번호는 사이트 안이 아니라 Cloudflare 대시보드 → Pages 프로젝트 → 설정 → 환경 변수의
            <code className="mx-1 rounded bg-slate-100 px-1">ADMIN_PASSWORD</code>에서 바꿉니다. (로컬에서는 <code className="rounded bg-slate-100 px-1">.dev.vars</code> 파일)
          </p>
        </Card>
      </div>
    </form>
  )
}
