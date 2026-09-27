import { json, isAdmin, unauthorized, notFound } from '../../_lib.js';
import { isPubliclyVisible } from '../listings/_fields.js';

// /api/photos/12        원본
// /api/photos/12?thumb  썸네일
// 사진 파일은 R2에 있고, 공개 여부 확인을 위해 항상 이 주소를 거쳐 내려줍니다.
export async function onRequestGet({ request, env, params }) {
  const thumb = new URL(request.url).searchParams.has('thumb');
  const row = await env.DB.prepare(
    `SELECT p.mime, p.r2_key, p.thumb_key, l.is_public, l.status
     FROM photos p JOIN listings l ON l.id = p.listing_id WHERE p.id = ?`
  ).bind(params.id).first();
  const visible = row && isPubliclyVisible(row);
  if (!row || (!visible && !(await isAdmin(request, env)))) {
    return new Response('Not found', { status: 404 });
  }
  const obj = await env.PHOTOS.get(thumb ? row.thumb_key : row.r2_key);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || row.mime,
      ETag: obj.httpEtag,
      // 거래완료·비공개로 바뀌면 곧바로 가려지도록 공개 사진도 캐시는 짧게(10분)
      'Cache-Control': visible ? 'public, max-age=600' : 'private, no-store',
    },
  });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const row = await env.DB.prepare('DELETE FROM photos WHERE id = ? RETURNING r2_key, thumb_key').bind(params.id).first();
  if (!row) return notFound();
  await env.PHOTOS.delete([row.r2_key, row.thumb_key].filter(Boolean));
  return json({ ok: true });
}
