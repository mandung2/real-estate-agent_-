import { json, bad, readJson, isAdmin, unauthorized, toStr, toInt } from '../../_lib.js';

// 방문자: 문의 남기기 / 관리자: 목록 보기
export async function onRequestPost({ request, env }) {
  const b = await readJson(request);
  if (b.website) return json({ ok: true }); // 스팸봇용 숨은 칸이 채워졌으면 조용히 무시
  const name = toStr(b.name, 50);
  const phone = toStr(b.phone, 50);
  if (!name || !phone) return bad('이름과 연락처를 입력해 주세요.');
  if (!b.agree) return bad('개인정보 수집·이용에 동의해 주세요.');
  await env.DB.prepare('INSERT INTO inquiries (name, phone, message, listing_id) VALUES (?, ?, ?, ?)')
    .bind(name, phone, toStr(b.message, 3000) || '', toInt(b.listing_id))
    .run();
  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const { results } = await env.DB.prepare(
    `SELECT i.*, l.title AS listing_title FROM inquiries i LEFT JOIN listings l ON l.id = i.listing_id
     ORDER BY i.is_handled, i.created_at DESC LIMIT 500`
  ).all();
  return json({ ok: true, items: results });
}
