-- 모든 사진을 R2로 옮긴 뒤 D1의 base64 사진 칸 삭제
ALTER TABLE photos DROP COLUMN data;
ALTER TABLE photos DROP COLUMN thumb;
