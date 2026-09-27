// 모든 API 호출은 같은 도메인의 /api 로 갑니다 (세션 쿠키 자동 포함).
async function request(method, path, body) {
  const res = await fetch('/api' + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    // 응답이 JSON이 아니면 (서버 미실행 등) 아래에서 에러 처리
  }
  if (!res.ok || data.ok === false) {
    const err = new Error(data.msg || `요청에 실패했습니다. (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  del: (path) => request('DELETE', path),
}

export const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString()
  return s ? '?' + s : ''
}

export const photoUrl = (id, thumb = false) => `/api/photos/${id}${thumb ? '?thumb' : ''}`
