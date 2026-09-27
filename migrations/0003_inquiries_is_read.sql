-- 관리자가 문의함에서 확인했는지 여부 (처리 완료 is_handled 와는 별개)
ALTER TABLE inquiries ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0;
