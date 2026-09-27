import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, photoUrl } from '../../lib/api'
import { prepareImage } from '../../lib/image'
import { DEAL_TYPES, PROPERTY_TYPES, STATUSES, DIRECTIONS } from '../../lib/constants'
import { won, pyeong, dateTime } from '../../lib/format'
import { Spinner, ErrorBox, Field, Toggle, Select, toast } from '../../components/ui'
import { PageHeader, Card } from '../../components/AdminLayout'
import Icon from '../../components/icons'

const EMPTY = {
  title: '', deal_type: '매매', property_type: '아파트', status: '광고중', is_public: 1, is_featured: 0,
  price: '', monthly_rent: '', maintenance_fee: '', area_supply: '', area_exclusive: '',
  rooms: '', bathrooms: '', floor: '', total_floors: '', direction: '', move_in: '', parking: '', built_year: '',
  address_public: '', description: '', address_detail: '', owner_name: '', owner_phone: '', private_memo: '',
}

function Section({ title, desc, children, locked }) {
  return (
    <Card className={`p-5 ${locked ? 'border-gold-200 bg-gold-100/30' : ''}`}>
      <div className="mb-4">
        <h2 className="flex items-center gap-1.5 font-bold">
          {locked && <Icon name="lock" className="size-4 text-gold-700" />}
          {title}
        </h2>
        {desc && <p className="mt-0.5 text-xs text-navy-600">{desc}</p>}
      </div>
      {children}
    </Card>
  )
}

export default function ListingEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const [f, setF] = useState(EMPTY)
  const [meta, setMeta] = useState(null)
  const [photos, setPhotos] = useState([]) // 저장된 사진 [{id}]
  const [pending, setPending] = useState([]) // 새 매물 저장 전 선택한 사진 [{file, url}]
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(0)
  const [dirty, setDirty] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (isNew) {
      setF(EMPTY)
      setPhotos([])
      setMeta(null)
      return
    }
    setLoading(true)
    api
      .get(`/listings/${id}`)
      .then(({ item }) => {
        const next = { ...EMPTY }
        for (const k of Object.keys(EMPTY)) next[k] = item[k] ?? ''
        setF(next)
        setPhotos(item.photos)
        setMeta({ created_at: item.created_at, updated_at: item.updated_at })
        setDirty(false)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id, isNew])

  // 저장 안 한 채로 창을 닫으려 하면 경고
  useEffect(() => {
    if (!dirty) return
    const h = (e) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const set = (k) => (v) => {
    setF((p) => ({ ...p, [k]: v }))
    setDirty(true)
  }
  const inp = (k, props = {}) => (
    <input className="input" value={f[k] ?? ''} onChange={(e) => set(k)(e.target.value)} {...props} />
  )

  const uploadFiles = async (listingId, files) => {
    setUploading(files.length)
    const added = []
    for (const file of files) {
      try {
        const img = await prepareImage(file)
        const { photo } = await api.post(`/listings/${listingId}/photos`, img)
        added.push(photo)
        setPhotos((p) => [...p, photo])
      } catch (e) {
        toast(e.message, 'error')
      }
      setUploading((n) => n - 1)
    }
    return added
  }

  const onPickFiles = async (e) => {
    const files = [...e.target.files].filter((file) => file.type.startsWith('image/'))
    e.target.value = ''
    if (!files.length) return
    if (isNew) {
      setPending((p) => [...p, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))])
      setDirty(true)
    } else {
      await uploadFiles(id, files)
      toast(`사진 ${files.length}장을 올렸습니다.`)
    }
  }

  const movePhoto = async (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= photos.length) return
    const next = [...photos]
    ;[next[i], next[j]] = [next[j], next[i]]
    setPhotos(next)
    try {
      await api.put(`/listings/${id}/photos`, { order: next.map((p) => p.id) })
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const deletePhoto = async (p) => {
    if (!window.confirm('이 사진을 삭제할까요?')) return
    try {
      await api.del(`/photos/${p.id}`)
      setPhotos((list) => list.filter((x) => x.id !== p.id))
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isNew) {
        const { id: newId } = await api.post('/listings', f)
        if (pending.length) await uploadFiles(newId, pending.map((p) => p.file))
        pending.forEach((p) => URL.revokeObjectURL(p.url))
        setPending([])
        setDirty(false)
        toast('매물을 등록했습니다.')
        navigate(`/admin/listings/${newId}`, { replace: true })
      } else {
        await api.put(`/listings/${id}`, f)
        setDirty(false)
        setMeta((m) => ({ ...m, updated_at: new Date(Date.now() + 9 * 3600e3).toISOString() }))
        toast('저장했습니다.')
      }
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('이 매물을 삭제할까요? 사진까지 모두 지워지며 되돌릴 수 없습니다.')) return
    await api.del(`/listings/${id}`)
    setDirty(false)
    toast('삭제했습니다.')
    navigate('/admin/listings')
  }

  if (loading) return <Spinner />
  if (error) return <ErrorBox error={error} />

  const isRent = f.deal_type === '월세' || f.deal_type === '단기임대'
  const priceLabelText = f.deal_type === '매매' ? '매매가' : '보증금'

  return (
    <form onSubmit={save}>
      <PageHeader
        title={isNew ? '매물 등록' : '매물 수정'}
        desc={meta ? `등록 ${dateTime(meta.created_at)} · 최근 수정 ${dateTime(meta.updated_at)}` : '필수 항목은 제목뿐입니다. 나머지는 알고 있는 만큼만 채우세요.'}
      >
        <Link to="/admin/listings" className="btn btn-ghost">
          목록
        </Link>
        {!isNew && (
          <Link to={`/listings/${id}`} target="_blank" className="btn btn-ghost">
            <Icon name="external" /> 미리보기
          </Link>
        )}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Section title="기본 정보">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="제목 *" className="sm:col-span-2">
                {inp('title', { required: true, placeholder: '예) 역삼동 래미안 32평 남향 올수리', maxLength: 200 })}
              </Field>
              <Field label="거래 유형">
                <Select value={f.deal_type} onChange={set('deal_type')} options={DEAL_TYPES} />
              </Field>
              <Field label="매물 종류">
                <Select value={f.property_type} onChange={set('property_type')} options={PROPERTY_TYPES} />
              </Field>
            </div>
          </Section>

          <Section title="가격" desc="만원 단위로 입력하세요. (3억 5천 → 35000)">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={`${priceLabelText} (만원)`} hint={f.price ? `= ${won(f.price)} 만원` : ''}>
                {inp('price', { type: 'number', inputMode: 'numeric', min: 0 })}
              </Field>
              {isRent && (
                <Field label="월세 (만원)" hint={f.monthly_rent ? `= ${won(f.monthly_rent)} 만원` : ''}>
                  {inp('monthly_rent', { type: 'number', inputMode: 'numeric', min: 0 })}
                </Field>
              )}
              <Field label="관리비 (만원)">{inp('maintenance_fee', { type: 'number', inputMode: 'decimal', min: 0, step: 'any' })}</Field>
            </div>
          </Section>

          <Section title="상세 정보">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="공급면적 ㎡" hint={f.area_supply ? `${pyeong(f.area_supply)}평` : ''}>
                {inp('area_supply', { type: 'number', inputMode: 'decimal', step: 'any', min: 0 })}
              </Field>
              <Field label="전용면적 ㎡" hint={f.area_exclusive ? `${pyeong(f.area_exclusive)}평` : ''}>
                {inp('area_exclusive', { type: 'number', inputMode: 'decimal', step: 'any', min: 0 })}
              </Field>
              <Field label="방 개수">{inp('rooms', { type: 'number', min: 0 })}</Field>
              <Field label="욕실 개수">{inp('bathrooms', { type: 'number', min: 0 })}</Field>
              <Field label="해당 층">{inp('floor', { placeholder: '예) 12, 저, 중, 고' })}</Field>
              <Field label="총 층수">{inp('total_floors', { type: 'number', min: 0 })}</Field>
              <Field label="방향">
                <Select value={f.direction} onChange={set('direction')} options={DIRECTIONS} placeholder="선택 안 함" />
              </Field>
              <Field label="사용승인 연도">{inp('built_year', { type: 'number', min: 1900, max: 2100, placeholder: '2015' })}</Field>
              <Field label="입주 가능일" className="col-span-2">
                {inp('move_in', { placeholder: '예) 즉시입주, 협의, 2026년 12월' })}
              </Field>
              <Field label="주차" className="col-span-2">
                {inp('parking', { placeholder: '예) 세대당 1.2대' })}
              </Field>
            </div>
          </Section>

          <Section title="위치 · 설명">
            <div className="space-y-4">
              <Field label="공개 주소" hint="고객에게 보이는 주소입니다. 동·단지명 정도만 적는 것을 권장합니다.">
                {inp('address_public', { placeholder: '예) 강남구 역삼동 · 래미안' })}
              </Field>
              <Field label="상세 설명">
                <textarea
                  className="input"
                  rows={8}
                  value={f.description ?? ''}
                  onChange={(e) => set('description')(e.target.value)}
                  placeholder={'매물의 장점, 주변 환경, 교통, 학군 등을 자유롭게 적어주세요.'}
                />
              </Field>
            </div>
          </Section>

          <Section title="관리자 전용 정보" desc="이 칸의 내용은 고객 화면에 절대 표시되지 않습니다." locked>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="상세 주소 (동·호수)" className="sm:col-span-2">
                {inp('address_detail', { placeholder: '예) 역삼동 123-4 래미안 105동 1203호' })}
              </Field>
              <Field label="소유주(임대인) 이름">{inp('owner_name')}</Field>
              <Field label="소유주 연락처">{inp('owner_phone', { type: 'tel', placeholder: '010-0000-0000' })}</Field>
              <Field label="메모" className="sm:col-span-2">
                <textarea
                  className="input"
                  rows={5}
                  value={f.private_memo ?? ''}
                  onChange={(e) => set('private_memo')(e.target.value)}
                  placeholder="비밀번호, 방문 가능 시간, 협의 가능 금액, 특이사항 등"
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* 오른쪽: 공개 설정 + 사진 */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Section title="공개 설정">
            <div className="space-y-4">
              <Field label="진행 상태">
                <Select value={f.status} onChange={set('status')} options={STATUSES} />
              </Field>
              <div><Toggle checked={!!Number(f.is_public)} onChange={(v) => set('is_public')(v ? 1 : 0)} label="사이트에 공개" /></div>
              <div><Toggle checked={!!Number(f.is_featured)} onChange={(v) => set('is_featured')(v ? 1 : 0)} label="홈 화면 추천 매물" /></div>
              {f.status === '보류' && <p className="text-xs text-navy-600">'보류' 상태는 공개 설정과 관계없이 고객에게 보이지 않습니다.</p>}
            </div>
          </Section>

          <Section title={`사진 ${photos.length + pending.length}장`} desc="첫 번째 사진이 대표사진입니다. 자동으로 용량을 줄여 올립니다.">
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-gold-100">
                  <img src={photoUrl(p.id, true)} alt="" className="size-full object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-gold-600 px-1.5 py-0.5 text-[10px] font-bold text-white">대표</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-navy-950/60 p-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button type="button" onClick={() => movePhoto(i, -1)} className="rounded p-1 text-white hover:bg-white/20" title="앞으로">
                      <Icon name="chevronLeft" className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => deletePhoto(p)} className="rounded p-1 text-white hover:bg-rose-500" title="삭제">
                      <Icon name="trash" className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => movePhoto(i, 1)} className="rounded p-1 text-white hover:bg-white/20" title="뒤로">
                      <Icon name="chevronRight" className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {pending.map((p, i) => (
                <div key={p.url} className="relative aspect-square overflow-hidden rounded-lg bg-gold-100">
                  <img src={p.url} alt="" className="size-full object-cover opacity-80" />
                  <button
                    type="button"
                    onClick={() => setPending((list) => list.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 rounded bg-navy-950/60 p-1 text-white"
                  >
                    <Icon name="x" className="size-3" />
                  </button>
                </div>
              ))}
              {Array.from({ length: uploading }).map((_, i) => (
                <div key={'u' + i} className="grid aspect-square place-items-center rounded-lg bg-gold-100">
                  <span className="size-5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid aspect-square place-items-center rounded-lg border-2 border-dashed border-gold-400 text-gold-700 hover:bg-gold-100"
              >
                <span className="flex flex-col items-center gap-1 text-xs font-semibold">
                  <Icon name="plus" className="size-5" /> 추가
                </span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPickFiles} />
            {isNew && pending.length > 0 && <p className="mt-2 text-xs text-navy-600">저장하면 사진이 함께 올라갑니다.</p>}
          </Section>

          <div className="flex gap-2">
            <button className="btn btn-primary flex-1 py-3" disabled={saving || uploading > 0}>
              {saving ? '저장 중…' : isNew ? '등록하기' : '저장하기'}
            </button>
            {!isNew && (
              <button type="button" onClick={remove} className="btn btn-danger py-3">
                삭제
              </button>
            )}
          </div>
          {dirty && <p className="text-center text-xs font-semibold text-gold-700">저장하지 않은 변경사항이 있습니다.</p>}
        </div>
      </div>
    </form>
  )
}
