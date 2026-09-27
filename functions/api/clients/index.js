import { json, readJson, isAdmin, unauthorized } from '../../_lib.js';
import { clientValues } from './_fields.js';

// 고객 관리 — 전부 관리자 전용
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const url = new URL(request.url);
  const where = [];
  const args = [];
  for (const key of ['client_type', 'status']) {
    const v = url.searchParams.get(key);
    if (v) {
      where.push(`c.${key} = ?`);
      args.push(v);
    }
  }
  const q = url.searchParams.get('q');
  if (q) {
    where.push('(c.name LIKE ? OR c.phone LIKE ? OR c.budget LIKE ? OR c.preference LIKE ? OR c.memo LIKE ?)');
    for (let i = 0; i < 5; i++) args.push(`%${q}%`);
  }
  const { results } = await env.DB.prepare(
    `SELECT c.*, l.title AS listing_title FROM clients c LEFT JOIN listings l ON l.id = c.listing_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY CASE WHEN c.next_contact IS NULL THEN 1 ELSE 0 END, c.next_contact, c.updated_at DESC`
  ).bind(...args).all();
  return json({ ok: true, items: results });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const v = clientValues(await readJson(request));
  const cols = Object.keys(v);
  const row = await env.DB.prepare(
    `INSERT INTO clients (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')}) RETURNING id`
  ).bind(...Object.values(v)).first();
  return json({ ok: true, id: row.id });
}
