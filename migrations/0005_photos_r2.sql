-- 사진 파일은 R2에 두고 D1에는 R2 파일 경로(r2_key, thumb_key)만 저장합니다.
-- 기존 data/thumb(base64) 칸은 R2로 옮기는 동안만 남겨 두기 위해 NULL 허용으로 바꿉니다.
CREATE TABLE photos_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  mime TEXT NOT NULL DEFAULT 'image/jpeg',
  r2_key TEXT,
  thumb_key TEXT,
  data TEXT,
  thumb TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);
INSERT INTO photos_new (id, listing_id, sort_order, mime, data, thumb, created_at)
  SELECT id, listing_id, sort_order, mime, data, thumb, created_at FROM photos;
DROP TABLE photos;
ALTER TABLE photos_new RENAME TO photos;
CREATE INDEX idx_photos_listing ON photos (listing_id, sort_order);
