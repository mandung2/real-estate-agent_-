import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, qs } from '../../lib/api'
import { POST_CATEGORIES } from '../../lib/constants'
import { date } from '../../lib/format'
import { useApi, Spinner, ErrorBox, Empty, Toggle, toast } from '../../components/ui'
import { PageHeader, Card } from '../../components/AdminLayout'
import Icon from '../../components/icons'

export default function PostsAdmin() {
  const [category, setCategory] = useState('')
  const { data, loading, error, setData, reload } = useApi('/posts' + qs({ admin: 1, category }))

  const patch = async (p, change) => {
    const prev = data.items
    setData({ ...data, items: prev.map((x) => (x.id === p.id ? { ...x, ...change } : x)) })
    try {
      await api.put(`/posts/${p.id}`, { _patch: true, ...change })
      if ('pinned' in change) reload()
    } catch (e) {
      setData({ ...data, items: prev })
      toast(e.message, 'error')
    }
  }

  const remove = async (p) => {
    if (!window.confirm(`'${p.title}' 글을 삭제할까요?`)) return
    await api.del(`/posts/${p.id}`).catch((e) => toast(e.message, 'error'))
    reload()
  }

  return (
    <>
      <PageHeader title="게시글" desc="공지사항, 부동산 소식, 칼럼 등을 올립니다.">
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">모든 분류</option>
          {POST_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Link to="/admin/posts/new" className="btn btn-gold">
          <Icon name="plus" /> 글쓰기
        </Link>
      </PageHeader>
      <ErrorBox error={error} />
      {loading ? (
        <Spinner />
      ) : !data?.items?.length ? (
        <Empty>아직 작성한 글이 없습니다.</Empty>
      ) : (
        <Card className="divide-y divide-slate-100">
          {data.items.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
              <Link to={`/admin/posts/${p.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-gold-100 px-1.5 py-0.5 font-bold text-gold-700">{p.category}</span>
                  <span className="text-navy-600">{date(p.created_at)}</span>
                  <span className="text-navy-600">조회 {p.views}</span>
                </div>
                <p className="mt-1 line-clamp-1 font-semibold">
                  {!p.is_public && <Icon name="eyeOff" className="mr-1 inline size-3.5 text-navy-600" />}
                  {p.title}
                </p>
              </Link>
              <div className="flex items-center gap-2">
                <Toggle checked={!!p.is_public} onChange={(v) => patch(p, { is_public: v ? 1 : 0 })} label={<span className="text-xs">공개</span>} />
                <button
                  onClick={() => patch(p, { pinned: p.pinned ? 0 : 1 })}
                  className={`rounded-md p-1.5 ${p.pinned ? 'text-gold-600' : 'text-slate-300 hover:text-gold-500'}`}
                  title="상단 고정"
                >
                  <Icon name="pin" />
                </button>
                <button onClick={() => remove(p)} className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50" title="삭제">
                  <Icon name="trash" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  )
}
