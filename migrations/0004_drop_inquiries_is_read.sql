-- N 표시 기준을 '처리 완료 전(is_handled = 0)'으로 바꾸면서 읽음 여부 칸은 쓰지 않게 됨
ALTER TABLE inquiries DROP COLUMN is_read;
