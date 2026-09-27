import { json, bad, readJson, signJWT, safeEqual, sessionCookie, SESSION_TTL_SECONDS } from '../../_lib.js';

// ADMIN_ID / ADMIN_PASSWORD / JWT_SECRET 은 Cloudflare 환경변수(로컬은 .dev.vars)이며
// 브라우저로는 절대 전달되지 않습니다.
export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_ID || !env.ADMIN_PASSWORD || !env.JWT_SECRET) {
    return bad('서버에 관리자 계정이 설정되어 있지 않습니다.', 500);
  }
  const body = await readJson(request);
  const idOk = await safeEqual(String(body.id || ''), env.ADMIN_ID, env.JWT_SECRET);
  const pwOk = await safeEqual(String(body.password || ''), env.ADMIN_PASSWORD, env.JWT_SECRET);
  if (!idOk || !pwOk) {
    await new Promise((r) => setTimeout(r, 600)); // 무차별 대입 속도 늦추기
    return bad('아이디 또는 비밀번호가 올바르지 않습니다.', 401);
  }
  const now = Math.floor(Date.now() / 1000);
  const token = await signJWT({ sub: 'admin', iat: now, exp: now + SESSION_TTL_SECONDS }, env.JWT_SECRET);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) });
}
