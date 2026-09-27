// 만원 단위 정수 → "3억 5,000" 형식
export function won(man) {
  if (man == null || man === '') return ''
  const n = Number(man)
  if (!isFinite(n)) return ''
  const eok = Math.floor(n / 10000)
  const rest = n % 10000
  if (eok && rest) return `${eok}억 ${rest.toLocaleString()}`
  if (eok) return `${eok}억`
  return rest.toLocaleString()
}

// 매물 가격 한 줄 표기
export function priceLabel(l) {
  if (l.price == null) return '가격 협의'
  if (l.deal_type === '월세' || l.deal_type === '단기임대') {
    return `${won(l.price)} / ${l.monthly_rent != null ? won(l.monthly_rent) : '-'}`
  }
  return won(l.price)
}

export const pyeong = (m2) => (m2 ? (Number(m2) / 3.3058).toFixed(1) : '')

export function areaLabel(l) {
  const a = l.area_exclusive || l.area_supply
  if (!a) return ''
  return `${Number(a)}㎡ (${pyeong(a)}평)`
}

export function floorLabel(l) {
  if (!l.floor && !l.total_floors) return ''
  return `${l.floor || '-'}${l.total_floors ? ` / ${l.total_floors}층` : '층'}`
}

export const date = (s) => (s ? s.slice(0, 10).replaceAll('-', '.') : '')
export const dateTime = (s) => (s ? s.slice(0, 16).replaceAll('-', '.').replace('T', ' ') : '')

export function todayKST() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)
}

export const telHref = (phone) => 'tel:' + String(phone || '').replace(/[^0-9+]/g, '')
