// ============================================================
// 03단원 · 개념 02 — 읽기
// ------------------------------------------------------------
// 실행: node 개념02_읽기.js
//
// ★ 이 파일은 10만 건을 만들어 놓고 잽니다. 3초쯤 걸립니다.
// ============================================================
//
// 개념01 에서 넣었습니다. 이제 읽습니다.
// 실무에서 쓰는 SQL 의 열에 아홉은 SELECT 입니다.
//
// 읽기는 네 가지를 정하는 일입니다.
//   ① 어떤 칸을 (SELECT)   ② 어떤 줄을 (WHERE)
//   ③ 어떤 순서로 (ORDER BY)   ④ 몇 개만 (LIMIT / OFFSET)
//
// ★★ ④ 에서 실무 사고 두 개를 재현합니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();


// ── 섹션 0: 읽을 것을 만들어 둡니다 ──

await db.exec(`
  CREATE TABLE 설비 (
    id            SERIAL PRIMARY KEY,
    이름          TEXT NOT NULL,
    라인          TEXT NOT NULL,
    상태          TEXT NOT NULL,
    담당자        TEXT,
    도입연도      INT,
    시간당생산량  INT,
    비고          TEXT
  );

  INSERT INTO 설비 (이름, 라인, 상태, 담당자, 도입연도, 시간당생산량, 비고) VALUES
    ('컨베이어 1호',  'A', '가동', '김반장', 2019, 1200, '가동률 95% 이상 유지'),
    ('컨베이어 2호',  'A', '정지', '이기사', 2021, 1100, NULL),
    ('프레스 1호',    'B', '가동', NULL,     2018,  300, '소음 심함'),
    ('프레스 2호',    'B', '점검', '김반장', 2023,  340, NULL),
    ('용접로봇 1호',  'C', '가동', '박주임', 2022,  800, '2026년 교체 예정'),
    ('CNC 선반 1호',  'C', '고장', NULL,     2017,  150, NULL),
    ('cnc 선반 2호',  'C', '가동', '최반장', 2024,  180, NULL),
    ('포장기 1호',    'A', '가동', '이기사', NULL,  900, '불량률 0.95 수준');
`);

// 10만 건짜리 점검기록도 만듭니다. 뒤에서 쪽 나누기를 잴 때 씁니다.
// ★ generate_series 는 "서버 안에서 1부터 N 까지 만들어 주는" 함수입니다.
//   시험 데이터를 만들 때 계속 씁니다. 개념05 에서 제대로 다룹니다.

await db.exec(`
  CREATE TABLE 점검기록 (
    id SERIAL PRIMARY KEY, 설비명 TEXT NOT NULL, 라인 TEXT NOT NULL,
    결과 TEXT NOT NULL, 점검일 DATE NOT NULL
  );

  INSERT INTO 점검기록 (설비명, 라인, 결과, 점검일)
  SELECT '설비' || (i % 500 + 1),
         (ARRAY['A','B','C'])[i % 3 + 1],
         (ARRAY['정상','주의','불량'])[i % 3 + 1],
         DATE '2026-01-01' + (i % 200)
  FROM generate_series(1, 100000) AS i;
`);

const 준비 = await db.query("SELECT count(*)::int AS 건수 FROM 점검기록");

console.log("점검기록 건수:", 준비.rows[0].건수);
// 출력: 점검기록 건수: 100000


// ── 섹션 1: 칸 고르기, 그리고 ★ SELECT * 를 쓰면 안 되는 이유 ──

// 필요한 칸만 이름으로 적습니다.

const 고른칸 = await db.query("SELECT 이름, 라인 FROM 설비 WHERE id = 1");

console.log("고른 칸:", JSON.stringify(고른칸.rows[0]));
// 출력: 고른 칸: {"이름":"컨베이어 1호","라인":"A"}

// * 를 쓰면 전부 옵니다.

const 별표 = await db.query("SELECT * FROM 설비 WHERE id = 1");

console.log("* 로 온 칸들:", Object.keys(별표.rows[0]).join(", "));
// 출력: * 로 온 칸들: id, 이름, 라인, 상태, 담당자, 도입연도, 시간당생산량, 비고

// ★ 편해 보입니다. 그런데 실무 코드에는 쓰면 안 됩니다. 이유가 셋입니다.
//   ① 안 쓰는 데이터를 실어 나릅니다
//   ② 칸이 늘면 코드가 조용히 깨집니다
//   ③ 색인만 읽고 끝낼 조회를 표까지 읽게 만듭니다 (06단원)
//
// ① 을 진짜로 재 봅니다. 긴 글이 든 표를 하나 만듭니다.

await db.exec(`
  CREATE TABLE 점검메모 (id SERIAL PRIMARY KEY, 설비명 TEXT, 결과 TEXT, 비고 TEXT);

  INSERT INTO 점검메모 (설비명, 결과, 비고)
  SELECT '설비' || (i % 300 + 1),
         (ARRAY['정상','주의','불량'])[i % 3 + 1],
         repeat('점검 결과 특이사항 없음. ', 20)
  FROM generate_series(1, 20000) AS i;
`);

// 중앙값을 씁니다. 평균은 어쩌다 한 번 느린 것에 크게 흔들립니다.
async function 재기(횟수, 할일) {
  const 잰것 = [];
  for (let 회차 = 0; 회차 < 횟수; 회차 += 1) {
    const 시작 = performance.now();
    await 할일();
    잰것.push(performance.now() - 시작);
  }
  return 잰것.sort((가, 나) => 가 - 나)[Math.floor(횟수 / 2)];
}

const 별표ms = await 재기(5, () => db.query("SELECT * FROM 점검메모"));
const 두칸ms = await 재기(5, () => db.query("SELECT id, 결과 FROM 점검메모"));

console.log(`SELECT * : ${별표ms.toFixed(0)} ms / SELECT id, 결과 : ${두칸ms.toFixed(0)} ms`);
// 출력?: SELECT * : 217 ms / SELECT id, 결과 : 53 ms

console.log("고른 칸이 더 빠른가:", 두칸ms < 별표ms);
// 출력: 고른 칸이 더 빠른가: true

// ★★ 필요 없는 '비고' 하나 때문에 몇 배가 느려집니다.
//   2만 건에서 이만큼이면 200만 건에서는 서비스가 멈춥니다.
//
// ② 는 이런 식으로 깨집니다.
//
//   const [id, 이름] = Object.values(줄);   ← 칸 순서에 기댄 코드
//   INSERT INTO 백업 SELECT * FROM 설비;    ← 칸이 늘면 개수가 안 맞습니다
//   res.json(줄);                           ← 새로 생긴 '주민번호' 칸까지 나갑니다
//
// ★★★ 세 번째가 진짜 사고입니다. API 가 SELECT * 를 그대로 내보내는데
//   누가 표에 개인정보 칸을 추가하면 그 순간부터 아무도 모르게 밖으로 나갑니다.
//
// ★ SELECT * 를 써도 되는 곳: 손으로 들여다볼 때, 그리고 count(*).


// ── 섹션 2: WHERE 와 연산자들 ──

async function 이름들(sql, 값들) {
  const 결과 = await db.query(sql, 값들);
  return 결과.rows.map((줄) => 줄.이름).join(" · ") || "(없음)";
}

console.log("= 가동:", await 이름들("SELECT 이름 FROM 설비 WHERE 상태 = '가동' ORDER BY id"));
// 출력: = 가동: 컨베이어 1호 · 프레스 1호 · 용접로봇 1호 · cnc 선반 2호 · 포장기 1호

console.log("<> 가동:", await 이름들("SELECT 이름 FROM 설비 WHERE 상태 <> '가동' ORDER BY id"));
// 출력: <> 가동: 컨베이어 2호 · 프레스 2호 · CNC 선반 1호

// ★ '같지 않다' 는 <> 입니다. != 도 통하지만 표준은 <> 입니다.

console.log("BETWEEN:", await 이름들("SELECT 이름 FROM 설비 WHERE 도입연도 BETWEEN 2019 AND 2022 ORDER BY id"));
// 출력: BETWEEN: 컨베이어 1호 · 컨베이어 2호 · 용접로봇 1호

// ★ BETWEEN 은 **양쪽 끝을 포함합니다.** 2019 도 2022 도 들어갑니다.
//   ★★ 시각까지 있는 칸(TIMESTAMP)에 쓰면 함정입니다. 1월 1일 AND 1월 31일 은
//   31일 00시 00분까지라 31일 오후 기록이 빠집니다. 날짜 범위는 >= 와 < 로 쓰세요.

console.log("IN:", await 이름들("SELECT 이름 FROM 설비 WHERE 상태 IN ('고장', '점검') ORDER BY id"));
// 출력: IN: 프레스 2호 · CNC 선반 1호

console.log("NOT IN:", await 이름들("SELECT 이름 FROM 설비 WHERE 라인 NOT IN ('A', 'B') ORDER BY id"));
// 출력: NOT IN: 용접로봇 1호 · CNC 선반 1호 · cnc 선반 2호

console.log("IS NULL:", await 이름들("SELECT 이름 FROM 설비 WHERE 담당자 IS NULL ORDER BY id"));
// 출력: IS NULL: 프레스 1호 · CNC 선반 1호

console.log("= NULL:", await 이름들("SELECT 이름 FROM 설비 WHERE 담당자 = NULL"));
// 출력: = NULL: (없음)

// ★★ 여기서 아주 많이 틀립니다. 담당자 = NULL 은 **에러가 아니라 그냥 0건** 입니다.
//   NULL 은 "값이 없다" 가 아니라 "모른다" 입니다.
//   모르는 것끼리 같은지 물으면 답도 "모른다" 입니다. 참이 아니니 안 나옵니다.
//   그래서 NULL 은 IS NULL / IS NOT NULL 로만 비교합니다.

// ★ NOT IN 과 NULL 이 만나면 더 이상합니다.

const 낚임 = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 담당자 NOT IN ('김반장', NULL)");

console.log("NOT IN 목록에 NULL 이 섞이면:", 낚임.rows[0].건수, "건");
// 출력: NOT IN 목록에 NULL 이 섞이면: 0 건

// ★★★ 한 건도 안 나옵니다. 에러도 없습니다.
//   'NULL 이 아닌가?' 의 답이 언제나 '모른다' 라서 전부 탈락합니다.
//   목록에 NULL 이 들어갈 수 있으면 NOT IN 을 쓰지 마세요.

// AND / OR / 괄호

console.log(
  "AND:",
  await 이름들("SELECT 이름 FROM 설비 WHERE 라인 = 'C' AND 상태 = '가동' ORDER BY id"),
);
// 출력: AND: 용접로봇 1호 · cnc 선반 2호

console.log(
  "괄호 없이:",
  await 이름들("SELECT 이름 FROM 설비 WHERE 라인 = 'A' OR 라인 = 'B' AND 상태 = '가동' ORDER BY id"),
);
// 출력: 괄호 없이: 컨베이어 1호 · 컨베이어 2호 · 프레스 1호 · 포장기 1호

console.log(
  "괄호 넣고:",
  await 이름들("SELECT 이름 FROM 설비 WHERE (라인 = 'A' OR 라인 = 'B') AND 상태 = '가동' ORDER BY id"),
);
// 출력: 괄호 넣고: 컨베이어 1호 · 프레스 1호 · 포장기 1호

// ★ AND 가 OR 보다 먼저 묶입니다. 헷갈리면 괄호를 치세요. 괄호는 공짜입니다.


// ── 섹션 3: ★ LIKE 와 와일드카드 ──

// LIKE 는 '이런 모양인 글자' 를 찾습니다. 기호가 두 개뿐입니다.
//   %   아무 글자 0개 이상        _   아무 글자 딱 1개

console.log("컨베이어%:", await 이름들("SELECT 이름 FROM 설비 WHERE 이름 LIKE '컨베이어%' ORDER BY id"));
// 출력: 컨베이어%: 컨베이어 1호 · 컨베이어 2호

console.log("%1호:", await 이름들("SELECT 이름 FROM 설비 WHERE 이름 LIKE '%1호' ORDER BY id"));
// 출력: %1호: 컨베이어 1호 · 프레스 1호 · 용접로봇 1호 · CNC 선반 1호 · 포장기 1호

console.log("_NC%:", await 이름들("SELECT 이름 FROM 설비 WHERE 이름 LIKE '_NC%' ORDER BY id"));
// 출력: _NC%: CNC 선반 1호

// ★ _ 는 정확히 한 글자입니다. 'C' 자리 하나입니다.

// ★★ LIKE 는 **대소문자를 가립니다.** ILIKE 는 안 가립니다.

console.log("LIKE cnc%:", await 이름들("SELECT 이름 FROM 설비 WHERE 이름 LIKE 'cnc%' ORDER BY id"));
// 출력: LIKE cnc%: cnc 선반 2호

console.log("ILIKE cnc%:", await 이름들("SELECT 이름 FROM 설비 WHERE 이름 ILIKE 'cnc%' ORDER BY id"));
// 출력: ILIKE cnc%: CNC 선반 1호 · cnc 선반 2호

// ★ 한글에는 대소문자가 없습니다. 그래서 한글만 찾을 때는 둘이 같습니다.

const 한글LIKE = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 이름 LIKE '프레스%'");
const 한글ILIKE = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 이름 ILIKE '프레스%'");

console.log("한글은 LIKE 와 ILIKE 가 같은가:", 한글LIKE.rows[0].건수 === 한글ILIKE.rows[0].건수);
// 출력: 한글은 LIKE 와 ILIKE 가 같은가: true

// ★★ 사용자가 검색창에 % 를 치면 그 기호가 와일드카드로 동작해 버립니다.
//   비고 칸에는 '가동률 95% 이상 유지' 와 '불량률 0.95 수준' 이 있습니다.
//   사용자가 "95%" 를 쳤습니다. 첫 번째 줄만 나와야 합니다.

function 검색어다듬기(입력) {
  // 와일드카드 기호 앞에 백슬래시를 붙여 '글자 그대로' 로 만듭니다.
  return 입력.replace(/[\\%_]/g, (글자) => "\\" + 글자);
}

const 그냥넘김 = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 비고 LIKE '%' || $1 || '%'", [
  "95%",
]);

const 다듬어넘김 = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 비고 LIKE '%' || $1 || '%'", [
  검색어다듬기("95%"),
]);

console.log("그냥 넘기면:", 그냥넘김.rows[0].건수, "건 / 다듬어 넘기면:", 다듬어넘김.rows[0].건수, "건");
// 출력: 그냥 넘기면: 2 건 / 다듬어 넘기면: 1 건

// ★★ 사용자가 친 기호 하나가 와일드카드가 되어 엉뚱한 줄까지 끌고 왔습니다.
//   '불량률 0.95 수준' 에는 퍼센트 기호가 없는데도 걸렸습니다.
//   (값 자체는 언제나 파라미터로 넘깁니다. 개념03 에서 왜 그런지 봅니다)

// ★ LIKE '%검색어%' 는 **앞에 % 가 붙으면 색인을 못 씁니다.**
//   10만 건이면 10만 건을 전부 훑습니다. 06단원에서 왜 그런지 봅니다.


// ── 섹션 4: ORDER BY ──

async function 담당자순(sql) {
  const 결과 = await db.query(sql);
  return 결과.rows.map((줄) => `${줄.이름}(${줄.담당자 ?? "없음"})`).join(" · ");
}

console.log("담당자 ASC:", await 담당자순("SELECT 이름, 담당자 FROM 설비 ORDER BY 담당자, id LIMIT 4"));
// 출력: 담당자 ASC: 컨베이어 1호(김반장) · 프레스 2호(김반장) · 용접로봇 1호(박주임) · 컨베이어 2호(이기사)

console.log("담당자 DESC:", await 담당자순("SELECT 이름, 담당자 FROM 설비 ORDER BY 담당자 DESC, id LIMIT 4"));
// 출력: 담당자 DESC: 프레스 1호(없음) · CNC 선반 1호(없음) · cnc 선반 2호(최반장) · 컨베이어 2호(이기사)

console.log(
  "DESC NULLS LAST:",
  await 담당자순("SELECT 이름, 담당자 FROM 설비 ORDER BY 담당자 DESC NULLS LAST, id LIMIT 4"),
);
// 출력: DESC NULLS LAST: cnc 선반 2호(최반장) · 컨베이어 2호(이기사) · 포장기 1호(이기사) · 용접로봇 1호(박주임)

// ★★ Postgres 의 기본 규칙입니다.
//     ASC (오름차순) → NULL 이 **맨 뒤**   ·   DESC (내림차순) → NULL 이 **맨 앞**
//
//   "NULL 은 가장 큰 값" 이라고 외우면 편합니다.
//   목록 맨 위에 값 없는 줄이 오면 이게 원인입니다. NULLS LAST 로 직접 정하세요.

// 여러 칸으로 정렬합니다. 앞의 칸이 먼저, 같으면 뒤의 칸으로 갑니다.

const 여러칸정렬 = await db.query(`
  SELECT 라인, 이름, 도입연도
  FROM 설비
  ORDER BY 라인 ASC, 도입연도 DESC NULLS LAST
`);

console.log(여러칸정렬.rows.map((줄) => `${줄.라인}:${줄.이름}(${줄.도입연도 ?? "미상"})`).join(" · "));
// 출력: A:컨베이어 2호(2021) · A:컨베이어 1호(2019) · A:포장기 1호(미상) · B:프레스 2호(2023) · B:프레스 1호(2018) · C:cnc 선반 2호(2024) · C:용접로봇 1호(2022) · C:CNC 선반 1호(2017)


// ── 섹션 5: LIMIT / OFFSET, 그리고 ★★ 그 함정 두 개 ──

// 목록 화면은 보통 이렇게 만듭니다.
//   1쪽 → LIMIT 20 OFFSET 0 · 2쪽 → OFFSET 20 · … · 4501쪽 → OFFSET 90000

const 첫쪽 = await db.query("SELECT id FROM 점검기록 ORDER BY id LIMIT 5 OFFSET 0");
const 둘째쪽 = await db.query("SELECT id FROM 점검기록 ORDER BY id LIMIT 5 OFFSET 5");

console.log("1쪽:", 첫쪽.rows.map((줄) => 줄.id).join(","), "/ 2쪽:", 둘째쪽.rows.map((줄) => 줄.id).join(","));
// 출력: 1쪽: 1,2,3,4,5 / 2쪽: 6,7,8,9,10

// ★★ 함정 ①: OFFSET 이 커지면 느려집니다.
//   OFFSET 90000 은 "90000개를 건너뛴다" 인데, 건너뛰려고 **그 90000개를 실제로 읽고**
//   나서 버립니다. 뒤로 갈수록 읽고 버리는 양이 늘어납니다. 10만 건으로 재 봅니다.

const 앞쪽ms = await 재기(7, () =>
  db.query("SELECT id, 설비명 FROM 점검기록 ORDER BY id LIMIT 20 OFFSET 0"),
);

const 뒤쪽ms = await 재기(7, () =>
  db.query("SELECT id, 설비명 FROM 점검기록 ORDER BY id LIMIT 20 OFFSET 90000"),
);

console.log(`OFFSET 0 : ${앞쪽ms.toFixed(2)} ms  /  OFFSET 90000 : ${뒤쪽ms.toFixed(2)} ms`);
// 출력?: OFFSET 0 : 0.27 ms  /  OFFSET 90000 : 17.70 ms

console.log(`몇 배 : ${(뒤쪽ms / 앞쪽ms).toFixed(0)} 배`);
// 출력?: 몇 배 : 66 배

console.log("뒤쪽이 더 느린가:", 뒤쪽ms > 앞쪽ms);
// 출력: 뒤쪽이 더 느린가: true

// ★★ 같은 20건을 가져오는데 수십 배가 걸립니다.
//   1000만 건짜리 표라면 뒷쪽은 아예 안 열립니다.
//
// ★ 해결: OFFSET 대신 **마지막으로 본 값** 을 조건으로 씁니다.
//   이걸 키셋 페이지 나누기(keyset pagination) 라고 합니다.

const 키셋ms = await 재기(7, () =>
  db.query("SELECT id, 설비명 FROM 점검기록 WHERE id > $1 ORDER BY id LIMIT 20", [90000]),
);

console.log(`키셋 : ${키셋ms.toFixed(2)} ms`);
// 출력?: 키셋 : 0.32 ms

console.log("키셋이 OFFSET 90000 보다 빠른가:", 키셋ms < 뒤쪽ms);
// 출력: 키셋이 OFFSET 90000 보다 빠른가: true

// ★ 키셋은 "몇 쪽으로 건너뛰기" 를 못 합니다. 다음 쪽만 됩니다.
//   무한 스크롤이나 '더 보기' 버튼에는 딱 맞습니다.

// ★★★ 함정 ②: 같은 줄이 두 쪽에 나옵니다.
//   정렬 기준 칸의 값이 겹치면 그 안의 순서는 **정해져 있지 않습니다.**
//   점검기록의 라인은 A·B·C 뿐이라 3만 건씩 값이 같습니다. 라인만으로 쪽을 나눠 봅니다.

const 겹침1쪽 = await db.query("SELECT id FROM 점검기록 ORDER BY 라인 LIMIT 10 OFFSET 0");
const 겹침2쪽 = await db.query("SELECT id FROM 점검기록 ORDER BY 라인 LIMIT 10 OFFSET 10");

const 앞쪽id = 겹침1쪽.rows.map((줄) => 줄.id);
const 뒷쪽id = 겹침2쪽.rows.map((줄) => 줄.id);
const 겹친것 = 앞쪽id.filter((id) => 뒷쪽id.includes(id));

console.log("1쪽:", 앞쪽id.join(","));
// 출력?: 1쪽: 24,27,15,21,6,3,12,9,18,30

console.log("2쪽:", 뒷쪽id.join(","));
// 출력?: 2쪽: 12,6,3,15,21,27,18,9,24,60

console.log("두 쪽에 겹쳐 나온 줄:", 겹친것.length, "개");
// 출력?: 두 쪽에 겹쳐 나온 줄: 9 개

console.log("겹친 줄이 있는가:", 겹친것.length > 0);
// 출력: 겹친 줄이 있는가: true

// ★★★ 10개 중 9개가 1쪽에도 2쪽에도 나왔습니다.
//
//   화면에서는 "1쪽에서 본 기록이 2쪽에도 또 있어요",
//   "분명 목록에 있었는데 넘겨도 안 보여요" 로 나타납니다.
//   개발 DB 에는 데이터가 적어 안 겹치니 재현도 안 됩니다.
//
// ★ 왜 그런가: 라인 값이 같은 3만 건의 순서는 정해져 있지 않습니다.
//   매번 달라도 규칙 위반이 아닙니다.
//
// ★★ 해결은 한 줄입니다. **정렬에 고유한 칸을 덧붙입니다.**

const 고침1쪽 = await db.query("SELECT id FROM 점검기록 ORDER BY 라인, id LIMIT 10 OFFSET 0");
const 고침2쪽 = await db.query("SELECT id FROM 점검기록 ORDER BY 라인, id LIMIT 10 OFFSET 10");

const 고침1 = 고침1쪽.rows.map((줄) => 줄.id);
const 고침2 = 고침2쪽.rows.map((줄) => 줄.id);

console.log("고친 1쪽:", 고침1.join(","));
// 출력: 고친 1쪽: 3,6,9,12,15,18,21,24,27,30

console.log("고친 2쪽:", 고침2.join(","));
// 출력: 고친 2쪽: 33,36,39,42,45,48,51,54,57,60

console.log("이제 겹치는가:", 고침1.some((id) => 고침2.includes(id)));
// 출력: 이제 겹치는가: false

// ★ 규칙: **ORDER BY 의 마지막에는 언제나 고유한 칸(보통 id)을 넣으세요.**


// ── 섹션 6: DISTINCT ──

const 라인목록 = await db.query("SELECT DISTINCT 라인 FROM 설비 ORDER BY 라인");

console.log("라인 종류:", 라인목록.rows.map((줄) => 줄.라인).join(", "));
// 출력: 라인 종류: A, B, C

// ★ DISTINCT 는 **고른 칸 전체의 조합**에 대해 중복을 없앱니다. 한 칸이 아닙니다.

const 조합 = await db.query("SELECT DISTINCT 라인, 상태 FROM 설비 ORDER BY 라인, 상태");

console.log("라인+상태 조합:", 조합.rows.map((줄) => `${줄.라인}/${줄.상태}`).join(" · "));
// 출력: 라인+상태 조합: A/가동 · A/정지 · B/가동 · B/점검 · C/가동 · C/고장

// ★ DISTINCT 는 공짜가 아닙니다. 10만 건을 전부 훑어 중복을 지웁니다.
//   "종류가 몇 개인지" 만 필요하면 count(DISTINCT 칸) 이 낫습니다.

const 설비종류 = await db.query("SELECT count(DISTINCT 설비명)::int AS 종류 FROM 점검기록");

console.log("점검기록에 나온 설비 종류:", 설비종류.rows[0].종류);
// 출력: 점검기록에 나온 설비 종류: 500


// ── 섹션 7: 별칭(AS)과 계산 칸 ──

// 읽어 오면서 계산할 수 있습니다. 그 결과에 이름을 붙이는 게 별칭입니다.

const 계산 = await db.query(`
  SELECT
    이름,
    시간당생산량 * 8            AS 하루생산량,
    2026 - 도입연도            AS 사용연수,
    상태 = '가동'              AS 돌고있음
  FROM 설비
  WHERE 시간당생산량 IS NOT NULL
  ORDER BY 하루생산량 DESC
  LIMIT 3
`);

for (const 줄 of 계산.rows) {
  console.log(`${줄.이름} — 하루 ${줄.하루생산량}개 · ${줄.사용연수 ?? "?"}년차 · 가동중=${줄.돌고있음}`);
}
// 출력: 컨베이어 1호 — 하루 9600개 · 7년차 · 가동중=true
// 출력: 컨베이어 2호 — 하루 8800개 · 5년차 · 가동중=false
// 출력: 포장기 1호 — 하루 7200개 · ?년차 · 가동중=true

// ★ 별칭에 띄어쓰기를 쓰려면 큰따옴표가 필요합니다. AS "하루 생산량" 처럼요.
//   작은따옴표는 값이라서 안 됩니다.

// ★★ 별칭은 ORDER BY 에서는 쓸 수 있는데 WHERE 에서는 못 씁니다.

const 별칭실패 = await db
  .query("SELECT 이름, 시간당생산량 * 8 AS 하루생산량 FROM 설비 WHERE 하루생산량 > 5000")
  .catch((에러) => 에러);

console.log("WHERE 에서 별칭:", 별칭실패.code, "·", 별칭실패.message);
// 출력: WHERE 에서 별칭: 42703 · column "하루생산량" does not exist

// ★ 왜 그런가: 실행 순서가 이렇기 때문입니다.
//
//     FROM → WHERE → GROUP BY → SELECT → ORDER BY → LIMIT
//
//   WHERE 를 볼 때는 별칭이 아직 안 만들어져 있습니다. ORDER BY 때는 있습니다.
//   이 순서를 외워 두면 "왜 여기선 되고 저기선 안 되지" 가 거의 다 풀립니다.

const 별칭해결 = await db.query(
  "SELECT 이름 FROM 설비 WHERE 시간당생산량 * 8 > 5000 ORDER BY 이름",
);

console.log("계산식을 그대로 쓰면:", 별칭해결.rows.map((줄) => 줄.이름).join(" · "));
// 출력: 계산식을 그대로 쓰면: 용접로봇 1호 · 컨베이어 1호 · 컨베이어 2호 · 포장기 1호


// ============================================================
// 정리 — 읽기
// ============================================================
//
//   무엇          쓰는 법                  주의할 점
//   ──────────────────────────────────────────────────────────────────
//   칸 고르기      SELECT 이름, 라인         * 는 코드에 쓰지 마세요
//   같다/다르다    = , <>                    != 도 되지만 <> 가 표준
//   범위          BETWEEN 가 AND 나         양 끝을 포함합니다
//   목록          IN ('가','나')            목록에 NULL 이 있으면 NOT IN 금지
//   빈 값         IS NULL                   = NULL 은 언제나 0건
//   모양          LIKE / ILIKE              % 와 _ 가 와일드카드
//   정렬          ORDER BY 칸 ASC/DESC      ASC→NULL 뒤, DESC→NULL 앞
//   자르기        LIMIT n OFFSET m          ★ OFFSET 이 크면 느립니다
//   중복 없애기    DISTINCT                  고른 칸 '조합' 기준
//   이름 붙이기    AS                        WHERE 에서는 못 씁니다
//
//   실행 순서:  FROM → WHERE → GROUP BY → SELECT → ORDER BY → LIMIT
//
// ★★ 재현한 사고 두 개
//   ① OFFSET 90000 이 OFFSET 0 보다 수십 배 느립니다 → 키셋으로 바꾸세요
//   ② 정렬키가 겹치면 같은 줄이 두 쪽에 나옵니다 → ORDER BY 끝에 id 를 붙이세요


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 담당자가 없는 설비를 담당자 = '' 로 찾아보세요.
//                    왜 안 나올까요? 빈 글자와 NULL 은 다릅니다.
//
// ✏️ 직접 해보기 2 — 섹션 5 의 겹침 실험에서 LIMIT 을 10 대신 100 으로 해 보세요.
//                    겹치는 줄이 늘어나나요, 줄어드나요?
//
// ✏️ 직접 해보기 3 — OFFSET 을 90000 대신 99980 으로 바꿔 재 보세요.
//                    더 느려지나요? 어디까지 느려지나요?
//
// ✏️ 직접 해보기 4 — 점검기록에서 결과가 '불량' 인 것만 최근 순으로 20건 뽑아 보세요.
//                    ORDER BY 에 id 를 꼭 붙이세요.
//
// ✏️ 직접 해보기 5 — 설비 이름에 '선반' 이 들어간 것을 대소문자 상관없이 찾아보세요.
//                    그리고 그 검색어를 파라미터($1)로 넘겨 보세요.



// ── 자주 하는 실수 ──

// [실수 1] NULL 을 = 로 비교함
//   담당자 = NULL 은 에러가 아니라 0건입니다. IS NULL 을 쓰세요.
//   NOT IN 목록에 NULL 이 섞이면 결과가 통째로 0건이 됩니다.

// [실수 2] ORDER BY 없이 LIMIT 을 씀
//   "아무 20건" 이 나옵니다. 매번 다를 수 있습니다.
//   LIMIT 을 쓸 때는 반드시 ORDER BY 를 쓰세요.

// [실수 3] ORDER BY 에 고유한 칸을 안 붙임
//   ORDER BY 점검일 DESC 가 아니라 ORDER BY 점검일 DESC, id DESC 로 쓰세요.

// [실수 4] 코드에서 SELECT * 를 씀
//   칸이 하나 늘면 응답에 그 칸이 딸려 나갑니다. 개인정보 칸이면 그대로 유출입니다.

// [실수 5] 페이지가 뒤로 갈수록 느린 걸 서버 탓으로 돌림
//   OFFSET 때문입니다. 서버를 키워도 안 낫습니다. 쿼리를 바꿔야 합니다.

// [실수 6] 검색창 입력을 그대로 LIKE 에 넣음
//   % 를 치면 전부 검색되고 _ 는 아무 한 글자가 됩니다. 다듬어서 넘기세요.


await db.close();
