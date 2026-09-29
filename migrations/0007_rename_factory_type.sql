-- 매물 종류 '공장' → '공장/창고' 로 명칭 변경
UPDATE listings SET property_type = '공장/창고' WHERE property_type = '공장';
