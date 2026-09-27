import { toInt, toNum, toStr, toBool, pick } from '../../_lib.js';

export const DEAL_TYPES = ['매매', '전세', '월세', '단기임대'];
export const PROPERTY_TYPES = ['아파트', '오피스텔', '빌라', '단독·다가구', '원룸·투룸', '상가', '사무실', '토지', '기타'];
export const STATUSES = ['광고중', '계약진행', '거래완료', '보류'];

// 고객에게 절대 노출되면 안 되는 필드
export const PRIVATE_FIELDS = ['address_detail', 'owner_name', 'owner_phone', 'private_memo'];

export function stripPrivate(row) {
  const out = { ...row };
  for (const f of PRIVATE_FIELDS) delete out[f];
  return out;
}

// 요청 본문 → DB 컬럼 값
export function listingValues(b) {
  return {
    title: toStr(b.title, 200) || '제목 없음',
    deal_type: pick(b.deal_type, DEAL_TYPES, '매매'),
    property_type: pick(b.property_type, PROPERTY_TYPES, '기타'),
    status: pick(b.status, STATUSES, '광고중'),
    is_public: toBool(b.is_public),
    is_featured: toBool(b.is_featured),
    price: toInt(b.price),
    monthly_rent: toInt(b.monthly_rent),
    maintenance_fee: toNum(b.maintenance_fee),
    area_supply: toNum(b.area_supply),
    area_exclusive: toNum(b.area_exclusive),
    rooms: toInt(b.rooms),
    bathrooms: toInt(b.bathrooms),
    floor: toStr(b.floor, 20),
    total_floors: toInt(b.total_floors),
    direction: toStr(b.direction, 20),
    move_in: toStr(b.move_in, 50),
    parking: toStr(b.parking, 50),
    built_year: toInt(b.built_year),
    address_public: toStr(b.address_public, 200),
    description: toStr(b.description, 20000),
    address_detail: toStr(b.address_detail, 300),
    owner_name: toStr(b.owner_name, 50),
    owner_phone: toStr(b.owner_phone, 50),
    private_memo: toStr(b.private_memo, 20000),
  };
}
