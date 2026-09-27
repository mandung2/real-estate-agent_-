// 공통 헬퍼: JSON 응답, HS256 JWT 세션 쿠키, 관리자 확인.
// 프론트와 API가 같은 도메인에서 서비스되므로 CORS 설정은 필요 없습니다.

const COOKIE_NAME = 'jh_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7일

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export const bad = (msg, status = 400) => json({ ok: false, msg }, status);
export const unauthorized = () => bad('로그인이 필요합니다.', 401);
export const notFound = () => bad('찾을 수 없습니다.', 404);

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function b64urlBytes(bytes) {
  let bin = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const b64urlJson = (obj) => b64urlBytes(new TextEncoder().encode(JSON.stringify(obj)));
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const hmacKey = (secret) =>
  crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

export async function signJWT(payload, secret) {
  const data = b64urlJson({ alg: 'HS256', typ: 'JWT' }) + '.' + b64urlJson(payload);
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), new TextEncoder().encode(data));
  return data + '.' + b64urlBytes(sig);
}

async function verifyJWT(token, secret) {
  const parts = (token || '').split('.');
  if (parts.length !== 3) return null;
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, b64urlDecode(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1])));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// 입력에 따라 비교 시간이 달라지지 않도록 HMAC 결과끼리 비교합니다.
export async function safeEqual(a, b, secret) {
  const key = await hmacKey(secret);
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([crypto.subtle.sign('HMAC', key, enc.encode(a)), crypto.subtle.sign('HMAC', key, enc.encode(b))]);
  const ua = new Uint8Array(x);
  const ub = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

export const sessionCookie = (token) =>
  `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
export const clearSessionCookie = () => `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export async function isAdmin(request, env) {
  if (!env.JWT_SECRET) return false;
  const header = request.headers.get('Cookie') || '';
  const m = header.match(new RegExp('(?:^|;\\s*)' + COOKIE_NAME + '=([^;]*)'));
  if (!m) return false;
  const payload = await verifyJWT(decodeURIComponent(m[1]), env.JWT_SECRET);
  return !!payload && payload.sub === 'admin';
}

// 폼에서 넘어온 값을 DB에 넣기 좋게 정리
export const toInt = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Math.round(Number(v)));
export const toNum = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));
export const toStr = (v, max = 5000) => (v == null ? null : String(v).trim().slice(0, max) || null);
export const toBool = (v) => (v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0);
export const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

export const NOW = "datetime('now', '+9 hours')";

// 관리자 데이터(비공개·거래완료·보류, 소유주 정보 등)는 로그인한 관리자가
// 관리자 페이지에서 ?admin=1 로 요청할 때만 내려줍니다. 고객용 화면은 관리자가
// 로그인한 브라우저로 봐도 항상 고객에게 보이는 그대로 보여야 하기 때문입니다.
export async function isAdminView(request, env) {
  return new URL(request.url).searchParams.get('admin') === '1' && (await isAdmin(request, env));
}
