// ============================================================
// 02단원 · 개념 05 — NULL 은 값이 아닙니다
// ------------------------------------------------------------
// 실행: node 개념05_NULL은_값이_아닙니다.js
// ============================================================
//
// 개념03 에서 "CHECK 는 NULL 을 막지 못한다" 는 것을 봤습니다.
// 그때 넘어간 이야기를 이제 합니다.
//
// NULL 은 초보자를 가장 많이 넘어뜨리는 것입니다.
// 문법이 어려워서가 아닙니다. **아무 에러 없이 조용히 틀리기 때문**입니다.
//
// 이 파일에서 실제로 재 볼 것들입니다.
//
//   ① `NULL = NULL` 은 참이 아닙니다
//   ②★★★ `NOT IN` 에 NULL 이 섞이면 결과가 **0건**이 됩니다. 에러도 안 납니다
//   ③ UNIQUE 칸에 NULL 은 여러 개 들어갑니다
//   ④ `SUM` 은 NULL 을 건너뛰고, `AVG` 는 분모에서도 뺍니다
//
// ★ 딱 한 문장만 외우세요. **NULL 은 "값이 없다" 가 아니라 "모른다" 입니다.**
//   0 도, 빈 문자열도, false 도 아닙니다.
//   "모르는 것" 끼리는 같은지도 모릅니다. 여기서 전부가 따라 나옵니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();


// ── 섹션 1: 모른다는 것 ──

// 안이 안 보이는 상자가 둘 있습니다. "내용물이 같습니까?"
// 답은 "예" 도 "아니오" 도 아닙니다. **모릅니다.** SQL 이 정확히 그렇게 답합니다.

const 비교 = (await db.query(`
  SELECT
    (NULL = NULL)  AS 널널같나,
    (NULL <> NULL) AS 널널다른가,
    (1 = NULL)     AS 일과널,
    ('' = NULL)    AS 빈문자와널,
    (0 = NULL)     AS 영과널
`)).rows[0];

console.log(JSON.stringify(비교));
// 출력: {"널널같나":null,"널널다른가":null,"일과널":null,"빈문자와널":null,"영과널":null}

// ★★★ 전부 `null` 입니다. **false 가 아닙니다.**
//   `NULL = NULL` 조차 참이 아닙니다. "모르는 것" 끼리 같은지 모르니까요.
//   자바스크립트의 `null === null` 이 `true` 인 것과 완전히 다릅니다.

console.log("JS 에서 null === null:", null === null);
// 출력: JS 에서 null === null: true

// ★ 그리고 NULL 은 계산에도 옮습니다. **한 방울이면 전체가 NULL 이 됩니다.**

const 계산 = (await db.query(`
  SELECT (1 + NULL)::text AS 더하기, ('가' || NULL) AS 잇기, concat('가', NULL) AS concat함수, upper(NULL) AS 대문자
`)).rows[0];
console.log(JSON.stringify(계산));
// 출력: {"더하기":null,"잇기":null,"concat함수":"가","대문자":null}

// ★ `||` 로 이으면 전체가 NULL 이 되는데 `concat()` 함수는 NULL 을 빈 문자열로 봅니다.
//   둘이 다릅니다. 이름을 이어 붙일 때 `성 || ' ' || 이름` 을 쓰면
//   성이 없는 사람의 이름이 통째로 사라집니다. `concat` 을 쓰세요.


// ── 섹션 2: ★★ 3값 논리 — TRUE / FALSE / UNKNOWN ──

// 자바스크립트의 불리언은 두 가지입니다. SQL 은 **세 가지**입니다.
// 진리표를 직접 뽑아 봅니다.

const 진리표 = (await db.query(`
  SELECT
    coalesce(x::text, 'NULL') AS x,
    coalesce(y::text, 'NULL') AS y,
    coalesce((x AND y)::text, 'NULL') AS 그리고,
    coalesce((x OR y)::text, 'NULL') AS 또는
  FROM (VALUES (true,true),(true,false),(true,NULL),(false,false),(false,NULL),(NULL,NULL)) AS v(x,y)
`)).rows;

for (const 줄 of 진리표) {
  console.log(`${줄.x} AND ${줄.y} = ${줄.그리고}   ·   ${줄.x} OR ${줄.y} = ${줄.또는}`);
}
// 출력: true AND true = true   ·   true OR true = true
// 출력: true AND false = false   ·   true OR false = true
// 출력: true AND NULL = NULL   ·   true OR NULL = true
// 출력: false AND false = false   ·   false OR false = false
// 출력: false AND NULL = false   ·   false OR NULL = NULL
// 출력: NULL AND NULL = NULL   ·   NULL OR NULL = NULL

// ★ 두 줄만 보면 규칙이 보입니다. 나머지는 전부 UNKNOWN 입니다.
//   `false AND NULL` = **false**   ← 하나가 거짓이면 나머지를 몰라도 거짓
//   `true  OR  NULL` = **true**    ← 하나가 참이면 나머지를 몰라도 참
//
// ★★★ 그리고 **WHERE 는 TRUE 인 줄만 통과시킵니다.**
//   FALSE 도 UNKNOWN 도 똑같이 버립니다. 이게 모든 사고의 근원입니다.


// ── 섹션 3: 그래서 IS NULL 이 필요합니다 ──

const 아이에스 = (await db.query(`
  SELECT
    (NULL IS NULL) AS is널,
    (NULL IS NOT NULL) AS isnot널,
    (NULL IS NOT DISTINCT FROM NULL) AS distinct널널,
    (1 IS DISTINCT FROM NULL) AS distinct일널
`)).rows[0];
console.log(JSON.stringify(아이에스));
// 출력: {"is널":true,"isnot널":false,"distinct널널":true,"distinct일널":true}

// ★ `IS NULL` / `IS NOT NULL` 은 **항상 true 나 false 를 줍니다.** UNKNOWN 이 없습니다.
//
// ★★ `IS DISTINCT FROM` 은 NULL 을 값처럼 취급해서 비교합니다.
//     A IS DISTINCT FROM B      →  다른가?   A IS NOT DISTINCT FROM B  →  같은가?
//   자바스크립트의 `!==` / `===` 처럼 동작합니다. 값이 NULL 일 수 있을 때 유용합니다.


// ── 섹션 4: WHERE 에서 줄이 조용히 사라집니다 ──

await db.exec(`
  CREATE TABLE 설비 (
    설비번호 INT PRIMARY KEY,
    이름 TEXT NOT NULL,
    라인 TEXT,
    담당자 TEXT,
    마지막점검일 DATE
  );
`);

await db.exec(`
  INSERT INTO 설비 VALUES
    (1,'컨베이어 1호','A','김반장','2026-03-01'),
    (2,'프레스 1호','A',NULL,'2026-03-05'),
    (3,'용접로봇 1호','B','이반장',NULL),
    (4,'절단기 1호',NULL,NULL,NULL);
`);

const 세기 = async (설명, 조건) => {
  const 결과 = await db.query(`SELECT count(*)::int AS 개수 FROM 설비 WHERE ${조건}`); // 검증무시: 조건은 허용 목록에서 온 글자
  console.log(`${설명} → ${결과.rows[0].개수}건`);
};

console.log("전체 4건 중에서");
// 출력: 전체 4건 중에서
await 세기("담당자 = '김반장'", `담당자 = '김반장'`);
// 출력: 담당자 = '김반장' → 1건
await 세기("담당자 <> '김반장'", `담당자 <> '김반장'`);
// 출력: 담당자 <> '김반장' → 1건
await 세기("담당자 IS NULL", `담당자 IS NULL`);
// 출력: 담당자 IS NULL → 2건
await 세기("담당자 IS DISTINCT FROM '김반장'", `담당자 IS DISTINCT FROM '김반장'`);
// 출력: 담당자 IS DISTINCT FROM '김반장' → 3건

// ★★★ `= '김반장'` 1건 + `<> '김반장'` 1건 = **2건.** 전체는 4건인데요.
//   담당자가 NULL 인 2건이 **양쪽 어디에도 안 들어갔습니다.**
//   화면 두 개를 합쳐도 전체가 안 됩니다. "설비가 사라졌어요" 라는 신고가 들어옵니다.
//
// ★ 고치는 법은 둘입니다.
//     `담당자 IS DISTINCT FROM '김반장'`          ← NULL 도 "김반장이 아님" 으로 봄
//     `담당자 <> '김반장' OR 담당자 IS NULL`      ← 같은 뜻, 더 길게


// ── 섹션 5: ★★★ NOT IN 에 NULL 이 섞이면 0건이 됩니다 ──

// 이 파일에서 가장 중요한 부분입니다. 실무에서 정말 자주 터집니다.

await db.exec(`CREATE TABLE 정비중 (설비번호 INT)`);
await db.exec(`INSERT INTO 정비중 VALUES (1), (NULL)`);

// 정비중 표에 NULL 이 한 줄 섞였습니다.
// (설비번호가 NOT NULL 이 아니라서 들어왔습니다. 개념03 을 안 지킨 표입니다)

const 인 = (await db.query(`
  SELECT 설비번호 FROM 설비 WHERE 설비번호 IN (SELECT 설비번호 FROM 정비중) ORDER BY 설비번호
`)).rows;
console.log("IN — 정비 중인 설비:", JSON.stringify(인.map((줄) => 줄.설비번호)));
// 출력: IN — 정비 중인 설비: [1]

const 낫인 = (await db.query(`
  SELECT 설비번호 FROM 설비 WHERE 설비번호 NOT IN (SELECT 설비번호 FROM 정비중) ORDER BY 설비번호
`)).rows;
console.log("NOT IN — 정비 중이 아닌 설비:", JSON.stringify(낫인.map((줄) => 줄.설비번호)));
// 출력: NOT IN — 정비 중이 아닌 설비: []

console.log("가동 가능한 설비가 0대로 나왔나:", 낫인.length === 0);
// 출력: 가동 가능한 설비가 0대로 나왔나: true

// ★★★ **0건입니다.** 2, 3, 4번은 정비 중이 아닌데도요.
//   에러도 경고도 없습니다. "오늘 가동 가능한 설비" 화면이 **텅 빕니다.**
//
// ── 왜 이렇게 되나 ──
//
//   `설비번호 NOT IN (1, NULL)` 은 이렇게 풀립니다.
//
//     NOT (설비번호 = 1 OR 설비번호 = NULL)
//
//   2번 설비로 계산해 봅니다.
//     설비번호 = 1     →  false
//     설비번호 = NULL  →  **UNKNOWN**
//     false OR UNKNOWN →  **UNKNOWN**   (섹션 2 의 진리표를 보세요)
//     NOT UNKNOWN      →  **UNKNOWN**
//     WHERE 는 TRUE 만 통과 →  **버려집니다**
//
//   NULL 이 하나라도 있으면 **모든 줄이 UNKNOWN** 이 됩니다. 그래서 0건입니다.
//
// 직접 값으로도 확인합니다.

const 직접 = (await db.query(`SELECT (2 NOT IN (1, NULL)) AS 이번, (1 NOT IN (1, NULL)) AS 일번`)).rows[0];
console.log("2 NOT IN (1, NULL) =", 직접.이번, "· 1 NOT IN (1, NULL) =", 직접.일번);
// 출력: 2 NOT IN (1, NULL) = null · 1 NOT IN (1, NULL) = false

// ★ `1 NOT IN (1, NULL)` 만 false 입니다. 1은 확실히 있으니까요.
//   나머지는 전부 UNKNOWN 입니다.
//
// ── 어떻게 고치나 ──
//
//   방법 A. **NOT EXISTS 를 쓴다**  ← 이게 정답입니다

const 낫이그지스트 = (await db.query(`
  SELECT 설비번호 FROM 설비 가
  WHERE NOT EXISTS (SELECT 1 FROM 정비중 나 WHERE 나.설비번호 = 가.설비번호)
  ORDER BY 설비번호
`)).rows;
console.log("NOT EXISTS 로 하면:", JSON.stringify(낫이그지스트.map((줄) => 줄.설비번호)));
// 출력: NOT EXISTS 로 하면: [2,3,4]

//   방법 B. 안쪽에서 NULL 을 걸러낸다

const 널제거 = (await db.query(`
  SELECT 설비번호 FROM 설비
  WHERE 설비번호 NOT IN (SELECT 설비번호 FROM 정비중 WHERE 설비번호 IS NOT NULL)
  ORDER BY 설비번호
`)).rows;
console.log("IS NOT NULL 을 붙이면:", JSON.stringify(널제거.map((줄) => 줄.설비번호)));
// 출력: IS NOT NULL 을 붙이면: [2,3,4]

//   방법 C. **애초에 그 칸에 NOT NULL 을 건다**  ← 근본 해결
//     `정비중.설비번호 INT NOT NULL` 이었으면 이 사고 자체가 없습니다.
//
// ★★★ 기억할 것: **NOT IN 에 서브쿼리를 쓰면 NOT EXISTS 로 바꿔 쓰세요.**
//   습관으로 만드세요. 그러면 이 사고를 평생 안 만납니다.
//   (참고로 IN 은 괜찮습니다. NULL 이 섞여도 있는 것은 찾아 줍니다)


// ── 섹션 6: 집계 함수와 NULL ──

await db.exec(`CREATE TABLE 생산 (설비번호 INT, 수량 INT)`);
await db.exec(`INSERT INTO 생산 VALUES (1,100), (2,NULL), (3,200)`);

const 집계 = (await db.query(`
  SELECT count(*)::int AS 줄수, count(수량)::int AS 수량있는줄, sum(수량)::int AS 합,
         avg(수량)::text AS 평균, max(수량)::int AS 최대, min(수량)::int AS 최소
  FROM 생산
`)).rows[0];

console.log(`줄수 ${집계.줄수} · 수량있는줄 ${집계.수량있는줄} · 합 ${집계.합}`);
// 출력: 줄수 3 · 수량있는줄 2 · 합 300
console.log(`평균 ${집계.평균} · 최대 ${집계.최대} · 최소 ${집계.최소}`);
// 출력: 평균 150.0000000000000000 · 최대 200 · 최소 100

// ★★ 여기가 헷갈립니다.
//
//   `count(*)`   →  **줄 수**를 셉니다. NULL 과 무관하게 3
//   `count(수량)` →  **수량이 NULL 이 아닌 줄**만 셉니다. 2
//   `sum(수량)`   →  NULL 을 건너뛰고 더합니다. 300
//   `avg(수량)`   →  300 / **2** = 150.  ← 3으로 안 나눕니다!
//
// ★★★ 평균을 손으로 내면 다릅니다.

console.log("합 / 줄수 로 계산하면:", 300 / 3);
// 출력: 합 / 줄수 로 계산하면: 100
console.log("avg 와 같은가:", Number(집계.평균) === 300 / 3);
// 출력: avg 와 같은가: false

// ★ 100 이냐 150 이냐는 **업무가 정할 문제**입니다.
//   SQL 의 기본은 "뺀다" 입니다. 넣고 싶으면 `avg(coalesce(수량, 0))` 로 씁니다.
//   ★★ 중요한 건 **어느 쪽을 원하는지 알고 쓰는 것**입니다.
//     모르고 쓰면 보고서 숫자가 틀리고, 아무도 눈치 못 챕니다.
//
// ★ 한 줄도 없으면 sum 은 0 이 아니라 NULL 입니다.

const 빈것 = (await db.query(`SELECT sum(수량)::int AS 합, count(*)::int AS 줄수 FROM 생산 WHERE 설비번호 = 999`)).rows[0];
console.log("한 줄도 없을 때 — sum:", 빈것.합, "· count:", 빈것.줄수);
// 출력: 한 줄도 없을 때 — sum: null · count: 0

// ★★ 이걸 그대로 화면에 쓰면 "총 생산량: null" 이 찍힙니다.
//   `coalesce(sum(수량), 0)` 으로 감싸세요.


// ── 섹션 7: COALESCE 와 NULLIF ──

// `COALESCE(a, b, c)` — 앞에서부터 **NULL 이 아닌 첫 값**을 돌려줍니다.

const 코얼 = (await db.query(`
  SELECT 설비번호,
         coalesce(담당자, '미배정') AS 담당,
         coalesce(마지막점검일::text, '점검이력없음') AS 점검
  FROM 설비 ORDER BY 설비번호
`)).rows;

for (const 줄 of 코얼) {
  console.log(`${줄.설비번호}번 · ${줄.담당} · ${줄.점검}`);
}
// 출력: 1번 · 김반장 · 2026-03-01
// 출력: 2번 · 미배정 · 2026-03-05
// 출력: 3번 · 이반장 · 점검이력없음
// 출력: 4번 · 미배정 · 점검이력없음

// `NULLIF(a, b)` — a 와 b 가 같으면 NULL, 다르면 a. COALESCE 의 반대입니다.

const 널이프 = (await db.query(`SELECT nullif(0,0) AS 영영, nullif(1,0) AS 일영, (10 / nullif(0,0))::text AS 나누기`)).rows[0];
console.log(JSON.stringify(널이프));
// 출력: {"영영":null,"일영":1,"나누기":null}

// ★ `10 / nullif(분모, 0)` 는 **0으로 나누기 에러를 피하는 정석**입니다.
//   결과가 NULL 이 되므로 `coalesce(..., 0)` 로 감싸서 씁니다.
//
// ★★ COALESCE 를 남발하지 마세요.
//   `coalesce(담당자, '미배정')` 을 조회할 때마다 붙이고 있다면,
//   그건 **설계 때 정했어야 할 것을 매번 미루고 있는 것**입니다.
//   담당자가 없을 수 없다면 NOT NULL DEFAULT '미배정' 으로 표에 박으세요.


// ── 섹션 8: ★ UNIQUE 와 NULL — 여러 개 들어갑니다 ──

await db.exec(`CREATE TABLE 작업자 (사번 TEXT UNIQUE, 이름 TEXT NOT NULL)`);
await db.exec(`INSERT INTO 작업자 VALUES (NULL,'가'), (NULL,'나'), (NULL,'다')`);

const 널개수 = (await db.query(`SELECT count(*)::int AS 개수 FROM 작업자 WHERE 사번 IS NULL`)).rows[0].개수;
console.log("UNIQUE 칸에 NULL 을 세 번 넣었더니:", 널개수, "건 들어감");
// 출력: UNIQUE 칸에 NULL 을 세 번 넣었더니: 3 건 들어감

// ★★ UNIQUE 는 "같은 값이 두 번 오면 안 된다" 인데,
//   NULL 끼리는 **같은지 모르므로** 중복으로 안 봅니다. 섹션 1 의 규칙 그대로입니다.
//   "사번은 유일하니 UNIQUE" 를 걸어 놓고 사번 안 적은 작업자가 100명 생깁니다.
//   ★ UNIQUE 를 걸 때는 **NOT NULL 도 같이** 거는지 꼭 생각하세요.
//
// ★ Postgres 15 부터는 NULL 도 중복으로 보게 할 수 있습니다.

await db.exec(`CREATE TABLE 작업자2 (사번 TEXT UNIQUE NULLS NOT DISTINCT, 이름 TEXT NOT NULL)`);
try {
  await db.query(`INSERT INTO 작업자2 VALUES (NULL,'가'), (NULL,'나')`);
  console.log("NULLS NOT DISTINCT 로 NULL 두 번 — 들어감");
} catch (에러) {
  console.log("NULLS NOT DISTINCT 로 NULL 두 번 —", 에러.code);
  // 출력: NULLS NOT DISTINCT 로 NULL 두 번 — 23505
}

// ★ 다만 이건 최근 기능이라 다른 DB 로 옮길 때 안 통합니다.
//   그냥 NOT NULL 을 거는 편이 낫습니다.


// ── 섹션 9: ORDER BY 와 GROUP BY 에서 NULL 은 어디에 ──

const 정렬 = async (설명, 문구) => {
  const 결과 = await db.query(`SELECT 담당자 FROM 설비 ORDER BY ${문구}`); // 검증무시: 정렬칸 허용 목록
  console.log(`${설명} → ${결과.rows.map((줄) => 줄.담당자 ?? "NULL").join(", ")}`);
};

await 정렬("ORDER BY 담당자 (기본 ASC)", "담당자");
// 출력: ORDER BY 담당자 (기본 ASC) → 김반장, 이반장, NULL, NULL
await 정렬("ORDER BY 담당자 DESC", "담당자 DESC");
// 출력: ORDER BY 담당자 DESC → NULL, NULL, 이반장, 김반장
await 정렬("ORDER BY 담당자 ASC NULLS FIRST", "담당자 ASC NULLS FIRST");
// 출력: ORDER BY 담당자 ASC NULLS FIRST → NULL, NULL, 김반장, 이반장

// ★ Postgres 의 기본값
//     ASC  → NULLS LAST   (NULL 이 맨 뒤)
//     DESC → NULLS FIRST  (NULL 이 맨 앞)
//
//   즉 **정렬 방향을 바꾸면 NULL 위치도 바뀝니다.**
//   "최근 점검일 순" 화면에서 정렬을 뒤집었더니 점검 안 한 설비가 맨 위로 올라옵니다.
//
//   ★ 화면에서 쓸 정렬은 `NULLS LAST` 를 명시하는 습관을 들이세요.
//
// ── MySQL 은 여기가 다릅니다 ──
//   · NULL 을 항상 "가장 작은 값" 으로 봅니다. ASC 면 앞, DESC 면 뒤
//   · `NULLS FIRST/LAST` 문법이 없습니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다
//
// ★ GROUP BY 는 반대입니다. **NULL 끼리 한 묶음으로 모읍니다.**

const 그룹 = (await db.query(`
  SELECT coalesce(라인,'(없음)') AS 표시라인, count(*)::int AS 대수
  FROM 설비 GROUP BY 라인 ORDER BY 라인 NULLS LAST
`)).rows;
for (const 줄 of 그룹) console.log(`${줄.표시라인} 라인 — ${줄.대수}대`);
// 출력: A 라인 — 2대
// 출력: B 라인 — 1대
// 출력: (없음) 라인 — 1대

// ★★ 헷갈립니다. 같은 NULL 인데
//     `=` 로 비교하면 → 같지 않음(UNKNOWN)
//     GROUP BY 로 모으면 → 같은 묶음
//     UNIQUE 로 보면 → 다른 값
//   상황마다 다릅니다. **그래서 NULL 을 피하는 게 최선입니다.**


// ── 섹션 10: 자바스크립트에서 null 을 넘길 때 ──

const 널로찾기 = await db.query(`SELECT count(*)::int AS 개수 FROM 설비 WHERE 담당자 = $1`, [null]);
console.log("담당자 = $1 에 null 을 넘기면:", 널로찾기.rows[0].개수, "건");
// 출력: 담당자 = $1 에 null 을 넘기면: 0 건

const 제대로 = await db.query(`SELECT count(*)::int AS 개수 FROM 설비 WHERE 담당자 IS NOT DISTINCT FROM $1`, [null]);
console.log("IS NOT DISTINCT FROM $1 에 null 을 넘기면:", 제대로.rows[0].개수, "건");
// 출력: IS NOT DISTINCT FROM $1 에 null 을 넘기면: 2 건

// ★★★ 검색 화면에서 "담당자" 를 비워 두고 검색하면 `$1` 에 null 이 갑니다.
//   `= $1` 은 **항상 0건**입니다. 에러도 안 납니다. 해결은 둘입니다.
//     ① `IS NOT DISTINCT FROM $1` 을 쓴다
//     ② 조건 자체를 안 붙인다 (`WHERE ($1 IS NULL OR 담당자 = $1)`)
//
// ★ 자바스크립트에서 `undefined` 를 넘기면 어떻게 될까요.

const 언디파인드 = await db.query(`SELECT count(*)::int AS 개수 FROM 설비 WHERE 담당자 = $1`, [undefined]);
console.log("undefined 를 넘기면:", 언디파인드.rows[0].개수, "건");
// 출력: undefined 를 넘기면: 0 건

// ★ null 로 취급됩니다. 즉 오타로 `req.body.담당자` 를 잘못 써서 undefined 가 가도
//   **에러 없이 0건**입니다. 조용히 틀리는 종류입니다.


// ── 섹션 11: ★ 그래서 설계 때 무엇을 정해야 하나 ──

// 칸을 하나 만들 때마다 이 질문에 답하세요.
//
//     **"이 칸이 비어 있는 상태가 업무적으로 말이 되는가?"**
//
//   말이 안 되면            →  NOT NULL. 필요하면 DEFAULT 도 같이
//   말이 되면               →  NULL 허용. 그리고 **그 뜻을 문서에 적으세요**
//   "아직 모른다" 와
//   "해당 없음" 이 다르면    →  칸을 나누거나 상태 칸을 따로 두세요
//
// ★ 예를 들어 `마지막점검일` 이 NULL 이면 무슨 뜻입니까?
//     · 한 번도 점검을 안 했다?
//     · 점검은 했는데 기록을 못 찾겠다?
//     · 점검 대상이 아닌 설비다?
//
//   셋은 완전히 다른 이야기인데 표에서는 똑같이 NULL 입니다.
//   그래서 나중에 "점검 안 한 설비 목록" 을 뽑으면 엉뚱한 게 섞입니다.
//
// ★★ 어중간하게 두면 평생 이런 코드를 답니다.
//
//     coalesce(담당자, '미배정')
//     coalesce(수량, 0)
//     WHERE (마지막점검일 IS NULL OR 마지막점검일 < ...)
//
//   조회할 때마다, 화면마다, 개발자마다 붙입니다. 한 군데만 빠뜨리면 숫자가 틀립니다.
//
// ★★★ **NULL 을 허용할지는 설계 시점에 정하세요.**
//   나중에 정하면 이미 NULL 이 들어와 있어서 못 정합니다. (개념03 섹션 7)


// ============================================================
// 정리 — NULL 이 하는 짓
// ============================================================
//
//   상황                          결과                       대처
//   ────────────────────────────────────────────────────────────────────────
//   NULL = NULL                   NULL (참 아님)             IS NULL
//   1 + NULL                      NULL                       coalesce
//   '가' || NULL                  NULL                       concat() 을 쓰기
//   WHERE 담당자 <> '김'          NULL 인 줄이 빠짐          IS DISTINCT FROM
//   ★★★ NOT IN (…, NULL)         **0건**                    NOT EXISTS
//   count(*) vs count(칸)         줄 수 vs 값 있는 줄 수     의도한 쪽을 쓰기
//   sum(칸)                       NULL 을 건너뜀             coalesce(sum(..),0)
//   avg(칸)                       분모에서도 뺌              avg(coalesce(칸,0))
//   UNIQUE 칸의 NULL              여러 개 들어감             NOT NULL 도 같이
//   ORDER BY ASC                  NULL 이 맨 뒤              NULLS LAST 명시
//   ORDER BY DESC                 NULL 이 맨 앞              NULLS LAST 명시
//   GROUP BY                      NULL 끼리 한 묶음
//   WHERE 칸 = $1 에 null         **0건**                    IS NOT DISTINCT FROM
//
// ★ 세 줄 요약
//   ① NULL 은 "모른다" 입니다. 0 도 빈 문자열도 아닙니다
//   ② WHERE 는 TRUE 만 통과시킵니다. UNKNOWN 은 FALSE 와 똑같이 버려집니다
//   ③ **NOT IN 서브쿼리는 NOT EXISTS 로 바꿔 쓰세요.** 습관으로 만드세요
//
// ★★ 그리고 가장 좋은 대처는 **NULL 이 안 들어오게 하는 것**입니다.
//   NOT NULL 을 거는 데는 1초가 걸리고, NULL 을 다루는 데는 평생이 걸립니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 5 의 `정비중` 표에서 NULL 줄을 지운 뒤 NOT IN 을 다시 해 보세요.
//                    이제 2, 3, 4 가 나오나요?
//                    그다음 NULL 을 한 줄 다시 넣고 해 보세요. 다시 0건이 되나요?
//
// ✏️ 직접 해보기 2 — `SELECT 1 WHERE NULL` 과 `SELECT 1 WHERE false` 를 비교해 보세요.
//                    둘 다 0건인가요? 그럼 뭐가 다른가요?
//                    (힌트: `SELECT 1 WHERE NOT NULL` 과 `SELECT 1 WHERE NOT false` 를 해 보세요)
//
// ✏️ 직접 해보기 3 — 설비 표에서 "점검한 지 30일이 넘었거나 한 번도 안 한 설비" 를 뽑아 보세요.
//                    `WHERE 마지막점검일 < CURRENT_DATE - 30` 만 쓰면 몇 건이 나오나요?
//                    한 번도 안 한 설비가 포함되나요?
//
// ✏️ 직접 해보기 4 — 섹션 6 의 생산 표에 수량이 NULL 인 줄을 두 개 더 넣어 보세요.
//                    `avg` 가 바뀌나요? `avg(coalesce(수량,0))` 은요?
//
// ✏️ 직접 해보기 5 — `이름 TEXT NOT NULL` 인 칸에 빈 문자열 `''` 을 넣어 보세요.
//                    들어가나요? NOT NULL 이 빈 문자열도 막아 주나요?
//                    (힌트: 개념03 섹션 2 의 CHECK 를 떠올리세요)
//
// ✏️ 직접 해보기 6 — `'가' || NULL` 과 `concat('가', NULL)` 을 각각 해 보세요.
//                    성이 없는 사람의 전체 이름을 만든다면 어느 쪽을 써야 하나요?
//
// ✏️ 직접 해보기 7 — 설비 표에 `UNIQUE (라인, 담당자)` 를 걸고
//                    라인과 담당자가 둘 다 NULL 인 줄을 두 개 넣어 보세요. 들어가나요?


// ── 자주 하는 실수 ──

// [실수 1] ★★★ NOT IN 서브쿼리에 NULL 이 섞임
//   결과가 0건이 되는데 에러가 안 납니다. 이 파일에서 가장 중요한 실수입니다.
//   NOT EXISTS 를 쓰세요.

// [실수 2] `<>` 로 "아닌 것" 을 뽑으면 전부 나올 거라고 생각
//   NULL 인 줄은 `=` 에도 `<>` 에도 안 걸립니다.
//   `IS DISTINCT FROM` 을 쓰거나 `OR ... IS NULL` 을 붙이세요.

// [실수 3] `= NULL` 이라고 씀
//   문법 오류가 안 납니다. 그냥 항상 0건입니다. `IS NULL` 을 쓰세요.

// [실수 4] avg 가 전체 줄로 나눌 거라고 생각
//   NULL 인 줄은 분모에서도 빠집니다. 보고서 숫자가 조용히 틀립니다.

// [실수 5] UNIQUE 만 걸고 NOT NULL 을 안 걺
//   NULL 은 몇 개든 들어갑니다. "사번은 유일" 이 안 지켜집니다.

// [실수 6] 파라미터에 null 을 넘기고 `= $1` 로 찾음
//   항상 0건입니다. 검색 화면에서 빈 칸을 넘길 때 자주 납니다.

// [실수 7] NULL 과 빈 문자열을 섞어 씀
//   어떤 코드는 `''`, 어떤 코드는 NULL 을 넣으면 둘 다 검사해야 합니다.
//   ★ 하나로 정하세요. 보통 **빈 문자열을 금지**(CHECK)하고 NULL 만 씁니다.

await db.close();
