import { json, readJson, isAdmin, isAdminView, unauthorized } from '../../_lib.js';
import { postValues } from './_fields.js';

export async function onRequestGet({ request, env }) {
  const admin = await isAdminView(request, env);
  const url = new URL(request.url);
  const where = [];
  const args = [];
  if (!admin) where.push('is_public = 1');
  const category = url.searchParams.get('category');
  if (category) {
    where.push('category = ?');
    args.push(category);
  }
  const q = url.searchParams.get('q');
  if (q) {
    where.push('(title LIKE ? OR body LIKE ?)');
    args.push(`%${q}%`, `%${q}%`);
  }
  const limit = Math.min(Number(url.searchParams.get('limit')) || 300, 300);
  // 목록에서는 본문 앞부분만 보냅니다.
  const { results } = await env.DB.prepare(
    `SELECT id, category, title, substr(body, 1, 160) AS excerpt, is_public, pinned, views, created_at, updated_at
     FROM posts ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY pinned DESC, created_at DESC LIMIT ${limit}`
  ).bind(...args).all();
  return json({ ok: true, items: results });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const v = postValues(await readJson(request));
  const cols = Object.keys(v);
  const row = await env.DB.prepare(
    `INSERT INTO posts (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')}) RETURNING id`
  ).bind(...Object.values(v)).first();
  return json({ ok: true, id: row.id });
}
