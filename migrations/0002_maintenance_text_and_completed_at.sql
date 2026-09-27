-- 관리비: 숫자(만원) → 자유 입력 글자 ("약 15만원", "관리비 없음" 등)
ALTER TABLE listings ADD COLUMN maintenance TEXT;
UPDATE listings SET maintenance = printf('%g만원', maintenance_fee) WHERE maintenance_fee IS NOT NULL;
ALTER TABLE listings DROP COLUMN maintenance_fee;

-- 거래완료로 바뀐 날짜 (거래완료 페이지 정렬·이번 달 집계용)
ALTER TABLE listings ADD COLUMN completed_at TEXT;
UPDATE listings SET completed_at = updated_at WHERE status = '거래완료';
