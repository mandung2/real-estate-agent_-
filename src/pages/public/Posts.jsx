import { Link, useSearchParams } from 'react-router-dom'
import { qs } from '../../lib/api'
import { POST_CATEGORIES } from '../../lib/constants'
import { date } from '../../lib/format'
import { useApi, Spinner, ErrorBox, Empty } from '../../components/ui'
import Icon from '../../components/icons'

export default function Posts() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || ''
  const { data, loading, error } = useApi('/posts' + qs({ category }))

  const chip = (active) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 ring-1 ring-[#e3ddd1] hover:ring-navy-600'}`

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">사무소 소식</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <button className={chip(!category)} onClick={() => setParams({})}>
          전체
        </button>
        {POST_CATEGORIES.map((c) => (
          <button key={c} className={chip(category === c)} onClick={() => setParams({ category: c })}>
            {c}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <ErrorBox error={error} />
        {loading ? (
          <Spinner />
        ) : data?.items?.length ? (
          <ul className="space-y-3">
            {data.items.map((p) => (
              <li key={p.id}>
                <Link to={`/posts/${p.id}`} className="block rounded-2xl border border-[#ebe6dc] bg-white p-5 transition hover:border-gold-400">
                  <div className="flex items-center gap-2 text-xs">
                    {p.pinned ? <Icon name="pin" className="size-3.5 text-gold-700" /> : null}
                    <span className="rounded bg-gold-100 px-2 py-0.5 font-bold text-gold-700">{p.category}</span>
                    <span className="text-navy-600">{date(p.created_at)}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold">{p.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-navy-600">{p.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          !error && <Empty>아직 등록된 글이 없습니다.</Empty>
        )}
      </div>
    </div>
  )
}
