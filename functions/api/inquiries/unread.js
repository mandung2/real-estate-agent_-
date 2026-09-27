import { json, isAdmin, unauthorized } from '../../_lib.js';

// 관리자 메뉴의 'N' 표시용: 아직 문의함에서 확인하지 않은 문의 수
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM inquiries WHERE is_read = 0').first();
  return json({ ok: true, unread: row.n });
}
