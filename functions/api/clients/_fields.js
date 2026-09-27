import { toStr, toInt, pick } from '../../_lib.js';

export const CLIENT_TYPES = ['매수', '매도', '임차', '임대'];
export const CLIENT_STATUSES = ['상담중', '매물안내', '계약완료', '보류'];

export function clientValues(b) {
  const date = toStr(b.next_contact, 10);
  return {
    name: toStr(b.name, 50) || '이름 없음',
    phone: toStr(b.phone, 50),
    client_type: pick(b.client_type, CLIENT_TYPES, '매수'),
    status: pick(b.status, CLIENT_STATUSES, '상담중'),
    budget: toStr(b.budget, 200),
    preference: toStr(b.preference, 2000),
    memo: toStr(b.memo, 20000),
    listing_id: toInt(b.listing_id),
    next_contact: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
  };
}
