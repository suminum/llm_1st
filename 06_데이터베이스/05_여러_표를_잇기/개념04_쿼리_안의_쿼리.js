// ============================================================
// 05단원 · 개념 04 — 쿼리 안의 쿼리
// ------------------------------------------------------------
// 실행: node 개념04_쿼리_안의_쿼리.js
// ============================================================
//
// 개념03 까지 JOIN 과 GROUP BY 로 나뉜 표를 다시 이어 봤습니다.
// 그런데 "평균보다 점수가 낮은 점검을 뽑아 주세요" 는 그것만으로 안 됩니다.
// 평균을 **먼저** 구해 놓아야 "평균보다 낮다" 를 따질 수 있으니까요.
// 쿼리 하나 안에 쿼리가 또 필요합니다. 이것을 서브쿼리라고 합니다.
//
// 이 파일에서 다루는 것:
//   · 값 하나를 돌려주는 서브쿼리(스칼라), 목록을 돌려주는 서브쿼리(IN)
//   · ★★★ NOT IN 에 NULL 이 섞이면 결과가 통째로 0건이 되는 사고
//   · EXISTS / NOT EXISTS, 상관 서브쿼리가 느려지는 지점, FROM 절 서브쿼리(인라인 뷰)
//   · WITH(CTE) 와 WITH RECURSIVE

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

// ── 예제 데이터 ──
await db.exec(`
  CREATE TABLE 라인 (
    라인코드 TEXT PRIMARY KEY,
    이름     TEXT NOT NULL,
    동       TEXT NOT NULL
  );

  CREATE TABLE 설비 (
    설비번호 INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인코드 TEXT REFERENCES 라인(라인코드),
    도입년도 INT  NOT NULL
  );

  CREATE TABLE 작업자 (
    사번     INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    소속라인 TEXT REFERENCES 라인(라인코드)
  );

  CREATE TABLE 점검기록 (
    점검번호 INT  PRIMARY KEY,
    설비번호 INT  REFERENCES 설비(설비번호),
    점검일   DATE NOT NULL,
    결과     TEXT NOT NULL,
    점수     INT,
    담당사번 INT  REFERENCES 작업자(사번)
  );

  INSERT INTO 라인 VALUES
    ('A', '조립1라인', '1동'),
    ('B', '가공2라인', '1동'),
    ('C', '포장3라인', '2동'),
    ('D', '신설4라인', '2동');

  INSERT INTO 설비 VALUES
    (1, '컨베이어 1호', 'A', 2015),
    (2, '프레스 1호',   'A', 2019),
    (3, '용접로봇 1호', 'B', 2021),
    (4, '검사기 1호',   'B', 2018),
    (5, '포장기 1호',   'C', 2022);

  INSERT INTO 작업자 VALUES
    (101, '김반장', 'A'),
    (102, '이기사', 'B'),
    (103, '박주임', 'B'),
    (104, '최사원', 'C'),
    (105, '정신입', NULL);

  INSERT INTO 점검기록 VALUES
    ( 1, 1, '2024-01-05', '정상',   92,  101),
    ( 2, 1, '2024-02-05', '정상',   88,  101),
    ( 3, 1, '2024-03-06', '주의',   71,  102),
    ( 4, 1, '2024-04-05', '정상',   90,  101),
    ( 5, 2, '2024-01-12', '주의',   65,  102),
    ( 6, 2, '2024-02-14', '불량',   48,  103),
    ( 7, 2, '2024-03-15', '정상',   88,  101),
    ( 8, 3, '2024-01-20', '정상',   95,  103),
    ( 9, 3, '2024-02-20', '정상', NULL,  103),
    (10, 3, '2024-03-21', '주의',   74,  102),
    (11, 3, '2024-04-22', '정상',   90, NULL),
    (12, 3, '2024-05-23', '불량',   52,  103),
    (13, 4, '2024-01-28', '정상', NULL,  104),
    (14, 4, '2024-03-29', '정상',   88,  104),
    (15, 4, '2024-05-30', '주의',   69, NULL);
`);

// ── 섹션 1 — 스칼라 서브쿼리: 값 하나를 돌려줍니다 ──
// 스칼라(scalar) = 값 하나. 줄 하나 × 칸 하나. 값이 올 자리면 어디든 괄호로 싸서 넣습니다.

const 평균 = await db.query(`SELECT ROUND(AVG(점수), 2) AS 평균점수 FROM 점검기록`);
console.log("전체 평균 점수:", 평균.rows[0].평균점수);
// 출력: 전체 평균 점수: 77.69
// ★ AVG(정수칸) 은 NUMERIC 이라 자바스크립트에는 **문자열**로 옵니다. Number(...) 를 거치세요.
console.log("자바스크립트에서 본 타입:", typeof 평균.rows[0].평균점수);
// 출력: 자바스크립트에서 본 타입: string

// 이 평균을 WHERE 안에 통째로 끼워 넣습니다. 안쪽이 먼저 한 번 실행되어 값 하나가 되고,
// 바깥은 그 값과 비교만 합니다.
const 평균미만 = await db.query(`
  SELECT 점검번호, 설비번호, 점수 FROM 점검기록
  WHERE 점수 < (SELECT AVG(점수) FROM 점검기록)
  ORDER BY 점검번호`);
for (const 줄 of 평균미만.rows) console.log(`· 점검${줄.점검번호} · 설비${줄.설비번호} · ${줄.점수}점`);
// 출력: · 점검3 · 설비1 · 71점
// 출력: · 점검5 · 설비2 · 65점
// 출력: · 점검6 · 설비2 · 48점
// 출력: · 점검10 · 설비3 · 74점
// 출력: · 점검12 · 설비3 · 52점
// 출력: · 점검15 · 설비4 · 69점
// ★ 점수가 NULL 인 점검 9·13 은 안 나왔습니다. `NULL < 77.69` 는 거짓이 아니라 UNKNOWN 이고,
//   WHERE 는 참만 통과시킵니다. (02단원 NULL 3값 논리. 섹션 3 에서 이게 사고를 냅니다)
console.log("평균 미만 줄 수:", 평균미만.rows.length);
// 출력: 평균 미만 줄 수: 6

// SELECT 절에도 씁니다. 안쪽에서 바깥 줄(s)을 참조하면 **상관 서브쿼리**입니다.
const 설비별 = await db.query(`
  SELECT s.이름,
         (SELECT COUNT(*)  FROM 점검기록 p WHERE p.설비번호 = s.설비번호) AS 점검수,
         (SELECT MAX(점수) FROM 점검기록 p WHERE p.설비번호 = s.설비번호) AS 최고점
  FROM 설비 s ORDER BY s.설비번호`);
for (const 줄 of 설비별.rows) console.log(`· ${줄.이름} · 점검 ${줄.점검수}건 · 최고 ${줄.최고점}`);
// 출력: · 컨베이어 1호 · 점검 4건 · 최고 92
// 출력: · 프레스 1호 · 점검 3건 · 최고 88
// 출력: · 용접로봇 1호 · 점검 5건 · 최고 95
// 출력: · 검사기 1호 · 점검 3건 · 최고 88
// 출력: · 포장기 1호 · 점검 0건 · 최고 null
// ★ 포장기 1호는 점검기록이 0줄입니다. COUNT 는 0, MAX 는 null 입니다. 이 차이를 꼭 보세요.
// ★ COUNT(*) 는 BIGINT 입니다. PGlite 는 안전한 정수 범위면 number, 넘으면 bigint 로 줍니다.
//   bigint 는 JSON.stringify 에서 터지니 Number(...) 로 감싸는 습관을 들이세요.
const 타입확인 = await db.query(`SELECT COUNT(*) AS 작은수, 9007199254740993::BIGINT AS 큰수 FROM 점검기록`);
console.log("작은 COUNT:", typeof 타입확인.rows[0].작은수, "· 아주 큰 BIGINT:", typeof 타입확인.rows[0].큰수);
// 출력: 작은 COUNT: number · 아주 큰 BIGINT: bigint
// ★ 스칼라 자리에 두 줄 이상이 오면 에러입니다.
try {
  await db.query(`SELECT 이름, (SELECT 라인코드 FROM 설비) FROM 라인`);
} catch (e) {
  console.log("에러코드:", e.code, "·", e.message);
}
// 출력: 에러코드: 21000 · more than one row returned by a subquery used as an expression
// ★ 그런데 0줄이면 에러가 아니라 조용히 NULL 이 됩니다. 이게 섹션 3 사고의 씨앗입니다.
const 영줄 = await db.query(`SELECT (SELECT 점수 FROM 점검기록 WHERE 설비번호 = 5) AS 값`);
console.log("0줄짜리 스칼라 서브쿼리의 값:", 영줄.rows[0].값);
// 출력: 0줄짜리 스칼라 서브쿼리의 값: null

// ── 섹션 2 — IN 서브쿼리: 목록을 돌려줍니다 ──
// 스칼라는 값 하나였습니다. IN 뒤의 서브쿼리는 **줄 여러 개**를 돌려줍니다. 칸은 하나여야 합니다.
const 불량설비 = await db.query(`
  SELECT 설비번호, 이름 FROM 설비
  WHERE 설비번호 IN (SELECT 설비번호 FROM 점검기록 WHERE 결과 = '불량')
  ORDER BY 설비번호`);
for (const 줄 of 불량설비.rows) console.log(`· ${줄.설비번호} · ${줄.이름}`);
// 출력: · 2 · 프레스 1호
// 출력: · 3 · 용접로봇 1호

// 안쪽이 무엇을 돌려줬는지 직접 봅시다.
const 목록 = await db.query(`SELECT DISTINCT 설비번호 FROM 점검기록 WHERE 결과 = '불량' ORDER BY 설비번호`);
console.log("서브쿼리가 돌려준 목록:", 목록.rows.map((줄) => 줄.설비번호).join(", "));
// 출력: 서브쿼리가 돌려준 목록: 2, 3

// 값 목록이든 서브쿼리든 IN 이 하는 일은 똑같습니다 — "이 중에 있나?"
const 값목록 = await db.query(`SELECT 설비번호 FROM 설비 WHERE 설비번호 IN (2, 3) ORDER BY 설비번호`);
console.log("IN (2, 3) 과 결과가 같은가:",
  JSON.stringify(값목록.rows.map((줄) => 줄.설비번호)) === JSON.stringify(불량설비.rows.map((줄) => 줄.설비번호)));
// 출력: IN (2, 3) 과 결과가 같은가: true
// ★ 차이는 "언제 정해지느냐" 뿐입니다 — 값 목록은 쿼리를 쓸 때, 서브쿼리는 실행할 때.

// ── 섹션 3 — ★★★ NOT IN 에 NULL 이 섞이면 결과가 0건이 됩니다 ──
// 이 파일에서 제일 중요한 곳이고, 실무에서 사고가 제일 많이 나는 자리입니다.
// 하고 싶은 것: "점검을 한 번도 담당한 적 없는 작업자". 눈으로 세면 정신입(105) 한 명입니다.

const 틀린것 = await db.query(`
  SELECT 사번, 이름 FROM 작업자
  WHERE 사번 NOT IN (SELECT 담당사번 FROM 점검기록)
  ORDER BY 사번`);
console.log("NOT IN 으로 찾은 줄 수:", 틀린것.rows.length);
// 출력: NOT IN 으로 찾은 줄 수: 0

// 0건입니다. 에러도 경고도 없습니다. **그냥 조용히 틀립니다.** 안쪽이 돌려준 목록을 봅시다.
const 담당 = await db.query(`SELECT DISTINCT 담당사번 FROM 점검기록 ORDER BY 담당사번`);
console.log("담당사번 목록:", 담당.rows.map((줄) => String(줄.담당사번)).join(", "));
// 출력: 담당사번 목록: 101, 102, 103, 104, null
// ★ 끝에 null 이 있습니다. 점검 11 과 15 는 담당자가 안 정해졌습니다.
//   `105 NOT IN (101, 102, 103, 104, NULL)` 을 SQL 은 이렇게 풉니다.
//
//   105 <> 101  AND  105 <> 102  AND  105 <> 103  AND  105 <> 104  AND  105 <> NULL
//     참              참              참              참              ???
//
// 마지막 칸이 문제입니다. 실제로 찍어 봅시다.
const 논리 = await db.query(`
  SELECT (105 <> 101) AS 값과비교, (105 <> NULL) AS 널과비교,
         (true AND NULL) AS 참그리고널, (false AND NULL) AS 거짓그리고널`);
const ㄴ = 논리.rows[0];
console.log(`105 <> 101 → ${ㄴ.값과비교} · 105 <> NULL → ${ㄴ.널과비교}`);
// 출력: 105 <> 101 → true · 105 <> NULL → null
console.log(`true AND NULL → ${ㄴ.참그리고널} · false AND NULL → ${ㄴ.거짓그리고널}`);
// 출력: true AND NULL → null · false AND NULL → false

// 정리하면
//   · `105 <> NULL` 은 참도 거짓도 아닌 **UNKNOWN** 입니다. NULL 은 "모름" 이니까요.
//   · `참 AND UNKNOWN` 은 **UNKNOWN** 입니다. 앞이 다 참이어도 소용없습니다.
//   · WHERE 는 **참만** 통과시킵니다. UNKNOWN 은 버립니다.
//   · 그리고 105 만이 아니라 **모든 줄이 똑같이** 됩니다. → 그래서 0건.

const 직접 = await db.query(`
  SELECT 105 NOT IN (SELECT 담당사번 FROM 점검기록) AS 백오번,
         104 IN     (SELECT 담당사번 FROM 점검기록) AS 백사번,
         999 IN     (SELECT 담당사번 FROM 점검기록) AS 구구구`);
const ㄷ = 직접.rows[0];
console.log(`105 NOT IN → ${ㄷ.백오번} · 104 IN → ${ㄷ.백사번} · 999 IN → ${ㄷ.구구구}`);
// 출력: 105 NOT IN → null · 104 IN → true · 999 IN → null
// ★ IN 은 "하나라도 참이면 참" 이라 104 는 무사히 true 가 나옵니다. 하지만 목록에 없는 999 는
//   **false 가 아니라 null** 입니다 (`거짓 OR UNKNOWN` = UNKNOWN). 결국 IN 도 NULL 이 섞이면
//   "없다" 를 딱 잘라 말하지 못합니다. 다만 WHERE 에서 IN 은 "찾은 것" 은 제대로 통과시키니
//   사고가 덜 보일 뿐입니다.

// ── 고치는 법 1 · NOT EXISTS ← ★ 이걸 쓰세요 (줄이 있냐 없냐만 보니 NULL 이 낄 틈이 없습니다) ──
const 방법1 = await db.query(`
  SELECT w.사번, w.이름 FROM 작업자 w
  WHERE NOT EXISTS (SELECT 1 FROM 점검기록 p WHERE p.담당사번 = w.사번)
  ORDER BY w.사번`);
for (const 줄 of 방법1.rows) console.log(`· ${줄.사번} · ${줄.이름}`);
// 출력: · 105 · 정신입

// ── 고치는 법 2 · 서브쿼리에서 NULL 을 먼저 걷어내기 ──
const 방법2 = await db.query(`
  SELECT 사번, 이름 FROM 작업자
  WHERE 사번 NOT IN (SELECT 담당사번 FROM 점검기록 WHERE 담당사번 IS NOT NULL)
  ORDER BY 사번`);

// ── 고치는 법 3 · LEFT JOIN 하고 짝이 없는 줄만 (개념02 의 관용구) ──
const 방법3 = await db.query(`
  SELECT w.사번, w.이름 FROM 작업자 w LEFT JOIN 점검기록 p ON p.담당사번 = w.사번
  WHERE p.점검번호 IS NULL ORDER BY w.사번`);

console.log("세 방법의 결과가 모두 같은가:",
  JSON.stringify(방법1.rows) === JSON.stringify(방법2.rows) &&
  JSON.stringify(방법2.rows) === JSON.stringify(방법3.rows));
// 출력: 세 방법의 결과가 모두 같은가: true
// ★★★ 결론: **`NOT IN` 뒤에 서브쿼리를 쓰지 마세요. `NOT EXISTS` 를 쓰세요.**
//   지금 그 칸에 NULL 이 없더라도, 내일 누가 NULL 을 하나 넣으면 그날부터 0건입니다.
//   `NOT IN` 은 `(1, 2, 3)` 처럼 내가 손으로 적은 값 목록에만 쓰세요.
//   (이 함정은 표준 SQL 의 규칙이라 MySQL 에서도 **똑같이** 일어납니다)

// ── 섹션 4 — EXISTS 와 IN, 무엇을 언제 쓰나 ──
// EXISTS 는 거의 항상 상관 서브쿼리와 같이 씁니다. 안쪽에서 바깥 줄(s)을 참조해서
// "이 줄에 딸린 게 있나?" 를 묻습니다.

const 이그1 = await db.query(`
  SELECT s.설비번호, s.이름 FROM 설비 s
  WHERE EXISTS (SELECT 1 FROM 점검기록 p WHERE p.설비번호 = s.설비번호 AND p.결과 = '불량')
  ORDER BY s.설비번호`);
for (const 줄 of 이그1.rows) console.log(`· ${줄.설비번호} · ${줄.이름}`);
// 출력: · 2 · 프레스 1호
// 출력: · 3 · 용접로봇 1호
// ★ `SELECT 1` 인 이유: EXISTS 는 **무엇을 고르는지 안 봅니다.** 줄이 있냐만 봅니다.
const 이그2 = await db.query(`
  SELECT s.설비번호, s.이름 FROM 설비 s
  WHERE EXISTS (SELECT * FROM 점검기록 p WHERE p.설비번호 = s.설비번호 AND p.결과 = '불량')
  ORDER BY s.설비번호`);
console.log("SELECT 1 과 SELECT * 의 결과가 같은가:", JSON.stringify(이그1.rows) === JSON.stringify(이그2.rows));
// 출력: SELECT 1 과 SELECT * 의 결과가 같은가: true

// 같은 질문을 IN 으로도 써 봅니다.
const 인판 = await db.query(`
  SELECT 설비번호, 이름 FROM 설비
  WHERE 설비번호 IN (SELECT 설비번호 FROM 점검기록 WHERE 결과 = '불량')
  ORDER BY 설비번호`);
console.log("IN 과 EXISTS 의 결과가 같은가:", JSON.stringify(인판.rows) === JSON.stringify(이그1.rows));
// 출력: IN 과 EXISTS 의 결과가 같은가: true

// ── 언제 무엇을 쓰나 ──
//   · NULL 이 있을 수 있다           → 무조건 EXISTS / NOT EXISTS
//   · 목록이 고정된 짧은 값이다       → `IN (1, 2, 3)` 이 읽기 쉽습니다
//   · 안쪽에 바깥 줄을 참조할 게 없다  → IN 이 문장이 짧아집니다
//   ★ 요즘 Postgres 는 IN 과 EXISTS 를 비슷하게 최적화합니다. "어떻게" 는 06단원에서 봅니다.

// ── 섹션 5 — 상관 서브쿼리는 줄마다 다시 실행됩니다 ──
// 상관 서브쿼리 = 안쪽이 바깥 줄을 참조하는 것. 바깥이 1000줄이면 안쪽이 **1000번** 돌 수 있습니다.
// 5줄짜리 표에서는 안 느껴집니다. 큰 표를 따로 만들어서 재 봅니다.

await db.exec(`
  CREATE TABLE 큰설비 AS
    SELECT g AS 설비번호, '설비' || g AS 이름 FROM generate_series(1, 1000) AS g;
  CREATE TABLE 큰점검 AS
    SELECT g AS 점검번호, (g % 1000) + 1 AS 설비번호, (g % 100) AS 점수
    FROM generate_series(1, 20000) AS g;
`);

const 상관쿼리 = `
  SELECT s.설비번호, (SELECT COUNT(*) FROM 큰점검 p WHERE p.설비번호 = s.설비번호) AS 건수
  FROM 큰설비 s ORDER BY s.설비번호`;
const 조인쿼리 = `
  SELECT s.설비번호, COUNT(p.점검번호) AS 건수
  FROM 큰설비 s LEFT JOIN 큰점검 p ON p.설비번호 = s.설비번호
  GROUP BY s.설비번호 ORDER BY s.설비번호`;

// ★ 먼저 두 방식이 **같은 답**을 내는지부터 확인합니다. 빠른 오답은 의미가 없습니다.
const 상관결과 = await db.query(상관쿼리);
const 조인결과 = await db.query(조인쿼리);
console.log("두 방식의 답이 같은가:", JSON.stringify(상관결과.rows) === JSON.stringify(조인결과.rows));
// 출력: 두 방식의 답이 같은가: true

// 시간은 기계마다 다릅니다. 한 번만 재면 튀니까 5번 재서 **중앙값**을 씁니다.
const 중앙값 = (목록) => [...목록].sort((ㄱ, ㄴ) => ㄱ - ㄴ)[Math.floor(목록.length / 2)];
async function 재기(sql, 횟수 = 5) {
  const 기록 = [];
  for (let i = 0; i < 횟수; i++) {
    const 시작 = performance.now();
    await db.query(sql);
    기록.push(performance.now() - 시작);
  }
  return 중앙값(기록);
}

const 상관ms = await 재기(상관쿼리);
const 조인ms = await 재기(조인쿼리);
console.log(`상관 서브쿼리: ${상관ms.toFixed(1)} ms`);
// 출력?: 상관 서브쿼리: 1705.1 ms
console.log(`JOIN + GROUP BY: ${조인ms.toFixed(1)} ms`);
// 출력?: JOIN + GROUP BY: 13.1 ms
// ★ 판정은 시간이 아니라 **비교 결과**로 남깁니다. 시간은 기계마다 다르니까요.
console.log("상관 서브쿼리가 JOIN 보다 10배 넘게 느린가:", 상관ms > 조인ms * 10);
// 출력: 상관 서브쿼리가 JOIN 보다 10배 넘게 느린가: true

// 설비 1000줄 × 점검 20000줄. 상관 쪽은 설비 한 줄마다 점검을 훑고, 조인 쪽은 한 번에 묶습니다.
// ★ "왜 그런가" 와 "색인을 걸면 어떻게 달라지는가" 는 06단원(색인과 실행계획) 것입니다.
//   여기서는 "줄마다 다시 도는 모양이면 의심하라" 만 기억하세요.

// ── 섹션 6 — FROM 절 서브쿼리 (인라인 뷰) ──
// 서브쿼리를 표가 올 자리에 놓을 수도 있습니다. 임시로 만든 표처럼 쓰는 것으로,
// "집계한 결과를 다시 집계하거나 다시 거를 때" 필요합니다. 예를 들어
// "설비 한 대당 점검이 평균 몇 건인가" 는 집계의 집계인데, 그냥 겹쳐 쓰면 에러가 납니다.
try {
  await db.query(`SELECT AVG(COUNT(*)) FROM 점검기록 GROUP BY 설비번호`);
} catch (e) {
  console.log("에러코드:", e.code, "·", e.message);
}
// 출력: 에러코드: 42803 · aggregate function calls cannot be nested

// 안쪽에서 한 번 집계해 표로 만들고, 바깥에서 그 표를 다시 집계합니다.
const 집계의집계 = await db.query(`
  SELECT ROUND(AVG(집계.건수), 2) AS 설비당평균
  FROM (SELECT 설비번호, COUNT(*) AS 건수 FROM 점검기록 GROUP BY 설비번호) AS 집계`);
console.log("설비 한 대당 평균 점검 건수:", 집계의집계.rows[0].설비당평균);
// 출력: 설비 한 대당 평균 점검 건수: 3.75
// ★ 15건 / 4대 = 3.75. 4대인 이유는 점검기록이 0건인 포장기 1호가 GROUP BY 에 안 나와서입니다.

// 인라인 뷰를 JOIN 에 그대로 끼워 넣을 수도 있습니다.
const 인라인뷰 = await db.query(`
  SELECT s.이름, 집계.건수, 집계.평균 FROM 설비 s
  JOIN (SELECT 설비번호, COUNT(*) AS 건수, ROUND(AVG(점수), 1) AS 평균
        FROM 점검기록 GROUP BY 설비번호) AS 집계 ON 집계.설비번호 = s.설비번호
  ORDER BY s.설비번호`);
for (const 줄 of 인라인뷰.rows) console.log(`· ${줄.이름} · ${줄.건수}건 · 평균 ${줄.평균}`);
// 출력: · 컨베이어 1호 · 4건 · 평균 85.3
// 출력: · 프레스 1호 · 3건 · 평균 67.0
// 출력: · 용접로봇 1호 · 5건 · 평균 77.8
// 출력: · 검사기 1호 · 3건 · 평균 78.5
// ★ FROM 절 서브쿼리에는 `AS 이름` 으로 별칭을 붙이는 게 정석입니다.
//   예전 Postgres 는 별칭이 없으면 문법 에러였습니다. 지금은 어떨까요? 돌려 봅시다.
const 별칭없이 = await db.query(`
  SELECT * FROM (SELECT 설비번호, COUNT(*) AS 건수 FROM 점검기록 GROUP BY 설비번호)
  ORDER BY 설비번호`);
console.log("별칭 없이도 되는가 · 줄 수:", 별칭없이.rows.length);
// 출력: 별칭 없이도 되는가 · 줄 수: 4
// ★ PostgreSQL 16 부터는 별칭이 없어도 통과합니다(우리 PGlite 는 18.3). 그래도 **붙이세요.**
//   칸을 `집계.건수` 처럼 가리킬 수 없으면 조인할 때 바로 막힙니다.
//
// ── MySQL 은 여기가 다릅니다 ──
//   · MySQL 8.0 은 별칭이 **없으면 에러**입니다 ("Every derived table must have its own alias")
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다

// ── 섹션 7 — ★ CTE (WITH): 서브쿼리를 위에서 아래로 펴기 ──
// 서브쿼리가 두세 겹 중첩되면 읽을 수가 없습니다. **안쪽부터** 읽어야 하니까요.
// 같은 질문 — "라인별 평균 점수가 전체 평균보다 높은 라인의 설비 목록" — 을 두 가지로 써 봅니다.

// ① 중첩 서브쿼리 버전 — 괄호 안에서 밖으로 읽어야 합니다
const 중첩버전 = await db.query(`
  SELECT s.설비번호, s.이름, s.라인코드 FROM 설비 s
  WHERE s.라인코드 IN (
    SELECT 라인평균.라인코드 FROM (
      SELECT s2.라인코드, AVG(p.점수) AS 평균 FROM 설비 s2
      JOIN 점검기록 p ON p.설비번호 = s2.설비번호 GROUP BY s2.라인코드
    ) AS 라인평균 WHERE 라인평균.평균 > (SELECT AVG(점수) FROM 점검기록)
  )
  ORDER BY s.설비번호`);

// ② CTE 버전 — 위에서 아래로 이름 붙여 가며 읽습니다
const 씨티이버전 = await db.query(`
  WITH 라인평균 AS (
    SELECT s.라인코드, AVG(p.점수) AS 평균 FROM 설비 s
    JOIN 점검기록 p ON p.설비번호 = s.설비번호 GROUP BY s.라인코드
  ),
  전체평균 AS (SELECT AVG(점수) AS 값 FROM 점검기록),
  잘하는라인 AS (
    SELECT 라인평균.라인코드 FROM 라인평균, 전체평균 WHERE 라인평균.평균 > 전체평균.값
  )
  SELECT s.설비번호, s.이름, s.라인코드 FROM 설비 s
  WHERE s.라인코드 IN (SELECT 라인코드 FROM 잘하는라인)
  ORDER BY s.설비번호`);

for (const 줄 of 씨티이버전.rows) console.log(`· ${줄.설비번호} · ${줄.이름} · ${줄.라인코드}라인`);
// 출력: · 3 · 용접로봇 1호 · B라인
// 출력: · 4 · 검사기 1호 · B라인
console.log("중첩 버전과 CTE 버전의 결과가 같은가:", JSON.stringify(중첩버전.rows) === JSON.stringify(씨티이버전.rows));
// 출력: 중첩 버전과 CTE 버전의 결과가 같은가: true

// 답이 맞는지 라인별 평균을 눈으로 확인합니다.
const 라인평균보기 = await db.query(`
  SELECT s.라인코드, ROUND(AVG(p.점수), 2) AS 평균 FROM 설비 s
  JOIN 점검기록 p ON p.설비번호 = s.설비번호 GROUP BY s.라인코드 ORDER BY s.라인코드`);
console.log("라인별 평균:", 라인평균보기.rows.map((줄) => `${줄.라인코드}=${줄.평균}`).join(" · "));
// 출력: 라인별 평균: A=77.43 · B=78.00
// ★ 전체 평균 77.69 보다 높은 건 B라인뿐이라 B라인 설비 3·4 가 나왔습니다. C·D라인은 아예
//   안 보입니다 — 포장기 1호는 점검기록이 없고 D라인은 설비가 없어 JOIN 에서 빠졌습니다.
// ★ 읽는 방향이 다릅니다
//   · 중첩 서브쿼리: 제일 안쪽 괄호부터 밖으로. 괄호를 세면서 읽어야 합니다.
//   · CTE: 위에서 아래로. `라인평균` → `전체평균` → `잘하는라인` → 마지막 SELECT.
//     조각마다 **이름**이 붙어 있어 이름만 읽어도 무슨 일인지 짐작이 됩니다.
//
// ★ CTE 는 쉼표로 잇습니다. 뒤 CTE 는 앞 CTE 를 볼 수 있지만(위 `잘하는라인`) 반대는 안 됩니다.
try {
  await db.query(`WITH ㄱ AS (SELECT 값 + 1 AS 값 FROM ㄴ), ㄴ AS (SELECT 1 AS 값) SELECT * FROM ㄱ`);
} catch (e) {
  console.log("뒤 CTE 를 앞에서 참조 · 에러코드:", e.code, "·", e.message);
}
// 출력: 뒤 CTE 를 앞에서 참조 · 에러코드: 42P01 · relation "ㄴ" does not exist

// ── 섹션 8 — WITH RECURSIVE: 계층을 훑습니다 ──
// 공장 조직처럼 "위-아래" 가 여러 단계로 이어진 데이터는, 몇 단계인지 미리 모르면
// JOIN 을 몇 번 써야 할지도 모릅니다. 그때 재귀 CTE 를 씁니다.

await db.exec(`
  CREATE TABLE 조직 (번호 INT PRIMARY KEY, 이름 TEXT NOT NULL, 상위번호 INT REFERENCES 조직(번호));

  INSERT INTO 조직 VALUES
    ( 1, '공장',         NULL), ( 2, '1동',          1), ( 3, '2동',          1),
    ( 4, '조립1라인',    2),    ( 5, '가공2라인',    2), ( 6, '포장3라인',    3),
    ( 7, '컨베이어 1호', 4),    ( 8, '프레스 1호',   4), ( 9, '용접로봇 1호', 5),
    (10, '검사기 1호',   5),    (11, '포장기 1호',   6), (12, '포장기 2호',   6);
`);

// WITH RECURSIVE 는 두 덩어리를 UNION ALL 로 잇습니다. 더 붙일 게 없으면 저절로 멈춥니다.
//   · 기준줄: 어디서 출발하나 (여기서는 상위가 없는 줄 = 공장)
//   · 재귀줄: 지금까지 나온 줄(훑기)에 딸린 아래 줄을 또 붙입니다
const 전개 = await db.query(`
  WITH RECURSIVE 훑기 AS (
    SELECT 번호, 이름, 1 AS 깊이, 이름::TEXT AS 경로
    FROM 조직 WHERE 상위번호 IS NULL
    UNION ALL
    SELECT 자식.번호, 자식.이름, 부모.깊이 + 1, 부모.경로 || ' > ' || 자식.이름
    FROM 조직 자식 JOIN 훑기 부모 ON 자식.상위번호 = 부모.번호
    WHERE 부모.깊이 < 5
  )
  SELECT 깊이, 경로 FROM 훑기 ORDER BY 경로`);
for (const 줄 of 전개.rows) console.log(`${"  ".repeat(줄.깊이 - 1)}· ${줄.경로}`);
// 출력: · 공장
// 출력:   · 공장 > 1동
// 출력:     · 공장 > 1동 > 가공2라인
// 출력:       · 공장 > 1동 > 가공2라인 > 검사기 1호
// 출력:       · 공장 > 1동 > 가공2라인 > 용접로봇 1호
// 출력:     · 공장 > 1동 > 조립1라인
// 출력:       · 공장 > 1동 > 조립1라인 > 컨베이어 1호
// 출력:       · 공장 > 1동 > 조립1라인 > 프레스 1호
// 출력:   · 공장 > 2동
// 출력:     · 공장 > 2동 > 포장3라인
// 출력:       · 공장 > 2동 > 포장3라인 > 포장기 1호
// 출력:       · 공장 > 2동 > 포장3라인 > 포장기 2호
// ★ `깊이 + 1` 로 단계를 세고 `경로 || ' > ' || 이름` 으로 지나온 길을 이었습니다.
//   재귀줄 안에서는 지금까지 만든 `훑기` 를 표처럼 씁니다.
//   ★ 기준줄에 `이름::TEXT` 로 타입을 못박은 이유: 안 박으면 경로가 짧게 잘릴 수 있습니다.

// ★★★ 종료 조건이 없으면 영원히 돕니다. 위 쿼리의 `WHERE 부모.깊이 < 5` 가 안전벨트입니다.
//   데이터에 순환 참조(A 의 위가 B, B 의 위가 A)가 있으면 안전벨트 없이는 안 멈춥니다.
//   일부러 순환을 만들어 봅시다.
await db.exec(`
  INSERT INTO 조직 VALUES (13, '임시반A', NULL), (14, '임시반B', 13);
  UPDATE 조직 SET 상위번호 = 14 WHERE 번호 = 13;
`);

// ★ Postgres 14 부터 CYCLE 절이 있습니다. 지나온 줄을 다시 만나면 표시하고 멈춥니다.
//   (아래 쿼리에는 깊이 제한이 없습니다. CYCLE 절만으로 멈추는지 보는 겁니다)
const 순환 = await db.query(`
  WITH RECURSIVE 훑기 AS (
    SELECT 번호, 이름, 1 AS 깊이 FROM 조직 WHERE 번호 = 13
    UNION ALL
    SELECT 자식.번호, 자식.이름, 부모.깊이 + 1
    FROM 조직 자식 JOIN 훑기 부모 ON 자식.상위번호 = 부모.번호
  ) CYCLE 번호 SET 순환났음 USING 지나온길
  SELECT 이름, 깊이, 순환났음 FROM 훑기 ORDER BY 깊이`);
for (const 줄 of 순환.rows) console.log(`· ${줄.이름} · ${줄.깊이}단계 · 순환났음=${줄.순환났음}`);
// 출력: · 임시반A · 1단계 · 순환났음=false
// 출력: · 임시반B · 2단계 · 순환났음=false
// 출력: · 임시반A · 3단계 · 순환났음=true
// ★ 임시반A 를 두 번째로 만난 줄에 `순환났음=true` 가 붙고 거기서 멈췄습니다. CYCLE 절도 없고
//   깊이 제한도 없었다면 이 쿼리는 안 끝납니다. 실무에서는 **둘 다** 거세요.

// ★ UNION 은 중복을 지웁니다(정렬·해시 비용이 듭니다). UNION ALL 은 그냥 다 붙입니다.
const 유니온 = await db.query(`
  SELECT (SELECT COUNT(*) FROM (SELECT 결과 FROM 점검기록 UNION ALL SELECT 결과 FROM 점검기록) ㄱ) AS 올붙임,
         (SELECT COUNT(*) FROM (SELECT 결과 FROM 점검기록 UNION     SELECT 결과 FROM 점검기록) ㄴ) AS 중복제거`);
console.log("UNION ALL:", 유니온.rows[0].올붙임, "· UNION:", 유니온.rows[0].중복제거);
// 출력: UNION ALL: 30 · UNION: 3
//   ★ 재귀 CTE 에 UNION 을 쓰면 중복이 지워져 순환이 멎기도 하지만 기대지 마세요.

// ── 섹션 9 — ★ "CTE 는 느리다" 는 옛날 이야기입니다 ──
// PostgreSQL 11 까지 CTE 는 **최적화의 벽**이었습니다. WITH 로 감싸면 무조건 따로 계산해서
// 임시 결과로 만들어 놓고 썼습니다. 그래서 옛날 자료에는 "CTE 는 느리다" 고 적혀 있습니다.
// PostgreSQL **12 부터** 바뀌었습니다. 조건이 맞으면 바깥 쿼리에 녹여 넣습니다(인라인).
// 이제는 직접 지정할 수도 있습니다.
//   · `WITH x AS MATERIALIZED (...)`     → 무조건 따로 계산해 두기 (옛날 방식)
//   · `WITH x AS NOT MATERIALIZED (...)` → 무조건 녹여 넣기
const 굳히기 = await db.query(`
  WITH 집계 AS MATERIALIZED (SELECT 설비번호, COUNT(*) AS 건수 FROM 점검기록 GROUP BY 설비번호)
  SELECT COUNT(*) AS 줄수 FROM 집계`);
const 녹이기 = await db.query(`
  WITH 집계 AS NOT MATERIALIZED (SELECT 설비번호, COUNT(*) AS 건수 FROM 점검기록 GROUP BY 설비번호)
  SELECT COUNT(*) AS 줄수 FROM 집계`);
console.log("MATERIALIZED:", 굳히기.rows[0].줄수, "· NOT MATERIALIZED:", 녹이기.rows[0].줄수);
// 출력: MATERIALIZED: 4 · NOT MATERIALIZED: 4
// ★ 둘 다 문법이 통과하고 **답은 같습니다.** 달라지는 건 계산하는 방법뿐입니다.
//   PGlite 는 PostgreSQL 18.3 이니 아무것도 안 붙이면 인라인됩니다.
//   ★ 어느 쪽이 언제 빠른지, 어떻게 확인하는지는 06단원(색인과 실행계획) 것입니다.
//   ★ 지금 기억할 것: **읽기 좋게 CTE 로 쓰세요.** "CTE 라서 느리다" 는 이제 사실이 아닙니다.

// ============================================================
// 정리 — 서브쿼리가 놓이는 다섯 자리
// ============================================================
//
//  자리         모양                             돌려주는 것   언제 쓰나                  함정
//  ──────────  ───────────────────────────────  ───────────  ───────────────────────  ───────────────────────
//  스칼라       WHERE 점수 < (SELECT AVG(...))    값 하나       기준값 하나가 필요할 때     두 줄 오면 에러(21000)
//               SELECT 이름, (SELECT COUNT(*)…)                줄마다 곁들일 값           0줄이면 조용히 NULL
//  IN           WHERE 번호 IN (SELECT …)          한 칸 목록     "이 중에 있나"             NOT IN + NULL → 0건 ★★★
//  EXISTS       WHERE EXISTS (SELECT 1 …)         참/거짓       "딸린 게 있나"             상관이라 줄마다 실행
//  FROM         FROM (SELECT …) AS 집계           표            집계를 다시 집계·거를 때    별칭 없으면 못 가리킴
//  WITH (CTE)   WITH ㄱ AS (…), ㄴ AS (…)         이름 붙인 표   여러 겹을 펴서 읽을 때      뒤 CTE 를 앞에서 못 봄
//
//  ★★★ 하나만 가져간다면: **NOT IN 뒤에 서브쿼리를 쓰지 말고 NOT EXISTS 를 쓰세요.**
// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 설비마다 "마지막 점검일" 을 SELECT 절 스칼라 서브쿼리로 붙여 보세요.
//   포장기 1호에는 무엇이 나오나요? 왜 그런가요?
//
// ✏️ 직접 해보기 2 — "점검기록이 한 건도 없는 설비" 를 NOT EXISTS 로 찾아보세요(답: 포장기 1호).
//   같은 것을 NOT IN 으로도 써 보세요. 이번에는 왜 NOT IN 도 잘 되나요?
//   (힌트: 점검기록.설비번호 에 NULL 이 있나요? 위 담당사번과 비교해 보세요)
//
// ✏️ 직접 해보기 3 — `UPDATE 점검기록 SET 설비번호 = NULL WHERE 점검번호 = 1;` 뒤에
//   해보기 2 의 NOT IN 버전을 다시 돌려 보세요. NOT EXISTS 버전은 그대로인가요?
//
// ✏️ 직접 해보기 4 — "점검 건수가 설비 평균(3.75건)보다 많은 설비" 를 인라인 뷰로 찾아보세요.
//   HAVING 만으로는 왜 안 되는지 같이 생각해 보세요.
//
// ✏️ 직접 해보기 5 — "전체 평균보다 점수가 낮은 점검을 담당한 작업자 이름과 그 건수" 를
//   중첩 서브쿼리로, 또 CTE 로 써 보세요. 어느 쪽이 고치기 쉬운가요?
//
// ✏️ 직접 해보기 6 — 조직표에서 "잎(자식이 하나도 없는 줄)만" 골라 보세요.
//   NOT EXISTS 를 쓰면 재귀 없이도 됩니다. 재귀 버전과 결과를 비교하세요.
//
// ✏️ 직접 해보기 7 — 섹션 5 의 큰설비를 3000줄로 늘리면 상관 서브쿼리는 몇 배 느려지나요?

// ── 자주 하는 실수 ──
//
// [실수 1] ★★★ 짝 없는 것을 찾는데 NOT IN 을 썼다
//   `WHERE 사번 NOT IN (SELECT 담당사번 FROM 점검기록)` → 0건. 목록에 NULL 이 하나만 섞여도
//   **모든 줄**이 UNKNOWN 이 되어 사라집니다. 에러도 경고도 없어서 배포된 뒤에야 압니다.
//   → `NOT EXISTS` 를 쓰세요.
//
// [실수 2] 스칼라 서브쿼리가 0줄이라 NULL 이 됐는데 모르고 지나갔다
//   `(SELECT MAX(점수) FROM 점검기록 p WHERE p.설비번호 = s.설비번호)` 는 짝이 없으면
//   에러가 아니라 NULL 입니다. 그대로 더하면 결과가 통째로 NULL 이 됩니다.
//   → `COALESCE(..., 0)` 로 기본값을 정해 두세요.
//
// [실수 3] FROM 절 서브쿼리에 별칭을 안 붙였다
//   PostgreSQL 16 부터 문법은 통과하지만 `집계.건수` 로 가리킬 수가 없어서 JOIN 하는 순간
//   막힙니다. MySQL 8.0 에서는 아예 에러입니다. → 짧게라도 `AS 집계` 를 항상 붙이세요.
//
// [실수 4] 스칼라 자리에 두 줄이 올 수 있는 서브쿼리를 넣었다
//   개발 데이터에서는 우연히 한 줄이라 잘 돌다가, 운영에서 두 줄이 되는 순간 21000 에러로 죽습니다.
//   → 스칼라 자리에는 집계 함수를 쓰거나 `ORDER BY … LIMIT 1` 로 한 줄을 보장하세요.
//
// [실수 5] 상관 서브쿼리를 SELECT 절에 몇 개씩 쌓았다
//   `SELECT (SELECT COUNT…), (SELECT MAX…), (SELECT MIN…)` 은 바깥 줄 수 × 서브쿼리 개수만큼
//   다시 돕니다. 섹션 5 에서 잰 그 차이입니다. → 하나의 JOIN + GROUP BY 로 묶으세요.
//
// [실수 6] WITH RECURSIVE 에 종료 조건을 안 걸었다
//   데이터가 깨끗할 때는 잘 돕니다. 순환 참조가 하나 생기는 순간 쿼리가 안 끝나고 서버 하나를
//   통째로 먹습니다. → `WHERE 깊이 < N` 을 항상 걸고 `CYCLE` 절도 함께 쓰세요.
//
// [실수 7] "CTE 는 느리다" 는 옛날 글을 보고 읽기 어려운 중첩 서브쿼리로 되돌렸다
//   PostgreSQL 12 부터 CTE 는 인라인됩니다. 읽기 좋은 쪽으로 쓰고, 굳혀 두고 싶을 때만
//   `MATERIALIZED` 를 붙이세요.

await db.close();
