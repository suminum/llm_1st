// ============================================================
// 02단원 · 개념 02 — 타입 고르기
// ------------------------------------------------------------
// 실행: node 개념02_타입_고르기.js
//
// ★★★ 이 단원에서 가장 중요한 파일입니다. 천천히 보세요.
// ============================================================
//
// 개념01 에서 `INT`, `TEXT` 를 아무 설명 없이 썼습니다. 이제 제대로 봅니다.
// 여기서 잘못 고르면 **몇 달 뒤에 돈 계산이 틀어지거나 새벽에 서버가 터집니다.**
//
// 이 파일에서 실제로 터뜨려 볼 세 가지입니다.
//
//   ① BIGINT 를 꺼내서 JSON 으로 만들면 **터집니다**
//   ② 돈을 REAL 로 저장하면 **1원씩 틀립니다**
//   ③ NUMERIC 을 그냥 더하면 **글자가 이어붙습니다**
//
// 셋 다 에러 메시지가 친절하지 않습니다. 미리 알아야 안 당합니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();


// ── 섹션 1: 타입은 문지기입니다 ──

// 01단원에서 본 파일 저장의 한계 중 하나가 "규칙을 못 지킨다" 였습니다.
// 타입이 그 첫 번째 문지기입니다.

await db.exec(`CREATE TABLE 문지기 (설비번호 INT, 이름 TEXT)`);

try {
  await db.query(`INSERT INTO 문지기 VALUES ('가나', '컨베이어 1호')`);
} catch (에러) {
  console.log(`${에러.code} — ${에러.message}`);
  // 출력: 22P02 — invalid input syntax for type integer: "가나"
}

// ★ 22P02 = "그 타입으로 읽을 수 없는 글자". JSON 파일이었다면 그냥 들어갔습니다.
// 반대로 읽을 수 있는 글자는 알아서 바꿔 줍니다.

const 바뀜 = await db.query(`SELECT '42'::int AS 숫자로, 42::text AS 글자로`);
console.log("'42'::int →", 바뀜.rows[0].숫자로, typeof 바뀜.rows[0].숫자로);
// 출력: '42'::int → 42 number
console.log("42::text →", 바뀜.rows[0].글자로, typeof 바뀜.rows[0].글자로);
// 출력: 42::text → 42 string

// ★ `::타입` 은 "이 값을 이 타입으로 봐라" 는 뜻입니다. **캐스팅(cast)** 이라고 합니다.


// ── 섹션 2: 전부 한 번에 재 봅니다 ──

// 표에 담긴 값이 **자바스크립트로 나올 때 무엇이 되는지** 가 이 개념의 핵심입니다.
// 전부 넣고 한 번에 꺼내 봅니다.

await db.exec(`
  CREATE TABLE 타입시험 (
    가_int         INT,
    나_bigint      BIGINT,
    다_smallint    SMALLINT,
    라_numeric     NUMERIC(10,2),
    마_real        REAL,
    바_double      DOUBLE PRECISION,
    사_text        TEXT,
    아_varchar     VARCHAR(10),
    자_char        CHAR(5),
    차_bool        BOOLEAN,
    카_date        DATE,
    타_timestamp   TIMESTAMP,
    파_timestamptz TIMESTAMPTZ,
    하_jsonb       JSONB,
    거_array       TEXT[],
    너_uuid        UUID
  );
`);

await db.query(`
  INSERT INTO 타입시험 VALUES (
    42, 9007199254740993, 7, 1.5, 1.5, 1.5,
    '글자', '짧게', 'A', true,
    '2026-03-15', '2026-03-15 23:30:00', '2026-03-15 23:30:00+09',
    '{"a":1}', ARRAY['A','B'], '11111111-2222-3333-4444-555555555555'
  )
`);

const 한줄 = (await db.query(`SELECT * FROM 타입시험`)).rows[0];

for (const [칸, 값] of Object.entries(한줄)) {
  console.log(`${칸} → ${typeof 값} (${값.constructor.name})`);
}
// 출력: 가_int → number (Number)
// 출력: 나_bigint → bigint (BigInt)
// 출력: 다_smallint → number (Number)
// 출력: 라_numeric → string (String)
// 출력: 마_real → number (Number)
// 출력: 바_double → number (Number)
// 출력: 사_text → string (String)
// 출력: 아_varchar → string (String)
// 출력: 자_char → string (String)
// 출력: 차_bool → boolean (Boolean)
// 출력: 카_date → object (Date)
// 출력: 타_timestamp → object (Date)
// 출력: 파_timestamptz → object (Date)
// 출력: 하_jsonb → object (Object)
// 출력: 거_array → object (Array)
// 출력: 너_uuid → string (String)

// ★★ 놀랄 곳이 두 군데입니다. 눈에 잘 안 띄니 다시 보세요.
//   나_bigint  → **bigint**   ← number 가 아닙니다
//   라_numeric → **string**   ← `"1.50"` 입니다
// 이 둘이 이 파일에서 터뜨릴 사고 ①, ③ 입니다.


// ── 섹션 3: 정수 세 형제 — SMALLINT / INT / BIGINT ──

// 차이는 담을 수 있는 크기뿐입니다.
//   SMALLINT  2바이트   -32,768 ~ 32,767
//   INT       4바이트   약 -21억 ~ 21억
//   BIGINT    8바이트   약 -922경 ~ 922경
// 넘치면 조용히 넘어가는 게 아니라 **에러가 납니다.** 확인합니다.

for (const [설명, 식] of [
  ["SMALLINT 에 32768", "32768::smallint"],
  ["INT 에 2147483648", "2147483648::int"],
]) {
  try {
    await db.query(`SELECT ${식}`); // 검증무시: 일부러 범위를 넘겨 보는 것
    console.log(`${설명} — 들어감`);
  } catch (에러) {
    console.log(`${설명} — ${에러.code} ${에러.message}`);
  }
}
// 출력: SMALLINT 에 32768 — 22003 smallint out of range
// 출력: INT 에 2147483648 — 22003 integer out of range

// ★ 22003 = 범위 초과.
// ★★ INT 의 21억이 커 보이지만 **금방 찹니다.** 초당 100건이면 250일에 씁니다.
//   다 찬 뒤에 바꾸려면 표 전체를 다시 씁니다 (개념01 섹션 8).
//   ★ 그래서 **번호(키) 칸은 처음부터 BIGINT** 로 잡습니다.
//
// ★ 정수끼리 나누면 소수점이 잘립니다. 자바스크립트와 다릅니다.

const 나누기 = await db.query(`SELECT 7/2 AS 정수끼리, (7.0/2)::text AS 소수섞어`);
console.log("SQL 에서 7/2 =", 나누기.rows[0].정수끼리, "· 7.0/2 =", 나누기.rows[0].소수섞어);
// 출력: SQL 에서 7/2 = 3 · 7.0/2 = 3.5000000000000000
console.log("JS 에서 7/2 =", 7 / 2);
// 출력: JS 에서 7/2 = 3.5


// ── 섹션 4: ★★ BIGINT 를 꺼내면 JSON.stringify 가 터집니다 ──

// 사고 ① 입니다. 진짜로 터뜨립니다.
console.log("나_bigint 값:", String(한줄.나_bigint));
// 출력: 나_bigint 값: 9007199254740993

try {
  JSON.stringify({ 설비번호: 한줄.나_bigint });
} catch (에러) {
  console.log(`${에러.name} — ${에러.message}`);
  // 출력: TypeError — Do not know how to serialize a BigInt
}

// ★★★ Express 에서 `res.json(줄)` 을 하면 안에서 JSON.stringify 가 돕니다.
//   즉 **API 가 500 으로 죽습니다.** 그것도 특정 데이터에서만요. 계산도 안 됩니다.

try {
  한줄.나_bigint + 1; // 검증무시: 일부러 터뜨리는 것
} catch (에러) {
  console.log(`${에러.name} — ${에러.message}`);
  // 출력: TypeError — Cannot mix BigInt and other types, use explicit conversions
}

console.log("bigint 끼리는 됩니다:", String(한줄.나_bigint + 1n));
// 출력: bigint 끼리는 됩니다: 9007199254740994

// ★★★ 진짜 함정은 따로 있습니다. **작은 값은 number 로 옵니다.**

await db.exec(`CREATE TABLE 번호시험 (작은값 BIGINT, 경계 BIGINT, 경계다음 BIGINT)`);
await db.query(`INSERT INTO 번호시험 VALUES (100, 9007199254740991, 9007199254740992)`);

const 번호 = (await db.query(`SELECT * FROM 번호시험`)).rows[0];
console.log(`작은값 → ${typeof 번호.작은값} / 경계 → ${typeof 번호.경계} / 경계다음 → ${typeof 번호.경계다음}`);
// 출력: 작은값 → number / 경계 → number / 경계다음 → bigint

console.log("경계는 Number.MAX_SAFE_INTEGER:", Number.MAX_SAFE_INTEGER);
// 출력: 경계는 Number.MAX_SAFE_INTEGER: 9007199254740991
// ★★★ 여기가 진짜 사고입니다.
//   PGlite 는 BIGINT 를 **number 로 담을 수 있으면 number 로** 줍니다.
//   9,007,199,254,740,991 을 넘어야 bigint 로 바뀝니다. 그래서 이렇게 됩니다.
//     개발할 때  → id 가 1, 2, 3 → number → 잘 돕니다
//     운영 1년 뒤 → id 가 9,007,199,254,740,992 → bigint → **갑자기 500**
//   테스트로 절대 못 잡습니다. 그 큰 값을 일부러 넣어 보지 않으면요.
//
// ★ 대처: **BIGINT 는 SQL 에서 문자열로 바꿔서 꺼내세요.**

const 안전 = await db.query(`SELECT 경계다음::text AS 설비번호 FROM 번호시험`);
console.log("::text 로 꺼내면:", typeof 안전.rows[0].설비번호, JSON.stringify(안전.rows[0]));
// 출력: ::text 로 꺼내면: string {"설비번호":"9007199254740992"}

// 반대로 Number() 로 바꾸면 값이 망가집니다.

const 원본 = "9007199254740993";
console.log(`Number("${원본}") = ${Number(원본)} · 원본과 같은가: ${String(Number(원본)) === 원본}`);
// 출력: Number("9007199254740993") = 9007199254740992 · 원본과 같은가: false

// ★★ 마지막 자리가 3 에서 2 로 바뀌었습니다. **에러도 안 납니다.**
//
// ★ 정리 — ① `::text` 로 꺼내 문자열로 다룬다 (가장 안전, 보통 이것)
//           ② bigint 그대로 쓰고 내보낼 때만 `.toString()`
// ★★ count(*) 도 Postgres 에서는 BIGINT 입니다. 다만 값이 작아서 number 로 옵니다.

const 세기 = await db.query(`SELECT count(*) AS 개수 FROM 번호시험`);
console.log("count(*) 타입:", typeof 세기.rows[0].개수, "· 값:", 세기.rows[0].개수);
// 출력: count(*) 타입: number · 값: 1

// ★ 그래도 `count(*)::int` 로 캐스팅해 두는 습관을 들이면 마음이 편합니다.


// ── 섹션 5: ★★★ 돈은 반드시 NUMERIC ──

// 사고 ② 입니다. 가장 유명하고, 가장 자주 납니다.
//   REAL / DOUBLE PRECISION  →  2진수로 근사. **빠르지만 부정확**
//   NUMERIC / DECIMAL        →  10진수 그대로. **정확하지만 느림**
// 유명한 0.1 + 0.2 를 세 타입으로 재 봅니다.

const 셋 = (await db.query(`
  SELECT
    (0.1::real + 0.2::real)::text AS 리얼,
    (0.1::double precision + 0.2::double precision)::text AS 더블,
    (0.1::numeric + 0.2::numeric)::text AS 뉴메릭,
    (0.1::real + 0.2::real = 0.3::real) AS 리얼같나,
    (0.1::double precision + 0.2::double precision = 0.3::double precision) AS 더블같나,
    (0.1::numeric + 0.2::numeric = 0.3::numeric) AS 뉴메릭같나
`)).rows[0];

console.log(`REAL   : ${셋.리얼}  · 0.3 과 같나: ${셋.리얼같나}`);
// 출력: REAL   : 0.3  · 0.3 과 같나: true
console.log(`DOUBLE : ${셋.더블}  · 0.3 과 같나: ${셋.더블같나}`);
// 출력: DOUBLE : 0.30000000000000004  · 0.3 과 같나: false
console.log(`NUMERIC: ${셋.뉴메릭}  · 0.3 과 같나: ${셋.뉴메릭같나}`);
// 출력: NUMERIC: 0.3  · 0.3 과 같나: true
console.log("자바스크립트:", 0.1 + 0.2, "· 0.3 과 같나:", 0.1 + 0.2 === 0.3);
// 출력: 자바스크립트: 0.30000000000000004 · 0.3 과 같나: false
// ★★ 재 보고 놀랐습니다. **REAL 은 0.3 이 나왔습니다.**
//   "REAL 로 하면 0.30000000000000004 가 나오겠지" 하고 적었다가 돌려 보니 아니었습니다.
//
//   REAL 은 4바이트라 정밀도가 낮아서 **오차가 반올림에 묻힙니다.**
//   DOUBLE PRECISION 은 8바이트라 오차가 그대로 보입니다.
//   자바스크립트의 number 가 바로 이 DOUBLE PRECISION 입니다.
//
//   ★★★ "REAL 은 괜찮네" 라고 결론 내면 안 됩니다.
//     오차가 **없는** 게 아니라 **안 보이는** 것뿐입니다. 1,000번 더해 봅니다.

await db.exec(`CREATE TABLE 단가 (리얼값 REAL, 뉴메릭값 NUMERIC(12,2))`);
await db.exec(`INSERT INTO 단가 SELECT 0.1, 0.1 FROM generate_series(1, 1000)`);

const 합계 = (await db.query(`SELECT sum(리얼값) AS 리얼합, sum(뉴메릭값) AS 뉴메릭합 FROM 단가`)).rows[0];

console.log("0.1 을 1000번 더한 값 — REAL:", 합계.리얼합);
// 출력: 0.1 을 1000번 더한 값 — REAL: 99.99905
console.log("0.1 을 1000번 더한 값 — NUMERIC:", 합계.뉴메릭합);
// 출력: 0.1 을 1000번 더한 값 — NUMERIC: 100.00
console.log("REAL 이 정확히 100 인가:", 합계.리얼합 === 100);
// 출력: REAL 이 정확히 100 인가: false
console.log("NUMERIC 이 정확히 100.00 인가:", 합계.뉴메릭합 === "100.00");
// 출력: NUMERIC 이 정확히 100.00 인가: true
// ★★★ 0.1 원짜리를 1,000개 팔았는데 **99.99905원** 이 나왔습니다.
//   회계 담당자는 이 차이를 반드시 찾아냅니다. 그리고 원인은 못 찾습니다.
//
//   ★ 돈·수량·세금·비율 — **정확해야 하는 값은 전부 NUMERIC** 입니다.
//     REAL / DOUBLE 은 온도·진동·압력처럼 **원래 근사값인 측정치**에만 쓰세요.
//
// ★ NUMERIC(전체자릿수, 소수자릿수) 의 뜻입니다.

await db.exec(`CREATE TABLE 부품 (이름 TEXT, 단가 NUMERIC(10,2), 수량 INT)`);
await db.exec(`INSERT INTO 부품 VALUES ('볼트', 1.50, 3), ('너트', 2.25, 4)`);

await db.query(`INSERT INTO 부품 VALUES ('와셔', 1.239, 1)`);
const 와셔 = (await db.query(`SELECT 단가 FROM 부품 WHERE 이름 = '와셔'`)).rows[0];
console.log("1.239 를 NUMERIC(10,2) 에 넣으면:", 와셔.단가);
// 출력: 1.239 를 NUMERIC(10,2) 에 넣으면: 1.24

try {
  await db.query(`INSERT INTO 부품 VALUES ('큰것', 123456789.00, 1)`);
} catch (에러) {
  console.log(`123456789 을 NUMERIC(10,2) 에: ${에러.code} ${에러.message}`);
  // 출력: 123456789 을 NUMERIC(10,2) 에: 22003 numeric field overflow
}

// ★ NUMERIC(10,2) = 전체 10자리 중 소수점 아래 2자리. 정수부는 8자리까지입니다.
//   ★ 소수는 **조용히 반올림**하고, 정수부가 넘치면 **에러**입니다. 방향이 다릅니다.
//   돈이라면 `NUMERIC(15,2)` 처럼 자릿수를 적어 두세요. 오타를 막아 줍니다.
// ★ Postgres 의 `MONEY` 타입은 **쓰지 마세요.** 서버 로케일에 따라 값이 달라집니다.


// ── 섹션 6: ★★ NUMERIC 은 자바스크립트로 **문자열**로 옵니다 ──

// 사고 ③ 입니다. NUMERIC 을 잘 골라 놓고 여기서 다시 틀립니다.

await db.exec(`DELETE FROM 부품 WHERE 이름 IN ('와셔')`);
const 부품들 = (await db.query(`SELECT * FROM 부품 ORDER BY 이름`)).rows;
console.log(JSON.stringify(부품들));
// 출력: [{"이름":"너트","단가":"2.25","수량":4},{"이름":"볼트","단가":"1.50","수량":3}]

// ★ 단가가 `2.25` 가 아니라 `"2.25"` 입니다. 따옴표를 보세요.
// 이 상태로 합계를 내면 이렇게 됩니다.

let 합 = 0;
for (const 부품 of 부품들) {
  합 = 합 + 부품.단가; // 검증무시: 일부러 틀리게 더하는 것
}

console.log("그냥 더한 결과:", 합, typeof 합);
// 출력: 그냥 더한 결과: 02.251.50 string

// ★★★ `0 + "2.25"` 는 `"02.25"` 입니다. 더하기가 **이어붙이기**가 됐습니다.
//   에러가 안 납니다. 화면에 `02.251.50 원` 이라고 찍힙니다.
//   `.toFixed(2)` 를 부르면 그때야 터지고, 그 자리는 보통 저 for 문에서 멉니다.
//
// ★ 더 고약한 건 **곱하기는 잘 된다**는 것입니다.

console.log("단가 * 수량 =", 부품들[0].단가 * 부품들[0].수량, typeof (부품들[0].단가 * 부품들[0].수량));
// 출력: 단가 * 수량 = 9 number

// ★★ 곱하기·빼기·나누기는 알아서 숫자로 바꿔 줍니다. **더하기만** 이어붙습니다.
//
// ── 어떻게 해야 하나 ──
//   방법 A. 계산은 **DB 에서** 합니다  ← 대부분 이게 정답입니다

const DB합 = (await db.query(`SELECT sum(단가 * 수량) AS 합계 FROM 부품`)).rows[0].합계;
console.log("DB 에서 계산한 합계:", DB합, typeof DB합);
// 출력: DB 에서 계산한 합계: 13.50 string

//   ★ 결과도 문자열이지만 **계산 자체는 정확합니다.** 화면에 그대로 보여 줄 거라면 최선입니다.
//
//   방법 B. 자바스크립트에서 꼭 계산해야 하면 **명시적으로 바꿉니다**

let 합B = 0;
for (const 부품 of 부품들) {
  합B += Number(부품.단가) * 부품.수량;
}
console.log("Number() 로 바꿔 계산:", 합B, typeof 합B);
// 출력: Number() 로 바꿔 계산: 13.5 number

//   ★★ 단, 이러면 다시 **부동소수점** 세상입니다. 0.1+0.2 문제가 돌아옵니다.
//     돈이 큰 서비스는 원 단위 정수로 저장하거나 `decimal.js` 같은 것을 씁니다.
//
//   방법 C. 애초에 **원 단위 정수(BIGINT)** 로 저장합니다
//     소수점이 없어서 안 틀립니다. 대신 표시할 때 나누는 걸 잊으면 15억이 됩니다.


// ── 섹션 7: 글자 세 형제 — TEXT / VARCHAR(n) / CHAR(n) ──

await db.exec(`CREATE TABLE 글자시험 (t TEXT, v VARCHAR(5), c CHAR(5))`);
await db.exec(`INSERT INTO 글자시험 VALUES ('가나', '가나', '가나')`);
const 글자 = (await db.query(`
  SELECT t, v, c, length(c) AS 씨길이, octet_length(c) AS 씨바이트 FROM 글자시험
`)).rows[0];

console.log("TEXT:", JSON.stringify(글자.t), "· VARCHAR(5):", JSON.stringify(글자.v), "· CHAR(5):", JSON.stringify(글자.c));
// 출력: TEXT: "가나" · VARCHAR(5): "가나" · CHAR(5): "가나   "

// ★★ CHAR(5) 는 **모자란 만큼 공백을 채웁니다.** `줄.c === "가나"` 가 거짓이 됩니다.
//   ★ CHAR 는 쓰지 마세요. 쓸 이유가 거의 없습니다.

console.log(`length(c)=${글자.씨길이} · octet_length(c)=${글자.씨바이트}`);
// 출력: length(c)=2 · octet_length(c)=9

// ★ length 는 글자 수, octet_length 는 바이트 수입니다. 한글 한 자는 UTF-8 로 3바이트.
//   ★ length 는 뒤 공백을 안 세는데 octet_length 는 셉니다. 둘이 안 맞습니다.
for (const [칸, 타입] of [["v", "VARCHAR(5)"], ["c", "CHAR(5)"]]) {
  try {
    await db.query(`INSERT INTO 글자시험 (${칸}) VALUES ('여섯글자넘음')`); // 검증무시: 표 이름/칸 이름 허용 목록
  } catch (에러) {
    console.log(`${타입} 에 6글자: ${에러.code} ${에러.message}`);
  }
}
// 출력: VARCHAR(5) 에 6글자: 22001 value too long for type character varying(5)
// 출력: CHAR(5) 에 6글자: 22001 value too long for type character(5)

// ★★ Postgres 에서는 **TEXT 가 VARCHAR 보다 느리지 않습니다.**
//   셋 다 같은 방식으로 저장됩니다. VARCHAR(n) 은 길이 검사만 붙인 것입니다.
//   "VARCHAR(50) 이 공간을 아낀다" 는 다른 DB 이야기입니다.
//   ★ 길이 제한은 **CHECK 로** 거세요. 훨씬 유연합니다.

await db.exec(`
  CREATE TABLE 설비 (
    이름 TEXT NOT NULL CHECK (char_length(이름) BETWEEN 1 AND 20)
  )
`);

for (const [설명, 값] of [["정상", "컨베이어 1호"], ["빈 문자열", ""], ["21글자", "가나다라마바사아자차카타파하가나다라마바사"]]) {
  try {
    await db.query(`INSERT INTO 설비 VALUES ($1)`, [값]);
    console.log(`${설명} — 들어감`);
  } catch (에러) {
    console.log(`${설명} — ${에러.code} 거절`);
  }
}
// 출력: 정상 — 들어감
// 출력: 빈 문자열 — 23514 거절
// 출력: 21글자 — 23514 거절

// ★ VARCHAR(20) 이었다면 **빈 문자열은 못 막습니다.** CHECK 는 한 번에 겁니다.
//   CHECK 는 개념03 에서 제대로 합니다.
//
// ── MySQL 은 여기가 다릅니다 ──
//   · VARCHAR(n) 을 훨씬 많이 씁니다. TEXT 는 색인에 제약이 있습니다
//   · CHAR 는 MySQL 도 공백을 채웁니다. 다만 꺼낼 때 잘라서 줍니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다


// ── 섹션 8: BOOLEAN ──

const 참거짓 = (await db.query(`
  SELECT 'true'::boolean AS a, 't'::boolean AS b, 'yes'::boolean AS c,
         'on'::boolean AS d, '1'::boolean AS e, '0'::boolean AS f
`)).rows[0];

console.log("true/t/yes/on/1/0 →", Object.values(참거짓).join(" "));
// 출력: true/t/yes/on/1/0 → true true true true true false

try {
  await db.query(`SELECT '참'::boolean`);
} catch (에러) {
  console.log(`'참' 은: ${에러.code} ${에러.message}`);
  // 출력: '참' 은: 22P02 invalid input syntax for type boolean: "참"
}
// ★ BOOLEAN 은 1바이트입니다. `가동중 INT` 로 0/1 을 쓰지 마세요.
//   `WHERE 가동중` 만으로 조회가 됩니다.
// ★★ 다만 BOOLEAN 에도 NULL 이 들어갑니다. 참/거짓/**모름** 세 가지입니다. 개념05 에서 합니다.


// ── 섹션 9: ★★ 날짜와 시간 — TIMESTAMPTZ 를 쓰세요 ──

// 셋을 구분해야 합니다.
//   DATE          날짜만. 시간 없음               4바이트
//   TIMESTAMP     날짜+시간. **시간대 정보 없음**  8바이트
//   TIMESTAMPTZ   날짜+시간. **시간대를 반영**     8바이트
//
// 이름이 헷갈립니다. TIMESTAMPTZ 는 시간대를 **저장하지 않습니다.**
// 항상 UTC 로 저장하고, 꺼낼 때 보는 사람의 시간대로 바꿔 줍니다.
// TIMESTAMP 는 그냥 적힌 글자를 그대로 들고 있습니다. 재 봅니다.

await db.exec(`CREATE TABLE 점검 (점검일 DATE, 시각 TIMESTAMP, 시각tz TIMESTAMPTZ)`);
await db.query(`INSERT INTO 점검 VALUES ('2026-03-15','2026-03-15 23:30:00','2026-03-15 23:30:00+09')`);
// 서울에서 밤 11시 30분에 점검했다고 넣었습니다. DB 시간대를 바꿔 가며 꺼내 봅니다.

for (const 지역 of ["Asia/Seoul", "America/New_York", "UTC"]) {
  await db.exec(`SET TimeZone = '${지역}'`); // 검증무시: 표 이름/칸 이름 허용 목록
  const 본것 = (await db.query(`SELECT 시각::text AS ts, 시각tz::text AS tstz FROM 점검`)).rows[0];
  console.log(`${지역} — TIMESTAMP: ${본것.ts} · TIMESTAMPTZ: ${본것.tstz}`);
}
// 출력: Asia/Seoul — TIMESTAMP: 2026-03-15 23:30:00 · TIMESTAMPTZ: 2026-03-15 23:30:00+09
// 출력: America/New_York — TIMESTAMP: 2026-03-15 23:30:00 · TIMESTAMPTZ: 2026-03-15 10:30:00-04
// 출력: UTC — TIMESTAMP: 2026-03-15 23:30:00 · TIMESTAMPTZ: 2026-03-15 14:30:00+00

await db.exec(`SET TimeZone = 'Asia/Seoul'`);

// ★★★ 보세요.
//   TIMESTAMPTZ → 어디서 봐도 **같은 순간**. 뉴욕에서는 오전 10시 30분입니다
//   TIMESTAMP   → 어디서 봐도 **같은 글자**. 뉴욕 사람은 "밤 11시 30분에 했구나" 하고 오해합니다
//
//   서울 공장과 미국 지사가 같은 시스템을 쓰면 바로 사고가 됩니다.
//
// ★ 결론: **시각을 담는 칸은 전부 TIMESTAMPTZ.**
//   TIMESTAMP 는 "시간대와 무관한 시각"(매일 09:00 근무 시작 같은 것) 에만 씁니다.
//
// ★ now() 는 TIMESTAMPTZ 이고, localtimestamp 는 TIMESTAMP 입니다.

const 지금 = (await db.query(`
  SELECT pg_typeof(now())::text AS a, pg_typeof(localtimestamp)::text AS b, pg_typeof(current_date)::text AS c
`)).rows[0];
console.log(`now()=${지금.a} · localtimestamp=${지금.b} · current_date=${지금.c}`);
// 출력: now()=timestamp with time zone · localtimestamp=timestamp without time zone · current_date=date

// ── ★★ DATE 는 자바스크립트로 오면 UTC 자정입니다 ──

const 날짜줄 = (await db.query(`SELECT 점검일, 시각tz FROM 점검`)).rows[0];

console.log("DATE 를 toISOString():", 날짜줄.점검일.toISOString());
// 출력: DATE 를 toISOString(): 2026-03-15T00:00:00.000Z
console.log("TIMESTAMPTZ 를 toISOString():", 날짜줄.시각tz.toISOString());
// 출력: TIMESTAMPTZ 를 toISOString(): 2026-03-15T14:30:00.000Z

// **날짜만** 넣었는데 자바스크립트에서는 UTC 자정의 Date 가 됐습니다. 여기서 하루가 어긋납니다.

const 서울에서 = 날짜줄.점검일.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
const 뉴욕에서 = 날짜줄.점검일.toLocaleDateString("en-CA", { timeZone: "America/New_York" });

console.log(`같은 DATE 를 서울에서 보면 ${서울에서}, 뉴욕에서 보면 ${뉴욕에서}`);
// 출력: 같은 DATE 를 서울에서 보면 2026-03-15, 뉴욕에서 보면 2026-03-14
console.log("하루가 어긋나나:", 서울에서 !== 뉴욕에서);
// 출력: 하루가 어긋나나: true

// ★★★ **3월 15일 점검 기록이 3월 14일로 보입니다.**
//   `getDate()` 나 `toLocaleDateString()` 을 그냥 쓰면 음수 시간대에서 하루가 밀립니다.
//
// ★ 대처: **날짜는 SQL 에서 문자열로 꺼내세요.** Date 를 안 만들면 안 밀립니다.

const 문자열날짜 = (await db.query(`SELECT 점검일::text AS 점검일 FROM 점검`)).rows[0];
console.log("점검일::text →", 문자열날짜.점검일, typeof 문자열날짜.점검일);
// 출력: 점검일::text → 2026-03-15 string

// 또는 UTC 기준으로 읽어도 됩니다. (toISOString 은 항상 UTC 입니다)

console.log("toISOString().slice(0,10) →", 날짜줄.점검일.toISOString().slice(0, 10));
// 출력: toISOString().slice(0,10) → 2026-03-15


// ── 섹션 10: JSONB — 모양이 정해지지 않은 것 ──

await db.exec(`CREATE TABLE 설정 (설비번호 INT, 값 JSONB)`);
await db.query(`INSERT INTO 설정 VALUES (1,'{"온도":75,"경보":{"상한":80,"하한":20}}'),(2,'{"온도":90}')`);
const 설정줄 = (await db.query(`SELECT 값 FROM 설정 WHERE 설비번호 = 1`)).rows[0];
console.log("JS 로 오면:", typeof 설정줄.값, "· 파싱 필요 없음:", 설정줄.값.온도);
// 출력: JS 로 오면: object · 파싱 필요 없음: 75
// SQL 안에서도 꺼냅니다.
//   값->'온도'          JSONB 로          값->>'온도'         **글자**로
//   값#>>'{경보,상한}'  깊이 들어가 글자로  값 @> '{"온도":90}' 이 내용을 품고 있나

const 꺼냄 = (await db.query(`
  SELECT 설비번호, 값->>'온도' AS 온도, 값#>>'{경보,상한}' AS 상한 FROM 설정 ORDER BY 설비번호
`)).rows;
console.log(JSON.stringify(꺼냄));
// 출력: [{"설비번호":1,"온도":"75","상한":"80"},{"설비번호":2,"온도":"90","상한":null}]

// ★ `->>` 는 항상 **글자**로 줍니다. 비교하려면 캐스팅해야 합니다.
const 뜨거운 = (await db.query(`SELECT 설비번호 FROM 설정 WHERE (값->>'온도')::int > 80`)).rows;
console.log("온도 80 초과:", JSON.stringify(뜨거운));
// 출력: 온도 80 초과: [{"설비번호":2}]

// ── JSON 과 JSONB 의 차이 ──

await db.exec(`CREATE TABLE 비교 (j JSON, b JSONB)`);
await db.query(`INSERT INTO 비교 VALUES ('{"b":2, "a":1, "a":9,  "c":3}','{"b":2, "a":1, "a":9,  "c":3}')`);
const 비교줄 = (await db.query(`SELECT j::text AS j, b::text AS b FROM 비교`)).rows[0];
console.log("JSON :", 비교줄.j);
// 출력: JSON : {"b":2, "a":1, "a":9,  "c":3}
console.log("JSONB:", 비교줄.b);
// 출력: JSONB: {"a": 9, "b": 2, "c": 3}

// ★ JSON  = 적어 준 글자 그대로 보관 (공백·중복 키·순서 그대로)
//   JSONB = 파싱해서 **정리해서** 보관 (공백 제거, 키 정렬, 중복 키는 뒤엣것만)
//   JSONB 는 저장할 때 한 번 일하고 읽을 때 빠릅니다. 색인도 걸립니다.
//   ★ 특별한 이유가 없으면 **JSONB.** JSON 은 원문을 그대로 보관해야 할 때만.
//
// ★★ JSONB 를 남용하지 마세요. 그러면 타입 검사도 CHECK 도 UNIQUE 도 못 씁니다.
//   01단원의 JSON 파일로 돌아가는 셈입니다.
//   **정해진 것은 칸으로, 진짜 제각각인 것만 JSONB 로.**


// ── 섹션 11: 배열과 UUID ──

await db.exec(`CREATE TABLE 작업자 (이름 TEXT, 자격 TEXT[])`);
await db.query(`INSERT INTO 작업자 VALUES ('김반장', ARRAY['용접','전기']), ('이반장', '{"지게차"}')`);
const 작업자들 = (await db.query(`SELECT * FROM 작업자 ORDER BY 이름`)).rows;
console.log(JSON.stringify(작업자들));
// 출력: [{"이름":"김반장","자격":["용접","전기"]},{"이름":"이반장","자격":["지게차"]}]

const 용접가능 = (await db.query(`SELECT 이름 FROM 작업자 WHERE '용접' = ANY(자격)`)).rows;
console.log("용접 가능:", 용접가능.map((줄) => 줄.이름).join(", "));
// 출력: 용접 가능: 김반장
const 첫자격 = (await db.query(`SELECT 자격[1] AS 첫번째 FROM 작업자 WHERE 이름 = '김반장'`)).rows[0];
console.log("자격[1] =", 첫자격.첫번째, "· SQL 배열은 1부터입니다");
// 출력: 자격[1] = 용접 · SQL 배열은 1부터입니다
// ★★ 배열도 남용하면 안 됩니다.
//   "작업자 한 명이 자격을 여러 개" 는 04단원에서 배울 **1:N 관계**입니다.
//   제대로 하려면 `작업자자격` 표를 따로 만듭니다.
//   배열은 표를 만들 만큼은 아닌 단순한 목록(태그 같은 것)에만 쓰세요.

const 새uuid = (await db.query(`SELECT gen_random_uuid() AS u`)).rows[0].u;
console.log("UUID 타입:", typeof 새uuid, "· 글자 수:", 새uuid.length, "· 모양:", 새uuid.replace(/[0-9a-f]/g, "x"));
// 출력: UUID 타입: string · 글자 수: 36 · 모양: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
const 크기 = (await db.query(`SELECT pg_column_size(gen_random_uuid()) AS u, pg_column_size(1::bigint) AS b`)).rows[0];
console.log(`UUID 는 ${크기.u}바이트 · BIGINT 는 ${크기.b}바이트`);
// 출력: UUID 는 16바이트 · BIGINT 는 8바이트

// ★ UUID 를 TEXT 로 저장하면 36바이트, UUID 타입으로 저장하면 **16바이트**입니다.
//   키로 쓸지 말지는 개념04 에서 정합니다.


// ============================================================
// 정리 — Postgres 타입과 자바스크립트
// ============================================================
//
//   SMALLINT / INT      number
//   BIGINT              number 또는 bigint  ★★ 9,007,199,254,740,991 넘으면 bigint
//                                          JSON.stringify 가 터집니다 → ::text
//   NUMERIC / DECIMAL   string          ★★ "1.50". 그냥 더하면 이어붙습니다
//   REAL / DOUBLE       number          오차 있음. 돈에 쓰지 마세요
//   BOOLEAN             boolean         ·   TEXT / VARCHAR  string
//   CHAR(n)             string          ★ 공백이 채워져서 옵니다. 쓰지 마세요
//   DATE                Date            ★★ UTC 자정. 하루 밀립니다 → ::text
//   TIMESTAMP           Date            ★ 시간대 정보 없음
//   TIMESTAMPTZ         Date            ★ 이걸 쓰세요
//   JSONB               object (파싱 필요 없음)  ·  TEXT[] 배열  ·  UUID string(36글자)
//
// ★ 무엇을 담을 때 무엇을 고르나
//
//   번호(기본키)              BIGINT                 INT 는 21억에서 찹니다
//   개수 · 나이 · 순서        INT
//   돈 · 단가 · 세금 · 비율   NUMERIC(15,2)          ★★★ 절대 REAL 금지
//   온도 · 진동 · 압력        REAL / DOUBLE          원래 근사값이라 괜찮습니다
//   이름 · 주소 · 메모        TEXT (+ CHECK)         VARCHAR(n) 대신
//   상태 · 구분               TEXT + CHECK IN (...)  개념03 에서 합니다
//   참/거짓                   BOOLEAN                INT 0/1 쓰지 마세요
//   생일 · 마감일 (날짜만)    DATE                   꺼낼 때 ::text
//   기록 시각 · 로그          TIMESTAMPTZ            ★★ TIMESTAMP 아님
//   설정처럼 모양이 제각각    JSONB                  남용 금지
//   외부 시스템의 식별자      UUID                   TEXT 로 담지 마세요
//
// ★ 헷갈리면 이 세 줄만 기억하세요.
//   ① 돈은 NUMERIC. 꺼내면 문자열입니다
//   ② 시각은 TIMESTAMPTZ
//   ③ 키는 BIGINT. 꺼낼 때 ::text


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 5 의 `generate_series(1, 1000)` 를 10000 으로 바꿔 보세요.
//                    REAL 합계는 얼마나 더 틀어지나요? NUMERIC 은요?
//
// ✏️ 직접 해보기 2 — 섹션 6 에서 `합 = 0` 을 `합 = ""` 로 바꾸면 어떻게 되나요? 왜 다를까요?
//
// ✏️ 직접 해보기 3 — 섹션 9 의 `SET TimeZone` 에 `'Europe/London'` 을 넣어 보세요.
//                    TIMESTAMPTZ 는 몇 시로 보이나요? 여름과 겨울이 다를까요?
//                    (힌트: 3월 15일과 12월 15일을 각각 넣어 보세요)
//
// ✏️ 직접 해보기 4 — `점검일` 을 DATE 대신 TEXT 로 만들면 어떤 게 안 되나요?
//                    `WHERE 점검일 > '2026-03-01'` 은요? `+ INTERVAL '7 days'` 는요?
//
// ✏️ 직접 해보기 5 — BIGINT 칸에 `9223372036854775808` (최대값 + 1) 을 넣어 보세요.
//                    어떤 에러 코드가 나오나요?
//
// ✏️ 직접 해보기 6 — JSONB 칸에 `'{"온도": "뜨거움"}'` 을 넣어 보세요. 들어가나요?
//                    `(값->>'온도')::int > 80` 을 하면 어떻게 되나요?
//                    ★ 이게 JSONB 를 남용하면 안 되는 이유입니다.


// ── 자주 하는 실수 ──

// [실수 1] 돈을 REAL / DOUBLE PRECISION 으로 저장
//   ★★★ 이 파일에서 가장 중요한 한 줄입니다. 돈은 NUMERIC 입니다.
//   1,000건만 쌓여도 틀어집니다. 나중에 타입을 바꾸면 이미 틀어진 값은 못 되돌립니다.

// [실수 2] NUMERIC 을 꺼내서 그냥 더함
//   `0 + "2.25"` = `"02.25"`. 에러가 안 나서 화면에 그대로 찍힙니다.
//   계산은 DB 에서 하거나, `Number()` 로 명시적으로 바꾸세요.

// [실수 3] BIGINT 를 res.json 으로 그냥 내보냄
//   작은 값일 때는 됩니다. 값이 커지는 순간 `Do not know how to serialize a BigInt`.
//   개발 환경에서는 절대 재현이 안 됩니다. `::text` 로 꺼내세요.

// [실수 4] TIMESTAMP 를 써 놓고 시간대를 나중에 붙이려고 함
//   저장된 값에는 "어느 시간대였는지" 가 없습니다. 복구할 방법이 없습니다.

// [실수 5] DATE 를 Date 객체로 받아서 `getDate()` 를 부름
//   UTC 자정으로 오기 때문에 음수 시간대에서 하루가 밀립니다.
//   `::text` 로 꺼내거나 `getUTCDate()` / `toISOString()` 을 쓰세요.

// [실수 6] CHAR(n) 을 씀
//   `"가나   "` 처럼 공백이 붙어 와서 `=== "가나"` 가 거짓이 됩니다. TEXT 를 쓰세요.

// [실수 7] "TEXT 는 느리니까 VARCHAR(50)" 이라고 믿음
//   Postgres 에서는 아닙니다. 저장 방식이 같습니다. TEXT + CHECK 가 더 유연합니다.

await db.close();
