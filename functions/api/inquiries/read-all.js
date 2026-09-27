import { json, readJson, isAdmin, unauthorized, toInt } from '../../_lib.js';

// 문의함을 열면 읽음 처리. upto(화면에 불러온 가장 최근 문의 번호)까지만 처리해서
// 그 사이 새로 들어온 문의는 N 표시가 계속 남게 합니다.
export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const upto = toInt((await readJson(request)).upto);
  if (upto == null) return json({ ok: true });
  await env.DB.prepare('UPDATE inquiries SET is_read = 1 WHERE is_read = 0 AND id <= ?').bind(upto).run();
  return json({ ok: true });
}
