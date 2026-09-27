import { json, isAdmin } from '../../_lib.js';

export async function onRequestGet({ request, env }) {
  return json({ ok: true, admin: await isAdmin(request, env) });
}
