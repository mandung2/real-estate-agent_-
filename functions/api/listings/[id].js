import { json, readJson, isAdmin, isAdminView, unauthorized, notFound, NOW } from '../../_lib.js';
import { listingValues, stripPrivate, isPubliclyVisible, COMPLETED_AT_SQL } from './_fields.js';

export async function onRequestGet({ request, env, params }) {
  const admin = await isAdminView(request, env);
  const row = await env.DB.prepare('SELECT * FROM listings WHERE id = ?').bind(params.id).first();
  if (!row || (!admin && !isPubliclyVisible(row))) return notFound();
  const { results: photos } = await env.DB.prepare(
    'SELECT id, sort_order FROM photos WHERE listing_id = ? ORDER BY sort_order, id'
  ).bind(params.id).all();
  return json({ ok: true, item: { ...(admin ? row : stripPrivate(row)), photos } });
}

export async function onRequestPut({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const body = await readJson(request);

  // 목록에서 상태·공개 여부만 빠르게 바꾸는 부분 수정
  if (body._patch) {
    const sets = [];
    const args = [];
    if ('status' in body) {
      const status = listingValues(body).status;
      sets.push('status = ?', COMPLETED_AT_SQL);
      args.push(status, status);
    }
    for (const f of ['is_public', 'is_featured']) {
      if (f in body) {
        sets.push(`${f} = ?`);
        args.push(body[f] ? 1 : 0);
      }
    }
    if (!sets.length) return json({ ok: true });
    await env.DB.prepare(`UPDATE listings SET ${sets.join(', ')}, updated_at = ${NOW} WHERE id = ?`).bind(...args, params.id).run();
    return json({ ok: true });
  }

  const v = listingValues(body);
  const res = await env.DB.prepare(
    `UPDATE listings SET ${Object.keys(v).map((c) => `${c} = ?`).join(', ')}, ${COMPLETED_AT_SQL}, updated_at = ${NOW} WHERE id = ?`
  ).bind(...Object.values(v), v.status, params.id).run();
  if (!res.meta.changes) return notFound();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM photos WHERE listing_id = ?').bind(params.id),
    env.DB.prepare('UPDATE clients SET listing_id = NULL WHERE listing_id = ?').bind(params.id),
    env.DB.prepare('UPDATE inquiries SET listing_id = NULL WHERE listing_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM listings WHERE id = ?').bind(params.id),
  ]);
  return json({ ok: true });
}
