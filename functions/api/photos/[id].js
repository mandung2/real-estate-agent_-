import { json, isAdmin, unauthorized, notFound } from '../../_lib.js';

function decode(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// /api/photos/12        원본
// /api/photos/12?thumb  썸네일
export async function onRequestGet({ request, env, params }) {
  const thumb = new URL(request.url).searchParams.has('thumb');
  const row = await env.DB.prepare(
    `SELECT p.mime, p.${thumb ? 'thumb' : 'data'} AS body, l.is_public
     FROM photos p JOIN listings l ON l.id = p.listing_id WHERE p.id = ?`
  ).bind(params.id).first();
  if (!row || (!row.is_public && !(await isAdmin(request, env)))) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(decode(row.body), {
    headers: {
      'Content-Type': row.mime,
      // 사진 ID는 재사용되지 않으므로 공개 매물 사진은 오래 캐시해도 안전
      'Cache-Control': row.is_public ? 'public, max-age=604800' : 'private, no-store',
    },
  });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const res = await env.DB.prepare('DELETE FROM photos WHERE id = ?').bind(params.id).run();
  if (!res.meta.changes) return notFound();
  return json({ ok: true });
}
