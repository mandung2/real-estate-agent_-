import { toInt, toNum, toStr, toBool, pick } from '../../_lib.js';

export const DEAL_TYPES = ['매매', '전세', '월세', '단기임대'];
export const PROPERTY_TYPES = ['아파트', '오피스텔', '주택', '토지', '원룸', '상가', '사무실', '공장', '기타'];
export const STATUSES = ['광고중', '계약진행', '거래완료', '보류'];

// 고객에게 절대 노출되면 안 되는 필드
export const PRIVATE_FIELDS = ['address_detail', 'owner_name', 'owner_phone', 'private_memo'];

// 고객에게 보여도 되는 매물: 공개 설정 + 거래완료·보류가 아닌 것
export const PUBLIC_WHERE = "l.is_public = 1 AND l.status NOT IN ('거래완료', '보류')";
export const isPubliclyVisible = (row) => !!row.is_public && !['거래완료', '보류'].includes(row.status);

// 상태가 거래완료로 바뀌는 순간의 날짜를 기록하고, 다른 상태로 되돌리면 지웁니다.
// UPDATE 문 안의 completed_at 은 수정 전 값이므로 이미 거래완료였다면 날짜가 유지됩니다.
export const COMPLETED_AT_SQL =
  "completed_at = CASE WHEN ? = '거래완료' THEN COALESCE(completed_at, datetime('now', '+9 hours')) ELSE NULL END";

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
    maintenance: toStr(b.maintenance, 100),
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
