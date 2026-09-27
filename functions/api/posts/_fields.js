import { toStr, toBool, pick } from '../../_lib.js';

export const POST_CATEGORIES = ['공지', '부동산 소식', '칼럼', '거래 후기'];

export function postValues(b) {
  return {
    category: pick(b.category, POST_CATEGORIES, '공지'),
    title: toStr(b.title, 200) || '제목 없음',
    body: toStr(b.body, 50000) || '',
    is_public: toBool(b.is_public),
    pinned: toBool(b.pinned),
  };
}
