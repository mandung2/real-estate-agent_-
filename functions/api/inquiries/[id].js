import { json, readJson, isAdmin, unauthorized } from '../../_lib.js';

export async function onRequestPut({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const b = await readJson(request);
  await env.DB.prepare('UPDATE inquiries SET is_handled = ? WHERE id = ?').bind(b.is_handled ? 1 : 0, params.id).run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  await env.DB.prepare('DELETE FROM inquiries WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
