// 서버 functions/api/**/_fields.js 와 같은 값이어야 합니다.
export const DEAL_TYPES = ['매매', '전세', '월세', '단기임대']
export const PROPERTY_TYPES = ['아파트', '오피스텔', '빌라', '단독·다가구', '원룸·투룸', '상가', '사무실', '토지', '기타']
export const STATUSES = ['광고중', '계약진행', '거래완료', '보류']
export const POST_CATEGORIES = ['공지', '부동산 소식', '칼럼', '거래 후기']
export const CLIENT_TYPES = ['매수', '매도', '임차', '임대']
export const CLIENT_STATUSES = ['상담중', '매물안내', '계약완료', '보류']
export const DIRECTIONS = ['남향', '남동향', '남서향', '동향', '서향', '북향', '북동향', '북서향']

export const STATUS_STYLE = {
  광고중: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  계약진행: 'bg-amber-50 text-amber-700 ring-amber-200',
  거래완료: 'bg-slate-100 text-slate-500 ring-slate-200',
  보류: 'bg-rose-50 text-rose-600 ring-rose-200',
  상담중: 'bg-sky-50 text-sky-700 ring-sky-200',
  매물안내: 'bg-amber-50 text-amber-700 ring-amber-200',
  계약완료: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

export const DEAL_STYLE = {
  매매: 'bg-navy-900 text-white',
  전세: 'bg-gold-600 text-white',
  월세: 'bg-navy-600 text-white',
  단기임대: 'bg-gold-200 text-navy-900',
}
