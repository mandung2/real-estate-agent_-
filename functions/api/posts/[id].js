import { json, readJson, isAdmin, isAdminView, unauthorized, notFound, NOW } from '../../_lib.js';
import { postValues } from './_fields.js';

export async function onRequestGet({ request, env, params }) {
  const admin = await isAdminView(request, env);
  const row = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(params.id).first();
  if (!row || (!admin && !row.is_public)) return notFound();
  // 방문자가 볼 때만 조회수 증가 (관리자 본인의 조회는 제외)
  if (!(await isAdmin(request, env)) && new URL(request.url).searchParams.has('view')) {
    await env.DB.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').bind(params.id).run();
  }
  return json({ ok: true, item: row });
}

export async function onRequestPut({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const body = await readJson(request);
  if (body._patch) {
    const sets = [];
    const args = [];
    for (const f of ['is_public', 'pinned']) {
      if (f in body) {
        sets.push(`${f} = ?`);
        args.push(body[f] ? 1 : 0);
      }
    }
    if (sets.length) await env.DB.prepare(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`).bind(...args, params.id).run();
    return json({ ok: true });
  }
  const v = postValues(body);
  const res = await env.DB.prepare(
    `UPDATE posts SET ${Object.keys(v).map((c) => `${c} = ?`).join(', ')}, updated_at = ${NOW} WHERE id = ?`
  ).bind(...Object.values(v), params.id).run();
  if (!res.meta.changes) return notFound();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
