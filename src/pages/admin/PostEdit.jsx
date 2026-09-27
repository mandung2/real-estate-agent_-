import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { POST_CATEGORIES } from '../../lib/constants'
import { Spinner, ErrorBox, Field, Toggle, Select, toast } from '../../components/ui'
import { PageHeader, Card } from '../../components/AdminLayout'
import Icon from '../../components/icons'

const EMPTY = { category: '공지', title: '', body: '', is_public: 1, pinned: 0 }

export default function PostEdit() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const [f, setF] = useState(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) return setF(EMPTY)
    setLoading(true)
    api
      .get(`/posts/${id}?admin=1`)
      .then(({ item }) => setF({ category: item.category, title: item.title, body: item.body, is_public: item.is_public, pinned: item.pinned }))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id, isNew])

  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isNew) {
        const { id: newId } = await api.post('/posts', f)
        toast('글을 올렸습니다.')
        navigate(`/admin/posts/${newId}`, { replace: true })
      } else {
        await api.put(`/posts/${id}`, f)
        toast('저장했습니다.')
      }
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorBox error={error} />

  return (
    <form onSubmit={save}>
      <PageHeader title={isNew ? '글쓰기' : '글 수정'}>
        <Link to="/admin/posts" className="btn btn-ghost">
          목록
        </Link>
        {!isNew && (
          <Link to={`/posts/${id}`} target="_blank" className="btn btn-ghost">
            <Icon name="external" /> 미리보기
          </Link>
        )}
      </PageHeader>
      <Card className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <Field label="분류">
            <Select value={f.category} onChange={set('category')} options={POST_CATEGORIES} />
          </Field>
          <Field label="제목 *">
            <input className="input" value={f.title} onChange={(e) => set('title')(e.target.value)} required maxLength={200} />
          </Field>
        </div>
        <Field label="본문" hint="줄바꿈은 그대로 표시됩니다.">
          <textarea className="input min-h-[360px]" value={f.body} onChange={(e) => set('body')(e.target.value)} />
        </Field>
        <div className="flex flex-wrap items-center gap-5 border-t border-slate-100 pt-4">
          <Toggle checked={!!f.is_public} onChange={(v) => set('is_public')(v ? 1 : 0)} label="사이트에 공개" />
          <Toggle checked={!!f.pinned} onChange={(v) => set('pinned')(v ? 1 : 0)} label="목록 상단 고정" />
          <button className="btn btn-primary ml-auto px-8" disabled={saving}>
            {saving ? '저장 중…' : isNew ? '올리기' : '저장하기'}
          </button>
        </div>
      </Card>
    </form>
  )
}
