// ============================================================
// 02단원 · 연습문제 정답 — 표 설계하기
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================
//
// 답만 보지 말고 **왜 그런지**를 읽으세요.
// 이 단원의 문제들은 "문법을 아느냐" 가 아니라
// "나중에 무엇이 터지는지 아느냐" 를 묻는 것입니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

const 답 = {};


// ============================================================
// 문제 1 — 표 만들기
// ============================================================

답.문제1 = `
  CREATE TABLE 작업자 (
    작업자번호 INT,
    이름 TEXT,
    입사일 DATE
  )
`;

// ── 왜 이렇게 쓰나 ──
//
// 칸 하나가 "이름 타입" 한 쌍입니다. 쉼표로 잇고, **마지막에는 쉼표를 붙이지 않습니다.**
// 자바스크립트 배열은 `[1, 2, ]` 를 받아 주지만 SQL 은 42601 (문법 오류) 를 냅니다.
//
// ★ `INT` 는 `INTEGER` 의 줄임말입니다. information_schema 에서는 integer 로 나옵니다.
// ★ 글자는 `TEXT` 를 쓰세요. Postgres 에서 TEXT 는 VARCHAR 보다 느리지 않습니다.
//   `VARCHAR(50)` 을 쓰면 나중에 50자를 넘는 이름이 들어올 때 22001 로 막힙니다.
//   길이를 정말 제한하고 싶으면 `TEXT + CHECK (char_length(이름) <= 50)` 이 낫습니다.
//
// ★★ 이 표에는 제약이 하나도 없습니다. 그래서 이런 게 다 들어갑니다.
//     작업자번호가 NULL 인 줄 · 같은 번호가 두 개 · 이름이 빈 문자열
//   실제 표라면 문제 7, 9, 10 처럼 제약을 걸어야 합니다.


// ============================================================
// 문제 2 — 타입 고르기
// ============================================================

답.문제2 = {
  설비단가: "NUMERIC(12,2)",
  설비온도: "REAL",
  가동여부: "BOOLEAN",
  점검기록시각: "TIMESTAMPTZ",
};

// ── 왜 이렇게 고르나 ──
//
// **설비단가 → NUMERIC.** "1원도 틀리면 안 됩니다" 가 결정적인 단서입니다.
//   REAL / DOUBLE PRECISION 은 2진수로 근사해서 담기 때문에 쌓으면 틀어집니다.
//   개념02 에서 0.1 을 1,000번 더했더니 **99.99905** 가 나왔습니다.
//   회계 담당자는 이 차이를 반드시 찾아냅니다. 그리고 원인은 못 찾습니다.
//   ★ 돈·단가·세금·비율은 예외 없이 NUMERIC 입니다.
//
// **설비온도 → REAL.** 반대로 온도는 원래 근사값입니다.
//   센서가 읽은 값 자체가 ±0.5도쯤 오차가 있습니다.
//   여기에 NUMERIC 을 쓰면 필요 없는 정확도에 비용만 냅니다.
//   ★ "원래 근사값인 측정치" 는 REAL / DOUBLE 이 맞습니다.
//
// **가동여부 → BOOLEAN.** `INT` 로 0/1 을 쓰지 마세요.
//   BOOLEAN 은 1바이트고, `WHERE 가동여부` 만으로 조회가 됩니다.
//   0/1 로 하면 "2가 들어오면 뭔가요?" 라는 질문이 언젠가 생깁니다.
//
// **점검기록시각 → TIMESTAMPTZ.** "해외 지사와 같이 봅니다" 가 결정적입니다.
//   TIMESTAMP 는 시간대 정보가 없어서 뉴욕 사람이 "밤 11시 30분에 점검했구나" 하고
//   오해합니다. TIMESTAMPTZ 는 어디서 봐도 **같은 순간**입니다.
//   ★ 사실 해외가 아니어도 TIMESTAMPTZ 를 쓰세요. 서머타임이나 서버 이전 때 터집니다.


// ============================================================
// 문제 3 — 어느 타입이 정확한가
// ============================================================

답.문제3 = "NUMERIC";

// ── 왜 그런가 ──
//
// NUMERIC 은 10진수를 **그대로** 담습니다. 사람이 종이에 계산하는 것과 같습니다.
// REAL / DOUBLE 은 2진수로 근사합니다. 0.1 은 2진수로 딱 떨어지지 않습니다.
// (1/3 을 소수로 적으면 0.3333... 으로 끝나지 않는 것과 같은 일입니다)
//
// ★★ 개념02 에서 재 보고 놀란 것이 하나 있습니다.
//   `0.1::real + 0.2::real = 0.3::real` 은 **true** 가 나왔습니다.
//   REAL 은 4바이트라 정밀도가 낮아서 오차가 반올림에 묻힌 것입니다.
//
//   그런데 1,000번 더하면 99.99905 가 됩니다.
//   ★ 오차가 **없는** 게 아니라 **안 보이는** 것뿐입니다. 쌓으면 드러납니다.
//   한 번 재 보고 "괜찮네" 하고 넘어가면 안 되는 이유입니다.


// ============================================================
// 문제 4 — BIGINT 를 안전하게 꺼내기
// ============================================================

답.문제4 = `SELECT 큰번호::text AS 큰번호 FROM 번호창고`;

// ── 왜 이렇게 하나 ──
//
// PGlite 는 BIGINT 를 꺼낼 때, 값이 자바스크립트 `number` 에 안전하게 담기면 number 로,
// 넘으면 **`bigint`** 로 줍니다. 그리고 `JSON.stringify` 는 bigint 를 못 다룹니다.
//
//     TypeError: Do not know how to serialize a BigInt
//
// ★★★ 이 사고의 진짜 무서운 점은 **개발할 때 절대 재현이 안 된다**는 것입니다.
//   개발 DB 의 id 는 1, 2, 3 이라 number 로 옵니다. 잘 돌아갑니다.
//   운영에서 id 가 9,007,199,254,740,991 을 넘는 순간 bigint 가 되고,
//   `res.json(줄)` 안의 JSON.stringify 가 터지면서 **API 가 500** 을 냅니다.
//
// ★ `::text` 로 캐스팅하면 처음부터 문자열로 옵니다. 크기와 무관하게 안전합니다.
//
// ★★ `Number(값)` 으로 바꾸면 안 됩니다. 값이 조용히 망가집니다.
//     Number("9007199254740993") === 9007199254740992   ← 마지막 자리가 바뀝니다
//   에러도 안 나서 더 위험합니다. 자바스크립트 number 는 2^53 까지만 정확합니다.


// ============================================================
// 문제 5 — 날짜를 하루 안 밀리게 꺼내기
// ============================================================

답.문제5 = `SELECT 마감일::text AS 마감일 FROM 일정`;

// ── 왜 이렇게 하나 ──
//
// DATE 는 자바스크립트로 오면 **UTC 자정의 Date 객체**가 됩니다.
// `2026-03-15` 는 `2026-03-15T00:00:00.000Z` 입니다.
//
// 여기에 `getDate()` 나 `toLocaleDateString()` 을 그냥 쓰면
// **음수 시간대(미국·유럽 일부)에서 하루가 밀립니다.**
//
//     서울에서 보면  2026-03-15
//     뉴욕에서 보면  2026-03-14   ← 같은 값인데 하루 전
//
// 3월 15일 점검 기록이 3월 14일로 보이는 것입니다.
//
// ★ `::text` 로 꺼내면 애초에 Date 객체를 안 만듭니다. 밀릴 일이 없습니다.
// ★ 이미 Date 로 받았다면 `toISOString().slice(0,10)` 이나 `getUTCDate()` 를 쓰세요.
//   **UTC 기준으로 읽는 것**이 핵심입니다.


// ============================================================
// 문제 6 — 표 고치기
// ============================================================

답.문제6 = `
  ALTER TABLE 설비목록 ADD COLUMN 도입일 DATE;
  ALTER TABLE 설비목록 RENAME COLUMN 이름 TO 설비명;
`;

// ── 왜 이렇게 하나 ──
//
// 표를 다시 만들 필요는 없습니다. ALTER 로 고칩니다.
//
//   ADD COLUMN            칸 추가 (기본값 없으면 거의 즉시. 안전합니다)
//   DROP COLUMN           칸 삭제 (★ 데이터가 사라집니다)
//   RENAME COLUMN A TO B  칸 이름 변경
//   ALTER COLUMN c TYPE t 칸 타입 변경 (★ 표 전체를 다시 씁니다. 큰 표면 멈춥니다)
//   RENAME TO             표 이름 변경
//
// ★ 두 문장이므로 `db.exec` 를 써야 합니다. `db.query` 는 문장 하나만 받습니다.
//     "cannot insert multiple commands into a prepared statement"
//
// ★★ 새로 넣은 `도입일` 은 **맨 뒤**로 갑니다. Postgres 에서 칸 순서는 못 바꿉니다.
//   불편해 보이지만 SELECT 에서 칸 이름을 적으면 순서는 상관없습니다.
//
// ★★★ ALTER 로 고칠 수 있다고 대충 만들면 안 됩니다.
//   `RENAME COLUMN` 을 하면 그 이름을 쓰던 **모든 코드가 조용히 깨집니다.**
//   처음에 잘 만드는 게 훨씬 쌉니다.


// ============================================================
// 문제 7 — 제약 걸기
// ============================================================

답.문제7 = `
  CREATE TABLE 점검 (
    점검번호 INT PRIMARY KEY,
    설비번호 INT NOT NULL,
    결과 TEXT NOT NULL CHECK (결과 IN ('정상','주의','불량')),
    비고 TEXT
  )
`;

// ── 왜 이렇게 하나 ──
//
// 요구사항 하나가 제약 하나에 그대로 대응합니다.
//
//   "기본키다"                → PRIMARY KEY     (= NOT NULL + UNIQUE + 색인)
//   "비울 수 없다"            → NOT NULL
//   "셋 중 하나만"            → CHECK (... IN (...))
//   "비워도 됨"               → 아무것도 안 씀
//
// ★★ `결과` 에 **NOT NULL 과 CHECK 를 둘 다** 건 것에 주목하세요.
//   CHECK 만 걸면 NULL 이 통과합니다. `NULL IN ('정상','주의','불량')` 이
//   거짓이 아니라 **UNKNOWN** 이고, CHECK 는 거짓일 때만 막기 때문입니다.
//   ★ CHECK 와 NOT NULL 은 서로 다른 일을 합니다. 둘 다 필요합니다.
//
// ★ 왜 애플리케이션 코드로 하지 않나요?
//   같은 검사를 자바스크립트로 쓰면 15줄쯤 됩니다. 줄 수가 문제가 아닙니다.
//   그 함수를 **부르는 걸 잊는 순간 뚫린다**는 게 문제입니다.
//   관리자 화면에서는 부르고, 엑셀 일괄 등록에서는 깜빡하고,
//   배치 스크립트는 몰랐고, 개발자가 psql 로 직접 넣으면 당연히 안 부릅니다.
//   제약은 **누가 어떤 경로로 넣든** 통합니다.
//
// ★ ENUM 타입(`CREATE TYPE 결과종류 AS ENUM (...)`)도 있습니다.
//   그런데 값을 추가·삭제하기가 CHECK 보다 번거로워서, 처음에는 CHECK 를 권합니다.


// ============================================================
// 문제 8 — 에러 코드
// ============================================================

답.문제8 = {
  낫널위반: "23502",
  유니크위반: "23505",
  체크위반: "23514",
};

// ── 왜 외워야 하나 ──
//
// 이 세 개는 사용자에게 보여 줄 메시지를 고르는 데 씁니다. 외워 두면 편합니다.
//
//   23502  NOT NULL 위반   e.column 에 칸 이름이 들어옵니다 (e.constraint 는 없습니다)
//   23505  UNIQUE / PK 중복  e.constraint 에 제약 이름
//   23514  CHECK 위반        e.constraint 에 제약 이름
//   23503  외래키 위반 (04단원)
//   22P02  타입에 안 맞는 글자
//   22003  범위 초과 (INT 넘침, NUMERIC 자릿수 넘침)
//   22001  길이 초과 (VARCHAR(n))
//   42601  문법 오류 · 42P01 없는 표 · 42P07 이미 있는 표
//
// ★★ `e.message` 와 `e.detail` 을 **사용자에게 그대로 보여 주면 안 됩니다.**
//     duplicate key value violates unique constraint "설비_이름_key"
//     Key ("이름")=(컨베이어 1호) already exists.
//   표 구조와 데이터가 그대로 새어 나갑니다. 로그에만 남기고
//   화면에는 "같은 이름의 설비가 이미 있습니다." 처럼 우리 말로 바꿔서 보여 주세요.
//
// ★ 그러려면 제약에 **이름을 붙여 두는 것**이 좋습니다.
//     CONSTRAINT 상태_확인 CHECK (...)
//   자동 이름(`표_칸_check`)에 의존하면 칸 이름을 바꿨을 때
//   `if (e.constraint === "설비_라인_check")` 가 조용히 헛돕니다.


// ============================================================
// 문제 9 — DEFAULT
// ============================================================

답.문제9 = `
  CREATE TABLE 주문 (
    주문번호 INT PRIMARY KEY,
    상태 TEXT NOT NULL DEFAULT '접수',
    접수시각 TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

// ── 왜 이렇게 하나 ──
//
// "안 적으면 ~가 들어가야 함" 이 DEFAULT 입니다.
// "해외에서도 같은 순간으로 보여야 합니다" 가 TIMESTAMPTZ 입니다.
//
// ★★ DEFAULT 는 거의 항상 **NOT NULL 과 짝으로** 씁니다. 이유가 있습니다.
//
//   DEFAULT 는 "그 칸을 **아예 안 적었을 때**" 만 동작합니다.
//   `INSERT INTO 주문 (주문번호, 상태) VALUES (1, NULL)` 처럼
//   **NULL 을 직접 적으면 DEFAULT 를 지나치고 NULL 이 들어갑니다.**
//
//   자바스크립트에서 `{ 상태: null }` 을 그대로 넘기면 딱 이렇게 됩니다.
//   NOT NULL 을 같이 걸어 두면 그 순간 23502 로 막힙니다.
//
// ★ 시각 기본값의 선택지
//     now()                동작 중인 트랜잭션이 **시작한** 시각 (같은 트랜잭션 안에서 항상 같음)
//     clock_timestamp()    진짜 지금 시각 (부를 때마다 다름)
//     CURRENT_TIMESTAMP    now() 와 같습니다
//     localtimestamp       ★ TIMESTAMP 입니다. 시간대가 없습니다. 쓰지 마세요
//
//   보통은 `now()` 로 충분합니다.


// ============================================================
// 문제 10 — 기본키를 자동으로
// ============================================================

답.문제10 = `
  CREATE TABLE 알림 (
    알림번호 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    내용 TEXT NOT NULL
  )
`;

// ── 왜 SERIAL 이 아니라 IDENTITY 인가 ──
//
// `BIGSERIAL` 로도 자동 번호는 됩니다. 그런데 두 가지가 다릅니다.
//
// ① **SERIAL 은 값을 직접 넣을 수 있습니다.** 그게 사고의 원인입니다.
//
//   데이터를 옮기면서 번호를 직접 넣으면, 시퀀스는 그걸 **모릅니다.**
//     표에는 1,2,3 이 있는데 시퀀스는 여전히 1
//     → 다음에 자동으로 넣으면 2번을 주려다 **23505 (중복)**
//
//   ★★★ 이 사고의 지독한 점은 **며칠 뒤에 터진다**는 것입니다.
//     이관한 날은 멀쩡합니다. 나중에 사용자가 새로 등록할 때 처음 터집니다.
//     그때는 아무도 이관 작업을 떠올리지 못합니다.
//
//   `GENERATED ALWAYS AS IDENTITY` 는 직접 넣기를 아예 막습니다 (428C9).
//   정말 필요하면 `OVERRIDING SYSTEM VALUE` 를 **일부러 길게 적어야** 뚫립니다.
//   실수로는 안 뚫립니다.
//
//   (이미 SERIAL 로 만든 표를 옮겼다면 이걸 꼭 하세요)
//     SELECT setval('표_칸_seq', (SELECT max(칸) FROM 표));
//
// ② **IDENTITY 는 SQL 표준입니다.** SERIAL 은 Postgres 만의 것입니다.
//
// ★ 왜 INT 가 아니라 BIGINT 인가
//   INT 는 약 21억에서 찹니다. 초당 100건 쌓이는 로그면 250일에 다 씁니다.
//   다 찬 뒤에 BIGINT 로 바꾸려면 표 전체를 다시 써야 합니다. 몇 시간씩 멈춥니다.
//   4바이트 아끼려다 새벽에 일어납니다. ★ 키는 처음부터 BIGINT 로 잡으세요.


// ============================================================
// 문제 11 — NULL 을 찾기
// ============================================================

답.문제11 = `SELECT 설비번호 FROM 설비 WHERE 담당자 IS NULL ORDER BY 설비번호`;

// ── 왜 `= NULL` 이 아닌가 ──
//
// `WHERE 담당자 = NULL` 은 **문법 오류가 안 납니다.** 그냥 항상 0건입니다.
//
// NULL 은 "모른다" 라서, 무엇과 비교해도 결과가 **UNKNOWN** 입니다.
// `NULL = NULL` 조차 참이 아닙니다. 그리고 WHERE 는 **TRUE 인 줄만** 통과시킵니다.
// UNKNOWN 은 FALSE 와 똑같이 버려집니다.
//
// ★ `IS NULL` / `IS NOT NULL` 은 언제나 true 나 false 를 줍니다. UNKNOWN 이 없습니다.
//
// ★★ 파라미터로 넘길 때도 같은 함정이 있습니다.
//     db.query("... WHERE 담당자 = $1", [null])   →  **항상 0건**
//     db.query("... WHERE 담당자 IS NOT DISTINCT FROM $1", [null])  →  제대로 나옵니다
//
//   검색 화면에서 빈 칸을 넘길 때 자주 겪습니다.
//   `undefined` 를 넘겨도 똑같이 0건입니다. 오타로 `req.body.담당자` 를 잘못 써도
//   에러 없이 0건이 나옵니다. 조용히 틀리는 종류입니다.


// ============================================================
// 문제 12 — ★ NOT IN 을 고치기
// ============================================================

답.문제12 = `
  SELECT 설비번호 FROM 설비 가
  WHERE NOT EXISTS (SELECT 1 FROM 정비중 나 WHERE 나.설비번호 = 가.설비번호)
  ORDER BY 설비번호
`;

// ── 왜 NOT IN 이 0건이 되나 ──
//
// 이 단원에서 **실무에서 가장 자주 터지는** 사고입니다.
//
// `설비번호 NOT IN (1, NULL)` 은 이렇게 풀립니다.
//
//     NOT (설비번호 = 1 OR 설비번호 = NULL)
//
// 2번 설비로 따라가 봅니다.
//
//     설비번호 = 1      →  false
//     설비번호 = NULL   →  UNKNOWN
//     false OR UNKNOWN  →  UNKNOWN
//     NOT UNKNOWN       →  UNKNOWN
//     WHERE 는 TRUE 만 통과 →  **버려집니다**
//
// NULL 이 하나라도 섞이면 **모든 줄이 UNKNOWN** 이 되어 결과가 0건입니다.
// 에러도, 경고도 없습니다. "오늘 가동 가능한 설비" 화면이 그냥 텅 빕니다.
//
// ── 고치는 세 가지 ──
//
//   ① NOT EXISTS 를 쓴다                  ← ★ 이게 정답입니다
//        NULL 이 있어도 안전하고, 대개 더 빠릅니다
//   ② 안쪽에 IS NOT NULL 을 붙인다
//        NOT IN (SELECT 설비번호 FROM 정비중 WHERE 설비번호 IS NOT NULL)
//        됩니다. 다만 다음 사람이 왜 붙었는지 모르고 지웁니다
//   ③ 애초에 그 칸에 NOT NULL 을 건다      ← ★ 근본 해결
//        `정비중.설비번호 INT NOT NULL` 이었으면 이 사고 자체가 없습니다
//
// ★★★ 습관을 하나 만드세요.
//     **NOT IN 에 서브쿼리를 쓰면 NOT EXISTS 로 바꿔 쓴다.**
//   그러면 이 사고를 평생 안 만납니다.
//   (IN 은 괜찮습니다. NULL 이 섞여도 있는 것은 제대로 찾아 줍니다)


// ============================================================
// 문제 13 — [도전] 집계와 NULL
// ============================================================

답.문제13 = `SELECT avg(coalesce(수량, 0))::int AS 평균 FROM 생산`;

// ── 왜 그냥 avg 를 쓰면 안 되나 ──
//
// 생산 표에는 네 줄이 있고, 그중 두 줄의 수량이 NULL 입니다.
//
//     (1,100) (2,NULL) (3,200) (4,NULL)
//
//   `avg(수량)`                → (100+200) / **2** = 150
//   `avg(coalesce(수량,0))`    → (100+0+200+0) / **4** = 75
//
// ★★ `avg` 는 NULL 인 줄을 **분모에서도 뺍니다.** 이게 핵심입니다.
//   `sum` 도 NULL 을 건너뜁니다. 그래서 `sum(수량) / count(*)` 로 하면 75가 나옵니다.
//
// ★★★ 150 이냐 75 냐는 **업무가 정할 문제**입니다.
//   "수량을 아직 안 적은 설비" 를 평균에 넣을 것인가, 뺄 것인가.
//   SQL 의 기본은 "뺀다" 입니다.
//   중요한 건 **어느 쪽을 원하는지 알고 쓰는 것**입니다.
//   모르고 쓰면 보고서 숫자가 틀리고, 아무도 눈치 못 챕니다.
//
// ★ 관련해서 같이 기억할 것
//     count(*)     줄 수를 셉니다. NULL 과 무관
//     count(칸)    그 칸이 NULL 이 아닌 줄만 셉니다
//     sum(칸)      한 줄도 없으면 0 이 아니라 **NULL** 입니다
//                  → `coalesce(sum(칸), 0)` 으로 감싸세요


// ============================================================
// 문제 14 — [도전] 요구사항대로 표 설계하기
// ============================================================

답.문제14 = `
  CREATE TABLE 작업지시 (
    지시번호 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    설비번호 INT NOT NULL,
    라인 TEXT NOT NULL CHECK (라인 IN ('A','B','C')),
    지시일 DATE NOT NULL DEFAULT CURRENT_DATE,
    목표수량 INT NOT NULL CHECK (목표수량 > 0),
    완료수량 INT NOT NULL DEFAULT 0 CHECK (완료수량 >= 0),
    CONSTRAINT 수량_확인 CHECK (완료수량 <= 목표수량),
    UNIQUE (설비번호, 지시일)
  )
`;

// ── 요구사항이 어디로 갔는지 한 줄씩 ──
//
//   "BIGINT 로 자동, 직접 못 넣음, 기본키"
//     → BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
//
//   "반드시 있어야 한다"                → NOT NULL
//   "'A','B','C' 중 하나"               → CHECK (라인 IN ('A','B','C'))
//   "안 적으면 오늘"                    → DEFAULT CURRENT_DATE  (+ NOT NULL 짝)
//   "0보다 커야 한다"                   → CHECK (목표수량 > 0)
//   "0 이상, 안 적으면 0"               → CHECK (완료수량 >= 0) + DEFAULT 0
//
//   "완료수량이 목표수량보다 클 수 없다"
//     → CONSTRAINT 수량_확인 CHECK (완료수량 <= 목표수량)
//
//   "같은 설비에 같은 날짜의 지시가 두 번"
//     → UNIQUE (설비번호, 지시일)
//
// ── ★ 여기서 배울 세 가지 ──
//
// ① **칸 두 개를 비교하는 CHECK 는 칸 정의 안에 못 씁니다.**
//   `완료수량 INT CHECK (완료수량 <= 목표수량)` 은 문법은 통과하지만
//   의미가 어색합니다. 표 수준(테이블 제약)으로 따로 적는 것이 정석입니다.
//   `종료일 >= 시작일` 같은 것도 전부 이 자리에 씁니다.
//
// ② **UNIQUE (설비번호, 지시일)** 은 두 칸을 **묶어서** 유일하게 봅니다.
//   설비 1번의 3월 15일 지시와 설비 2번의 3월 15일 지시는 둘 다 들어갑니다.
//   `설비번호 INT UNIQUE, 지시일 DATE UNIQUE` 로 따로 걸면 완전히 다른 뜻이 됩니다.
//   (설비 1번은 평생 지시를 한 번만 받게 됩니다)
//
// ③ **제약에 이름을 붙였습니다.** `CONSTRAINT 수량_확인`
//   이름을 안 붙이면 `작업지시_check` 처럼 자동 이름이 붙습니다.
//   에러를 사람 말로 바꿀 때 `e.constraint === '수량_확인'` 으로 잡을 수 있어야
//   "완료수량은 목표수량을 넘을 수 없습니다." 를 보여 줄 수 있습니다.
//
// ★★ 이 표 정의 하나가 자바스크립트 검사 코드 20줄을 대체합니다.
//   그리고 **관리자 화면·배치·엑셀 업로드·psql 어디서 넣어도** 똑같이 통합니다.
//   동시에 열 명이 같은 설비·같은 날짜를 넣어도 UNIQUE 가 하나만 통과시킵니다.
//   "조회해서 없으면 INSERT" 로는 이걸 못 막습니다.


// ============================================================
// 문제 15 — [도전] 더러운 데이터를 정리하고 제약 걸기
// ============================================================

답.문제15 = `
  UPDATE 옛날설비 SET 라인 = 'A' WHERE 라인 IS NULL OR 라인 NOT IN ('A','B','C');
  ALTER TABLE 옛날설비 ADD CONSTRAINT 라인_확인 CHECK (라인 IN ('A','B','C'));
`;

// ── 왜 순서가 중요한가 ──
//
// 제약을 먼저 걸면 **실패합니다.**
//
//     ERROR: check constraint "라인_확인" of relation "옛날설비" is violated by some row
//     (SQLSTATE 23514)
//
// ★★★ **이미 어긴 데이터가 있으면 제약을 걸 수 없습니다.**
//   이게 이 단원 전체가 "처음에 잘 만들라" 고 하는 이유입니다.
//
// ── ★ UPDATE 의 WHERE 에 주목하세요 ──
//
//     WHERE 라인 IS NULL OR 라인 NOT IN ('A','B','C')
//
//   `WHERE 라인 NOT IN ('A','B','C')` 만 쓰면 **NULL 인 줄이 안 걸립니다.**
//   `NULL NOT IN (...)` 이 UNKNOWN 이라 WHERE 를 통과하지 못하기 때문입니다.
//   그러면 UPDATE 는 잘 끝나는데 ALTER 가 여전히 실패합니다.
//   "분명히 다 고쳤는데 왜 안 되지?" 하고 한참 헤맵니다. 문제 12 와 같은 뿌리입니다.
//
//   ★ 빈 문자열 `''` 도 잊지 마세요. NULL 이 아니라서 IS NULL 로는 안 걸리고,
//     `NOT IN ('A','B','C')` 으로 걸립니다. 이 문제에서는 5번 줄이 그렇습니다.
//
// ── 운영에서는 이 순서를 밟습니다 ──
//
//   ① 어긴 줄이 몇 개인지 센다
//   ② 그 줄들을 어떻게 할지 **업무 담당자와 정한다**  ← 여기가 몇 주씩 걸립니다
//   ③ 고친다
//   ④ 제약을 건다
//   ⑤ 그 사이에 새로 들어온 어긴 줄이 없는지 다시 본다
//
//   ★ 이 문제에서는 "전부 A 로" 라고 정해 줬지만, 실제로는
//     "999 라인은 뭐예요?" 를 물어볼 사람이 이미 퇴사한 경우가 많습니다.
//
// ★★ 큰 표에서는 `NOT VALID` 를 씁니다.
//     ALTER TABLE 옛날설비 ADD CONSTRAINT 라인_확인 CHECK (...) NOT VALID;
//   기존 줄은 안 보고 **새로 들어오는 것만** 막습니다. 표를 오래 잠그지 않습니다.
//   데이터를 다 고친 뒤 한가한 시간에 `VALIDATE CONSTRAINT` 로 전체를 검사합니다.


// ============================================================
// ↓↓↓ 아래는 채점 코드입니다 (연습문제.js 와 같습니다) ↓↓↓
// ============================================================

await db.exec(`
  CREATE TABLE 번호창고 (큰번호 BIGINT);
  INSERT INTO 번호창고 VALUES (9007199254740993);

  CREATE TABLE 일정 (마감일 DATE);
  INSERT INTO 일정 VALUES ('2026-03-15');

  CREATE TABLE 설비목록 (번호 INT, 이름 TEXT);

  CREATE TABLE 설비 (설비번호 INT PRIMARY KEY, 담당자 TEXT);
  INSERT INTO 설비 VALUES (1,'김반장'), (2,NULL), (3,'이반장'), (4,NULL);

  CREATE TABLE 정비중 (설비번호 INT);
  INSERT INTO 정비중 VALUES (1), (NULL);

  CREATE TABLE 생산 (설비번호 INT, 수량 INT);
  INSERT INTO 생산 VALUES (1,100), (2,NULL), (3,200), (4,NULL);

  CREATE TABLE 옛날설비 (번호 INT, 라인 TEXT);
  INSERT INTO 옛날설비 VALUES (1,'A'), (2,'999'), (3,NULL), (4,'B'), (5,'');
`);

let 맞은수 = 0;

async function 채점(번호, 확인) {
  const 답안 = 답[`문제${번호}`];

  const 안풀었나 =
    답안 === null ||
    답안 === undefined ||
    (typeof 답안 === "object" && Object.values(답안).every((값) => 값 === null));

  if (안풀었나) {
    console.log(`문제 ${번호} — ⬜ 아직 안 풀었습니다`);
    return;
  }

  try {
    const 통과 = await 확인(답안);
    if (통과) 맞은수 += 1;
    console.log(`문제 ${번호} — ${통과 ? "✅ 정답" : "❌ 틀렸습니다"}`);
  } catch (에러) {
    console.log(`문제 ${번호} — ❌ 에러 (${에러.code ?? 에러.name})`);
  }
}

async function 굴려보기(sql, 확인) {
  let 통과 = false;
  try {
    await db.transaction(async (tx) => {
      await tx.exec(sql);
      통과 = await 확인(tx);
      throw new Error("되돌리기");
    });
  } catch (에러) {
    if (에러.message !== "되돌리기") throw 에러;
  }
  return 통과;
}

async function 칸모양(tx, 표이름) {
  const 결과 = await tx.query(
    `SELECT column_name, data_type, is_nullable, column_default, is_identity
     FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
    [표이름],
  );
  return 결과.rows;
}

// 성공하면 그 줄을 **그대로 둡니다.** 뒤에서 중복 검사를 해야 하기 때문입니다.
async function 막히나(tx, sql) {
  await tx.query(`SAVEPOINT 시험`);
  try {
    await tx.query(sql);
    await tx.query(`RELEASE SAVEPOINT 시험`);
    return false;
  } catch {
    await tx.query(`ROLLBACK TO SAVEPOINT 시험`);
    return true;
  }
}

console.log("===== 02단원 연습문제 채점 =====");

await 채점(1, (답안) =>
  굴려보기(답안, async (tx) => {
    const 칸 = await 칸모양(tx, "작업자");
    return (
      칸.length === 3 &&
      칸[0].column_name === "작업자번호" && 칸[0].data_type === "integer" &&
      칸[1].column_name === "이름" && ["text", "character varying"].includes(칸[1].data_type) &&
      칸[2].column_name === "입사일" && 칸[2].data_type === "date"
    );
  }),
);

await 채점(2, (답안) =>
  답안.설비단가 === "NUMERIC(12,2)" &&
  답안.설비온도 === "REAL" &&
  답안.가동여부 === "BOOLEAN" &&
  답안.점검기록시각 === "TIMESTAMPTZ",
);

await 채점(3, (답안) => 답안 === "NUMERIC");

await 채점(4, async (답안) => {
  const 결과 = await db.query(답안);
  const 값 = 결과.rows[0].큰번호;
  return typeof 값 === "string" && 값 === "9007199254740993" && JSON.stringify(결과.rows).length > 0;
});

await 채점(5, async (답안) => {
  const 값 = (await db.query(답안)).rows[0].마감일;
  return 값 === "2026-03-15";
});

await 채점(6, (답안) =>
  굴려보기(답안, async (tx) => {
    const 칸 = await 칸모양(tx, "설비목록");
    const 이름들 = 칸.map((하나) => 하나.column_name);
    return (
      이름들.includes("설비명") && !이름들.includes("이름") &&
      칸.some((하나) => 하나.column_name === "도입일" && 하나.data_type === "date")
    );
  }),
);

await 채점(7, (답안) =>
  굴려보기(답안, async (tx) => {
    const 정상 = !(await 막히나(tx, `INSERT INTO 점검 VALUES (1, 10, '정상', NULL)`));
    const 결과오타 = await 막히나(tx, `INSERT INTO 점검 VALUES (2, 10, '가둥', NULL)`);
    const 설비널 = await 막히나(tx, `INSERT INTO 점검 VALUES (3, NULL, '정상', NULL)`);
    const 번호중복 = await 막히나(tx, `INSERT INTO 점검 VALUES (1, 11, '주의', NULL)`);
    return 정상 && 결과오타 && 설비널 && 번호중복;
  }),
);

await 채점(8, (답안) =>
  답안.낫널위반 === "23502" && 답안.유니크위반 === "23505" && 답안.체크위반 === "23514",
);

await 채점(9, (답안) =>
  굴려보기(답안, async (tx) => {
    await tx.query(`INSERT INTO 주문 (주문번호) VALUES (1)`);
    const 줄 = (await tx.query(`SELECT 상태, 접수시각 FROM 주문 WHERE 주문번호 = 1`)).rows[0];
    const 칸 = await 칸모양(tx, "주문");
    const 시각칸 = 칸.find((하나) => 하나.column_name === "접수시각");
    return (
      줄.상태 === "접수" &&
      줄.접수시각 instanceof Date &&
      시각칸.data_type === "timestamp with time zone" &&
      시각칸.is_nullable === "NO"
    );
  }),
);

await 채점(10, (답안) =>
  굴려보기(답안, async (tx) => {
    const 칸 = await 칸모양(tx, "알림");
    const 번호칸 = 칸.find((하나) => 하나.column_name === "알림번호");
    if (!번호칸 || 번호칸.data_type !== "bigint" || 번호칸.is_identity !== "YES") return false;
    await tx.query(`INSERT INTO 알림 (내용) VALUES ('첫 알림')`);
    const 자동 = (await tx.query(`SELECT 알림번호 FROM 알림`)).rows[0].알림번호;
    const 직접막힘 = await 막히나(tx, `INSERT INTO 알림 VALUES (99, '몰래')`);
    return Number(자동) === 1 && 직접막힘;
  }),
);

await 채점(11, async (답안) => {
  const 줄들 = (await db.query(답안)).rows.map((줄) => 줄.설비번호);
  return JSON.stringify(줄들) === JSON.stringify([2, 4]);
});

await 채점(12, async (답안) => {
  const 줄들 = (await db.query(답안)).rows.map((줄) => 줄.설비번호);
  return JSON.stringify(줄들) === JSON.stringify([2, 3, 4]);
});

await 채점(13, async (답안) => {
  const 값 = (await db.query(답안)).rows[0].평균;
  return Number(값) === 75;
});

await 채점(14, (답안) =>
  굴려보기(답안, async (tx) => {
    const 칸 = await 칸모양(tx, "작업지시");
    const 지시번호 = 칸.find((하나) => 하나.column_name === "지시번호");
    if (!지시번호 || 지시번호.data_type !== "bigint" || 지시번호.is_identity !== "YES") return false;


    const 정상 = !(await 막히나(tx, `INSERT INTO 작업지시 (설비번호,라인,목표수량) VALUES (1,'A',100)`));
    const 라인틀림 = await 막히나(tx, `INSERT INTO 작업지시 (설비번호,라인,목표수량) VALUES (2,'999',100)`);
    const 목표영 = await 막히나(tx, `INSERT INTO 작업지시 (설비번호,라인,목표수량) VALUES (3,'A',0)`);
    const 완료초과 = await 막히나(tx, `INSERT INTO 작업지시 (설비번호,라인,목표수량,완료수량) VALUES (4,'B',10,11)`);
    const 중복 = await 막히나(tx, `INSERT INTO 작업지시 (설비번호,라인,목표수량) VALUES (1,'A',50)`);

    const 첫줄 = (await tx.query(`SELECT 완료수량, 지시일 FROM 작업지시 WHERE 설비번호 = 1`)).rows[0];
    const 기본값 = 첫줄 && 첫줄.완료수량 === 0 && 첫줄.지시일 instanceof Date;

    const 이름붙임 = (await tx.query(
      `SELECT count(*)::int AS 개수 FROM pg_constraint
       WHERE conrelid = '작업지시'::regclass AND conname = '수량_확인'`,
    )).rows[0].개수 === 1;

    return 정상 && 라인틀림 && 목표영 && 완료초과 && 중복 && 기본값 && 이름붙임;
  }),
);

await 채점(15, (답안) =>
  굴려보기(답안, async (tx) => {
    const 줄수 = (await tx.query(`SELECT count(*)::int AS 개수 FROM 옛날설비`)).rows[0].개수;
    const 나쁜것 = (await tx.query(
      `SELECT count(*)::int AS 개수 FROM 옛날설비 WHERE 라인 IS NULL OR 라인 NOT IN ('A','B','C')`,
    )).rows[0].개수;
    const 제약있나 = (await tx.query(
      `SELECT count(*)::int AS 개수 FROM pg_constraint
       WHERE conrelid = '옛날설비'::regclass AND conname = '라인_확인'`,
    )).rows[0].개수 === 1;
    const 막히나결과 = await 막히나(tx, `INSERT INTO 옛날설비 VALUES (9, 'Z')`);
    return 줄수 === 5 && 나쁜것 === 0 && 제약있나 && 막히나결과;
  }),
);

console.log(`===== 15문제 중 ${맞은수}개 정답 =====`);
// 출력: ===== 02단원 연습문제 채점 =====
// 출력: 문제 1 — ✅ 정답
// 출력: 문제 2 — ✅ 정답
// 출력: 문제 3 — ✅ 정답
// 출력: 문제 4 — ✅ 정답
// 출력: 문제 5 — ✅ 정답
// 출력: 문제 6 — ✅ 정답
// 출력: 문제 7 — ✅ 정답
// 출력: 문제 8 — ✅ 정답
// 출력: 문제 9 — ✅ 정답
// 출력: 문제 10 — ✅ 정답
// 출력: 문제 11 — ✅ 정답
// 출력: 문제 12 — ✅ 정답
// 출력: 문제 13 — ✅ 정답
// 출력: 문제 14 — ✅ 정답
// 출력: 문제 15 — ✅ 정답
// 출력: ===== 15문제 중 15개 정답 =====

await db.close();
