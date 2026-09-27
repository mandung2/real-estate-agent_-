import { json, readJson, isAdmin, unauthorized } from '../../_lib.js';
import { listingValues, stripPrivate } from './_fields.js';

const COVER = '(SELECT id FROM photos p WHERE p.listing_id = l.id ORDER BY sort_order, id LIMIT 1) AS cover_photo_id';
const COUNT = '(SELECT COUNT(*) FROM photos p WHERE p.listing_id = l.id) AS photo_count';

// 목록: 관리자는 전체(비공개 포함), 방문자는 공개 매물만
export async function onRequestGet({ request, env }) {
  const admin = await isAdmin(request, env);
  const url = new URL(request.url);
  const where = [];
  const args = [];
  if (!admin) where.push("l.is_public = 1 AND l.status != '보류'");
  for (const key of ['deal_type', 'property_type', 'status']) {
    const v = url.searchParams.get(key);
    if (v) {
      where.push(`l.${key} = ?`);
      args.push(v);
    }
  }
  if (url.searchParams.get('featured') === '1') where.push('l.is_featured = 1');
  const q = url.searchParams.get('q');
  if (q) {
    const cols = admin
      ? ['title', 'address_public', 'address_detail', 'owner_name', 'owner_phone', 'description', 'private_memo']
      : ['title', 'address_public', 'description'];
    where.push('(' + cols.map((c) => `l.${c} LIKE ?`).join(' OR ') + ')');
    cols.forEach(() => args.push(`%${q}%`));
  }
  const limit = Math.min(Number(url.searchParams.get('limit')) || 500, 500);
  const sql = `SELECT l.*, ${COVER}, ${COUNT} FROM listings l
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY CASE l.status WHEN '거래완료' THEN 1 ELSE 0 END, l.is_featured DESC, l.updated_at DESC
    LIMIT ${limit}`;
  const { results } = await env.DB.prepare(sql).bind(...args).all();
  return json({ ok: true, items: admin ? results : results.map(stripPrivate) });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const v = listingValues(await readJson(request));
  const cols = Object.keys(v);
  const row = await env.DB.prepare(
    `INSERT INTO listings (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')}) RETURNING id`
  ).bind(...Object.values(v)).first();
  return json({ ok: true, id: row.id });
}
