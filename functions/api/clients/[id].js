import { json, readJson, isAdmin, unauthorized, notFound, NOW } from '../../_lib.js';
import { clientValues } from './_fields.js';

export async function onRequestPut({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const v = clientValues(await readJson(request));
  const res = await env.DB.prepare(
    `UPDATE clients SET ${Object.keys(v).map((c) => `${c} = ?`).join(', ')}, updated_at = ${NOW} WHERE id = ?`
  ).bind(...Object.values(v), params.id).run();
  if (!res.meta.changes) return notFound();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  await env.DB.prepare('DELETE FROM clients WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
