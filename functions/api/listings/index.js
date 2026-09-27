import { json, readJson, isAdmin, isAdminView, unauthorized } from '../../_lib.js';
import { listingValues, stripPrivate, PUBLIC_WHERE } from './_fields.js';

const COVER = '(SELECT id FROM photos p WHERE p.listing_id = l.id ORDER BY sort_order, id LIMIT 1) AS cover_photo_id';
const COUNT = '(SELECT COUNT(*) FROM photos p WHERE p.listing_id = l.id) AS photo_count';

// 목록: 관리자 페이지(?admin=1)는 전체, 그 외(고객 화면)는 항상 공개 매물만
export async function onRequestGet({ request, env }) {
  const admin = await isAdminView(request, env);
  const url = new URL(request.url);
  const where = [];
  const args = [];
  if (!admin) where.push(PUBLIC_WHERE);
  const status = admin ? url.searchParams.get('status') : null;
  for (const key of ['deal_type', 'property_type']) {
    const v = url.searchParams.get(key);
    if (v) {
      where.push(`l.${key} = ?`);
      args.push(v);
    }
  }
  if (status) {
    where.push('l.status = ?');
    args.push(status);
  } else if (admin && url.searchParams.get('exclude_done') === '1') {
    // 관리자 '매물 관리'는 진행 중인 매물만, 거래완료는 별도 페이지에서
    where.push("l.status != '거래완료'");
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
    ORDER BY ${status === '거래완료' ? 'l.completed_at DESC,' : 'l.is_featured DESC,'} l.updated_at DESC
    LIMIT ${limit}`;
  const { results } = await env.DB.prepare(sql).bind(...args).all();
  return json({ ok: true, items: admin ? results : results.map(stripPrivate) });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const v = listingValues(await readJson(request));
  if (v.status === '거래완료') v.completed_at = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 19).replace('T', ' ');
  const cols = Object.keys(v);
  const row = await env.DB.prepare(
    `INSERT INTO listings (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')}) RETURNING id`
  ).bind(...Object.values(v)).first();
  return json({ ok: true, id: row.id });
}
