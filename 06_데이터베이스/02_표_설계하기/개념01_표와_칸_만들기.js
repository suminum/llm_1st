// ============================================================
// 02단원 · 개념 01 — 표와 칸 만들기
// ------------------------------------------------------------
// 실행: node 개념01_표와_칸_만들기.js
//
// ★ PGlite 는 시작에 1초쯤 걸립니다. 잠깐 멈춰 있어도 정상입니다.
// ============================================================
//
// 01단원에서 파일 저장의 한계를 재 봤습니다.
// 그중 하나가 **규칙을 못 지킨다** 였습니다. 라인 칸에 999 를 넣어도 파일은 받아 줍니다.
//
// 데이터베이스는 그 규칙을 **표를 만들 때** 적어 둡니다.
// 그래서 이 단원이 중요합니다.
//
//   여기서 꼼꼼히 적으면  →  뒤에 쓰는 코드가 짧아집니다
//   여기서 대충 적으면    →  그 뒤 전부가 고생합니다
//
// 이 개념에서는 표를 만드는 문법만 봅니다.
// 타입은 개념02, 규칙(제약)은 개념03 에서 합니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();


// ── 섹션 1: 표 · 줄 · 칸 ──

// 엑셀을 떠올리면 거의 맞습니다. 이름만 다릅니다.
//
//   엑셀에서       데이터베이스에서       영어
//   ────────────────────────────────────────────────
//   시트           표                    table
//   행             줄                    row  (record 라고도 함)
//   열             칸                    column (field 라고도 함)
//   셀             값                    value
//
// ★ 다른 점이 하나 있습니다. **칸마다 타입이 정해져 있습니다.**
//   엑셀은 같은 열에 숫자와 글자를 섞어도 됩니다. 표는 안 됩니다.
//   그 "안 됨" 이 우리가 원하는 것입니다.

console.log("표 = 시트 / 줄 = 행 / 칸 = 열");
// 출력: 표 = 시트 / 줄 = 행 / 칸 = 열


// ── 섹션 2: CREATE TABLE 을 한 줄씩 ──

// 설비 표를 만듭니다. 한 줄씩 뜯어봅니다.
//
//   CREATE TABLE 설비 (          ← 설비 라는 이름의 표를 만들어라
//     설비번호 INT,              ← 설비번호 칸, 정수  ┐
//     이름 TEXT,                 ← 이름 칸, 글자      │ 칸 정의는 쉼표로 잇습니다
//     라인 TEXT,                 ← 라인 칸, 글자      │
//     가동중 BOOLEAN             ← 가동중 칸, 참/거짓 ┘ ★ 마지막에는 쉼표 없음
//   );                           ← 닫고 세미콜론
//
// 규칙은 셋뿐입니다.
//   ① 칸 하나가 "이름 타입" 한 쌍
//   ② 칸과 칸 사이는 쉼표
//   ③ 마지막 칸 뒤에는 쉼표를 붙이지 않습니다  ← 여기서 제일 많이 틀립니다

await db.exec(`
  CREATE TABLE 설비 (
    설비번호 INT,
    이름 TEXT,
    라인 TEXT,
    가동중 BOOLEAN
  );
`);

console.log("설비 표를 만들었습니다");
// 출력: 설비 표를 만들었습니다

// 마지막에 쉼표를 남기면 이렇게 됩니다. 진짜로 해 봅니다.

try {
  await db.exec(`CREATE TABLE 쉼표시험 (가 INT, 나 TEXT,)`);
} catch (에러) {
  console.log(`${에러.code} — ${에러.message}`);
  // 출력: 42601 — syntax error at or near ")"
}

// ★ 42601 은 **문법 오류** 입니다.
//   "at or near ')'" — 닫는 괄호 근처가 이상하다는 뜻입니다.
//   Postgres 는 "쉼표를 지우세요" 라고 말해 주지 않습니다. 위치만 알려 줍니다.


// ── 섹션 3: 정말 만들어졌는지 확인합니다 ──

// 표의 구조는 information_schema.columns 에서 볼 수 있습니다.
// 이건 Postgres 가 자기 정보를 담아 두는 표입니다. 표를 조회하듯이 조회합니다.

const 칸들 = await db.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = '설비'
  ORDER BY ordinal_position
`);

for (const 칸 of 칸들.rows) {
  console.log(`${칸.column_name} · ${칸.data_type} · NULL 허용=${칸.is_nullable}`);
}
// 출력: 설비번호 · integer · NULL 허용=YES
// 출력: 이름 · text · NULL 허용=YES
// 출력: 라인 · text · NULL 허용=YES
// 출력: 가동중 · boolean · NULL 허용=YES

// ★ 두 가지가 눈에 띕니다.
//   ① INT 라고 썼는데 integer 라고 나옵니다. INT 는 integer 의 줄임말입니다
//   ② NULL 허용이 전부 YES 입니다. **아무것도 안 적으면 다 비워도 됩니다**
//      이게 사고의 시작입니다. 개념03 에서 막습니다.
//
// ★ psql 에서는 \d 설비 한 줄이면 같은 것을 봅니다.
//   PGlite 에는 \d 가 없어서 information_schema 를 직접 조회합니다.


// ── 섹션 4: ★ 이름의 대소문자 — Postgres 는 소문자로 접습니다 ──

// 이건 반드시 알아야 합니다. 실제로 재 봅니다.

await db.exec(`CREATE TABLE Equipment (Id INT, MachineName TEXT)`);
await db.exec(`CREATE TABLE "Equipment2" ("Id" INT, "MachineName" TEXT)`);

const 표들 = await db.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`);

console.log("만들어진 표:", 표들.rows.map((표) => 표.table_name).join(", "));
// 출력: 만들어진 표: Equipment2, equipment, 설비

// ★★ `CREATE TABLE Equipment` 라고 대문자로 썼는데 **equipment** 가 됐습니다.
//   따옴표로 감싼 `"Equipment2"` 만 대문자가 살아남았습니다.
//
//   Postgres 는 따옴표 없는 이름을 **전부 소문자로 접습니다.**
//   칸 이름도 마찬가지입니다.

const 칸이름들 = await db.query(`
  SELECT table_name, column_name FROM information_schema.columns
  WHERE table_name IN ('equipment', 'Equipment2')
  ORDER BY table_name, ordinal_position
`);

for (const 칸 of 칸이름들.rows) {
  console.log(`${칸.table_name} → ${칸.column_name}`);
}
// 출력: Equipment2 → Id
// 출력: Equipment2 → MachineName
// 출력: equipment → id
// 출력: equipment → machinename

// MachineName 이 machinename 이 됐습니다. 낙타등(camelCase)이 뭉개졌습니다.
//
// 그래서 이런 일이 벌어집니다.

const 대문자로조회 = await db.query(`SELECT * FROM EQUIPMENT`);
console.log("EQUIPMENT 로 조회한 칸:", 대문자로조회.fields.map((칸) => 칸.name).join(", "));
// 출력: EQUIPMENT 로 조회한 칸: id, machinename

// 대문자로 써도 소문자로 접혀서 equipment 를 찾습니다. 잘 됩니다.
// 그런데 따옴표로 만든 표는 반대입니다.

try {
  await db.query(`SELECT * FROM Equipment2`);
} catch (에러) {
  console.log(`${에러.code} — ${에러.message}`);
  // 출력: 42P01 — relation "equipment2" does not exist
}

// ★★★ 여기가 함정입니다.
//   `"Equipment2"` 로 만들어 놓으면, 그 뒤로 **영원히 따옴표를 달아야** 합니다.
//   한 번이라도 빼먹으면 42P01 (없는 표) 입니다.
//
//   ★ 결론: **따옴표를 쓰지 마세요.**
//     이름은 처음부터 소문자와 밑줄로만 씁니다. `machine_name` 처럼요.
//     그러면 대소문자를 신경 쓸 일이 없습니다.

console.log("따옴표 없이 만든 이름은 소문자가 된다:", 표들.rows.some((표) => 표.table_name === "equipment"));
// 출력: 따옴표 없이 만든 이름은 소문자가 된다: true


// ── 섹션 5: 한글 이름은 되나 ──

// 됩니다. 위에서 이미 `설비`, `설비번호` 로 만들었습니다.
//
// 한글에는 대소문자가 없으니 접힐 것도 없습니다. 따옴표 없이 그냥 씁니다.
//
// ★ 이 자료는 배우기 쉬우라고 한글 이름을 씁니다.
//   **회사에서는 영어를 훨씬 많이 씁니다.** 이유가 있습니다.
//     · 도구·라이브러리가 영어 이름을 가정하고 만들어졌습니다
//     · 자바스크립트 객체 키가 한글이면 `줄.설비번호` 는 되는데 `줄.설비-번호` 같은 건 안 됩니다
//     · 외국 개발자와 같이 일하면 못 읽습니다
//
//   그러니 배울 때는 한글, 실무에서는 팀 규칙을 따르세요.
//
// ── 이름에 쓸 수 없는 것 ──
//
//   · 숫자로 시작       →  2호기  (X)   호기2  (O)
//   · 하이픈            →  설비-번호 (X)  설비_번호 (O)
//   · 공백              →  설비 번호 (X)
//   · 예약어            →  order, user, table  ← 따옴표 없이는 못 씁니다
//
// 실제로 해 봅니다.

for (const 나쁜이름 of ["2호기", "설비-번호"]) {
  try {
    await db.exec(`CREATE TABLE ${나쁜이름} (가 INT)`); // 검증무시: 일부러 안 되는 이름을 보여 주는 것
    console.log(`${나쁜이름} — 만들어짐`);
  } catch (에러) {
    console.log(`${나쁜이름} — ${에러.code} ${에러.message}`);
  }
}
// 출력: 2호기 — 42601 trailing junk after numeric literal at or near "2호기"
// 출력: 설비-번호 — 42601 syntax error at or near "-"

// ★ `설비-번호` 는 Postgres 가 "설비 빼기 번호" 로 읽습니다. 그래서 문법 오류입니다.
//
// ★ 예약어는 조금 다릅니다. `order` 는 표 이름으로 쓸 수 없지만 `user` 는 상황에 따라 됩니다.
//   외우지 말고 그냥 **피하세요.** `주문`, `사용자` 처럼 다른 이름을 쓰면 됩니다.


// ── 섹션 6: 이미 있는 표를 또 만들면 ──

try {
  await db.exec(`CREATE TABLE 설비 (설비번호 INT)`);
} catch (에러) {
  console.log(`${에러.code} — ${에러.message}`);
  // 출력: 42P07 — relation "설비" already exists
}

// ★ 42P07 = "그 이름의 것이 이미 있다".
//   relation 은 표·뷰·시퀀스를 아우르는 말입니다. 여기서는 표입니다.
//
// 실습 파일을 여러 번 돌리면 이 에러를 반드시 만납니다. 대처는 둘입니다.
//
//   ① 있으면 넘어가라  →  CREATE TABLE IF NOT EXISTS
//   ② 있으면 지우고 다시 →  DROP TABLE IF EXISTS 뒤에 CREATE

const 넘어감 = await db.exec(`CREATE TABLE IF NOT EXISTS 설비 (설비번호 INT)`);
console.log("IF NOT EXISTS 결과:", 넘어감[0].command, "· 에러 없음");
// 출력: IF NOT EXISTS 결과: CREATE · 에러 없음

// ★★ 여기서 착각하기 쉽습니다. **표를 고쳐 주지 않습니다.**
//   위에서 설비 표는 칸이 네 개인데, 방금 `(설비번호 INT)` 하나로 다시 만들려 했습니다.
//   IF NOT EXISTS 는 그냥 **아무것도 안 했습니다.** 칸은 그대로 네 개입니다.

const 칸수 = await db.query(`
  SELECT count(*)::int AS 개수 FROM information_schema.columns WHERE table_name = '설비'
`);
console.log("설비 표의 칸 수:", 칸수.rows[0].개수);
// 출력: 설비 표의 칸 수: 4

// ★ 그래서 실습에서는 ② 가 안전합니다.
//     DROP TABLE IF EXISTS 설비;
//     CREATE TABLE 설비 (...);
//   운영 서버에서는 절대 이러면 안 됩니다. 데이터가 다 날아갑니다.


// ── 섹션 7: DROP TABLE ──

try {
  await db.exec(`DROP TABLE 없는표`);
} catch (에러) {
  console.log(`${에러.code} — ${에러.message}`);
  // 출력: 42P01 — table "없는표" does not exist
}

const 조용히 = await db.exec(`DROP TABLE IF EXISTS 없는표`);
console.log("DROP IF EXISTS:", 조용히[0].command, "· 에러 없음");
// 출력: DROP IF EXISTS: DROP · 에러 없음

await db.exec(`DROP TABLE IF EXISTS Equipment, "Equipment2"`);
console.log("치웠습니다");
// 출력: 치웠습니다

// ★★★ DROP TABLE 은 되돌릴 수 없습니다.
//   휴지통이 없습니다. 확인 창도 없습니다. 그냥 사라집니다.
//   운영에서 표를 지울 일이 있으면 **백업부터** 하세요. 10단원에서 합니다.


// ── 섹션 8: ALTER TABLE — 나중에 고치기 ──

// 표를 만든 뒤에 "아 도입일도 넣을걸" 하는 일이 반드시 생깁니다.
// 그때 다시 만들 필요는 없습니다. 고치면 됩니다.

await db.exec(`ALTER TABLE 설비 ADD COLUMN 도입일 DATE`);          // 칸 추가
await db.exec(`ALTER TABLE 설비 RENAME COLUMN 이름 TO 설비명`);     // 칸 이름 바꾸기
await db.exec(`ALTER TABLE 설비 DROP COLUMN 가동중`);              // 칸 삭제
await db.exec(`ALTER TABLE 설비 ALTER COLUMN 라인 TYPE VARCHAR(1)`); // 칸 타입 바꾸기

const 고친뒤 = await db.query(`
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_name = '설비' ORDER BY ordinal_position
`);

for (const 칸 of 고친뒤.rows) {
  console.log(`${칸.column_name} · ${칸.data_type}`);
}
// 출력: 설비번호 · integer
// 출력: 설비명 · text
// 출력: 라인 · character varying
// 출력: 도입일 · date

// ★ 순서를 보세요. 새로 넣은 도입일이 **맨 뒤** 로 갔습니다.
//   Postgres 에서 칸 순서는 바꿀 수 없습니다. 중간에 끼워 넣을 수도 없습니다.
//   불편해 보이지만, 사실 SELECT 에서 칸 이름을 적으면 순서는 아무 상관이 없습니다.
//
// 표 이름도 바꿉니다.

await db.exec(`ALTER TABLE 설비 RENAME TO 설비목록`);
const 있나 = await db.query(`
  SELECT count(*)::int AS 개수 FROM information_schema.tables WHERE table_name = '설비목록'
`);
console.log("설비목록 이라는 표가 있나:", 있나.rows[0].개수 === 1);
// 출력: 설비목록 이라는 표가 있나: true

// ★★ ALTER TABLE 은 운영 중에도 됩니다. 그런데 조심할 게 있습니다.
//
//   · ADD COLUMN (기본값 없이)  →  거의 즉시. 안전합니다
//   · DROP COLUMN               →  즉시. 다만 **데이터가 사라집니다**
//   · ALTER COLUMN TYPE         →  표 전체를 다시 씁니다. 큰 표면 몇 분씩 멈춥니다
//   · RENAME COLUMN             →  즉시. 다만 그 이름을 쓰던 코드가 전부 깨집니다
//
//   그래서 **처음에 잘 만드는 것** 이 훨씬 쌉니다. 이 단원의 목적이 그것입니다.

await db.exec(`DROP TABLE 설비목록`);


// ── 섹션 9: query 와 exec 는 무엇이 다른가 ──

// PGlite 에는 두 가지가 있습니다. 헷갈리면 계속 걸립니다.

const q = await db.query(`SELECT 1 AS 가, '나' AS 나`);
console.log("query 결과:", JSON.stringify(q.rows), "·", q.command, "· rowCount", q.rowCount);
// 출력: query 결과: [{"가":1,"나":"나"}] · SELECT · rowCount 1

const e = await db.exec(`CREATE TABLE 임시 (a INT); INSERT INTO 임시 VALUES (1),(2);`);
console.log("exec 결과 개수:", e.length, "·", e.map((하나) => `${하나.command}:${하나.affectedRows}`).join(" "));
// 출력: exec 결과 개수: 2 · CREATE:0 INSERT:2

// ★ 정리
//   db.query(sql, [값])  →  문장 **하나**. 파라미터를 넘길 수 있습니다. 결과가 객체 하나
//   db.exec(sql)         →  세미콜론으로 이은 **여러 문장**. 파라미터 없음. 결과가 배열
//
// ★★ query 에 두 문장을 넣으면 이렇게 됩니다.

try {
  await db.query(`SELECT 1; SELECT 2;`);
} catch (에러) {
  console.log("query 에 두 문장:", 에러.message);
  // 출력: query 에 두 문장: cannot insert multiple commands into a prepared statement
}

// ★ 파라미터는 `$1`, `$2` 입니다. `?` 가 아닙니다.

const 파라미터 = await db.query(`SELECT $1::int + $2::int AS 합`, [3, 4]);
console.log("파라미터 결과:", 파라미터.rows[0].합);
// 출력: 파라미터 결과: 7

await db.exec(`DROP TABLE 임시`);

// ── MySQL 은 여기가 다릅니다 ──
//   · 파라미터가 $1 이 아니라 ? 입니다
//   · 이름을 소문자로 접지 않습니다. 대신 **운영체제에 따라** 대소문자 구분이 달라집니다
//     (리눅스는 구분, 맥/윈도우는 구분 안 함 — 그래서 옮길 때 터집니다)
//   · TEXT 와 VARCHAR 의 성격이 다릅니다. 개념02 에서 잠깐 언급합니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다


// ============================================================
// 정리 — 표를 만들고 고치는 문장
// ============================================================
//
//   무엇을                     문장
//   ────────────────────────────────────────────────────────────────
//   표 만들기                  CREATE TABLE 이름 (칸 타입, 칸 타입)
//   있으면 넘어가기            CREATE TABLE IF NOT EXISTS ...
//   표 지우기                  DROP TABLE 이름
//   없어도 조용히              DROP TABLE IF EXISTS 이름
//   칸 추가                    ALTER TABLE 표 ADD COLUMN 칸 타입
//   칸 삭제                    ALTER TABLE 표 DROP COLUMN 칸
//   칸 이름 바꾸기             ALTER TABLE 표 RENAME COLUMN 옛 TO 새
//   칸 타입 바꾸기             ALTER TABLE 표 ALTER COLUMN 칸 TYPE 새타입
//   표 이름 바꾸기             ALTER TABLE 표 RENAME TO 새이름
//   구조 보기                  SELECT * FROM information_schema.columns WHERE table_name = '표'
//
//   에러 코드                  뜻
//   ────────────────────────────────────────────────────────────────
//   42601                      문법 오류 (쉼표, 괄호, 오타)
//   42P01                      그런 표가 없다
//   42P07                      그 이름이 이미 있다
//
// ★ 오늘의 핵심 두 가지
//   ① Postgres 는 따옴표 없는 이름을 **소문자로 접습니다.** 그러니 처음부터 소문자로 쓰세요
//   ② ALTER 로 나중에 고칠 수 있지만 **싸지 않습니다.** 처음에 잘 만드는 게 낫습니다


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — `점검기록` 표를 만들어 보세요.
//                    칸: 점검번호(INT), 설비번호(INT), 점검일(DATE), 결과(TEXT)
//                    만든 뒤 information_schema 로 확인하세요.
//
// ✏️ 직접 해보기 2 — 섹션 4 를 흉내 내서 `"MyTable"` 을 만들고,
//                    따옴표 없이 `SELECT * FROM MyTable` 을 해 보세요.
//                    어떤 에러가 나나요? 왜 그럴까요?
//
// ✏️ 직접 해보기 3 — 이 파일을 두 번 연달아 실행하면 어떻게 되나요?
//                    (힌트: PGlite.create() 는 메모리에만 만듭니다. 매번 새것입니다)
//                    `PGlite.create("./내디비")` 로 바꾸고 두 번 돌려 보세요.
//                    ★ 폴더가 생깁니다. 실험이 끝나면 지우세요.
//
// ✏️ 직접 해보기 4 — 표를 만들 때 칸 이름을 `order` 로 해 보세요.
//                    되나요? `user` 는요? `select` 는요?
//
// ✏️ 직접 해보기 5 — ALTER TABLE 로 칸을 지웠다가 다시 추가해 보세요.
//                    지웠던 값이 돌아오나요?
//
// ✏️ 직접 해보기 6 — information_schema.tables 대신 `pg_tables` 를 조회해 보세요.
//                    어떤 칸이 더 있나요? (힌트: SELECT * FROM pg_tables WHERE schemaname='public')


// ── 자주 하는 실수 ──

// [실수 1] 마지막 칸 뒤에 쉼표를 남김
//   `가 INT, 나 TEXT,)` → 42601. 자바스크립트 배열 버릇이 그대로 나옵니다.
//   JS 는 `[1, 2, ]` 를 받아 주지만 SQL 은 안 받습니다.

// [실수 2] 낙타등 이름을 쓰고 그대로 조회
//   `CREATE TABLE machineLog` 하면 실제로는 `machinelog` 가 됩니다.
//   나중에 `"machineLog"` 로 조회하면 42P01 입니다.
//   ★ 처음부터 `machine_log` 로 쓰세요.

// [실수 3] IF NOT EXISTS 를 "고쳐 준다" 고 오해
//   표가 이미 있으면 **아무것도 안 합니다.** 칸을 늘려 주지 않습니다.
//   구조를 바꾸려면 ALTER 를 쓰거나 DROP 하고 다시 만들어야 합니다.

// [실수 4] 운영 서버에서 DROP TABLE
//   휴지통이 없습니다. 되돌릴 수 없습니다.
//   습관적으로 `DROP TABLE IF EXISTS` 를 파일 맨 위에 적어 두면 언젠가 사고가 납니다.

// [실수 5] query 에 세미콜론으로 두 문장
//   "cannot insert multiple commands into a prepared statement" 가 납니다.
//   여러 문장은 exec 를 쓰세요. 대신 exec 에는 파라미터를 못 넘깁니다.

// [실수 6] 파라미터를 `?` 로 씀
//   `WHERE 라인 = ?` 는 Postgres 에서 안 됩니다. `$1` 입니다.
//   MySQL·SQLite 예제를 그대로 베끼면 여기서 걸립니다.

await db.close();
