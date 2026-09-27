import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSite } from '../../site'
import LoginForm from '../../components/LoginForm'

export default function Login() {
  const { admin } = useSite()
  const navigate = useNavigate()
  const location = useLocation()

  if (admin) return <Navigate to="/admin" replace />

  return (
    <div className="grid min-h-screen place-items-center bg-navy-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-3xl bg-cream shadow-xl">
            <img src="/logo-mark.png" alt="" className="w-16" />
          </div>
          <h1 className="mt-5 text-xl font-extrabold text-white">정교한 우리집 관리자</h1>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-2xl">
          <LoginForm onSuccess={() => navigate(location.state?.from || '/admin', { replace: true })} />
        </div>
        <Link to="/" className="mt-6 block text-center text-sm text-white/50 hover:text-white">
          ← 사이트로 돌아가기
        </Link>
      </div>
    </div>
  )
}
