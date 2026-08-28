// ============================================================
// 08단원 · 개념 01 — 서버에서 데이터베이스 부르기
// ------------------------------------------------------------
// 실행: node 개념01_서버에서_데이터베이스_부르기.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ============================================================
//
// 여기까지 우리는 SQL 을 **손으로** 쳤습니다.
// 이제 자바스크립트 프로그램이 대신 치게 합니다.
//
//   브라우저 → (HTTP) → Node 서버 → (SQL) → PostgreSQL
//
// 이 단원은 가운데 화살표, **Node 서버가 데이터베이스를 부르는 부분**을 다룹니다.
//
// 이 파일에서 볼 것:
//
//   ① 연결하는 두 가지 방법 — 설정 객체와 연결 문자열
//   ② ★★ 비밀번호를 코드에 적으면 안 되는 이유
//   ③ 연결이 실패하는 세 가지를 **일부러 내 보고** 구분하는 법
//   ④ query 가 돌려주는 것이 정확히 무엇인가
//   ⑤ ★★ Postgres 의 타입이 자바스크립트로 오면 무엇이 되는가
//   ⑥ 연결을 안 닫으면 생기는 일

import pg from "pg";

// ── 섹션 0: 연결 설정 ──

// ★ 표 이름·칸 이름은 한글로 쓰지만 **계정·DB 이름은 영어**로 씁니다.
//   도구들이 한글을 못 받는 곳이 많습니다. docker-compose.yml 도 그래서 영어입니다.

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434,          // ★ 5432 가 아닙니다. 이미 깔린 Postgres 와 안 부딪히게 비켜 놨습니다
  user: "factory",
  password: "secret",
  database: "factory_db",
};

let 연결;

try {
  연결 = new pg.Client(접속정보);
  await 연결.connect();
} catch (에러) {
  // 검증무시: Docker 가 없는 사람을 위한 안내입니다. 정상 종료합니다.
  console.log("데이터베이스에 연결하지 못했습니다.", 에러.code ?? 에러.message);
  console.log("이 파일은 Docker 가 필요합니다. 아래를 치고 다시 실행하세요.");
  console.log("  docker compose up -d");
  process.exit(0);
}

// ★★ 08~10단원이 같은 데이터베이스를 씁니다.
//   단원끼리 표 이름이 부딪히지 않게 **자기 스키마**를 씁니다.
await 연결.query("CREATE SCHEMA IF NOT EXISTS 단원08");
await 연결.query("SET search_path TO 단원08");

console.log("연결됐습니다.");
// 출력: 연결됐습니다.

const 서버판 = (await 연결.query("SELECT version()")).rows[0].version;

console.log("서버:", 서버판.split(" ").slice(0, 2).join(" "));
// 출력?: 서버: PostgreSQL 18.6

// ★ 아무것도 안 적으면 pg 는 5432 로 붙으려 합니다. 우리 컨테이너는 5434 입니다.
console.log("pg 의 기본 포트:", pg.defaults.port);
// 출력: pg 의 기본 포트: 5432


// ── 섹션 1: 세 줄이면 됩니다 ──

// 연결하고 → 물어보고 → 닫습니다. 그게 전부입니다.
//
//   const 연결 = new pg.Client({ ... });   await 연결.connect();
//   const 결과 = await 연결.query("SELECT ...");   await 연결.end();
//
// ★ `pg.Client` 는 **연결 하나**입니다. 전화선 한 가닥이라고 생각하세요.
//   서버가 손님을 여럿 받는다면 이걸로는 모자랍니다. 개념02 에서 풀립니다.

await 연결.query("DROP TABLE IF EXISTS 점검기록");
await 연결.query("DROP TABLE IF EXISTS 설비");

await 연결.query(`
  CREATE TABLE 설비 (
    설비번호 TEXT PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인     TEXT NOT NULL,
    상태     TEXT NOT NULL DEFAULT '정지',
    도입가   NUMERIC(12, 2),
    누적가동 BIGINT,
    설치일   DATE
  )
`);

await 연결.query(
  `INSERT INTO 설비 (설비번호, 이름, 라인, 상태, 도입가, 누적가동, 설치일)
   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  ["EQ-001", "컨베이어 1호", "A", "가동", "12500000.50", "9007199254740993", "2026-03-02"],
);

await 연결.query(
  `INSERT INTO 설비 (설비번호, 이름, 라인, 상태, 도입가, 누적가동, 설치일)
   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  ["EQ-002", "프레스 1호", "B", "정지", "8300000.00", "120000", "2026-04-11"],
);

const 설비수 = (await 연결.query("SELECT count(*)::int AS 건수 FROM 설비")).rows[0].건수;

console.log("설비 건수:", 설비수);
// 출력: 설비 건수: 2

// ★ 파라미터는 `$1, $2` 입니다. `?` 가 아닙니다.
//   `?` 는 MySQL 과 SQLite 입니다. 09단원에서 비교합니다.
//
// ★★ 값을 문자열로 이어 붙이지 마세요. 그러면 뚫립니다.
const 나쁜입력 = "' OR '1'='1";

const 안전 = await 연결.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 이름 = $1", [나쁜입력]);
const 위험 = await 연결.query(`SELECT count(*)::int AS 건수 FROM 설비 WHERE 이름 = '${나쁜입력}'`); // 검증무시: 일부러 뚫는 예

console.log("파라미터로 넘기면:", 안전.rows[0].건수, "건");
// 출력: 파라미터로 넘기면: 0 건

console.log("이어 붙이면:", 위험.rows[0].건수, "건");
// 출력: 이어 붙이면: 2 건

// ★★★ 이어 붙인 쪽은 **전부** 나왔습니다. `WHERE 이름 = '' OR '1'='1'` 이 되어
//   조건이 통째로 무력화됐습니다. `$1` 로 넘기면 값이 SQL 문장과 **따로** 전달되어
//   따옴표가 있어도 그냥 글자가 됩니다.
//   ★ 이스케이프를 직접 하지 마세요. 뚫리는 방법이 계속 나옵니다. 드라이버에 맡기세요.


// ── 섹션 2: 연결 문자열 ──

// 위처럼 객체로 써도 되고, 한 줄짜리 문자열로 써도 됩니다.
//
//   postgres://사용자:비밀번호@호스트:포트/데이터베이스
//
// 클라우드 서비스들은 대개 이 한 줄을 줍니다. 그래서 이 모양을 알아야 합니다.

const 연결문자열 = `postgres://${접속정보.user}:${접속정보.password}@${접속정보.host}:${접속정보.port}/${접속정보.database}`;

const 문자열연결 = new pg.Client({ connectionString: 연결문자열 });
await 문자열연결.connect();

console.log("연결 문자열로도 됩니다:", (await 문자열연결.query("SELECT 1 AS 값")).rows[0].값);
// 출력: 연결 문자열로도 됩니다: 1

await 문자열연결.end();

// ★ 배포 환경에서는 연결 문자열(환경변수 하나로 끝납니다), 내 노트북에서는 객체를 씁니다.
//
// ★ 비밀번호에 `@` 나 `/` 가 들어가면 연결 문자열이 깨집니다.
//   `encodeURIComponent(비밀번호)` 로 감싸세요.

const 특수비번 = "a@b/c";

console.log("인코딩 전:", 특수비번, "→ 후:", encodeURIComponent(특수비번));
// 출력: 인코딩 전: a@b/c → 후: a%40b%2Fc


// ── 섹션 3: ★★ 비밀번호를 코드에 적으면 안 됩니다 ──

// 위 코드에는 `password: "secret"` 이 그대로 적혀 있습니다.
// 실습이니까 그렇게 했습니다. **실무에서는 사고입니다.**
//
//   ① git 에 올라갑니다. 한 번 올라가면 **지워도 히스토리에 남습니다**
//   ② 저장소를 잠깐 공개로 바꾸면 그 순간 세상에 공개됩니다
//   ③ 비밀번호를 바꾸려면 코드를 고쳐서 다시 배포해야 합니다
//
// ★ 공개 저장소에 올라간 DB 비밀번호는 **몇 분 안에** 스캔됩니다. 봇이 24시간 돕니다.
// 그래서 **환경변수**로 뺍니다.

const 환경에서읽기 = process.env.DATABASE_URL ?? 연결문자열;

console.log("DATABASE_URL 이 설정돼 있나:", process.env.DATABASE_URL !== undefined);
// 출력: DATABASE_URL 이 설정돼 있나: false

// 실무 코드는 이렇게 씁니다. **없으면 아예 못 뜨게** 막는 것까지가 한 벌입니다.
// 조용히 기본값으로 도는 쪽이 더 위험합니다.
//
//   if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL 이 없습니다");
//   const 연결 = new pg.Client({ connectionString: process.env.DATABASE_URL });
//
// 값은 `.env` 파일에 적고, Node 20.6+ 의 내장 기능으로 읽습니다. 패키지가 필요 없습니다.
//
//   # .env                                    ← ★★★ 반드시 .gitignore 에 넣으세요
//   DATABASE_URL=postgres://factory:secret@127.0.0.1:5434/factory_db
//
//   node --env-file=.env 서버.js
//
// ★ 팀원에게는 값을 비운 `.env.example` 을 줍니다. 이름만 알려 주는 것입니다.

// ★ 로그를 찍을 때도 조심해야 합니다. 연결 문자열을 그대로 찍으면 비밀번호가 남습니다.

function 비밀가리기(문자열) {
  return 문자열.replace(/:\/\/([^:]+):([^@]*)@/, "://$1:****@");
}

console.log("그냥 찍으면:", 연결문자열);
// 출력: 그냥 찍으면: postgres://factory:secret@127.0.0.1:5434/factory_db

console.log("가리고 찍으면:", 비밀가리기(연결문자열));
// 출력: 가리고 찍으면: postgres://factory:****@127.0.0.1:5434/factory_db

// ★ 에러 객체를 통째로 찍는 것도 위험합니다.
//   `console.log(에러)` 가 설정 객체를 같이 뱉는 라이브러리가 있습니다.
//   `에러.code` 와 `에러.message` 만 찍는 습관을 들이세요.

console.log("환경변수에서 읽은 값이 있나:", 환경에서읽기.length > 0);
// 출력: 환경변수에서 읽은 값이 있나: true


// ── 섹션 4: ★ 연결이 실패하는 세 가지를 일부러 내 봅니다 ──

// 처음 연결할 때 학생이 가장 많이 막히는 곳입니다.
// 에러 메시지를 **읽을 줄 알면** 대부분 1분 안에 풀립니다.

async function 연결해보기(설명, 바꿀것) {
  const 시험 = new pg.Client({ ...접속정보, ...바꿀것, connectionTimeoutMillis: 3000 });

  try {
    await 시험.connect();
    await 시험.end();
    return `${설명} → 성공`;
  } catch (에러) {
    try {
      await 시험.end();
    } catch {
      // 이미 끊어진 것을 또 끊으려 한 것뿐입니다. 무시합니다.
    }

    return `${설명} → code=${에러.code}  ${에러.message}`;
  }
}

for (const [설명, 바꿀것] of [
  ["포트가 틀림", { port: 5999 }],
  ["비밀번호가 틀림", { password: "틀린비번" }],
  ["없는 데이터베이스", { database: "없는디비" }],
  ["없는 호스트", { host: "없는호스트.invalid" }],
]) {
  console.log(await 연결해보기(설명, 바꿀것));
}
// 출력: 포트가 틀림 → code=ECONNREFUSED  connect ECONNREFUSED 127.0.0.1:5999
// 출력: 비밀번호가 틀림 → code=28P01  password authentication failed for user "factory"
// 출력: 없는 데이터베이스 → code=3D000  database "없는디비" does not exist
// 출력: 없는 호스트 → code=ENOTFOUND  getaddrinfo ENOTFOUND 없는호스트.invalid

// ★★ 코드가 두 종류라는 것을 눈여겨보세요. 이 구분이 진단의 절반입니다.
//
//   ECONNREFUSED / ENOTFOUND / ETIMEDOUT  ← **Node 가 낸 것**. DB 까지 못 갔습니다
//   28P01 / 3D000 / 42601 ...             ← **Postgres 가 낸 것**. DB 는 만났습니다
//
//   무엇을 보나              무슨 뜻인가                  무엇을 확인하나
//   ─────────────────────────────────────────────────────────────────────
//   ECONNREFUSED           그 포트에 아무도 없음          docker compose ps / 포트 번호
//   ENOTFOUND              호스트 이름을 못 찾음          호스트 오타, DNS
//   ETIMEDOUT              대답이 없음                   방화벽, 보안그룹
//   28P01                  비밀번호가 틀림                계정·비밀번호
//   3D000                  그 이름의 DB 가 없음           DB 이름 오타
//   28000                  그 계정으로는 못 들어옴        pg_hba.conf
//
// ★ `없는 계정`으로 붙어도 `28P01` 입니다. 계정이 있는지를 밖에서 못 알아내게
//   일부러 그렇게 만든 것입니다. 로그인 화면이 "아이디 또는 비밀번호가 틀립니다"
//   라고 쓰는 것과 같은 이유입니다.


// ── 섹션 5: query 가 돌려주는 것 ──

const 결과 = await 연결.query("SELECT 설비번호, 이름, 라인 FROM 설비 ORDER BY 설비번호");

console.log("rowCount:", 결과.rowCount);
// 출력: rowCount: 2

console.log("command:", 결과.command);
// 출력: command: SELECT

console.log("rows:", JSON.stringify(결과.rows));
// 출력: rows: [{"설비번호":"EQ-001","이름":"컨베이어 1호","라인":"A"},{"설비번호":"EQ-002","이름":"프레스 1호","라인":"B"}]

console.log("칸 이름:", 결과.fields.map((칸) => 칸.name).join(", "));
// 출력: 칸 이름: 설비번호, 이름, 라인

const 첫칸 = 결과.fields[0];

console.log("첫 칸:", 첫칸.name, "· 타입번호", 첫칸.dataTypeID, "· 전송형식", 첫칸.format);
// 출력: 첫 칸: 설비번호 · 타입번호 25 · 전송형식 text

// ★ `rows` 는 **평범한 객체의 배열**입니다. 그대로 `res.json(결과.rows)` 해도 됩니다.
// ★ `dataTypeID` 는 Postgres 의 타입 번호입니다. 25 = TEXT, 23 = INT4, 1700 = NUMERIC.
//   드라이버는 이 번호를 보고 무슨 자바스크립트 값으로 만들지 정합니다. 섹션 6 에서 봅니다.

// SELECT 말고 다른 것들은 어떻게 오나 봅니다.

const 넣기 = await 연결.query("INSERT INTO 설비 (설비번호, 이름, 라인) VALUES ('EQ-003', '용접로봇 1호', 'C')");

console.log("INSERT:", 넣기.command, "/ rowCount", 넣기.rowCount, "/ rows", JSON.stringify(넣기.rows));
// 출력: INSERT: INSERT / rowCount 1 / rows []

const 고치기 = await 연결.query("UPDATE 설비 SET 상태 = '점검중' WHERE 라인 = 'A'");

console.log("UPDATE:", 고치기.command, "/ rowCount", 고치기.rowCount);
// 출력: UPDATE: UPDATE / rowCount 1

const 지우기 = await 연결.query("DELETE FROM 설비 WHERE 설비번호 = 'EQ-999'");

console.log("아무것도 못 지웠을 때 rowCount:", 지우기.rowCount);
// 출력: 아무것도 못 지웠을 때 rowCount: 0

// ★★ `rowCount` 가 0 인지 보는 것이 아주 중요합니다. "수정했습니다" 라고 응답해 놓고
//   실제로는 그 줄이 없어서 아무것도 안 바뀐 경우를 이걸로 잡습니다. 개념03 에서 다시 씁니다.

const 되돌려받기 = await 연결.query(
  "INSERT INTO 설비 (설비번호, 이름, 라인) VALUES ($1, $2, $3) RETURNING 설비번호, 상태",
  ["EQ-004", "검사기 1호", "A"],
);

console.log("RETURNING:", JSON.stringify(되돌려받기.rows));
// 출력: RETURNING: [{"설비번호":"EQ-004","상태":"정지"}]

// ★ `RETURNING` 은 Postgres 의 무기입니다. 넣으면서 자동 생성된 값을 바로 받습니다.
//   MySQL 에는 없습니다. 09단원에서 비교합니다.
//
// ★ 칸 이름이 겹치는 JOIN 에서는 `rowMode: "array"` 로 배열을 받을 수도 있습니다.
//   `연결.query({ text: "SELECT ...", rowMode: "array" })`


// ── 섹션 6: ★★ 타입이 자바스크립트로 오면 무엇이 되는가 ──

// 여기가 이 파일에서 가장 사고가 많이 나는 곳입니다.
// **재 봅시다.** 감으로 알면 안 됩니다.

const 한줄 = (await 연결.query("SELECT * FROM 설비 WHERE 설비번호 = 'EQ-001'")).rows[0];

for (const 칸이름 of ["설비번호", "도입가", "누적가동", "설치일"]) {
  const 값 = 한줄[칸이름];
  const 종류 = 값 instanceof Date ? "Date" : typeof 값;

  console.log(`${칸이름} → ${종류} · ${String(값 instanceof Date ? 값.toISOString() : 값)}`);
}
// 출력: 설비번호 → string · EQ-001
// 출력?: 도입가 → string · 12500000.50
// 출력?: 누적가동 → string · 9007199254740993
// 출력?: 설치일 → Date · 2026-03-01T15:00:00.000Z

console.log("도입가가 문자열인가:", typeof 한줄.도입가 === "string");
// 출력: 도입가가 문자열인가: true

console.log("누적가동이 문자열인가:", typeof 한줄.누적가동 === "string");
// 출력: 누적가동이 문자열인가: true

// ★★★ `NUMERIC` 도 `BIGINT` 도 **문자열**로 옵니다.
//
//   왜? 자바스크립트의 `number` 로는 정확히 담을 수 없기 때문입니다.
//   드라이버가 마음대로 `number` 로 바꾸면 값이 **조용히 망가집니다.**
//   그래서 일부러 문자열로 줍니다. "네가 알아서 정하라" 는 뜻입니다.
//
// 그대로 계산하면 이렇게 됩니다.

console.log("문자열 + 1 =", 한줄.도입가 + 1);
// 출력: 문자열 + 1 = 12500000.501

// ★★★ `12500001.50` 이 아니라 `12500000.501` 입니다.
//   더한 게 아니라 **글자를 이어 붙였습니다.** 에러도 안 납니다.

console.log("Number 로 바꾸면:", Number(한줄.도입가) + 1);
// 출력: Number 로 바꾸면: 12500001.5

// ★ 돈이라면 `Number` 도 위험합니다. 0.1 + 0.2 문제가 그대로 있습니다.
console.log("0.1 + 0.2 =", 0.1 + 0.2);
// 출력: 0.1 + 0.2 = 0.30000000000000004

// ★ 돈은 **DB 안에서 NUMERIC 으로 계산**하거나 원 단위 정수로 다루세요.

const 합계 = (await 연결.query("SELECT sum(도입가) AS 합 FROM 설비")).rows[0].합;

console.log("DB 가 더한 합계:", 합계, "· 타입", typeof 합계);
// 출력: DB 가 더한 합계: 20800000.50 · 타입 string

// ★★ `BIGINT` 를 굳이 `bigint` 로 받고 싶으면 파서를 바꿀 수 있습니다.
//   그런데 그러면 다른 것이 터집니다.

pg.types.setTypeParser(20, (글자) => BigInt(글자));   // 20 = BIGINT 의 타입 번호

const 큰수 = (await 연결.query("SELECT 누적가동 FROM 설비 WHERE 설비번호 = 'EQ-001'")).rows[0].누적가동;

console.log("파서를 바꾼 뒤:", typeof 큰수, String(큰수));
// 출력: 파서를 바꾼 뒤: bigint 9007199254740993

try {
  JSON.stringify({ 누적가동: 큰수 });
} catch (에러) {
  console.log("JSON.stringify:", 에러.constructor.name, "-", 에러.message);
}
// 출력: JSON.stringify: TypeError - Do not know how to serialize a BigInt

// ★★★ `res.json(rows)` 가 **500 으로 터집니다.** 조회는 됐는데 응답을 못 만듭니다.
//   그래서 `pg` 는 기본을 문자열로 둔 것입니다.

// Number 로 바꾸는 파서는 더 위험합니다. 조용히 값이 바뀝니다.

pg.types.setTypeParser(20, (글자) => Number(글자));

const 숫자로 = (await 연결.query("SELECT 누적가동 FROM 설비 WHERE 설비번호 = 'EQ-001'")).rows[0].누적가동;

console.log("Number 파서:", 숫자로, "· 원래 값과 같은가:", String(숫자로) === "9007199254740993");
// 출력: Number 파서: 9007199254740992 · 원래 값과 같은가: false

// ★★★ 끝자리가 3 에서 2 로 바뀌었습니다. 에러도 경고도 없습니다.
//   `Number.MAX_SAFE_INTEGER` 는 9007199254740991 입니다. 그 위는 못 셉니다.

pg.types.setTypeParser(20, (글자) => 글자);   // 원래대로 되돌립니다

// ★★ `DATE` 의 시간대 함정 — `2026-03-02` 로 넣었는데 위 출력은
//   `2026-03-01T15:00:00.000Z` 입니다. **하루 앞으로 밀렸습니다.**

const 설치일 = 한줄.설치일;

console.log(
  "로컬:", `${설치일.getFullYear()}-${설치일.getMonth() + 1}-${설치일.getDate()}`,
  "· toISOString 앞 10글자:", 설치일.toISOString().slice(0, 10),
);
// 출력?: 로컬: 2026-3-2 · toISOString 앞 10글자: 2026-03-01

console.log("둘이 같은 날인가:", 설치일.toISOString().slice(0, 10) === "2026-03-02");
// 출력?: 둘이 같은 날인가: false

// ★★★ `pg` 는 `DATE` 를 **그 기계의 로컬 자정**으로 만듭니다.
//   한국(UTC+9)에서 `2026-03-02 00:00 KST` = `2026-03-01 15:00 UTC` 입니다.
//   UTC 기계에서는 안 밀립니다. 그래서 **한국에서만 나는 버그**가 되어 재현이 어렵습니다.
//
//   ★ 해결책 두 가지
//     ① SQL 에서 글자로 받기 — `to_char(설치일, 'YYYY-MM-DD')`
//     ② 파서를 글자로 바꾸기 — `pg.types.setTypeParser(1082, (글자) => 글자)`

const 글자날짜 = (await 연결.query(
  "SELECT to_char(설치일, 'YYYY-MM-DD') AS 날 FROM 설비 WHERE 설비번호 = 'EQ-001'",
)).rows[0].날;

console.log("SQL 에서 글자로 받으면:", 글자날짜);
// 출력: SQL 에서 글자로 받으면: 2026-03-02

// ★ 표로 정리합니다. (전부 이 파일에서 실제로 확인한 값입니다)
//
//   Postgres              pg 가 주는 것     주의
//   ────────────────────────────────────────────────────────────────
//   INT / SMALLINT        number           안전
//   BIGINT                ★ string          number 로 바꾸면 값이 깨질 수 있음
//   NUMERIC / DECIMAL     ★ string          + 로 더하면 글자가 이어 붙음
//   REAL / DOUBLE         number           0.1 + 0.2 문제 있음
//   BOOLEAN               boolean          안전
//   DATE                  ★ Date            로컬 자정. toISOString 하면 날짜가 밀림
//   TIMESTAMPTZ           Date             제대로 옵니다
//   TEXT / VARCHAR / UUID string           안전
//   JSONB / TEXT[]        object / Array   자동으로 파싱해 줍니다
//   count(*)              ★ string          BIGINT 라서 문자열입니다
//
// ★★ `count(*)` 가 문자열인 것을 모르고 `건수 === 0` 을 쓰면 늘 `false` 입니다.
//   이 자료가 `count(*)::int` 라고 쓰는 이유입니다.

const 그냥카운트 = (await 연결.query("SELECT count(*) FROM 설비")).rows[0].count;
const 캐스팅 = (await 연결.query("SELECT count(*)::int AS 건수 FROM 설비")).rows[0].건수;

console.log("count(*) 그대로:", typeof 그냥카운트, "· ::int 붙이면:", typeof 캐스팅);
// 출력: count(*) 그대로: string · ::int 붙이면: number

// ★★ PGlite(01~06단원)는 `BIGINT` 를 `bigint` 로 주고, `pg` 는 `string` 으로 줍니다.
//   **같은 PostgreSQL 이라도 드라이버가 다르면 오는 값이 다릅니다.** 옮길 때 확인하세요.


// ── 섹션 7: 여러 문장 한 번에 ──

// ★ 파라미터가 **없으면** `query` 가 세미콜론으로 이은 여러 문장을 받습니다.

const 여럿 = await 연결.query("SELECT 1 AS 가; SELECT 2 AS 나");

console.log("여러 문장 결과:", Array.isArray(여럿) ? `배열 ${여럿.length}개` : "객체 1개");
// 출력: 여러 문장 결과: 배열 2개

// ★★ 그런데 파라미터를 하나라도 쓰면 **거절합니다.**

try {
  await 연결.query("SELECT $1::int AS 가; SELECT 2 AS 나", [1]);
} catch (에러) {
  console.log("파라미터 + 여러 문장:", 에러.code, "-", 에러.message);
}
// 출력: 파라미터 + 여러 문장: 42601 - cannot insert multiple commands into a prepared statement

// ★★★ 여러 문장을 받는다는 것은 **인젝션의 피해가 커진다**는 뜻입니다.
//   이어 붙인 문자열에 `; DROP TABLE 설비; --` 가 들어가면 진짜로 실행됩니다.
//   파라미터를 쓰면 애초에 이 경로가 막힙니다.


// ── 섹션 8: 연결 닫기 ──

// `await 연결.end()` 를 안 하면 ① 프로그램이 안 끝나고(node 가 소켓을 붙잡습니다),
// ② 서버 쪽에 연결이 남아 쌓이면 `max_connections` 를 채워서 아무도 못 붙습니다.
// 실제로 재 봅니다.

const 내연결세기 = async () =>
  (await 연결.query(
    "SELECT count(*)::int AS 건수 FROM pg_stat_activity WHERE application_name = $1",
    ["unit08-demo"],
  )).rows[0].건수;

console.log("시작할 때 내 연결:", await 내연결세기());
// 출력: 시작할 때 내 연결: 0

const 안닫은것 = [];

for (let 번째 = 0; 번째 < 3; 번째 += 1) {
  const 임시 = new pg.Client({ ...접속정보, application_name: "unit08-demo" });
  await 임시.connect();
  await 임시.query("SELECT 1");
  안닫은것.push(임시);
}

console.log("3개 열고 안 닫으면:", await 내연결세기());
// 출력: 3개 열고 안 닫으면: 3

for (const 임시 of 안닫은것) await 임시.end();

console.log("전부 닫으면:", await 내연결세기());
// 출력: 전부 닫으면: 0

// ★ `application_name` 은 **영어로** 쓰세요. 운영 중에 "누가 붙어 있나" 볼 때
//   이 칸이 생명줄인데, 한글을 넣으면 바이트로 깨져 보입니다.

const 한글이름 = new pg.Client({ ...접속정보, application_name: "내앱" });
await 한글이름.connect();

const 보이는이름 = (await 한글이름.query("SHOW application_name")).rows[0].application_name;

console.log("한글 application_name 은 이렇게 보입니다:", 보이는이름);
// 출력: 한글 application_name 은 이렇게 보입니다: \xeb\x82\xb4\xec\x95\xb1

await 한글이름.end();

// ★ 닫은 연결에 다시 물어보면 어떻게 되나

const 닫힌것 = new pg.Client(접속정보);
await 닫힌것.connect();
await 닫힌것.end();

try {
  await 닫힌것.query("SELECT 1");
} catch (에러) {
  console.log("닫은 뒤 query:", 에러.message);
}
// 출력: 닫은 뒤 query: Client was closed and is not queryable

// ★★ `Client` 는 **재사용이 안 됩니다.** 한 번 닫으면 끝이고, 다시 `connect()` 해도
//   안 됩니다. 새 `Client` 를 만들어야 합니다. 개념02 의 풀이 이것도 대신 해 줍니다.

// ★★★ `connect()` 를 안 하고 `query()` 를 부르면 **아무 일도 안 일어납니다.**
//   에러도 안 나고 영원히 안 끝납니다. Node 는 종료 코드 13 으로 조용히 죽습니다.
//   3초만 기다려 보겠습니다.

const 연결안한것 = new pg.Client(접속정보);

const 삼초 = new Promise((풀기) => setTimeout(() => 풀기("시간초과"), 3000));
const 결말 = await Promise.race([연결안한것.query("SELECT 1").then(() => "응답옴"), 삼초]);

console.log("connect() 없이 query() 한 결과:", 결말);
// 출력: connect() 없이 query() 한 결과: 시간초과

연결안한것.end().catch(() => {});   // 붙은 적이 없으니 조용히 정리만 합니다


// 뒷정리
await 연결.query("DROP TABLE IF EXISTS 설비");
await 연결.end();

console.log("끝났습니다.");
// 출력: 끝났습니다.


// ============================================================
// 정리
// ============================================================
//
//   무엇                    쓰는 법                          주의
//   ────────────────────────────────────────────────────────────────────────
//   연결                    new pg.Client(설정)               연결 하나입니다
//   연결 문자열              postgres://user:pw@host:port/db   비밀번호에 특수문자 조심
//   비밀번호                 process.env.DATABASE_URL          .env 를 .gitignore 에
//   파라미터                 $1, $2                            ? 가 아닙니다
//   결과                    rows / rowCount / fields          rows 는 평범한 객체 배열
//   NUMERIC · BIGINT        문자열로 옵니다                    + 로 더하면 글자가 이어집니다
//   DATE                    로컬 자정 Date                     toISOString 하면 날짜가 밀립니다
//   닫기                    await 연결.end()                   안 닫으면 안 끝납니다
//
// ★ 연결 하나로는 손님을 여럿 못 받습니다. 개념02 에서 **커넥션 풀**로 풉니다.


// ── MySQL 은 여기가 다릅니다 ──
//   · 드라이버가 `mysql2` 입니다 · 파라미터가 `?` 입니다
//   · `RETURNING` 이 없습니다 (`insertId` 를 따로 받습니다)
//   · 결과가 `{ rows }` 가 아니라 `[rows, fields]` 배열로 옵니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 4 의 `연결해보기` 에 `{ user: "없는계정" }` 을 넣어 보세요.
//                    무슨 코드가 나오나요? 왜 `3D000` 이 아닐까요?
//
// ✏️ 직접 해보기 2 — `docker compose down` 으로 DB 를 끄고 이 파일을 실행해 보세요.
//                    맨 위의 안내가 제대로 나오나요? 다시 `up -d` 로 켜세요.
//
// ✏️ 직접 해보기 3 — `DATABASE_URL=postgres://factory:secret@127.0.0.1:5434/factory_db node 개념01_....js`
//                    로 실행해 보세요. 섹션 3 의 출력이 어떻게 바뀌나요?
//
// ✏️ 직접 해보기 4 — `도입가 NUMERIC` 대신 `DOUBLE PRECISION` 으로 바꿔 보세요.
//                    타입이 무엇으로 오나요? `12500000.50` 이 그대로 나오나요?
//
// ✏️ 직접 해보기 5 — `pg.types.setTypeParser(1082, (글자) => 글자)` 를 섹션 6 앞에 넣어 보세요.
//                    (1082 는 DATE 의 타입 번호입니다) 설치일이 무엇으로 오나요?
//
// ✏️ 직접 해보기 6 — 섹션 8 의 `안닫은것` 반복을 3 에서 30 으로 늘려 보세요.
//                    `max_connections` 는 100 입니다. 몇 개까지 버티나요?


// ── 자주 하는 실수 ──

// [실수 1] 파라미터를 `?` 로 씀
//   Postgres 에서 `42601` 문법 오류가 납니다. `?` 는 MySQL·SQLite 문법입니다.

// [실수 2] 값을 문자열로 이어 붙임
//   섹션 1 에서 본 것처럼 그대로 뚫립니다. 그리고 파라미터로 넘기면 코드가 더
//   짧습니다. 안 쓸 이유가 없습니다.

// [실수 3] `NUMERIC` 을 그냥 더함
//   `"100" + "200"` 은 `"100200"` 입니다. 에러가 안 나서 몇 달 뒤에 발견됩니다.
//   돈은 DB 에서 `sum()` 으로 더하거나 원 단위 정수로 다루세요.

// [실수 4] `DATE` 를 `toISOString().slice(0, 10)` 으로 자름
//   한국에서는 **하루가 밀리고** UTC 서버에서는 안 밀립니다. 재현이 어렵습니다.
//   `to_char(칸, 'YYYY-MM-DD')` 로 글자를 받으세요.

// [실수 5] 비밀번호를 코드에 적고 커밋함
//   git 히스토리는 지워도 남습니다. 되돌리려면 비밀번호 자체를 바꿔야 합니다.
//   `.env` 를 만들기 **전에** `.gitignore` 에 넣으세요. 순서가 중요합니다.

// [실수 6] `end()` 를 안 함
//   프로그램이 안 끝납니다. 테스트 러너에서 "왜 안 끝나지" 로 몇 시간을 씁니다.

// [실수 7] 에러 객체를 통째로 로그에 찍음
//   설정이 같이 찍혀서 비밀번호가 로그에 남습니다. `code` 와 `message` 만 찍으세요.
