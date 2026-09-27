import { json, isAdmin, unauthorized, notFound } from '../../_lib.js';
import { isPubliclyVisible } from '../listings/_fields.js';

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
    `SELECT p.mime, p.${thumb ? 'thumb' : 'data'} AS body, l.is_public, l.status
     FROM photos p JOIN listings l ON l.id = p.listing_id WHERE p.id = ?`
  ).bind(params.id).first();
  const visible = row && isPubliclyVisible(row);
  if (!row || (!visible && !(await isAdmin(request, env)))) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(decode(row.body), {
    headers: {
      'Content-Type': row.mime,
      // 거래완료·비공개로 바뀌면 곧바로 가려지도록 공개 사진도 캐시는 짧게(10분)
      'Cache-Control': visible ? 'public, max-age=600' : 'private, no-store',
    },
  });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const res = await env.DB.prepare('DELETE FROM photos WHERE id = ?').bind(params.id).run();
  if (!res.meta.changes) return notFound();
  return json({ ok: true });
}
