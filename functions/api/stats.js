import { json, isAdmin, unauthorized } from '../_lib.js';

// 관리자 대시보드 요약
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return unauthorized();
  const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const [counts, contacts, inquiries, recent] = await env.DB.batch([
    env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM listings WHERE status = '광고중') AS active,
        (SELECT COUNT(*) FROM listings WHERE status = '계약진행') AS in_contract,
        (SELECT COUNT(*) FROM listings WHERE status = '거래완료' AND substr(completed_at, 1, 7) = ?) AS done_this_month,
        (SELECT COUNT(*) FROM listings WHERE status = '거래완료') AS done_total,
        (SELECT COUNT(*) FROM listings WHERE is_public = 0) AS private_count,
        (SELECT COUNT(*) FROM listings) AS total,
        (SELECT COUNT(*) FROM inquiries WHERE is_handled = 0) AS open_inquiries,
        (SELECT COUNT(*) FROM clients WHERE status NOT IN ('계약완료', '보류')) AS active_clients,
        (SELECT COUNT(*) FROM clients WHERE next_contact IS NOT NULL AND next_contact <= ? AND status NOT IN ('계약완료', '보류')) AS due_contacts`
    ).bind(month, today),
    env.DB.prepare(
      `SELECT id, name, phone, client_type, status, next_contact, budget FROM clients
       WHERE next_contact IS NOT NULL AND status NOT IN ('계약완료', '보류') AND next_contact <= date(?, '+7 days')
       ORDER BY next_contact LIMIT 10`
    ).bind(today),
    env.DB.prepare(
      `SELECT i.id, i.name, i.phone, i.message, i.created_at, l.title AS listing_title
       FROM inquiries i LEFT JOIN listings l ON l.id = i.listing_id
       WHERE i.is_handled = 0 ORDER BY i.created_at DESC LIMIT 5`
    ),
    env.DB.prepare(
      `SELECT l.id, l.title, l.deal_type, l.property_type, l.status, l.price, l.monthly_rent, l.is_public, l.updated_at,
        (SELECT id FROM photos p WHERE p.listing_id = l.id ORDER BY sort_order, id LIMIT 1) AS cover_photo_id
       FROM listings l WHERE l.status != '거래완료' ORDER BY l.updated_at DESC LIMIT 6`
    ),
  ]);
  return json({
    ok: true,
    today,
    counts: counts.results[0],
    contacts: contacts.results,
    inquiries: inquiries.results,
    recent: recent.results,
  });
}
