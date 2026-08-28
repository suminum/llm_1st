// ============================================================
// 05단원 · 개념 01 — 두 표를 잇기
// ------------------------------------------------------------
// 실행: node 개념01_두_표를_잇기.js
// ============================================================
//
// 04단원에서 표를 나눴습니다. 설비 이름을 점검기록마다 적지 않고 설비 표에
// 한 번만 적었습니다. 저장할 때는 그게 맞습니다.
//
// 그런데 **사람이 보고 싶은 것은 이어진 모습**입니다. "3월에 주의 난 설비 이름이
// 뭐죠?" 라고 묻지, "설비번호 3번의 3월 점검 결과요" 라고 묻지 않습니다.
//
// 나눠 놓은 표를 다시 이어서 보는 것 — 그게 JOIN 입니다. 이 파일은 가장 기본인
// INNER JOIN 하나만 제대로 팹니다. 짝 없는 줄은 개념02 의 LEFT JOIN 이 살립니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

// ── 예제 데이터 ──
// 05단원 전체가 이 네 표를 씁니다. 사이사이 일부러 구멍을 뚫어 놨습니다.
//   · 설비 5(포장기 1호) 는 점검기록이 없습니다
//   · 라인 D(신설4라인) 는 설비가 없습니다
//   · 점검기록 11·15 는 담당사번이 NULL 입니다

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

// ── 섹션 1: 왜 이어야 하는가 ──

const 기록만 = await db.query("SELECT 점검번호, 설비번호, 결과, 점수 FROM 점검기록 ORDER BY 점검번호 LIMIT 3");
for (const 줄 of 기록만.rows) {
  console.log(`· 점검 ${줄.점검번호} · 설비번호 ${줄.설비번호} · ${줄.결과} · ${줄.점수}점`);
}
// 출력: · 점검 1 · 설비번호 1 · 정상 · 92점
// 출력: · 점검 2 · 설비번호 1 · 정상 · 88점
// 출력: · 점검 3 · 설비번호 1 · 주의 · 71점
console.log("이 결과에 설비 이름이 있나:", "이름" in 기록만.rows[0]);
// 출력: 이 결과에 설비 이름이 있나: false

// ★ "설비번호 1" 이 무슨 설비인지 이 표만 보고는 모릅니다. 현장에 "설비번호 1이
//   주의입니다" 라고 하면 못 알아듣습니다. "컨베이어 1호" 라고 해야 알아듣습니다.
// ★ "그럼 프로그램에서 두 번 조회해 합치면 되잖아요" — 많이들 이렇게 짭니다.

let 던진쿼리수 = 0;

async function 프로그램에서합치기() {
  던진쿼리수 = 0;
  const 기록 = await db.query("SELECT 점검번호, 설비번호, 결과 FROM 점검기록 ORDER BY 점검번호");
  던진쿼리수 += 1;
  const 합친것 = [];
  for (const 줄 of 기록.rows) {
    // ★ 점검기록 한 줄마다 설비를 한 번씩 더 물어봅니다
    const 설비 = await db.query("SELECT 이름 FROM 설비 WHERE 설비번호 = $1", [줄.설비번호]);
    던진쿼리수 += 1;
    합친것.push({ 점검번호: 줄.점검번호, 설비이름: 설비.rows[0].이름, 결과: 줄.결과 });
  }
  return 합친것;
}

const 손으로합친것 = await 프로그램에서합치기();
console.log("던진 쿼리 수:", 던진쿼리수, "/ 얻은 줄 수:", 손으로합친것.length);
// 출력: 던진 쿼리 수: 16 / 얻은 줄 수: 15

// ★★ 15줄을 얻으려고 쿼리를 16번 던졌습니다. 목록 1번 + 줄마다 1번씩 15번. 이걸
//   **N+1 문제** 라고 합니다. 5만 줄이면 5만 1번입니다. JOIN 은 한 번에 가져옵니다.
async function 한번에가져오기() {
  const 결과 = await db.query(`
    SELECT p.점검번호, s.이름 AS 설비이름, p.결과
    FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
    ORDER BY p.점검번호
  `);
  return 결과.rows;
}

console.log("JOIN 결과가 같은가:", JSON.stringify(손으로합친것) === JSON.stringify(await 한번에가져오기()));
// 출력: JOIN 결과가 같은가: true

// 시간을 잽니다. 다섯 번 재서 중앙값을 씁니다. 한 번만 재면 어쩌다 느린 것에 휘둘립니다.
async function 재기(횟수, 할일) {
  const 잰것 = [];
  for (let 회차 = 0; 회차 < 횟수; 회차 += 1) {
    const 시작 = performance.now();
    await 할일();
    잰것.push(performance.now() - 시작);
  }
  return 잰것.sort((가, 나) => 가 - 나)[Math.floor(횟수 / 2)];
}

const N더하기1ms = await 재기(5, 프로그램에서합치기);
const 조인ms = await 재기(5, 한번에가져오기);
console.log(`쿼리 16번: ${N더하기1ms.toFixed(1)} ms / 쿼리 1번: ${조인ms.toFixed(1)} ms`);
// 출력?: 쿼리 16번: 4.4 ms / 쿼리 1번: 0.4 ms
console.log("N+1 이 더 느린가:", N더하기1ms > 조인ms);
// 출력: N+1 이 더 느린가: true

// ★ 왜 이렇게까지 차이가 나는지는 06단원(색인과 실행계획) 에서 봅니다.
//   여기서는 "잇는 일은 DB 에게 시켜라" 만 가져가면 됩니다.

// ── 섹션 2: INNER JOIN ... ON ──
//
// 문법은 이렇습니다.   FROM 왼쪽표 JOIN 오른쪽표 ON 짝짓는조건
// ★ JOIN 이 하는 일은 **두 표의 줄을 짝지어 옆으로 붙이는 것** 입니다.
//   위아래로 쌓는 게 아닙니다.
// 개념 모델은 이렇습니다. (진짜 이렇게 도는 건 아닙니다 — 06단원)
//   ① 설비 5줄 × 점검기록 15줄 = 75가지 짝을 전부 만들어 보고 ② 조건이 참인 것만 남긴다
//
//   1 컨베이어 1호  ───  점검 1 (설비번호 1)   ✔ 남김
//   1 컨베이어 1호  ─X─  점검 5 (설비번호 2)   ✘ 버림
//   5 포장기 1호    ─X─  (짝이 하나도 없음)     ✘ 통째로 사라짐

const 조인전부 = await db.query("SELECT * FROM 설비 JOIN 점검기록 ON 설비.설비번호 = 점검기록.설비번호");
const 설비만 = await db.query("SELECT * FROM 설비");
const 점검기록만 = await db.query("SELECT * FROM 점검기록");
console.log("설비 칸 수:", 설비만.fields.length, "/ 점검기록 칸 수:", 점검기록만.fields.length);
// 출력: 설비 칸 수: 4 / 점검기록 칸 수: 6
console.log("이은 칸 수:", 조인전부.fields.length, "/ 4 + 6 인가:", 조인전부.fields.length === 4 + 6);
// 출력: 이은 칸 수: 10 / 4 + 6 인가: true
console.log("설비 줄 수:", 설비만.rows.length, "/ 점검기록 줄 수:", 점검기록만.rows.length);
// 출력: 설비 줄 수: 5 / 점검기록 줄 수: 15
console.log("이은 줄 수:", 조인전부.rows.length);
// 출력: 이은 줄 수: 15

// ★ 칸 수 = 왼쪽 칸 수 + 오른쪽 칸 수. 옆으로 붙였으니 당연합니다.
// 이어진 모습을 봅니다. 길어서 앞의 두 대만 찍습니다.

const 조인보기 = await db.query(`
  SELECT 설비.이름 AS 설비이름, 점검기록.점검번호, 점검기록.결과
  FROM 설비 JOIN 점검기록 ON 설비.설비번호 = 점검기록.설비번호
  WHERE 설비.설비번호 <= 2 ORDER BY 점검기록.점검번호
`);
for (const 줄 of 조인보기.rows) console.log(`· ${줄.설비이름} · 점검 ${줄.점검번호} · ${줄.결과}`);
// 출력: · 컨베이어 1호 · 점검 1 · 정상
// 출력: · 컨베이어 1호 · 점검 2 · 정상
// 출력: · 컨베이어 1호 · 점검 3 · 주의
// 출력: · 컨베이어 1호 · 점검 4 · 정상
// 출력: · 프레스 1호 · 점검 5 · 주의
// 출력: · 프레스 1호 · 점검 6 · 불량
// 출력: · 프레스 1호 · 점검 7 · 정상

// ★ 컨베이어 1호가 네 번, 프레스 1호가 세 번 나왔습니다. 이게 섹션 5 의 씨앗입니다.
// ★ 그리고 이은 결과 15줄 전체에 설비는 4대뿐입니다. 포장기 1호는 점검기록이 없어서
//   **짝을 못 찾아 통째로 빠졌습니다.** INNER JOIN 은 양쪽에 다 있는 것만 남깁니다.

const 빠진설비 = await db.query("SELECT 설비번호, 이름 FROM 설비 WHERE 설비번호 NOT IN (SELECT 설비번호 FROM 점검기록)");
for (const 줄 of 빠진설비.rows) console.log(`· 빠진 설비: ${줄.설비번호} ${줄.이름}`);
// 출력: · 빠진 설비: 5 포장기 1호

// ★ 이렇게 빠진 줄까지 살리는 것이 LEFT JOIN 입니다. 개념02 에서 합니다. 아래는 INNER 확인.
const INNER붙임 = await db.query("SELECT COUNT(*) AS 줄수 FROM 설비 INNER JOIN 점검기록 ON 설비.설비번호 = 점검기록.설비번호");
console.log("INNER 를 붙여도 같은가:", INNER붙임.rows[0].줄수 === 조인전부.rows.length);
// 출력: INNER 를 붙여도 같은가: true

// ★ INNER 는 생략할 수 있습니다. 안 쓰면 INNER 로 칩니다. 이 자료에서는 생략합니다.

// ── 섹션 3: 별칭(alias) ──
//
// 표 뒤에 짧은 이름을 붙입니다.  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
// 필요한 이유는 둘입니다. ① 표 이름이 길어서 ② ★ 같은 이름의 칸이 양쪽에 있을 때
//   — 설비에도 `이름`, 작업자에도 `이름` 이 있습니다

try {
  await db.query("SELECT 이름 FROM 설비 s JOIN 작업자 w ON s.라인코드 = w.소속라인");
  console.log("에러가 안 났습니다");
} catch (에러) {
  console.log("e.code:", 에러.code);
  console.log("e.message:", 에러.message);
}
// 출력: e.code: 42702
// 출력: e.message: column reference "이름" is ambiguous

// ★ 42702 = ambiguous_column. "어느 표의 이름인지 모르겠다" 는 뜻입니다. 별칭으로 고칩니다.
const 별칭사용 = await db.query(`
  SELECT s.이름 AS 설비이름, w.이름 AS 담당자이름, p.결과
  FROM 설비 s
  JOIN 점검기록 p ON s.설비번호 = p.설비번호
  JOIN 작업자   w ON p.담당사번 = w.사번
  ORDER BY p.점검번호 LIMIT 3
`);
console.log("결과 칸 이름:", 별칭사용.fields.map((칸) => 칸.name).join(", "));
// 출력: 결과 칸 이름: 설비이름, 담당자이름, 결과
for (const 줄 of 별칭사용.rows) console.log(`· ${줄.설비이름} · ${줄.담당자이름} · ${줄.결과}`);
// 출력: · 컨베이어 1호 · 김반장 · 정상
// 출력: · 컨베이어 1호 · 김반장 · 정상
// 출력: · 컨베이어 1호 · 이기사 · 주의

// ★ `AS 설비이름` 은 **결과 칸의 이름**, `설비 s` 는 **표의 별칭** 입니다. 둘 다 AS 를
//   쓸 수 있어 헷갈립니다. 표 별칭에는 AS 를 안 쓰는 게 관례입니다.
// ★★ 별칭을 붙이면 원래 표 이름은 더 이상 못 씁니다. 가려집니다.

try {
  await db.query("SELECT 설비.이름 FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호");
  console.log("에러가 안 났습니다");
} catch (에러) {
  console.log("e.code:", 에러.code);
  console.log("e.message:", 에러.message);
}
// 출력: e.code: 42P01
// 출력: e.message: invalid reference to FROM-clause entry for table "설비"

// ★ 42P01 은 "없는 표" 에러입니다. 설비 표는 분명히 있는데도 이게 납니다. 별칭 s 를
//   붙이는 순간 그 표의 이름은 s 가 되기 때문입니다. **끝까지 별칭으로** 쓰세요.

// ── 섹션 4: 표 세 개 이상 잇기 ──
//
// JOIN 은 왼쪽부터 차례로 붙습니다. 앞에서 이은 결과가 다음 JOIN 의 왼쪽이 됩니다.
//   라인 ─JOIN→ (라인+설비) ─JOIN→ (+점검기록) ─JOIN→ (+작업자)

const 네표 = await db.query(`
  SELECT *
  FROM 라인 l
  JOIN 설비 s     ON l.라인코드 = s.라인코드
  JOIN 점검기록 p ON s.설비번호 = p.설비번호
  JOIN 작업자 w   ON p.담당사번 = w.사번
`);
console.log("네 표를 이은 칸 수:", 네표.fields.length, "/ 3+4+6+3 인가:", 네표.fields.length === 3 + 4 + 6 + 3);
// 출력: 네 표를 이은 칸 수: 16 / 3+4+6+3 인가: true
console.log("네 표를 이은 줄 수:", 네표.rows.length);
// 출력: 네 표를 이은 줄 수: 13

// ★ 점검기록은 15줄인데 13줄이 나왔습니다. 두 줄이 어디로 갔을까요.
const 담당없음 = await db.query("SELECT COUNT(*) AS 건수 FROM 점검기록 WHERE 담당사번 IS NULL");
console.log("담당사번이 NULL 인 점검기록:", 담당없음.rows[0].건수);
// 출력: 담당사번이 NULL 인 점검기록: 2

// ★★ 담당자가 안 정해진 2건이 작업자와 짝을 못 지어 사라졌습니다. NULL 은 무엇과도
//   같지 않습니다. `NULL = 105` 는 참도 거짓도 아니라 ON 조건이 참이 안 됩니다.
//   ★ 표를 하나 더 이을 때마다 줄이 **조용히 줄어들 수 있습니다.**

const 네표보기 = await db.query(`
  SELECT l.이름 AS 라인이름, s.이름 AS 설비이름, w.이름 AS 담당자, p.결과
  FROM 라인 l
  JOIN 설비 s     ON l.라인코드 = s.라인코드
  JOIN 점검기록 p ON s.설비번호 = p.설비번호
  JOIN 작업자 w   ON p.담당사번 = w.사번
  ORDER BY p.점검번호 LIMIT 3
`);
for (const 줄 of 네표보기.rows) console.log(`· ${줄.라인이름} · ${줄.설비이름} · ${줄.담당자} · ${줄.결과}`);
// 출력: · 조립1라인 · 컨베이어 1호 · 김반장 · 정상
// 출력: · 조립1라인 · 컨베이어 1호 · 김반장 · 정상
// 출력: · 조립1라인 · 컨베이어 1호 · 이기사 · 주의

// ── 섹션 5: ★★ 1:N 을 이으면 줄 수가 늘어납니다 ──
//
// 이 파일에서 제일 중요한 부분입니다. 설비 한 대에 점검기록이 여러 건 붙습니다(1:N).
// 이걸 이으면 **설비가 점검기록 건수만큼 반복해서 나옵니다.**

const 반복확인 = await db.query(`
  SELECT s.이름, COUNT(*) AS 나온횟수
  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY s.설비번호, s.이름 ORDER BY s.설비번호
`);
for (const 줄 of 반복확인.rows) console.log(`· ${줄.이름} · 결과에 ${줄.나온횟수}번 나옴`);
// 출력: · 컨베이어 1호 · 결과에 4번 나옴
// 출력: · 프레스 1호 · 결과에 3번 나옴
// 출력: · 용접로봇 1호 · 결과에 5번 나옴
// 출력: · 검사기 1호 · 결과에 3번 나옴

// ★★ 여기서 사고가 납니다. 모르고 세면 틀립니다.
const 설비수 = await db.query("SELECT COUNT(*) AS 대수 FROM 설비");
const 이은뒤수 = await db.query("SELECT COUNT(*) AS 대수 FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호");
const 중복뺀수 = await db.query("SELECT COUNT(DISTINCT s.설비번호) AS 대수 FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호");
console.log("설비 표만 세면:", 설비수.rows[0].대수);
// 출력: 설비 표만 세면: 5
console.log("이은 뒤에 세면:", 이은뒤수.rows[0].대수);
// 출력: 이은 뒤에 세면: 15
console.log("DISTINCT 로 세면:", 중복뺀수.rows[0].대수);
// 출력: DISTINCT 로 세면: 4

// ★★★ 설비는 15대가 아닙니다. 5대입니다. `COUNT(*)` 는 **결과의 줄 수** 를 셉니다.
//   ★ 5도 맞고 15도 맞고 4도 맞습니다. 셋 다 **다른 질문의 답** 입니다.
//     "설비가 몇 대인가" 5 / "점검을 몇 번 했나" 15 / "점검받은 설비가 몇 대인가" 4.
//     쿼리를 쓰기 전에 **무엇을 세는지** 부터 정하세요.
// 표를 하나 더 끼우면 더 크게 틀립니다. 라인별 설비 대수를 세 봅니다.
const 라인별진짜 = await db.query("SELECT 라인코드, COUNT(*) AS 대수 FROM 설비 GROUP BY 라인코드 ORDER BY 라인코드");
for (const 줄 of 라인별진짜.rows) console.log(`· 라인 ${줄.라인코드} · 설비 ${줄.대수}대`);
// 출력: · 라인 A · 설비 2대
// 출력: · 라인 B · 설비 2대
// 출력: · 라인 C · 설비 1대

const 라인별틀림 = await db.query(`
  SELECT l.라인코드, COUNT(*) AS 대수
  FROM 라인 l JOIN 설비 s ON l.라인코드 = s.라인코드
              JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY l.라인코드 ORDER BY l.라인코드
`);
for (const 줄 of 라인별틀림.rows) console.log(`· 라인 ${줄.라인코드} · 설비 ${줄.대수}대(?)`);
// 출력: · 라인 A · 설비 7대(?)
// 출력: · 라인 B · 설비 8대(?)

// ★★★ 라인 A 에 설비가 7대라고 나왔습니다. 실제로는 2대입니다. 점검기록을 이어
//   붙였더니 설비가 점검 건수만큼 부풀었습니다. 라인 C 와 D 는 아예 사라졌습니다.
//   보고서에 이 숫자가 올라가면 아무도 눈치 못 챕니다. 그럴듯하니까요.

const 라인별고침 = await db.query(`
  SELECT l.라인코드, COUNT(DISTINCT s.설비번호) AS 대수
  FROM 라인 l JOIN 설비 s ON l.라인코드 = s.라인코드
              JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY l.라인코드 ORDER BY l.라인코드
`);
for (const 줄 of 라인별고침.rows) console.log(`· 라인 ${줄.라인코드} · 설비 ${줄.대수}대`);
// 출력: · 라인 A · 설비 2대
// 출력: · 라인 B · 설비 2대

// ★ 부풀린 것은 DISTINCT 로 고쳤습니다. 그래도 라인 C·D 는 여전히 없습니다.
//   그건 DISTINCT 로 못 고칩니다. LEFT JOIN 이 필요합니다. 개념02·03 에서 합니다.
// ★ SUM 도 똑같이 틀립니다. 이건 더 눈치채기 어렵습니다.

const 년도합진짜 = await db.query("SELECT SUM(도입년도) AS 합 FROM 설비");
const 년도합틀림 = await db.query("SELECT SUM(s.도입년도) AS 합 FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호");
console.log("설비 표만 SUM:", 년도합진짜.rows[0].합, "/ 이은 뒤 SUM:", 년도합틀림.rows[0].합);
// 출력: 설비 표만 SUM: 10095 / 이은 뒤 SUM: 30276

// ★★ 설비 1이 4번 나오니 2015 를 네 번 더했습니다. 금액이면 매출이 뻥튀기됩니다.
//   ★ **1:N 을 이은 결과에서 1쪽 값을 집계하면 거의 항상 틀립니다.**
//     제대로 세는 법(GROUP BY + LEFT JOIN)은 개념03 에서 합니다.
// ★ 세는 값의 타입도 한 번 짚고 갑니다. 여기서 학생들이 잘 걸립니다.
const 큰수 = await db.query("SELECT 9007199254740993::BIGINT AS 큰값");
console.log("COUNT 결과의 타입:", typeof 설비수.rows[0].대수);
// 출력: COUNT 결과의 타입: number
console.log("큰 BIGINT 의 타입:", typeof 큰수.rows[0].큰값, String(큰수.rows[0].큰값));
// 출력: 큰 BIGINT 의 타입: bigint 9007199254740993

// ★★ `COUNT(*)` 의 SQL 타입은 BIGINT 입니다. PGlite 는 안전하게 담기는 크기면 number
//   로, 넘어가면 **bigint** 로 줍니다. bigint 는 `JSON.stringify` 가 터지고 number 와
//   `+` 로 못 더합니다. ★ 세는 값은 습관적으로 `Number(...)` 로 감싸세요.

// ── 섹션 6: USING 과 NATURAL JOIN ──
//
// 양쪽 칸 이름이 똑같으면 USING 으로 짧게 씁니다.
//   ON 설비.설비번호 = 점검기록.설비번호   →   USING (설비번호)

const ON버전 = await db.query("SELECT * FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호");
const USING버전 = await db.query("SELECT * FROM 설비 JOIN 점검기록 USING (설비번호)");
console.log("ON 칸 수:", ON버전.fields.length, "/ USING 칸 수:", USING버전.fields.length);
// 출력: ON 칸 수: 10 / USING 칸 수: 9
console.log("줄 수는 같은가:", ON버전.rows.length === USING버전.rows.length);
// 출력: 줄 수는 같은가: true
console.log("ON 칸 이름:", ON버전.fields.map((칸) => 칸.name).join(","));
// 출력: ON 칸 이름: 설비번호,이름,라인코드,도입년도,점검번호,설비번호,점검일,결과,점수,담당사번
console.log("USING 칸 이름:", USING버전.fields.map((칸) => 칸.name).join(","));
// 출력: USING 칸 이름: 설비번호,이름,라인코드,도입년도,점검번호,점검일,결과,점수,담당사번

// ★ ON 은 설비번호가 **두 번**, USING 은 **한 번만** 나옵니다. 그래서 한 칸 적습니다.
// ★★ 여기 자바스크립트 쪽 함정이 하나 붙어 있습니다.
console.log("ON 버전 fields:", ON버전.fields.length, "/ rows[0] 키:", Object.keys(ON버전.rows[0]).length);
// 출력: ON 버전 fields: 10 / rows[0] 키: 9

// ★★ SQL 은 10칸을 줬는데 자바스크립트 객체에는 9개뿐입니다. 키는 중복될 수 없어서
//   뒤에 온 설비번호가 앞엣것을 덮어썼습니다.
//   ★ 그래서 JOIN 에서 `SELECT *` 를 쓰면 안 됩니다. 필요한 칸만 AS 로 골라 쓰세요.
// NATURAL JOIN 은 **이름이 같은 칸을 알아서 다 찾아** 짝지어 줍니다.
const 자연조인1 = await db.query("SELECT * FROM 설비 NATURAL JOIN 점검기록");
console.log("NATURAL 줄 수:", 자연조인1.rows.length, "/ 칸 수:", 자연조인1.fields.length);
// 출력: NATURAL 줄 수: 15 / 칸 수: 9

// 잘 됩니다. USING (설비번호) 와 똑같고 ON 도 안 썼습니다. 편해 보입니다.
// ★★★ 그런데 쓰지 마세요. 반년 뒤 누가 점검기록에 라인코드를 복사해 둡니다.
//   조회할 때마다 설비를 잇기 귀찮아서요. 현실에서 아주 흔합니다.

await db.exec("ALTER TABLE 점검기록 ADD COLUMN 라인코드 TEXT;");
const 자연조인2 = await db.query("SELECT * FROM 설비 NATURAL JOIN 점검기록");
const ON조인2 = await db.query("SELECT * FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호");
console.log("칸 하나 늘린 뒤 NATURAL 줄 수:", 자연조인2.rows.length);
// 출력: 칸 하나 늘린 뒤 NATURAL 줄 수: 0
console.log("같은 상황에서 ON 줄 수:", ON조인2.rows.length);
// 출력: 같은 상황에서 ON 줄 수: 15

// ★★★ 15줄이 0줄이 됐습니다. **에러도 안 납니다.** NATURAL JOIN 이 라인코드까지 조건에
//   넣었고, 새 칸은 전부 NULL 이라 다 탈락합니다. 칸 하나 늘렸을 뿐인데 목록이 사라집니다.

await db.exec("UPDATE 점검기록 SET 라인코드 = 'A' WHERE 설비번호 IN (1, 2);");
const 자연조인3 = await db.query("SELECT * FROM 설비 NATURAL JOIN 점검기록");
console.log("설비 1·2 에 라인코드를 채운 뒤 NATURAL 줄 수:", 자연조인3.rows.length);
// 출력: 설비 1·2 에 라인코드를 채운 뒤 NATURAL 줄 수: 7

// 복사해 둔 값은 이렇게 틀어집니다. 한 건만 잘못 넣어 봅니다.
await db.exec("UPDATE 점검기록 SET 라인코드 = 'Z' WHERE 설비번호 = 1;");
const 자연조인4 = await db.query("SELECT * FROM 설비 NATURAL JOIN 점검기록");
console.log("한 설비를 틀리게 바꾼 뒤 NATURAL 줄 수:", 자연조인4.rows.length);
// 출력: 한 설비를 틀리게 바꾼 뒤 NATURAL 줄 수: 3

// ★★★ 15 → 0 → 7 → 3. 쿼리는 한 글자도 안 바꿨습니다. NATURAL JOIN 은 **표가 바뀌면
//   조용히 뜻이 바뀝니다.** 조건이 쿼리에 없으니 코드를 읽어도 안 보입니다.
//   ★ USING 은 괜찮습니다. 칸이 늘어도 USING (설비번호) 는 설비번호만 봅니다.

await db.exec("ALTER TABLE 점검기록 DROP COLUMN 라인코드;");
const 되돌림확인 = await db.query("SELECT * FROM 설비 NATURAL JOIN 점검기록");
console.log("칸을 지워 원래대로 돌린 뒤 NATURAL 줄 수:", 되돌림확인.rows.length);
// 출력: 칸을 지워 원래대로 돌린 뒤 NATURAL 줄 수: 15

// ── 섹션 7: 옛날 문법과 카테시안 곱 ──
//
// 오래된 코드는 JOIN 이라는 낱말 없이 이렇게 씁니다.
//   FROM 설비, 점검기록 WHERE 설비.설비번호 = 점검기록.설비번호

const 옛날문법 = await db.query("SELECT s.이름, p.점검번호 FROM 설비 s, 점검기록 p WHERE s.설비번호 = p.설비번호 ORDER BY p.점검번호");
const 요즘문법 = await db.query("SELECT s.이름, p.점검번호 FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호 ORDER BY p.점검번호");
console.log("옛날 문법 줄 수:", 옛날문법.rows.length);
// 출력: 옛날 문법 줄 수: 15
console.log("결과가 똑같은가:", JSON.stringify(옛날문법.rows) === JSON.stringify(요즘문법.rows));
// 출력: 결과가 똑같은가: true

// ★★ 그런데 이 문법에는 함정이 있습니다. **조건을 빠뜨려도 에러가 안 납니다.**
const 조건빠뜨림 = await db.query("SELECT * FROM 설비, 점검기록");
console.log("조건 없이 이은 줄 수:", 조건빠뜨림.rows.length, "/ 5 × 15 인가:", 조건빠뜨림.rows.length === 5 * 15);
// 출력: 조건 없이 이은 줄 수: 75 / 5 × 15 인가: true

// ★★★ 모든 짝을 다 만든 것입니다. 이걸 **카테시안 곱(cartesian product)** 이라고 합니다.
//   섹션 2 에서 "75가지 짝을 만들어 보고 조건에 맞는 것만 남긴다" 고 했는데, 조건을
//   안 주면 **거르는 단계 없이 75가지가 전부 나옵니다.**
//   설비 1만 대 × 점검기록 10만 건이면 **10억 줄** 입니다. 서버 메모리가 날아갑니다.
// 일부러 작게 만들어 시간을 재 봅니다. 300 × 300 입니다.
await db.exec(`
  CREATE TABLE 큰왼쪽   AS SELECT g AS 번호, 'L' || g AS 이름 FROM generate_series(1, 300) g;
  CREATE TABLE 큰오른쪽 AS SELECT g AS 번호, 'R' || g AS 이름 FROM generate_series(1, 300) g;
`);
const 곱줄수 = await db.query("SELECT COUNT(*) AS 줄수 FROM 큰왼쪽, 큰오른쪽");
const 조건줄수 = await db.query("SELECT COUNT(*) AS 줄수 FROM 큰왼쪽 가, 큰오른쪽 나 WHERE 가.번호 = 나.번호");
console.log("조건 없이:", 곱줄수.rows[0].줄수, "줄 / 조건 있게:", 조건줄수.rows[0].줄수, "줄");
// 출력: 조건 없이: 90000 줄 / 조건 있게: 300 줄

const 곱ms = await 재기(5, () => db.query("SELECT COUNT(*) AS 줄수 FROM 큰왼쪽, 큰오른쪽"));
const 조건ms = await 재기(5, () => db.query("SELECT COUNT(*) AS 줄수 FROM 큰왼쪽 가, 큰오른쪽 나 WHERE 가.번호 = 나.번호"));
console.log(`조건 없이: ${곱ms.toFixed(1)} ms / 조건 있게: ${조건ms.toFixed(1)} ms`);
// 출력?: 조건 없이: 8.8 ms / 조건 있게: 0.5 ms
console.log("조건을 빠뜨린 쪽이 더 느린가:", 곱ms > 조건ms);
// 출력: 조건을 빠뜨린 쪽이 더 느린가: true

// ★ 표가 300줄짜리 둘뿐인데도 벌써 차이가 납니다. 왜 그런지는 06단원에서 합니다.
// ★★ 그래서 `JOIN ... ON` 을 씁니다. ON 을 빠뜨리면 **문법 에러로 바로 잡힙니다.**

try {
  await db.query("SELECT * FROM 설비 JOIN 점검기록");
  console.log("에러가 안 났습니다");
} catch (에러) {
  console.log("e.code:", 에러.code);
  console.log("e.message:", 에러.message);
}
// 출력: e.code: 42601
// 출력: e.message: syntax error at end of input

// ★ 42601 = 문법 에러. 사람이 실수했을 때 **기계가 대신 잡아 주는 것** 이 좋은 문법입니다.
//   쉼표 문법은 안 잡아 줍니다. 정말로 모든 짝이 필요할 때는 뜻을 분명히 적습니다.
const 일부러곱 = await db.query("SELECT COUNT(*) AS 줄수 FROM 설비 CROSS JOIN 점검기록");
console.log("CROSS JOIN 줄 수:", 일부러곱.rows[0].줄수);
// 출력: CROSS JOIN 줄 수: 75

// ★ CROSS JOIN 은 "일부러 곱한 것" 이라고 코드에 적어 두는 것입니다.
//   달력 날짜 × 설비 목록처럼 빈칸까지 다 만들어야 할 때 씁니다.
// ── MySQL 은 여기가 다릅니다 ──
//   · MySQL 에서는 JOIN / INNER JOIN / CROSS JOIN 이 서로 바꿔 쓸 수 있는 낱말입니다
//   · 그래서 `FROM 설비 JOIN 점검기록` 처럼 ON 을 빼도 에러가 안 나고 카테시안 곱이 됩니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다

// ============================================================
// 정리 — 잇는 문법과 이 파일에서 실측한 값
// ============================================================
//
//   문법                        칸 수  조건을 빠뜨리면       쓸 것인가
//   ────────────────────────────────────────────────────────────────
//   JOIN ... ON                 10     문법 에러 42601       ★ 이걸 쓰세요
//   JOIN ... USING (설비번호)   9      칸 이름 틀리면 에러   ★ 이름 같으면 좋음
//   NATURAL JOIN                9      조용히 결과가 바뀜    ✘ 쓰지 마세요
//   FROM 설비, 점검기록         10     75줄 곱, 에러 없음    ✘ 옛날 문법
//   CROSS JOIN                  10     원래 곱하는 문법      ○ 일부러 곱할 때만
//
//   실측값                               값      왜
//   ────────────────────────────────────────────────────────────
//   설비 JOIN 점검기록                   15줄    설비 5는 짝이 없어 빠짐 (칸은 4+6=10)
//   네 표를 이으면                       13줄    담당사번 NULL 2건이 더 빠짐 (칸은 16)
//   이은 뒤 COUNT(*) / COUNT(DISTINCT)   15 / 4  15는 설비 대수가 아닙니다
//   조건 없이 쉼표로 이으면              75줄    5 × 15
//
// ★★★ 딱 하나만 가져간다면 이것입니다.
//   **1:N 을 이으면 1쪽이 반복됩니다. 그 상태로 세거나 더하면 틀립니다.**

// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 2 의 JOIN 을 뒤집어 보세요. `FROM 점검기록 JOIN 설비 ON ...`
//                    줄 수가 달라지나요? 칸 순서는요?
//                    (힌트: INNER 는 좌우를 바꿔도 같습니다)
//
// ✏️ 직접 해보기 2 — 설비와 작업자를 `ON s.라인코드 = w.소속라인` 으로 이어 보세요.
//                    몇 줄일까요? 손으로 먼저 세고 돌려서 맞춰 보세요.
//                    (힌트: 라인 A 는 설비 2대 × 작업자 1명)
//
// ✏️ 직접 해보기 3 — 섹션 5 의 `SUM(s.도입년도)` 를 `SUM(p.점수)` 로 바꿔 보세요.
//                    점수는 이어도 안 틀립니다. (힌트: 점수는 N쪽, 도입년도는 1쪽 칸)
//
// ✏️ 직접 해보기 4 — 라인·설비·점검기록을 잇고 1동 라인만 골라 보세요. 조건을 WHERE 에
//                    쓸 때와 ON 에 쓸 때 결과가 같나요? (LEFT JOIN 은 다릅니다 — 개념02)
//
// ✏️ 직접 해보기 5 — `설비 NATURAL JOIN 작업자` 는 몇 줄일까요? 예상하고 돌려 보세요.
//                    ★ 두 표에 `이름` 칸이 둘 다 있습니다. 그것도 짝짓기 조건이 됩니다.
//
// ✏️ 직접 해보기 6 — 섹션 7 의 300 을 1000 으로 바꿔 보세요. 줄 수는 100만이 됩니다.
//                    시간은 몇 배가 되나요? ★ 3000 이상은 하지 마세요. 노트북이 멈춥니다.
//
// ✏️ 직접 해보기 7 — 섹션 1 의 N+1 코드에서 점검기록을 `generate_series` 로 1000건
//                    만들어 돌려 보세요. JOIN 과 몇 배 차이인가요?

// ── 자주 하는 실수 ──
//
// [실수 1] 이은 결과에서 COUNT(*) 로 개수를 셈
//   `설비 JOIN 점검기록` 의 COUNT(*) 는 15입니다. 설비는 5대인데요. 1:N 을 이으면
//   1쪽이 반복됩니다. `COUNT(DISTINCT 설비번호)` 를 쓰세요. SUM·AVG 도 똑같이 부풉니다.
//
// [실수 2] 표를 하나 더 이었더니 줄이 줄어든 걸 못 알아챔
//   15줄이 13줄이 됐습니다. 담당사번이 NULL 인 2건이 빠진 것입니다. INNER JOIN 은
//   짝 없는 줄을 **말없이** 버립니다. 이을 때마다 줄 수를 확인하세요.
//
// [실수 3] JOIN 에서 SELECT * 를 씀
//   설비번호가 두 번 나오는데 객체 키는 하나뿐이라 뒤엣것이 덮어씁니다.
//   fields 는 10개인데 rows[0] 키는 9개였습니다. 필요한 칸만 AS 로 골라 쓰세요.
//
// [실수 4] NATURAL JOIN 을 편하다고 씀
//   지금은 잘 돕니다. 반년 뒤 누가 칸 하나를 늘리면 조용히 0줄이 됩니다.
//   에러도 로그도 안 남습니다. USING 이나 ON 을 쓰세요.
//
// [실수 5] 쉼표 문법으로 잇다가 조건을 빠뜨림
//   `FROM 설비, 점검기록` 은 75줄을 그냥 돌려줍니다. 에러가 안 납니다. `JOIN ... ON`
//   이었으면 42601 로 잡혔습니다. 표가 세 개면 조건도 두 개라 더 자주 빠뜨립니다.
//
// [실수 6] 별칭을 붙여 놓고 원래 표 이름을 씀
//   `FROM 설비 s` 라고 해 놓고 `설비.이름` 이라고 쓰면 42P01 이 납니다.
//   "표가 있는데 왜 없다고 하지?" 하고 헤맵니다. 끝까지 별칭으로 쓰세요.
//
// [실수 7] 프로그램에서 반복문으로 이어 붙임
//   점검기록 줄마다 설비를 조회하면 쿼리를 1 + N 번 던집니다. 여기서는 16번,
//   5만 건이면 5만 1번입니다. 잇는 일은 DB 에게 시키세요. 그러라고 있는 기능입니다.

await db.close();
