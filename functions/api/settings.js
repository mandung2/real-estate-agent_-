import { json, readJson, isAdmin, unauthorized, toStr } from '../_lib.js';

export const SETTING_KEYS = [
  'office_name', 'ceo_name', 'reg_number', 'address', 'phone', 'mobile', 'email',
  'hours', 'hero_title', 'hero_subtitle', 'intro',
];

// 사무소 정보는 누구나 읽을 수 있고(푸터·연락처 표시용), 수정은 관리자만
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
  const out = {};
  for (const k of SETTING_KEYS) out[k] = '';
  for (const r of results) if (SETTING_KEYS.includes(r.key)) out[r.key] = r.value;
  return json({ ok: true, settings: out });
}

export async function onRequestPut({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const b = await readJson(request);
  const stmts = SETTING_KEYS.filter((k) => k in b).map((k) =>
    env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .bind(k, toStr(b[k], 5000) || '')
  );
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true });
}
