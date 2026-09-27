import { json, bad, readJson, isAdmin, unauthorized, notFound, NOW } from '../../../_lib.js';

const MAX_B64 = 1_400_000; // 약 1MB 이미지

function decode(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// 사진 추가: { data: base64, thumb: base64, mime } — 리사이즈는 브라우저에서 미리 합니다.
// 파일은 R2에 저장하고, D1에는 R2 파일 경로(r2_key, thumb_key)만 기록합니다.
export async function onRequestPost({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const listing = await env.DB.prepare('SELECT id FROM listings WHERE id = ?').bind(params.id).first();
  if (!listing) return notFound();
  const b = await readJson(request);
  if (typeof b.data !== 'string' || typeof b.thumb !== 'string') return bad('사진 데이터가 없습니다.');
  if (b.data.length > MAX_B64 || b.thumb.length > MAX_B64) return bad('사진 용량이 너무 큽니다.');
  const mime = ['image/jpeg', 'image/webp', 'image/png'].includes(b.mime) ? b.mime : 'image/jpeg';
  const ext = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' }[mime];

  const base = `listings/${params.id}/${crypto.randomUUID()}`;
  const r2Key = `${base}.${ext}`;
  const thumbKey = `${base}_thumb.${ext}`;
  const meta = { httpMetadata: { contentType: mime } };
  await Promise.all([env.PHOTOS.put(r2Key, decode(b.data), meta), env.PHOTOS.put(thumbKey, decode(b.thumb), meta)]);

  const row = await env.DB.prepare(
    `INSERT INTO photos (listing_id, sort_order, mime, r2_key, thumb_key)
     VALUES (?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM photos WHERE listing_id = ?), ?, ?, ?)
     RETURNING id, sort_order`
  ).bind(params.id, params.id, mime, r2Key, thumbKey).first();
  await env.DB.prepare(`UPDATE listings SET updated_at = ${NOW} WHERE id = ?`).bind(params.id).run();
  return json({ ok: true, photo: row });
}

// 순서 변경: { order: [photoId, ...] } — 첫 번째가 대표사진
export async function onRequestPut({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const { order } = await readJson(request);
  if (!Array.isArray(order) || !order.length) return bad('순서 정보가 없습니다.');
  await env.DB.batch(
    order.map((pid, i) =>
      env.DB.prepare('UPDATE photos SET sort_order = ? WHERE id = ? AND listing_id = ?').bind(i, pid, params.id)
    )
  );
  return json({ ok: true });
}
