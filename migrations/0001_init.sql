-- 매물
CREATE TABLE listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  deal_type TEXT NOT NULL DEFAULT '매매',        -- 매매/전세/월세/단기임대
  property_type TEXT NOT NULL DEFAULT '아파트',  -- 아파트/오피스텔/빌라 ...
  status TEXT NOT NULL DEFAULT '광고중',         -- 광고중/계약진행/거래완료/보류
  is_public INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  price INTEGER,              -- 만원 (매매가 또는 보증금)
  monthly_rent INTEGER,       -- 만원
  maintenance_fee INTEGER,    -- 만원
  area_supply REAL,           -- m²
  area_exclusive REAL,        -- m²
  rooms INTEGER,
  bathrooms INTEGER,
  floor TEXT,
  total_floors INTEGER,
  direction TEXT,
  move_in TEXT,
  parking TEXT,
  built_year INTEGER,
  address_public TEXT,        -- 고객에게 보이는 주소 (예: 강남구 역삼동)
  description TEXT,
  -- 이하 관리자 전용
  address_detail TEXT,
  owner_name TEXT,
  owner_phone TEXT,
  private_memo TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);
CREATE INDEX idx_listings_public ON listings (is_public, status);

-- 매물 사진 (클라이언트에서 리사이즈한 JPEG를 base64로 저장)
CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  mime TEXT NOT NULL DEFAULT 'image/jpeg',
  data TEXT NOT NULL,
  thumb TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);
CREATE INDEX idx_photos_listing ON photos (listing_id, sort_order);

-- 게시글 (공지 / 부동산 소식 / 칼럼)
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL DEFAULT '공지',
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  is_public INTEGER NOT NULL DEFAULT 1,
  pinned INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);

-- 고객 (관리자 전용)
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  client_type TEXT NOT NULL DEFAULT '매수',   -- 매수/매도/임차/임대
  status TEXT NOT NULL DEFAULT '상담중',       -- 상담중/매물안내/계약완료/보류
  budget TEXT,
  preference TEXT,
  memo TEXT,
  listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
  next_contact TEXT,          -- YYYY-MM-DD
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);

-- 고객 문의 (사이트 방문자가 남김)
CREATE TABLE inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
  is_handled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);

-- 사무소 정보 등 설정
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

INSERT INTO settings (key, value) VALUES
  ('office_name', '정교한 우리집 공인중개사사무소'),
  ('ceo_name', ''),
  ('reg_number', ''),
  ('address', ''),
  ('phone', ''),
  ('mobile', ''),
  ('email', ''),
  ('hours', '평일 09:00 - 19:00 · 토요일 10:00 - 17:00'),
  ('hero_title', '꼼꼼하게, 정교하게.' || char(10) || '당신의 집을 찾아드립니다.'),
  ('hero_subtitle', '매물 하나하나 직접 확인하고 소개하는 동네 공인중개사입니다.'),
  ('intro', '');
