// ============================================================
// 01단원 · 개념 04 — SQL 은 어떤 말인가
// ------------------------------------------------------------
// 실행: node 개념04_SQL은_어떤_말인가.js
//
// ★ PGlite 가 뜨는 데 1초쯤 걸립니다. 잠깐 멈춰 있어도 정상입니다.
// ============================================================
//
// 개념02·03 에서 SQL 문장을 몇 개 봤습니다. 아직 설명은 안 했습니다.
// 이번에 SQL 이 **어떤 종류의 말인지** 봅니다.
//
// 문법을 외우는 시간이 아닙니다. 문법은 03단원부터 차근차근 합니다.
// 여기서 잡을 것은 딱 두 가지입니다.
//
//   ① SQL 은 "어떻게" 가 아니라 "무엇을" 을 적는 말입니다
//   ② ★★★ **적는 순서와 실행 순서가 다릅니다**
//
// ②를 모르면 "WHERE 에서 별칭을 왜 못 쓰지?" 에서 반드시 막힙니다.
// 오늘 그 에러를 진짜로 내 보겠습니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();


// ── 섹션 1: 실습용 점검기록 ──

await db.exec(`
  CREATE TABLE 점검기록 (
    id     SERIAL PRIMARY KEY,
    설비명 TEXT NOT NULL,
    라인   TEXT NOT NULL,
    점검자 TEXT NOT NULL,
    소요분 INT  NOT NULL,
    결과   TEXT NOT NULL
  );

  INSERT INTO 점검기록 (설비명, 라인, 점검자, 소요분, 결과) VALUES
    ('컨베이어 1호',  'A', '김반장', 35, '정상'),
    ('컨베이어 2호',  'A', '김반장', 50, '이상'),
    ('프레스 1호',    'B', '이반장', 20, '정상'),
    ('프레스 2호',    'B', '이반장', 65, '이상'),
    ('용접로봇 1호',  'C', '박반장', 15, '정상'),
    ('용접로봇 2호',  'C', '박반장', 80, '이상'),
    ('도장기 1호',    'A', '김반장', 45, '정상');
`);

// ★ `db.exec()` 를 썼습니다. 세미콜론으로 여러 문장을 이었기 때문입니다.
//   `db.query()` 로 하면 에러가 납니다. 섹션 7 에서 진짜로 내 봅니다.


// ── 섹션 2: ★ SQL 은 선언형입니다 ──

// 같은 일을 자바스크립트와 SQL 로 각각 해 봅니다.
//
//   "소요분이 30분을 넘은 점검을, 오래 걸린 순서로, 위에서 3건만"

const 점검배열 = [
  { 설비명: "컨베이어 1호", 라인: "A", 점검자: "김반장", 소요분: 35, 결과: "정상" },
  { 설비명: "컨베이어 2호", 라인: "A", 점검자: "김반장", 소요분: 50, 결과: "이상" },
  { 설비명: "프레스 1호", 라인: "B", 점검자: "이반장", 소요분: 20, 결과: "정상" },
  { 설비명: "프레스 2호", 라인: "B", 점검자: "이반장", 소요분: 65, 결과: "이상" },
  { 설비명: "용접로봇 1호", 라인: "C", 점검자: "박반장", 소요분: 15, 결과: "정상" },
  { 설비명: "용접로봇 2호", 라인: "C", 점검자: "박반장", 소요분: 80, 결과: "이상" },
  { 설비명: "도장기 1호", 라인: "A", 점검자: "김반장", 소요분: 45, 결과: "정상" },
];

// 자바스크립트 — **어떻게** 할지를 순서대로 적습니다.
const js답 = 점검배열
  .filter((줄) => 줄.소요분 > 30) //  ① 걸러라
  .sort((가, 나) => 나.소요분 - 가.소요분) //  ② 정렬해라
  .slice(0, 3) //  ③ 잘라라
  .map((줄) => 줄.설비명); //  ④ 이름만 뽑아라

console.log("자바스크립트:", JSON.stringify(js답));
// 출력: 자바스크립트: ["용접로봇 2호","프레스 2호","컨베이어 2호"]

// SQL — **무엇을** 원하는지만 적습니다.
const sql답 = await db.query(`
  SELECT 설비명
  FROM   점검기록
  WHERE  소요분 > 30
  ORDER BY 소요분 DESC
  LIMIT 3
`);

console.log("SQL:", JSON.stringify(sql답.rows.map((줄) => 줄.설비명)));
// 출력: SQL: ["용접로봇 2호","프레스 2호","컨베이어 2호"]

console.log("두 답이 같은가:", JSON.stringify(js답) === JSON.stringify(sql답.rows.map((줄) => 줄.설비명)));
// 출력: 두 답이 같은가: true

// ★★ 같은 답인데 적는 방식이 다릅니다.
//
//   자바스크립트: 걸러라 → 정렬해라 → 잘라라 → 뽑아라   (**절차형**)
//   SQL        : 이런 걸 이 순서로 이만큼 달라          (**선언형**)
//
//   SQL 에는 "어떻게 찾을지" 가 없습니다.
//   전부 훑을지, 색인을 탈지, 어느 것부터 이을지는 **데이터베이스가 정합니다.**
//   그 정한 내용을 '실행계획' 이라고 합니다. 06단원에서 들여다봅니다.
//
// ★ 왜 이렇게 만들었을까요?
//   데이터가 늘거나 색인이 생기면 **가장 빠른 방법이 바뀝니다.**
//   그때마다 코드를 고치지 않아도 되게 하려고, "무엇을" 만 적게 한 것입니다.
//
// ★★ 대신 대가가 있습니다.
//   느릴 때 "왜 느린지" 가 코드에 안 보입니다.
//   그래서 실행계획을 읽을 줄 알아야 합니다. 06단원입니다.


// ── 섹션 3: 문장의 구조 ──

// SELECT 문장은 이 일곱 조각으로 이루어집니다. 순서가 정해져 있습니다.
//
//   SELECT    무엇을 보여 줄 것인가
//   FROM      어느 표에서
//   WHERE     어떤 줄만
//   GROUP BY  무엇으로 묶어서
//   HAVING    묶은 것 중 어떤 것만
//   ORDER BY  어떤 순서로
//   LIMIT     몇 개만
//
// 전부 쓸 필요는 없습니다. SELECT 와 FROM 만 있어도 문장이 됩니다.

const 묶기 = await db.query(`
  SELECT   라인, count(*)::int AS 건수, round(avg(소요분), 1) AS 평균분
  FROM     점검기록
  GROUP BY 라인
  HAVING   count(*) >= 2
  ORDER BY 라인
`);

console.log(JSON.stringify(묶기.rows));
// 출력: [{"라인":"A","건수":3,"평균분":"43.3"},{"라인":"B","건수":2,"평균분":"42.5"},{"라인":"C","건수":2,"평균분":"47.5"}]

// ★ 평균분이 `"43.3"` 입니다. 따옴표가 붙어 있습니다. **문자열입니다.**
//   `round(...)` 가 돌려주는 NUMERIC 타입이 자바스크립트로 올 때 문자열이 됩니다.
//   숫자로 쓰려면 `Number()` 로 바꾸거나 SQL 에서 `::float` 를 붙여야 합니다.
//   ★ 돈 계산에서 이것 때문에 사고가 납니다. 02단원에서 따로 다룹니다.
//
// ★ `count(*)::int` 의 `::int` 는 개념02 섹션 2 에서 본 그것입니다.
//   `count(*)` 는 BIGINT 라, 값이 안전 정수를 넘으면 bigint 가 되어
//   `JSON.stringify` 가 터집니다. 미리 못을 박아 두는 것입니다.


// ── 섹션 4: ★★★ 적는 순서와 실행 순서가 다릅니다 ──

// 적는 순서
//   SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT
//
// 실행 순서
//   FROM → WHERE → GROUP BY → HAVING → **SELECT** → ORDER BY → LIMIT
//
// ★ **SELECT 가 거의 끝에서 두 번째입니다.**
//   WHERE 나 GROUP BY 가 돌아갈 때는 SELECT 를 아직 안 봤습니다.
//   그래서 SELECT 에서 만든 별칭을 WHERE 가 모릅니다.
//
// 말로 하면 안 와닿습니다. 진짜로 에러를 내 봅니다.

try {
  await db.query(`
    SELECT 설비명, 소요분 * 60 AS 소요초
    FROM   점검기록
    WHERE  소요초 > 1000
  `); // 검증무시: 일부러 실패하는 문장입니다
} catch (에러) {
  console.log(`WHERE 에서 별칭 → [${에러.code}] ${에러.message}`);
}
// 출력: WHERE 에서 별칭 → [42703] column "소요초" does not exist

// ★★ "방금 위에서 `AS 소요초` 라고 만들었는데요?"
//   만든 것은 맞습니다. 그런데 **WHERE 가 먼저 돕니다.**
//   WHERE 차례에는 아직 소요초라는 게 세상에 없습니다.
//
//   ★ 그럼 어떻게 쓰나요? 식을 그대로 다시 씁니다.

const 다시씀 = await db.query(`
  SELECT 설비명, 소요분 * 60 AS 소요초
  FROM   점검기록
  WHERE  소요분 * 60 > 1000
  ORDER BY 소요초 DESC
  LIMIT 3
`);

console.log(JSON.stringify(다시씀.rows));
// 출력: [{"설비명":"용접로봇 2호","소요초":4800},{"설비명":"프레스 2호","소요초":3900},{"설비명":"컨베이어 2호","소요초":3000}]

// ★★ 그런데 **ORDER BY 에서는 별칭이 됩니다.** 위 문장을 보세요.
//   ORDER BY 는 SELECT **다음**에 돌기 때문입니다.
//
//   실행 순서를 알면 이게 전부 설명됩니다.
//
//     WHERE 에서 별칭  → 안 됨 (SELECT 보다 먼저 돎)
//     HAVING 에서 별칭 → 안 됨 (SELECT 보다 먼저 돎)
//     ORDER BY 에서 별칭 → 됨   (SELECT 다음에 돎)
//
//   ★ 외우지 마세요. 실행 순서 한 줄만 기억하면 셋 다 따라옵니다.
//     **FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT**

// HAVING 에서도 정말 안 되는지 확인합니다.

try {
  await db.query(`
    SELECT   라인, count(*) AS 건수
    FROM     점검기록
    GROUP BY 라인
    HAVING   건수 >= 2
  `); // 검증무시: 일부러 실패하는 문장입니다
} catch (에러) {
  console.log(`HAVING 에서 별칭 → [${에러.code}] ${에러.message}`);
}
// 출력: HAVING 에서 별칭 → [42703] column "건수" does not exist

// 실행 순서를 모르면 만나는 에러가 두 개 더 있습니다.

try {
  await db.query(`
    SELECT   라인, 설비명, count(*)
    FROM     점검기록
    GROUP BY 라인
  `); // 검증무시: 일부러 실패하는 문장입니다
} catch (에러) {
  console.log(`묶지 않은 칸 → [${에러.code}] ${에러.message}`);
}
// 출력: 묶지 않은 칸 → [42803] column "점검기록.설비명" must appear in the GROUP BY clause or be used in an aggregate function

// ★ 라인 'A' 로 묶으면 그 안에 설비명이 셋(컨베이어 1호·2호·도장기 1호) 있습니다.
//   셋 중 무엇을 보여 줘야 하나요? 알 수 없습니다. 그래서 거절합니다.
//   ★★ MySQL 은 설정에 따라 **아무거나 하나 골라서 보여 줍니다.** 09단원에서 봅니다.

try {
  await db.query(`
    SELECT   라인
    FROM     점검기록
    WHERE    count(*) > 1
    GROUP BY 라인
  `); // 검증무시: 일부러 실패하는 문장입니다
} catch (에러) {
  console.log(`WHERE 에서 집계 → [${에러.code}] ${에러.message}`);
}
// 출력: WHERE 에서 집계 → [42803] aggregate functions are not allowed in WHERE

// ★ WHERE 는 GROUP BY 보다 **먼저** 돕니다. 아직 안 묶였으니 셀 수가 없습니다.
//   묶은 다음에 거르는 것이 HAVING 입니다.
//
//   ★★ 이 한 줄로 정리됩니다.
//     **WHERE 는 줄을 거르고, HAVING 은 묶음을 거릅니다.**


// ── 섹션 5: 적는 법 — 대소문자·세미콜론·주석 ──

// SQL 은 키워드의 대소문자를 안 가립니다. 이 셋이 전부 같은 문장입니다.
//
//   SELECT * FROM 점검기록
//   select * from 점검기록
//   SeLeCt * FrOm 점검기록
//
// ★ 관례는 **키워드는 대문자, 이름은 그대로** 입니다.
//   눈으로 훑을 때 문장 구조가 바로 보이라고 그렇게 씁니다.
//   이 자료는 전부 그 관례를 따릅니다.

// ★★ 그런데 **이름의 대소문자는 이야기가 다릅니다.**
//   PostgreSQL 은 따옴표 없는 이름을 전부 **소문자로 바꿔서** 봅니다.

const 대소문자 = await db.query("SELECT 소요분 AS Total FROM 점검기록 LIMIT 1");

console.log("돌려준 칸 이름:", JSON.stringify(Object.keys(대소문자.rows[0])));
// 출력: 돌려준 칸 이름: ["total"]

// ★★ `Total` 이라고 적었는데 `total` 로 돌아왔습니다.
//   자바스크립트에서 `줄.Total` 로 꺼내면 **undefined** 입니다. 여기서 많이 막힙니다.
//   대문자를 지키려면 `AS "Total"` 처럼 큰따옴표로 묶어야 합니다.
//   ★ 그런데 그러면 **부를 때마다 큰따옴표를 써야 합니다.** 귀찮습니다.
//     그래서 실무에서는 칸 이름을 처음부터 소문자로 짓습니다.
//
// ★ 한글 이름은 대소문자 문제가 없어서 이 자료에서는 한글을 씁니다.
//   회사에서는 영어 소문자에 밑줄(`inspection_log`)을 많이 씁니다.

// 세미콜론은 "문장이 여기서 끝났다" 는 표시입니다.
// 한 문장만 보낼 때는 있어도 되고 없어도 됩니다.

const 세미콜론있음 = await db.query("SELECT count(*)::int AS 건수 FROM 점검기록;");

console.log("세미콜론 붙여도:", 세미콜론있음.rows[0].건수);
// 출력: 세미콜론 붙여도: 7

// 주석은 `--` 입니다. 그 줄의 끝까지가 주석입니다.
// 여러 줄은 `/* ... */` 입니다.

const 주석있는문장 = await db.query(`
  SELECT count(*)::int AS 건수   -- 몇 건인지 셉니다
  FROM   점검기록
  /* 이상만 셉니다 */
  WHERE  결과 = '이상'
`);

console.log("이상 건수:", 주석있는문장.rows[0].건수);
// 출력: 이상 건수: 3

// ★ 자바스크립트의 `//` 가 아닙니다. SQL 은 `--` 입니다. 자주 틀립니다.


// ── 섹션 6: SQL 의 네 가족 ──

const 가족 = [
  ["DDL", "표를 만들고 바꾸고 지움", "CREATE · ALTER · DROP · TRUNCATE", "02단원"],
  ["DML", "데이터를 넣고 읽고 고치고 지움", "INSERT · SELECT · UPDATE · DELETE", "03단원"],
  ["TCL", "여러 작업을 한 덩어리로 묶음", "BEGIN · COMMIT · ROLLBACK", "07단원"],
  ["DCL", "누가 무엇을 할 수 있는지 정함", "GRANT · REVOKE", "10단원"],
];

for (const [이름, 하는일, 명령, 단원] of 가족) {
  console.log(`${이름} — ${하는일} · ${명령} (${단원})`);
}
// 출력: DDL — 표를 만들고 바꾸고 지움 · CREATE · ALTER · DROP · TRUNCATE (02단원)
// 출력: DML — 데이터를 넣고 읽고 고치고 지움 · INSERT · SELECT · UPDATE · DELETE (03단원)
// 출력: TCL — 여러 작업을 한 덩어리로 묶음 · BEGIN · COMMIT · ROLLBACK (07단원)
// 출력: DCL — 누가 무엇을 할 수 있는지 정함 · GRANT · REVOKE (10단원)

// ★ 이름은 안 외워도 됩니다. 시험에나 나옵니다.
//   중요한 것은 **성격이 다르다** 는 점입니다.
//   DDL 은 표의 모양을 바꾸는 것이라 되돌리기가 어렵고,
//   DML 은 트랜잭션으로 되돌릴 수 있습니다. 07단원에서 확인합니다.


// ── 섹션 7: ★ query 와 exec 는 다릅니다 ──

// 섹션 1 에서 `db.exec()` 를 썼습니다. 왜 그랬는지 봅니다.

try {
  await db.query("SELECT 1 AS 가; SELECT 2 AS 나;"); // 검증무시: 일부러 실패하는 문장입니다
} catch (에러) {
  console.log(`query 에 두 문장 → [${에러.code}] ${에러.message}`);
}
// 출력: query 에 두 문장 → [42601] cannot insert multiple commands into a prepared statement

// ★★ `db.query()` 는 **한 문장만** 받습니다.
//
//   왜냐하면 query 는 문장을 '준비된 문장(prepared statement)' 으로 만들기 때문입니다.
//   준비된 문장은 값을 넣을 자리($1, $2)를 미리 뚫어 두는 방식입니다.
//   그래야 SQL 인젝션을 막을 수 있습니다.
//   그런데 준비된 문장은 **한 번에 하나**만 됩니다.
//
// ★ 여러 문장을 보내려면 `db.exec()` 입니다.

const 여러문장 = await db.exec("SELECT 1 AS 가; SELECT 2 AS 나;");

console.log("exec 결과 개수:", 여러문장.length);
// 출력: exec 결과 개수: 2

console.log(JSON.stringify(여러문장.map((하나) => 하나.rows)));
// 출력: [[{"가":1}],[{"나":2}]]

// ★★★ 대신 `db.exec()` 는 **$1 을 못 씁니다.**
//   그래서 사용자가 넣은 값을 exec 로 보내면 안 됩니다. 인젝션이 뚫립니다.
//
//   ★ 규칙은 이렇게 잡으세요.
//     · 표를 만들거나 실습 데이터를 미리 넣을 때  → `exec`
//     · 사용자 값이 들어가는 모든 문장           → `query` + `$1`
//
//   예외는 없습니다. 08단원에서 이 규칙을 어겼을 때 무슨 일이 나는지 봅니다.

// query 가 돌려주는 것을 한 번 더 봅니다.

const 조회결과 = await db.query("SELECT 설비명 FROM 점검기록 WHERE 라인 = $1", ["A"]);

console.log("command:", 조회결과.command, "/ rowCount:", 조회결과.rowCount, "/ affectedRows:", 조회결과.affectedRows);
// 출력: command: SELECT / rowCount: 3 / affectedRows: 0

const 수정결과 = await db.query("UPDATE 점검기록 SET 결과 = $1 WHERE 라인 = $2", ["정상", "C"]);

console.log("command:", 수정결과.command, "/ affectedRows:", 수정결과.affectedRows, "/ rows:", JSON.stringify(수정결과.rows));
// 출력: command: UPDATE / affectedRows: 2 / rows: []

// ★ UPDATE 는 `rows` 가 비어 있습니다. 몇 줄이 바뀌었는지는 `affectedRows` 로 봅니다.
//   바뀐 줄을 돌려받고 싶으면 `RETURNING` 을 붙입니다. 03단원에서 합니다.


// ── 섹션 8: 문법이 틀리면 무엇이 나오나 ──

const 틀린문장들 = [
  ["오타", "SELEC * FROM 점검기록"],
  ["없는 표", "SELECT * FROM 없는표"],
  ["없는 칸", "SELECT 없는칸 FROM 점검기록"],
];

for (const [무엇, 문장] of 틀린문장들) {
  try {
    await db.query(문장); // 검증무시: 일부러 실패하는 문장입니다
  } catch (에러) {
    console.log(`${무엇} → [${에러.code}] ${에러.message}`);
  }
}
// 출력: 오타 → [42601] syntax error at or near "SELEC"
// 출력: 없는 표 → [42P01] relation "없는표" does not exist
// 출력: 없는 칸 → [42703] column "없는칸" does not exist

// ★★ `에러.code` 를 보세요. 다섯 글자짜리 코드입니다. **SQLSTATE** 라고 합니다.
//   메시지는 버전마다 바뀔 수 있지만 코드는 안 바뀝니다.
//   그래서 코드로 검색하는 게 정확합니다. 개념05 에서 자주 나오는 코드를 정리합니다.
//
// ★ `relation` 은 '표' 라는 뜻입니다. 관계형에서 표를 relation 이라고 부릅니다.
//   에러 메시지에 relation 이 나오면 표 이야기라고 보시면 됩니다.


await db.close();


// ============================================================
// 정리 — SQL 이라는 말
// ============================================================
//
//   무엇                내용
//   ──────────────────────────────────────────────────────────────
//   성격                선언형. "어떻게" 가 아니라 "무엇을"
//   적는 순서           SELECT FROM WHERE GROUP BY HAVING ORDER BY LIMIT
//   ★ 실행 순서        FROM WHERE GROUP BY HAVING SELECT ORDER BY LIMIT
//   별칭이 되는 곳       ORDER BY (O) · WHERE (X) · HAVING (X)
//   WHERE 대 HAVING     줄을 거름 대 묶음을 거름
//   주석                -- 한 줄 · /* 여러 줄 */
//   네 가족             DDL · DML · TCL · DCL
//   query 대 exec       한 문장 + $1 대 여러 문장 + $1 없음
//
// ★★★ 딱 한 줄만 외운다면 이것입니다.
//   **FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT**
//   이 자료에서 앞으로 만날 에러의 절반쯤이 이 한 줄로 설명됩니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 2 의 SQL 에서 `LIMIT 3` 을 지우면 몇 건이 나오나요?
//                    `ORDER BY 소요분 DESC` 를 `ASC` 로 바꾸면 어떻게 되나요?
//
// ✏️ 직접 해보기 2 — 점검자별 평균 소요분을 구해 보세요.
//                    평균이 40분을 넘는 사람만 나오게 해 보세요.
//                    (힌트: GROUP BY 점검자, 그리고 HAVING)
//
// ✏️ 직접 해보기 3 — 섹션 4 의 별칭 에러를 HAVING 이 아니라 GROUP BY 에서 내 보세요.
//                      GROUP BY 별칭 — 됩니다. 왜 될까요?
//                    (힌트: 표준은 안 되는데 PostgreSQL 이 봐 줍니다. 의존하지 마세요)
//
// ✏️ 직접 해보기 4 — `SELECT 설비명 AS Name FROM 점검기록 LIMIT 1` 을 돌리고
//                    `rows[0].Name` 과 `rows[0].name` 을 각각 찍어 보세요.
//                    어느 쪽이 undefined 인가요?
//
// ✏️ 직접 해보기 5 — `db.exec("SELECT $1", ['A'])` 를 해 보세요.
//                    무슨 에러가 나나요? exec 는 왜 $1 을 못 받을까요?
//
// ✏️ 직접 해보기 6 — 섹션 8 의 `틀린문장들` 에 하나를 더 넣어 보세요.
//                      "SELECT * FROM 점검기록 WHERE 소요분 = '삼십'"
//                    어떤 코드가 나오나요?
//
// ✏️ 직접 해보기 7 — 섹션 3 의 `round(avg(소요분), 1)` 을 `avg(소요분)` 으로 바꿔 보세요.
//                    자릿수가 몇 개나 나오나요? 그것도 문자열인가요?


// ── 자주 하는 실수 ──

// [실수 1] WHERE 에서 별칭을 씀
//   가장 많이 나오는 에러입니다. 42703 이 나옵니다.
//   SELECT 가 WHERE 보다 **나중에** 돕니다. 식을 그대로 다시 쓰세요.

// [실수 2] WHERE 에 집계 함수를 씀
//   `WHERE count(*) > 1` 은 42803 입니다.
//   묶기 전이라 셀 수가 없습니다. 묶은 다음 거르는 건 HAVING 입니다.

// [실수 3] GROUP BY 에 안 넣은 칸을 SELECT 에 씀
//   42803 입니다. 묶음 하나에 값이 여럿이라 무엇을 보여 줄지 정할 수 없습니다.
//   MySQL 은 아무거나 하나 골라 줍니다. 그래서 더 위험합니다.

// [실수 4] 주석을 `//` 로 씀
//   SQL 은 `--` 입니다. `//` 는 문법 에러(42601)가 납니다.

// [실수 5] `db.query()` 에 세미콜론으로 여러 문장을 넣음
//   42601 "cannot insert multiple commands into a prepared statement" 입니다.
//   여러 문장은 `db.exec()` 입니다. 대신 exec 에는 $1 을 못 씁니다.

// [실수 6] 대문자 별칭을 만들고 대문자로 꺼냄
//   `AS Total` 은 `total` 로 돌아옵니다. `rows[0].Total` 은 undefined 입니다.
//   지키려면 `AS "Total"` 처럼 큰따옴표를 쓰거나, 처음부터 소문자로 지으세요.

// [실수 7] NUMERIC 결과를 숫자로 여김
//   `round(avg(...), 1)` 은 `"43.3"` 이라는 **문자열**로 옵니다.
//   `+` 로 더하면 이어 붙습니다. `Number()` 로 바꾸세요. 02단원에서 자세히 봅니다.
