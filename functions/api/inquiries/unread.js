import { json, isAdmin, unauthorized } from '../../_lib.js';

// 관리자 메뉴의 'N' 표시용: 아직 '처리 완료'를 누르지 않은 문의 수
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM inquiries WHERE is_handled = 0').first();
  return json({ ok: true, unread: row.n });
}
