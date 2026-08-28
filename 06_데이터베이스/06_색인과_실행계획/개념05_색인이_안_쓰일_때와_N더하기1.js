// ============================================================
// 06단원 · 개념 05 — 색인이 안 쓰일 때, 그리고 N+1
// ------------------------------------------------------------
// 실행: node 개념05_색인이_안_쓰일_때와_N더하기1.js
//
// ★ 이 파일은 40초쯤 걸립니다. 망 지연을 흉내 내는 부분이 있어 좀 걸립니다.
// ============================================================
//
// "색인을 걸었는데 안 빨라져요."
//
// 이 단원에서 가장 많이 듣는 말입니다. 대부분 원인은 정해져 있습니다.
// **색인은 있는데 질의가 색인을 못 쓰게 생겼기 때문**입니다.
//
// 이 파일의 앞부분에서 그 경우를 여섯 가지 전부 **실제로 재현**하고 고칩니다.
// 뒷부분에서는 색인과 아무 상관 없는데 가장 흔한 성능 문제, **N+1** 을 다룹니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

async function 재기(횟수, 할일) {
  await 할일(0);                       // 예열

  const 잰것 = [];

  for (let 회차 = 0; 회차 < 횟수; 회차 += 1) {
    const 시작 = performance.now();
    await 할일(회차);
    잰것.push(performance.now() - 시작);
  }

  return 잰것.sort((가, 나) => 가 - 나)[Math.floor(횟수 / 2)];
}

async function 계획(sql, 옵션 = "") {
  const 결과 = await db.query(`EXPLAIN ${옵션} ${sql}`);
  return 결과.rows.map((줄) => 줄["QUERY PLAN"]).join("\n");
}

const 색인썼나 = async (sql) => !(await 계획(sql)).includes("Seq Scan on");


// ── 섹션 0: 데이터와 색인 ──

await db.exec(`
  CREATE TABLE 설비 (
    id     SERIAL PRIMARY KEY,
    이름   TEXT NOT NULL,
    라인   TEXT NOT NULL,
    관리번호 TEXT NOT NULL
  );
  INSERT INTO 설비 (이름, 라인, 관리번호)
  SELECT '설비' || i, (ARRAY['A','B','C','D'])[(i % 4) + 1], lpad(i::text, 8, '0')
  FROM generate_series(1, 20000) AS i;
  CREATE INDEX 설비_이름 ON 설비 (이름);
  CREATE INDEX 설비_관리번호 ON 설비 (관리번호);

  CREATE TABLE 점검기록 (
    id       SERIAL PRIMARY KEY,
    설비번호 INT  NOT NULL,
    상태     TEXT NOT NULL,
    점검자   TEXT NOT NULL,
    점검일   DATE NOT NULL
  );
  INSERT INTO 점검기록 (설비번호, 상태, 점검자, 점검일)
  SELECT (i % 20000) + 1,
         (ARRAY['정상','주의','고장'])[(i % 3) + 1],
         '점검원' || ((i % 50) + 1),
         DATE '2024-01-01' + ((i % 365) || ' days')::interval
  FROM generate_series(1, 200000) AS i;
  CREATE INDEX 점검_설비번호 ON 점검기록 (설비번호);
  CREATE INDEX 점검_점검자 ON 점검기록 (점검자);
  ANALYZE;
`);

// 색인은 전부 걸려 있습니다. 이제부터 **색인을 못 쓰게 만드는** 실수를 하나씩 해 봅니다.


// ── 함정 1: 칸에 함수를 씌웠습니다 ──

console.log("그냥 찾기:", await 색인썼나("SELECT * FROM 점검기록 WHERE 점검자 = '점검원7'"));
// 출력: 그냥 찾기: true

console.log("lower() 를 씌우면:", await 색인썼나("SELECT * FROM 점검기록 WHERE lower(점검자) = '점검원7'"));
// 출력: lower() 를 씌우면: false

console.log(await 계획("SELECT * FROM 점검기록 WHERE lower(점검자) = '점검원7'"));
// 출력?: Seq Scan on "점검기록"  (cost=0.00..4471.00 rows=1000 width=30)
// 출력?:   Filter: (lower("점검자") = '점검원7'::text)

// ★ 왜: 색인 안에는 `점검원7` 이 들어 있습니다. `lower(점검원7)` 은 없습니다.
//   색인은 **저장된 값 그대로** 정렬돼 있습니다. 함수를 씌우면 그 정렬이 소용없어집니다.
//
// ★ 자주 하는 형태 — 전부 같은 함정입니다
//     WHERE lower(이름) = ...
//     WHERE 설비번호 + 0 = 500
//     WHERE 설비번호::text = '500'
//     WHERE date_trunc('day', 점검일) = DATE '2024-03-01'
//     WHERE substring(관리번호, 1, 3) = '000'

console.log("설비번호 + 0 으로 찾으면:", await 색인썼나("SELECT * FROM 점검기록 WHERE 설비번호 + 0 = 500"));
// 출력: 설비번호 + 0 으로 찾으면: false

// ★ 고치는 법 두 가지
//   ① 조건을 옮긴다 — 칸 쪽은 그대로 두고 값 쪽을 바꿉니다
//        WHERE 설비번호 + 0 = 500   →   WHERE 설비번호 = 500
//        WHERE date_trunc('day', 점검일) = DATE '2024-03-01'
//          → WHERE 점검일 >= DATE '2024-03-01' AND 점검일 < DATE '2024-03-02'
//   ② 표현식 색인을 만든다 (개념04 섹션 6)
//        CREATE INDEX ON 점검기록 (lower(점검자));

await db.exec("CREATE INDEX 점검_소문자점검자 ON 점검기록 (lower(점검자))");
await db.exec("ANALYZE 점검기록");

console.log("표현식 색인을 만든 뒤:", await 색인썼나("SELECT * FROM 점검기록 WHERE lower(점검자) = '점검원7'"));
// 출력: 표현식 색인을 만든 뒤: true

console.log("범위로 바꾼 날짜 조건:", await 색인썼나("SELECT * FROM 점검기록 WHERE 설비번호 >= 500 AND 설비번호 < 501"));
// 출력: 범위로 바꾼 날짜 조건: true


// ── 함정 2: LIKE 의 앞이 열려 있습니다 ──

console.log("LIKE '설비77%' (앞이 고정):", await 색인썼나("SELECT * FROM 설비 WHERE 이름 LIKE '설비77%'"));
// 출력: LIKE '설비77%' (앞이 고정): true

console.log("LIKE '%77%' (앞이 열림):", await 색인썼나("SELECT * FROM 설비 WHERE 이름 LIKE '%77%'"));
// 출력: LIKE '%77%' (앞이 열림): false

console.log(await 계획("SELECT * FROM 설비 WHERE 이름 LIKE '설비77%'"));
// 출력?: Bitmap Heap Scan on "설비"  (cost=5.30..146.62 rows=2 width=26)
// 출력?:   Filter: ("이름" ~~ '설비77%'::text)
// 출력?:   ->  Bitmap Index Scan on "설비_이름"  (cost=0.00..5.30 rows=101 width=0)
// 출력?:         Index Cond: (("이름" >= '설비77'::text) AND ("이름" < '설비78'::text))

// ★★ `Index Cond` 를 보세요. PostgreSQL 이 `LIKE '설비77%'` 를
//   `>= '설비77' AND < '설비78'` 이라는 **범위 조건으로 바꿨습니다.**
//   색인은 정렬돼 있으니 그 구간만 읽으면 됩니다.
//
//   그런데 `'%77%'` 은 그렇게 못 바꿉니다.
//   '77' 로 시작하는 게 아니라 아무 데나 있으면 되니까요.
//   전화번호부에서 "이름에 철 자가 들어가는 사람" 을 찾는 것과 같습니다. 다 봐야 합니다.
//
// ★ 고치는 법
//   ① 앞을 고정할 수 있으면 고정한다 (`LIKE '설비77%'`)
//   ② 뒤에서부터 찾는 거면 거꾸로 저장한 칸을 만들고 색인 (`reverse(이름)`)
//   ③ 진짜 전문 검색이면 **전문 검색 색인(GIN)** 이나 pg_trgm 확장을 쓴다
//      (PGlite 에는 확장이 없어 실습은 못 합니다. 10단원에서 언급합니다)
//
// ★ 대소문자 무시 + 앞 고정을 같이 하려면 표현식 색인을 씁니다
//     CREATE INDEX ON 설비 (lower(이름) text_pattern_ops);
//     WHERE lower(이름) LIKE '설비77%'


// ── 함정 3: 타입이 안 맞습니다 ──

// ★ PostgreSQL 은 여기서 **다른 데이터베이스보다 훨씬 친절합니다.**
//   맞는 게 없으면 조용히 느려지는 대신 **에러를 냅니다.**

try {
  await db.query("SELECT * FROM 설비 WHERE 관리번호 = 500");
} catch (에러) {
  console.log("문자 칸에 숫자를 주면:", 에러.code, "—", 에러.message.slice(0, 40));
  // 출력: 문자 칸에 숫자를 주면: 42883 — operator does not exist: text = integer
}

// 숫자 칸에 문자를 주는 것은 알아서 맞춰 줍니다. 색인도 그대로 쓰입니다.

console.log("숫자 칸에 문자를 주면:", await 색인썼나("SELECT * FROM 점검기록 WHERE 설비번호 = '500'"));
// 출력: 숫자 칸에 문자를 주면: true

// ★★ **PostgreSQL 에서 타입 때문에 색인이 죽는 건 '칸 쪽에 형변환이 붙을 때' 입니다.**

console.log("칸을 형변환하면:", await 색인썼나("SELECT * FROM 점검기록 WHERE 설비번호::text = '500'"));
// 출력: 칸을 형변환하면: false

// ★ 애플리케이션에서 이렇게 만들어지기 쉽습니다
//     WHERE CAST(설비번호 AS TEXT) = $1        ← 코드에서 문자열로 받아서 그냥 맞춘 경우
//   고치는 법: **값 쪽을 바꾸세요.** `WHERE 설비번호 = $1::int`
//
// ── MySQL 은 여기가 다릅니다 ──
//   MySQL 은 문자 칸에 숫자를 주면 **에러 없이 조용히 전부 훑습니다.**
//   그게 훨씬 위험합니다. 09단원에서 실제로 재 봅니다.


// ── 함정 4: OR ──

// ★ 먼저 오해를 풉니다. **OR 이 항상 나쁜 게 아닙니다.**
//   양쪽에 색인이 있으면 PostgreSQL 은 둘 다 씁니다.

console.log(await 계획("SELECT id FROM 점검기록 WHERE 설비번호 = 500 OR 점검자 = '점검원7'"));
// 출력?: Bitmap Heap Scan on "점검기록"  (cost=53.65..1586.41 rows=4116 width=4)
// 출력?:   Recheck Cond: (("설비번호" = 500) OR ("점검자" = '점검원7'::text))
// 출력?:   ->  BitmapOr  (cost=53.65..53.65 rows=4117 width=0)
// 출력?:         ->  Bitmap Index Scan on "점검_설비번호"  (cost=0.00..4.37 rows=10 width=0)
// 출력?:               Index Cond: ("설비번호" = 500)
// 출력?:         ->  Bitmap Index Scan on "점검_점검자"  (cost=0.00..47.22 rows=4107 width=0)
// 출력?:               Index Cond: ("점검자" = '점검원7'::text)

// ★ `BitmapOr` — 색인 두 개로 각각 찾아서 결과를 합쳤습니다. 잘 돌아갑니다.
//
// ★★ 진짜 문제는 **OR 이 두 표에 걸칠 때**입니다.

const 오알질의 = `
  SELECT p.id FROM 점검기록 p JOIN 설비 s ON p.설비번호 = s.id
  WHERE s.이름 = '설비77' OR p.점검자 = '점검원7'`;

const 오알계획 = await 계획(오알질의, "(ANALYZE)");

console.log(오알계획.split("\n").slice(0, 4).map((줄) => 줄.trim()).join("\n"));
// 출력?: Hash Join  (cost=597.00..4593.00 rows=4099 width=4) (actual time=13.497..148.188 rows=4010.00 loops=1)
// 출력?: Hash Cond: (p."설비번호" = s.id)
// 출력?: Join Filter: ((s."이름" = '설비77'::text) OR (p."점검자" = '점검원7'::text))
// 출력?: Rows Removed by Join Filter: 195990

// ★★★ `Rows Removed by Join Filter: 195990` 을 보세요.
//   **20만 줄을 전부 이어 붙인 다음** OR 조건으로 걸렀습니다.
//   색인은 하나도 안 썼습니다. 조건이 두 표에 걸쳐 있으면 색인으로 미리 못 거릅니다.
//
// ★ 고치는 법: **UNION 으로 쪼갭니다.**
//   각각은 한 표의 조건이니 색인을 쓸 수 있습니다.

const 유니온질의 = `
  SELECT p.id FROM 점검기록 p JOIN 설비 s ON p.설비번호 = s.id WHERE s.이름 = '설비77'
  UNION
  SELECT p.id FROM 점검기록 p JOIN 설비 s ON p.설비번호 = s.id WHERE p.점검자 = '점검원7'`;

const 오알ms = await 재기(5, () => db.query(오알질의));
const 유니온ms = await 재기(5, () => db.query(유니온질의));

console.log(`OR ${오알ms.toFixed(1)} ms / UNION ${유니온ms.toFixed(1)} ms → ${(오알ms / 유니온ms).toFixed(1)}배`);
// 출력?: OR 73.4 ms / UNION 13.9 ms → 5.3배

console.log("UNION 이 더 빠른가:", 유니온ms < 오알ms);
// 출력: UNION 이 더 빠른가: true

const 오알건수 = (await db.query(`SELECT count(*) AS 수 FROM (${오알질의}) AS t`)).rows[0].수;
const 유니온건수 = (await db.query(`SELECT count(*) AS 수 FROM (${유니온질의}) AS t`)).rows[0].수;

console.log(`결과 건수 — OR ${오알건수} / UNION ${유니온건수}`);
// 출력: 결과 건수 — OR 4010 / UNION 4010

console.log("결과가 같은가:", 오알건수 === 유니온건수);
// 출력: 결과가 같은가: true

// ★★ 주의: `UNION` 은 중복을 지웁니다(정렬/해시 비용이 듭니다).
//   중복이 없는 게 확실하면 `UNION ALL` 이 더 쌉니다.
//   하지만 OR 은 원래 중복을 안 내므로, 겹치는 줄이 있으면 UNION 을 써야 결과가 같습니다.


// ── 함정 5: 대부분의 줄을 읽습니다 ──

// 이건 **함정이 아닙니다.** 플래너가 일부러 색인을 안 쓴 것입니다. (개념01 섹션 6)

await db.exec("CREATE INDEX 점검_상태 ON 점검기록 (상태); ANALYZE 점검기록;");

console.log("고장만 (33%):", await 색인썼나("SELECT id FROM 점검기록 WHERE 상태 = '고장'"));
// 출력: 고장만 (33%): true

console.log("정상이 아닌 것 (67%):", await 색인썼나("SELECT id FROM 점검기록 WHERE 상태 <> '정상'"));
// 출력: 정상이 아닌 것 (67%): false

// ★ 이럴 때 "왜 색인을 안 쓰지?" 하고 억지로 쓰게 만들면 **더 느려집니다.**
//   개념01 에서 재 봤습니다.
//
// ★ 진짜 고치는 법은 색인이 아닙니다
//   ① 조건을 더 좁힌다 (기간을 넣는다)
//   ② LIMIT 을 건다 (화면에 20줄만 보여 주면 되잖아요)
//   ③ 미리 세어 둔 요약표를 만든다 (집계는 04단원의 이야기입니다)


// ── 함정 6: 통계가 낡았습니다 ──

// 개념02 섹션 5 에서 자세히 봤습니다. 여기서는 짧게 확인만 합니다.

await db.exec(`
  CREATE TABLE 신규기록 (id SERIAL PRIMARY KEY, 상태 TEXT NOT NULL);
  INSERT INTO 신규기록 (상태) SELECT CASE WHEN i <= 10 THEN '고장' ELSE '정상' END
  FROM generate_series(1, 100000) AS i;
  CREATE INDEX 신규_상태 ON 신규기록 (상태);
  ANALYZE 신규기록;
`);

await db.exec("UPDATE 신규기록 SET 상태 = '고장' WHERE id % 10 <> 0");   // 이제 90% 가 고장

const 낡은계획 = await 계획("SELECT count(*) FROM 신규기록 WHERE 상태 = '고장'", "(ANALYZE)");
const 낡은줄 = 낡은계획.split("\n").find((줄) => /Scan/.test(줄));

console.log("ANALYZE 전:", 낡은줄.trim().slice(0, 30), "...");
// 출력?: ANALYZE 전: ->  Index Only Scan using "신규_ ...

console.log(`추정 ${낡은줄.match(/rows=(\d+) width/)[1]} 줄 / 실제 ${낡은줄.match(/loops/) ? 낡은줄.match(/rows=([\d.]+) loops/)[1] : "?"} 줄`);
// 출력?: 추정 19 줄 / 실제 90001.00 줄

await db.exec("ANALYZE 신규기록");

console.log("ANALYZE 후:", (await 계획("SELECT count(*) FROM 신규기록 WHERE 상태 = '고장'")).includes("Seq Scan") ? "Seq Scan 으로 바뀜" : "그대로");
// 출력: ANALYZE 후: Seq Scan 으로 바뀜

// ★ 대량으로 넣거나 고친 뒤에는 `ANALYZE 표이름;` 을 손으로 돌리세요.


// ============================================================
// 후반부 — N+1 문제
// ============================================================
//
// 지금부터는 색인 이야기가 아닙니다. 색인을 아무리 잘 걸어도 안 풀리는 문제입니다.
//
// 화면 하나를 만듭니다.
//
//   "A 라인 설비 100대를 보여 주고, 각 설비의 최근 점검기록도 같이 보여 준다"
//
// 코드로 짜면 자연스럽게 이렇게 됩니다.

const 설비목록질의 = "SELECT id, 이름 FROM 설비 WHERE 라인 = 'A' LIMIT 100";

async function 한대씩읽기() {
  const 설비들 = (await db.query(설비목록질의)).rows;          // ← 1번

  const 결과 = [];

  for (const 설비 of 설비들) {
    const 기록 = await db.query(                                // ← N번 (100번)
      "SELECT id, 상태 FROM 점검기록 WHERE 설비번호 = $1",
      [설비.id],
    );
    결과.push({ ...설비, 기록수: 기록.rows.length });
  }

  return 결과;
}

const 한대씩결과 = await 한대씩읽기();

console.log(`설비 ${한대씩결과.length} 대, 데이터베이스 왕복 ${1 + 한대씩결과.length} 번`);
// 출력: 설비 100 대, 데이터베이스 왕복 101 번

// ★★ 이게 **N+1 문제**입니다.
//   목록 1번 + 각 줄마다 1번씩 N번 = N+1 번.
//   설비가 1000대면 1001번입니다. 화면에 보이는 줄 수만큼 왕복이 늘어납니다.
//
// 고치는 법은 두 가지입니다.


// 고치기 ① — 한 번에 다 가져오기 (IN / = ANY)

async function 한번에읽기() {
  const 설비들 = (await db.query(설비목록질의)).rows;          // ← 1번

  const 기록들 = (
    await db.query(                                            // ← 1번. 끝
      "SELECT 설비번호, id, 상태 FROM 점검기록 WHERE 설비번호 = ANY($1)",
      [설비들.map((설비) => 설비.id)],
    )
  ).rows;

  // 자바스크립트에서 설비별로 묶습니다
  const 묶음 = new Map();
  for (const 기록 of 기록들) {
    if (!묶음.has(기록.설비번호)) 묶음.set(기록.설비번호, []);
    묶음.get(기록.설비번호).push(기록);
  }

  return 설비들.map((설비) => ({ ...설비, 기록수: (묶음.get(설비.id) ?? []).length }));
}

// ★ `= ANY($1)` 은 배열을 통째로 넘깁니다. `IN (1,2,3,...)` 과 결과가 같습니다.
//   ★★ 파라미터로 넘길 때는 `IN` 보다 `= ANY` 를 쓰세요.
//     `IN` 은 개수만큼 `$1, $2, ...` 를 만들어야 해서 개수가 바뀔 때마다
//     질의 글자가 달라집니다. 그러면 계획 캐시가 매번 새로 만들어집니다.


// 고치기 ② — JOIN 한 번으로

async function 조인으로읽기() {
  const 줄들 = (
    await db.query(`
      SELECT s.id, s.이름, count(p.id) AS 기록수
      FROM (${설비목록질의}) AS s
      LEFT JOIN 점검기록 p ON p.설비번호 = s.id
      GROUP BY s.id, s.이름
    `)
  ).rows;                                                      // ← 1번. 끝

  return 줄들;
}

const 한번에결과 = await 한번에읽기();
const 조인결과 = await 조인으로읽기();

console.log("세 방법의 결과 건수:", 한대씩결과.length, 한번에결과.length, 조인결과.length);
// 출력: 세 방법의 결과 건수: 100 100 100

console.log("기록수 합계가 같은가:",
  한대씩결과.reduce((합, 줄) => 합 + 줄.기록수, 0) === 한번에결과.reduce((합, 줄) => 합 + 줄.기록수, 0));
// 출력: 기록수 합계가 같은가: true


// ── 얼마나 차이 나나 — 같은 기계에서 ──

const 한대씩ms = await 재기(5, 한대씩읽기);
const 한번에ms = await 재기(5, 한번에읽기);
const 조인ms = await 재기(5, 조인으로읽기);

console.log(`N+1 ${한대씩ms.toFixed(1)} ms / ANY 한 번 ${한번에ms.toFixed(1)} ms / JOIN 한 번 ${조인ms.toFixed(1)} ms`);
// 출력?: N+1 22.3 ms / ANY 한 번 4.1 ms / JOIN 한 번 1.4 ms

console.log(`같은 기계에서 몇 배: ${(한대씩ms / 한번에ms).toFixed(1)}배`);
// 출력?: 같은 기계에서 몇 배: 5.5배

console.log("한 번에 읽는 쪽이 빠른가:", 한번에ms < 한대씩ms);
// 출력: 한 번에 읽는 쪽이 빠른가: true

// ★ 5배쯤입니다. "생각보다 별거 아니네" 싶으시죠.
//   **그건 데이터베이스가 같은 컴퓨터 안(그것도 같은 프로세스 안)에 있어서** 그렇습니다.


// ── ★★ 진짜 서버에서는 — 망 왕복을 흉내 냅니다 ──

// 회사에서는 애플리케이션 서버와 데이터베이스 서버가 다른 기계입니다.
// 같은 데이터센터 안이라도 왕복 0.5~1ms, 다른 지역이면 수십 ms 가 듭니다.
//
// 여기서는 **한 번 왕복에 3ms** 를 흉내 내 봅니다. 클라우드에서 흔한 값입니다.

const 왕복지연 = 3;
const 지연 = () => new Promise((끝내기) => setTimeout(끝내기, 왕복지연));

async function 지연질의(sql, 값들) {
  await 지연();                        // 가는 길 + 오는 길
  return db.query(sql, 값들);
}

async function 느린N더하기1() {
  const 설비들 = (await 지연질의(설비목록질의)).rows;

  for (const 설비 of 설비들) {
    await 지연질의("SELECT id, 상태 FROM 점검기록 WHERE 설비번호 = $1", [설비.id]);
  }

  return 설비들.length;
}

async function 느린한번에() {
  const 설비들 = (await 지연질의(설비목록질의)).rows;
  await 지연질의("SELECT 설비번호, id, 상태 FROM 점검기록 WHERE 설비번호 = ANY($1)", [
    설비들.map((설비) => 설비.id),
  ]);
  return 설비들.length;
}

const 망N더하기1 = await 재기(3, 느린N더하기1);
const 망한번에 = await 재기(3, 느린한번에);

console.log(`망 왕복 ${왕복지연}ms 를 흉내 냈을 때 — N+1 ${망N더하기1.toFixed(0)} ms / 한 번에 ${망한번에.toFixed(0)} ms`);
// 출력?: 망 왕복 3ms 를 흉내 냈을 때 — N+1 403 ms / 한 번에 12 ms

console.log(`몇 배: ${(망N더하기1 / 망한번에).toFixed(0)}배`);
// 출력?: 몇 배: 33배

console.log("망이 끼면 차이가 훨씬 커지나:", 망N더하기1 / 망한번에 > 한대씩ms / 한번에ms);
// 출력: 망이 끼면 차이가 훨씬 커지나: true

// ★★★ 계산으로도 확인해 봅시다.
//
//   N+1  : 101번 왕복 × 3ms = 303ms  (+ 데이터베이스가 실제로 일한 시간)
//   한 번에 :   2번 왕복 × 3ms =   6ms  (+ 데이터베이스가 실제로 일한 시간)
//
//   **망 시간만 놓고 봐도 50배**입니다.
//   질의 하나하나는 0.05ms 로 아주 빠릅니다. 색인도 잘 걸려 있습니다.
//   그런데 화면 하나 그리는 데 0.4초가 걸립니다.
//
// ★ 이게 N+1 이 무서운 이유입니다.
//   **느린 질의가 하나도 없는데 화면이 느립니다.**
//   느린 질의 로그를 봐도 아무것도 안 걸립니다. 전부 빠르니까요.
//   왕복 횟수를 세어 봐야 보입니다.

console.log(`계산으로: N+1 은 ${101 * 왕복지연}ms, 한 번에는 ${2 * 왕복지연}ms → ${((101 * 왕복지연) / (2 * 왕복지연)).toFixed(0)}배`);
// 출력: 계산으로: N+1 은 303ms, 한 번에는 6ms → 51배


// ── ★ ORM 을 쓰면 자기도 모르게 납니다 ──
//
// 이 코드는 for 문이 눈에 보여서 그나마 낫습니다.
// ORM(객체 관계 매핑 도구)을 쓰면 **for 문 없이도** N+1 이 납니다.
//
//   const 설비들 = await 설비.findAll({ where: { 라인: 'A' }, limit: 100 });
//
//   for (const 설비 of 설비들) {
//     console.log(설비.점검기록들.length);   // ← 이 한 줄이 질의를 한 번 더 보냅니다
//   }
//
// `설비.점검기록들` 은 그냥 속성처럼 생겼습니다. 그런데 읽는 순간 질의가 나갑니다.
// 이걸 지연 로딩(lazy loading) 이라고 합니다.
//
// ★ 고치는 법은 ORM 마다 이름이 다르지만 하는 일은 같습니다.
//     Sequelize   → include: [점검기록]
//     Prisma      → include: { 점검기록들: true }
//     TypeORM     → relations: ['점검기록들']
//     Django      → prefetch_related('점검기록들')
//   전부 "미리 한 번에 가져와라" 는 뜻입니다.
//
// ★★ 08단원에서 애플리케이션과 이을 때 이 문제를 다시, 더 깊게 봅니다.
//   그때는 **날아간 질의를 전부 찍어 보는 법**도 같이 합니다.


// ============================================================
// 정리 — 색인이 안 쓰이는 여섯 가지와 N+1
// ============================================================
//
//   증상                        원인                       고치는 법
//   ─────────────────────────────────────────────────────────────────────────
//   lower(칸) = ?              칸에 함수를 씌움            조건을 옮기거나 표현식 색인
//   칸 + 0 = ?, 칸::text = ?    칸에 계산/형변환            값 쪽을 바꾼다
//   LIKE '%중간%'              앞이 열려 있음              앞을 고정하거나 전문 검색 색인
//   문자칸 = 숫자              타입 불일치                 PostgreSQL 은 에러를 냄(다행)
//   두 표에 걸친 OR            조인 뒤에 걸러야 함          UNION 으로 쪼갠다
//   대부분을 읽는 조건          플래너가 일부러 안 씀        조건을 좁히거나 LIMIT
//   통계가 낡음                ANALYZE 를 안 함            ANALYZE 표이름
//
//   N+1                        무엇                       고치는 법
//   ─────────────────────────────────────────────────────────────────────────
//   목록 1번 + 줄마다 1번        왕복 횟수가 줄 수만큼 늘어남   = ANY($1) 한 번 / JOIN 한 번
//   같은 기계에서 5배            망이 없으면 티가 잘 안 남
//   망 3ms 면 50배              질의는 다 빠른데 화면이 느림
//
// ★★★ 느린 화면을 볼 때 순서
//   ① 왕복을 몇 번 하나 (N+1 인가)          ← 여기가 제일 크다
//   ② EXPLAIN ANALYZE 로 rows 어긋남 확인
//   ③ 색인이 쓰이나 (위 여섯 가지 중 하나인가)
//   ④ 정말로 색인이 없나


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — `WHERE date_trunc('day', 점검일) = DATE '2024-03-01'` 로 찾아 보세요.
//                    색인이 쓰이나요? 범위 조건(`>= AND <`)으로 바꾸면요?
//
// ✏️ 직접 해보기 2 — 함정 2 의 `LIKE '설비77%'` 를 `LIKE '설비%'` 로 바꿔 보세요.
//                    (2만 건 중 2만 건이 걸립니다) 색인을 쓰나요? 왜 그럴까요?
//
// ✏️ 직접 해보기 3 — 함정 4 의 UNION 을 `UNION ALL` 로 바꿔 보세요.
//                    결과 건수가 달라지나요? 왜 그럴까요?
//
// ✏️ 직접 해보기 4 — 후반부의 설비 개수를 100 에서 500 으로 늘려 보세요.
//                    N+1 시간이 5배가 되나요? 한 번에 읽는 쪽은요?
//
// ✏️ 직접 해보기 5 — 왕복지연을 3 에서 30 으로 바꿔 보세요. (다른 지역 서버라고 치고)
//                    배수가 어떻게 되나요?
//                    ★ 재는 데 시간이 좀 걸립니다.
//
// ✏️ 직접 해보기 6 — `= ANY($1)` 에 넘기는 배열을 10000개로 만들면 어떻게 되나요?
//                    한 번에 넘길 수 있는 개수에 한계가 있을까요?
//                    (힌트: 있습니다. 보통 1000개쯤에서 나눠 보내는 게 안전합니다)
//
// ✏️ 직접 해보기 7 — 함정 6 에서 UPDATE 를 한 뒤 ANALYZE 를 하기 전과 후의
//                    Execution Time 을 재 보세요. 차이가 크게 나나요?
//                    ★ PGlite 는 전부 메모리라 차이가 작습니다. 왜 그런지 생각해 보세요.


// ── 자주 하는 실수 ──

// [실수 1] "색인을 걸었으니 됐다" 고 생각함
//   질의가 색인을 못 쓰게 생겼으면 소용없습니다.
//   **EXPLAIN 으로 확인하세요.** Seq Scan 이 보이면 이 파일의 여섯 가지를 하나씩 대 보세요.

// [실수 2] 애플리케이션에서 값을 가공해서 조건을 만듦
//   `WHERE lower(이름) = $1` 처럼 **칸 쪽을 건드리면** 색인이 죽습니다.
//   가공은 **값 쪽에서** 하세요. `WHERE 이름 = lower($1)` 은 괜찮습니다.

// [실수 3] "OR 은 무조건 나쁘다" 고 외움
//   함정 4 에서 봤습니다. 한 표 안의 OR 은 BitmapOr 로 잘 돕니다.
//   문제는 **두 표에 걸친 OR** 입니다. 그때만 UNION 으로 쪼개세요.

// [실수 4] Seq Scan 을 보면 무조건 색인을 더 검
//   함정 5 를 보세요. 표의 절반을 읽는 질의에 색인을 걸어 봐야 안 쓰입니다.
//   쓰이게 강제하면 더 느려집니다.

// [실수 5] N+1 을 느린 질의 로그로 찾으려 함
//   못 찾습니다. **질의 하나하나는 다 빠릅니다.**
//   왕복 횟수를 세야 보입니다. 08단원에서 세는 법을 합니다.

// [실수 6] 로컬에서 재고 "N+1 이 별거 아니네" 라고 결론 냄
//   같은 기계에서는 5배, 망이 끼면 50배입니다.
//   **로컬에서 잰 값으로 망 성능을 판단하면 안 됩니다.**

// [실수 7] N+1 을 고친다고 데이터를 전부 가져옴
//   설비 100대의 기록만 필요한데 20만 건을 다 가져오면 그것도 문제입니다.
//   `= ANY($1)` 로 **필요한 것만** 한 번에 가져오세요.


await db.close();
