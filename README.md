# 정교한 우리집 — 공인중개사 사이트

고객용 매물 사이트 + 중개사 본인의 매물·고객 관리 도구입니다.
React(Vite) + Cloudflare Pages Functions + D1(SQLite) 구성입니다.

- 운영 사이트: https://jeonggyo-home.pages.dev
- 관리자: https://jeonggyo-home.pages.dev/admin

## 기능

**고객 화면**
- 홈 (추천 매물, 사무소 소식, 상담 안내)
- 매물 목록 (거래유형·종류·키워드 검색) / 매물 상세 (사진 슬라이드, 상세 정보, 문의 폼)
- 소식 (공지·부동산 소식·칼럼·거래 후기)
- 상담 문의 (사무소 정보 + 문의 폼)
- 하단에 공인중개사법상 표시 의무사항(상호·대표·등록번호·소재지·연락처) 자동 표시

**관리자 화면** (`/admin`, 하단 🔒관리자 링크)
- 대시보드: 매물 현황, 오늘 연락할 고객, 새 문의, 최근 수정 매물
- 매물 관리: 등록/수정/복제/삭제, 사진 여러 장 업로드(자동 축소)·순서 변경, 목록에서 상태·공개·추천 바로 변경, 엑셀(CSV) 내보내기
  - **관리자 전용 칸**(상세 주소, 소유주 이름·연락처, 메모)은 고객에게 절대 노출되지 않음
  - 비공개 매물, '보류' 상태 매물은 고객 화면에서 숨김
- 고객 관리: 매수/매도/임차/임대 고객, 예산·희망조건, 상담 메모(날짜 도장), 다음 연락일 알림, 관련 매물 연결, CSV
- 문의함: 사이트 문의 확인, 처리 완료 표시, 클릭 한 번으로 고객 등록
- 게시글: 글쓰기, 공개/비공개, 상단 고정
- 사무소 정보: 상호·연락처·홈 화면 문구 수정

## 로컬에서 실행

```bash
npm install
npm start        # 빌드 + DB 준비 + 서버 실행 → http://localhost:8788
```

- 처음 받았다면 `.dev.vars.example` 을 `.dev.vars` 로 복사하세요. 로컬 관리자 계정이 들어 있습니다 (기본: `admin` / `change-me-1234`).
- 화면을 고치면서 개발할 때: 터미널 두 개에서 `npm run api`, `npm run dev` → http://localhost:5173

## 수정 후 다시 배포

```bash
npm run deploy
```

DB 구조를 바꾸는 migration을 추가했다면 먼저 `npm run db:init:remote` 를 실행하세요.

## 처음부터 새로 배포하는 경우 (Cloudflare Pages, 무료 플랜으로 충분)

```bash
npx wrangler login
npx wrangler d1 create jeonggyo-home-db
#  → 출력된 database_id 를 wrangler.toml 에 붙여넣기
npm run db:init:remote
npm run deploy
```

그다음 Cloudflare 대시보드 → Workers & Pages → jeonggyo-home → 설정 → 환경 변수에
**Secret**으로 아래 3개를 추가하고 한 번 더 `npm run deploy` 하세요.

| 이름 | 값 |
|---|---|
| `ADMIN_ID` | 관리자 아이디 |
| `ADMIN_PASSWORD` | 길고 추측하기 어려운 비밀번호 |
| `JWT_SECRET` | 아무 긴 무작위 문자열 (32자 이상) |

## 참고

- 사진은 브라우저에서 1600px JPEG로 줄인 뒤 D1에 저장합니다. 무료 플랜은 DB당 500MB라 사진 약 1,000장 정도까지 여유 있게 쓸 수 있습니다. 그 이상이 되면 유료 플랜(DB당 10GB)이나 R2 저장소로 옮기면 됩니다.
- 가격은 **만원 단위**로 입력합니다. (3억 5천 → `35000`)
- 백업: 관리자 화면의 CSV 내보내기, 또는 `npx wrangler d1 export jeonggyo-home-db --remote --output backup.sql`
