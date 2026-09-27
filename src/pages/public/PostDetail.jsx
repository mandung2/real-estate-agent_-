import { Link, useParams } from 'react-router-dom'
import { useSite } from '../../site'
import { date } from '../../lib/format'
import { useApi, Spinner } from '../../components/ui'
import Icon from '../../components/icons'

export default function PostDetail() {
  const { id } = useParams()
  const { admin } = useSite()
  const { data, loading, error } = useApi(`/posts/${id}?view`)

  if (loading) return <Spinner />
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-bold">글을 찾을 수 없습니다.</p>
        <Link to="/posts" className="btn btn-primary mt-6">
          목록으로
        </Link>
      </div>
    )
  const p = data.item
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <Link to="/posts" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:text-navy-900">
          <Icon name="chevronLeft" /> 목록
        </Link>
        {admin && (
          <Link to={`/admin/posts/${p.id}`} className="btn btn-gold">
            이 글 수정
          </Link>
        )}
      </div>
      <div className="mt-6 flex items-center gap-2 text-sm">
        <span className="rounded bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-700">{p.category}</span>
        <span className="text-navy-600">{date(p.created_at)}</span>
      </div>
      <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">{p.title}</h1>
      <div className="mt-8 whitespace-pre-wrap border-t border-[#ebe6dc] pt-8 text-[16px] leading-[1.85] text-navy-800">{p.body}</div>
    </article>
  )
}
