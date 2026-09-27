import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <img src="/logo-mark.png" alt="" className="mx-auto w-20 opacity-40" />
      <p className="mt-6 text-lg font-bold">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="btn btn-primary mt-6">
        홈으로
      </Link>
    </div>
  )
}
