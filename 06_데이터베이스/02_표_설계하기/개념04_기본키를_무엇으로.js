// ============================================================
// 02단원 · 개념 04 — 기본키를 무엇으로
// ------------------------------------------------------------
// 실행: node 개념04_기본키를_무엇으로.js
// ============================================================
//
// 개념03 에서 PRIMARY KEY 를 "NOT NULL + UNIQUE" 라고만 하고 넘어갔습니다.
// 이제 제대로 봅니다.
//
// 기본키를 정하는 일은 표 설계에서 **가장 되돌리기 어려운 결정**입니다.
// 칸은 나중에 추가할 수 있습니다. 타입도 (아프지만) 바꿀 수 있습니다.
// 그런데 기본키는 다른 표들이 그 값을 붙들고 있어서 바꾸기가 아주 어렵습니다.
//
// 이 파일에서 실제로 재 볼 것들입니다.
//
//   ① SERIAL 에 값을 직접 넣으면 **나중에 충돌합니다** — 재현합니다
//   ② 지운 번호는 재활용되지 않습니다 — 재 봅니다
//   ③ 롤백해도 번호는 안 돌아옵니다 — 재 봅니다
//   ④ 자연키는 바뀝니다 — 바뀔 때 무슨 일이 나는지 봅니다

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();


// ── 섹션 1: PRIMARY KEY 가 하는 일 ──

// 기본키는 **이 줄 하나를 정확히 가리키는 값**입니다.
// 세 가지를 한꺼번에 합니다.

await db.exec(`
  CREATE TABLE 설비 (
    설비번호 INT PRIMARY KEY,
    이름 TEXT NOT NULL
  );
`);

await db.exec(`INSERT INTO 설비 VALUES (1, '컨베이어 1호')`);

const 시도 = async (설명, sql) => {
  try {
    await db.query(sql);
    console.log(`${설명} — 들어감`);
  } catch (에러) {
    console.log(`${설명} — ${에러.code}`);
  }
};

await 시도("NULL 을 넣으면", `INSERT INTO 설비 VALUES (NULL, '프레스 1호')`);
// 출력: NULL 을 넣으면 — 23502
await 시도("같은 번호를 또 넣으면", `INSERT INTO 설비 VALUES (1, '프레스 1호')`);
// 출력: 같은 번호를 또 넣으면 — 23505

// 그리고 세 번째, 눈에 안 보이는 일을 합니다.

const 색인 = await db.query(`SELECT indexname FROM pg_indexes WHERE tablename = '설비'`);
console.log("자동으로 생긴 색인:", 색인.rows.map((줄) => 줄.indexname).join(", "));
// 출력: 자동으로 생긴 색인: 설비_pkey

// ★ PRIMARY KEY = NOT NULL + UNIQUE + **색인(index)**
//
//   색인 덕분에 `WHERE 설비번호 = 1` 이 아주 빠릅니다.
//   100만 줄이 있어도 전부 훑지 않습니다. 06단원에서 재 봅니다.
//
// ★★ 표 하나에 PRIMARY KEY 는 **하나뿐**입니다.
//   "이것도 유일한데" 싶은 칸은 UNIQUE 를 걸면 됩니다. UNIQUE 는 여러 개 됩니다.
//
// ★ 기본키가 없는 표도 만들 수는 있습니다. 그런데 만들지 마세요.
//   똑같은 줄이 두 개 있으면 하나만 지울 방법이 없습니다.


// ── 섹션 2: 번호를 자동으로 매기는 두 가지 방법 ──

// 설비번호를 사람이 일일이 정하면 곧 충돌합니다. 자동으로 매깁니다.
// Postgres 에는 방법이 둘 있습니다.

await db.exec(`CREATE TABLE 설비_시리얼 (설비번호 SERIAL PRIMARY KEY, 이름 TEXT NOT NULL)`);
await db.exec(`CREATE TABLE 설비_아이덴티티 (설비번호 INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 이름 TEXT NOT NULL)`);

// 겉보기에는 똑같이 동작합니다. 속을 보면 다릅니다.

const 시리얼정의 = (await db.query(`
  SELECT column_default, is_identity FROM information_schema.columns
  WHERE table_name = '설비_시리얼' AND column_name = '설비번호'
`)).rows[0];

const 아이덴티티정의 = (await db.query(`
  SELECT column_default, is_identity, identity_generation FROM information_schema.columns
  WHERE table_name = '설비_아이덴티티' AND column_name = '설비번호'
`)).rows[0];

console.log("SERIAL 의 기본값:", 시리얼정의.column_default);
// 출력: SERIAL 의 기본값: nextval('"설비_시리얼_설비번호_seq"'::regclass)
console.log("SERIAL 이 IDENTITY 인가:", 시리얼정의.is_identity);
// 출력: SERIAL 이 IDENTITY 인가: NO
console.log("IDENTITY 의 기본값:", 아이덴티티정의.column_default);
// 출력: IDENTITY 의 기본값: null
console.log("IDENTITY 종류:", 아이덴티티정의.identity_generation);
// 출력: IDENTITY 종류: ALWAYS

// ★★ SERIAL 은 사실 **타입이 아닙니다.** 줄임말입니다.
//
//     설비번호 SERIAL
//   는 Postgres 가 이렇게 풀어 씁니다.
//     ① 시퀀스(sequence)라는 별도 물건을 만든다  — 설비_시리얼_설비번호_seq
//     ② 칸을 INT NOT NULL 로 만든다
//     ③ 그 칸의 DEFAULT 를 nextval(시퀀스) 로 건다
//
//   시퀀스는 "다음 번호를 뽑아 주는 기계" 입니다. 표와 별개로 존재합니다.

const 시퀀스들 = await db.query(`SELECT sequence_name FROM information_schema.sequences ORDER BY sequence_name`);
console.log("만들어진 시퀀스:", 시퀀스들.rows.map((줄) => 줄.sequence_name).join(", "));
// 출력: 만들어진 시퀀스: 설비_시리얼_설비번호_seq

// ★ IDENTITY 도 속으로는 시퀀스를 씁니다. 다만 **칸에 붙어 있습니다.**
//   그래서 표를 지우면 같이 지워지고, 아무나 값을 못 넣게 막을 수 있습니다.
//
//   ★★ IDENTITY 는 SQL 표준입니다. Postgres 10 부터 됩니다.
//     새로 만드는 표는 IDENTITY 를 쓰세요. SERIAL 은 오래된 코드에서 만납니다.
//
//   왜 그런지를 지금부터 실제로 봅니다.


// ── 섹션 3: ★★★ SERIAL 에 값을 직접 넣으면 나중에 터집니다 ──

// 데이터를 옮기거나, 테스트 데이터를 만들 때 번호를 직접 적는 일이 흔합니다.

await db.exec(`INSERT INTO 설비_시리얼 (이름) VALUES ('컨베이어 1호')`);       // 자동: 1번
await db.exec(`INSERT INTO 설비_시리얼 VALUES (2, '프레스 1호')`);            // 직접: 2번
await db.exec(`INSERT INTO 설비_시리얼 VALUES (3, '용접로봇 1호')`);          // 직접: 3번

const 지금까지 = (await db.query(`SELECT 설비번호, 이름 FROM 설비_시리얼 ORDER BY 설비번호`)).rows;
console.log("여기까지는 멀쩡합니다:", 지금까지.map((줄) => 줄.설비번호).join(", "));
// 출력: 여기까지는 멀쩡합니다: 1, 2, 3

// 그런데 시퀀스는 그 사이에 아무것도 모릅니다. 물어봅니다.

const 시퀀스값 = (await db.query(`SELECT last_value FROM 설비_시리얼_설비번호_seq`)).rows[0];
console.log("시퀀스가 마지막으로 준 번호:", 시퀀스값.last_value);
// 출력: 시퀀스가 마지막으로 준 번호: 1

// ★★★ 표에는 3번까지 있는데 시퀀스는 아직 **1** 입니다.
//   직접 넣은 2, 3 을 시퀀스는 본 적이 없습니다.
//
// 이 상태에서 다음 설비를 자동으로 넣으면 어떻게 될까요.

await 시도("자동으로 다음 설비 넣기", `INSERT INTO 설비_시리얼 (이름) VALUES ('절단기 1호')`);
// 출력: 자동으로 다음 설비 넣기 — 23505

// ★★★ **중복 키 에러입니다.** 시퀀스가 2번을 줬는데 이미 2번이 있습니다.
//
//   이 사고의 무서운 점은 **시간이 지나서 터진다**는 것입니다.
//     · 데이터를 옮긴 날에는 멀쩡합니다
//     · 며칠 뒤 사용자가 새 설비를 등록할 때 처음 터집니다
//     · 그때는 아무도 이관 작업을 떠올리지 못합니다
//
//   그리고 한 번만 터지는 게 아닙니다. 3번도 걸립니다. 4번이 되어야 지나갑니다.
//
// ★ 고치는 법: 시퀀스를 표의 최대값에 맞춥니다.

const 맞춤 = (await db.query(`
  SELECT setval('설비_시리얼_설비번호_seq', (SELECT max(설비번호) FROM 설비_시리얼)) AS 맞춘값
`)).rows[0];
console.log("setval 로 맞춘 값:", 맞춤.맞춘값);
// 출력: setval 로 맞춘 값: 3

await 시도("다시 자동으로 넣기", `INSERT INTO 설비_시리얼 (이름) VALUES ('절단기 1호')`);
// 출력: 다시 자동으로 넣기 — 들어감

const 고친뒤 = (await db.query(`SELECT 설비번호 FROM 설비_시리얼 ORDER BY 설비번호`)).rows;
console.log("고친 뒤:", 고친뒤.map((줄) => 줄.설비번호).join(", "));
// 출력: 고친 뒤: 1, 2, 3, 4

// ★★ 데이터를 옮긴 뒤에는 **반드시 setval 을 하세요.**
//   이걸 잊어서 나는 장애가 정말 흔합니다.


// ── 섹션 4: IDENTITY 는 애초에 못 넣게 막습니다 ──

await 시도("IDENTITY 칸에 99 를 직접", `INSERT INTO 설비_아이덴티티 VALUES (99, '몰래')`);
// 출력: IDENTITY 칸에 99 를 직접 — 428C9

// ★ 428C9 = "IDENTITY 칸에 직접 값을 넣을 수 없다".
//   섹션 3 의 사고가 **애초에 일어나지 않습니다.** 이게 IDENTITY 를 쓰는 이유입니다.
//
// 정말 필요하면 명시적으로 뚫을 수 있습니다.

await 시도("OVERRIDING SYSTEM VALUE 를 붙이면", `INSERT INTO 설비_아이덴티티 OVERRIDING SYSTEM VALUE VALUES (99, '이관용')`);
// 출력: OVERRIDING SYSTEM VALUE 를 붙이면 — 들어감

// ★ 길고 눈에 띄는 문장을 일부러 적어야 뚫립니다. **실수로는 안 뚫립니다.**
//   (이걸 쓴 뒤에도 시퀀스는 안 따라옵니다. setval 은 여전히 해야 합니다)
//
// ★ 두 종류가 있습니다.
//     GENERATED ALWAYS AS IDENTITY      직접 넣기 금지 (OVERRIDING 으로만)  ← 보통 이걸 씁니다
//     GENERATED BY DEFAULT AS IDENTITY  직접 넣어도 됨 (SERIAL 과 비슷)

await db.exec(`CREATE TABLE 설비_기본 (설비번호 INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, 이름 TEXT)`);
await 시도("BY DEFAULT 에 직접 넣기", `INSERT INTO 설비_기본 VALUES (5, '직접')`);
// 출력: BY DEFAULT 에 직접 넣기 — 들어감

// ★ BIGINT 로 하려면 이렇게 씁니다.
//     설비번호 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
//   (SERIAL 의 BIGINT 판은 BIGSERIAL 입니다)
//
//   ★★ 개념02 에서 본 대로 **키는 BIGINT** 를 권합니다. INT 는 21억에서 찹니다.


// ── 섹션 5: 방금 넣은 번호를 알아내기 ──

// 자동으로 매겨진 번호는 넣기 전에는 모릅니다. RETURNING 으로 받습니다.

const 받은것 = await db.query(`INSERT INTO 설비_아이덴티티 (이름) VALUES ('세척기 1호') RETURNING 설비번호, 이름`);
console.log("RETURNING 으로 받은 것:", JSON.stringify(받은것.rows[0]));
// 출력: RETURNING 으로 받은 것: {"설비번호":1,"이름":"세척기 1호"}

// ★ RETURNING 은 INSERT · UPDATE · DELETE 에 다 붙습니다. Postgres 의 좋은 점입니다.
//   `RETURNING *` 으로 줄 전체를 받을 수도 있습니다.
//
// ── MySQL 은 여기가 다릅니다 ──
//   · RETURNING 이 없습니다. 넣은 뒤 LAST_INSERT_ID() 를 따로 부릅니다
//   · SERIAL / IDENTITY 대신 AUTO_INCREMENT 입니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다


// ── 섹션 6: ★ 지운 번호는 재활용되나 ──

// 많이 궁금해하는 부분입니다. 실제로 재 봅니다.

await db.exec(`CREATE TABLE 재활용시험 (번호 INT GENERATED ALWAYS AS IDENTITY, 이름 TEXT)`);
await db.exec(`INSERT INTO 재활용시험 (이름) VALUES ('가'), ('나'), ('다')`);
await db.exec(`DELETE FROM 재활용시험 WHERE 번호 = 3`);
await db.exec(`INSERT INTO 재활용시험 (이름) VALUES ('라')`);

const 재활용 = (await db.query(`SELECT 번호, 이름 FROM 재활용시험 ORDER BY 번호`)).rows;
console.log("3번을 지우고 새로 넣으면:", 재활용.map((줄) => `${줄.번호}:${줄.이름}`).join(" "));
// 출력: 3번을 지우고 새로 넣으면: 1:가 2:나 4:라

// ★ **3번은 영영 비어 있습니다.** 4번이 나왔습니다.
//   시퀀스는 뒤로 돌아가지 않습니다.
//
// ★★ 롤백해도 마찬가지입니다. 실패한 트랜잭션이 쓴 번호도 안 돌아옵니다.

await db.exec(`CREATE TABLE 롤백시험 (번호 INT GENERATED ALWAYS AS IDENTITY, 이름 TEXT)`);
await db.exec(`INSERT INTO 롤백시험 (이름) VALUES ('가')`);

try {
  await db.transaction(async (tx) => {
    await tx.query(`INSERT INTO 롤백시험 (이름) VALUES ('실패할것')`);
    throw new Error("일부러 실패");
  });
} catch {
  // 롤백됐습니다
}

await db.exec(`INSERT INTO 롤백시험 (이름) VALUES ('나')`);

const 롤백뒤 = (await db.query(`SELECT 번호, 이름 FROM 롤백시험 ORDER BY 번호`)).rows;
console.log("롤백 뒤 다음 번호는:", 롤백뒤.map((줄) => `${줄.번호}:${줄.이름}`).join(" "));
// 출력: 롤백 뒤 다음 번호는: 1:가 3:나

// ★★★ 2번이 사라졌습니다. 롤백된 INSERT 도 시퀀스는 이미 써 버렸습니다.
//
//   왜 이렇게 만들었을까요? **되돌리면 동시에 들어온 사람과 부딪히기 때문**입니다.
//   시퀀스는 트랜잭션 밖에서 돕니다. 그래야 여러 명이 동시에 넣어도 안 겹칩니다.
//
//   ★ 그래서 이렇게 기억하세요.
//     자동 번호는 **유일함만 보장합니다.** 연속을 보장하지 않습니다.
//
//   ★★ 그러니 자동 번호를 "몇 건인가" 로 쓰면 안 됩니다.
//     "송장번호가 1000번이니 1000건 팔았구나" 는 틀립니다.
//     세는 것은 `count(*)` 로 하세요.
//
// ★ SQLite 를 쓰던 사람은 여기서 놀랍니다.
//   SQLite 의 AUTOINCREMENT 없는 rowid 는 **빈 번호를 재활용합니다.** Postgres 는 안 합니다.
//
// ★ TRUNCATE 도 시퀀스를 안 되돌립니다. 되돌리려면 명시해야 합니다.

await db.exec(`TRUNCATE 재활용시험`);
await db.exec(`INSERT INTO 재활용시험 (이름) VALUES ('새로')`);
const 트렁 = (await db.query(`SELECT 번호 FROM 재활용시험`)).rows[0];
console.log("TRUNCATE 뒤 번호:", 트렁.번호);
// 출력: TRUNCATE 뒤 번호: 5

await db.exec(`TRUNCATE 재활용시험 RESTART IDENTITY`);
await db.exec(`INSERT INTO 재활용시험 (이름) VALUES ('진짜새로')`);
const 리스타트 = (await db.query(`SELECT 번호 FROM 재활용시험`)).rows[0];
console.log("RESTART IDENTITY 뒤 번호:", 리스타트.번호);
// 출력: RESTART IDENTITY 뒤 번호: 1


// ── 섹션 7: UUID 를 키로 ──

await db.exec(`
  CREATE TABLE 점검 (
    점검번호 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    설비번호 INT NOT NULL,
    내용 TEXT NOT NULL
  );
`);

const 새점검 = await db.query(`INSERT INTO 점검 (설비번호, 내용) VALUES (1, '벨트 장력 확인') RETURNING 점검번호`);
console.log("UUID 키 길이:", 새점검.rows[0].점검번호.length, "· 타입:", typeof 새점검.rows[0].점검번호);
// 출력: UUID 키 길이: 36 · 타입: string

const 크기비교 = (await db.query(`
  SELECT pg_column_size(gen_random_uuid()) AS uuid바이트, pg_column_size(1::bigint) AS bigint바이트
`)).rows[0];
console.log(`UUID ${크기비교.uuid바이트}바이트 vs BIGINT ${크기비교.bigint바이트}바이트`);
// 출력: UUID 16바이트 vs BIGINT 8바이트

// ★ UUID 를 키로 쓰면 좋은 점
//   · **DB 에 묻지 않고 애플리케이션에서 미리 만들 수 있습니다** — 이게 가장 큽니다
//     여러 서버가, 심지어 브라우저가 만들어도 안 겹칩니다
//   · 주소창에 노출돼도 옆 번호를 추측할 수 없습니다 (`/설비/1` → `/설비/2` 를 못 함)
//   · 여러 DB 를 합칠 때 번호가 안 부딪힙니다
//
// ★ 나쁜 점
//   · 2배 큽니다 (16 vs 8바이트). 색인도 2배가 됩니다
//   · **순서가 없습니다.** 무작위라 색인의 여기저기에 흩어져 들어갑니다
//     줄이 많아지면 이게 눈에 띄게 느려집니다
//   · 사람이 못 읽습니다. "설비 3번" 대신 "설비 a3f9-..." 라고 말해야 합니다
//   · 로그와 화면이 지저분해집니다
//
// ★★ 언제 쓰나
//   · 여러 곳에서 동시에 만드는 데이터 (오프라인 앱, 여러 서버, 브라우저)
//   · 번호를 밖에 노출해야 하는데 추측당하면 곤란한 것
//   그 외에는 **BIGINT IDENTITY 가 무난합니다.**
//
//   ★ 절충안: 안에서는 BIGINT 를 쓰고, 밖에 보여 줄 때만 UUID 칸을 따로 두는 방법도 있습니다.
//
// ★ UUID 를 TEXT 로 저장하지 마세요. 36바이트가 됩니다. UUID 타입은 16바이트입니다.


// ── 섹션 8: 자연키 vs 인조키 ──

// **자연키(natural key)** — 업무에 원래 있는 값. 사번, 설비번호, 사업자등록번호, 주민번호
// **인조키(surrogate key)** — 업무와 상관없이 만든 번호. IDENTITY, UUID
//
// 자연키가 좋아 보입니다. 이미 있는 값이니 표가 깔끔합니다.
// 그런데 현장에서는 이런 일이 벌어집니다.

await db.exec(`
  CREATE TABLE 작업자_자연키 (
    사번 TEXT PRIMARY KEY,
    이름 TEXT NOT NULL
  );
  CREATE TABLE 배정_자연키 (
    사번 TEXT REFERENCES 작업자_자연키(사번),
    설비 TEXT
  );
`);

await db.exec(`INSERT INTO 작업자_자연키 VALUES ('A-001', '김반장')`);
await db.exec(`INSERT INTO 배정_자연키 VALUES ('A-001', '컨베이어 1호')`);

// 3년 뒤, 인사팀이 사번 체계를 바꿉니다. `A-001` → `2026-A-001`.

await 시도("사번 체계를 바꾸면", `UPDATE 작업자_자연키 SET 사번 = '2026-A-001' WHERE 사번 = 'A-001'`);
// 출력: 사번 체계를 바꾸면 — 23503

// ★★★ 23503 = 외래키 위반. **다른 표가 그 값을 붙들고 있어서 못 바꿉니다.**
//
//   `REFERENCES` 는 "이 값은 저 표에 있어야 한다" 는 제약입니다. 04단원에서 제대로 합니다.
//   여기서는 이것만 보세요. **자연키가 바뀌면 그 값을 쓰는 모든 표를 같이 고쳐야 합니다.**
//
//   실제 현장에서 자연키가 바뀌는 이유들입니다. 전부 실제로 일어납니다.
//     · 사번 체계 개편 (회사 합병, 계열사 통합)
//     · 설비번호를 라인 재배치하면서 다시 붙임
//     · 사업자등록번호가 바뀜 (법인 전환)
//     · 처음에 "절대 안 바뀐다" 던 코드값이 바뀜
//     · 잘못 입력한 사번을 고쳐야 함  ← 이게 제일 흔합니다
//
// ★ 인조키로 하면 이렇습니다.

await db.exec(`
  CREATE TABLE 작업자 (
    작업자번호 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    사번 TEXT NOT NULL UNIQUE,
    이름 TEXT NOT NULL
  );
`);

await db.exec(`INSERT INTO 작업자 (사번, 이름) VALUES ('A-001', '김반장')`);
await 시도("인조키 표에서 사번 바꾸기", `UPDATE 작업자 SET 사번 = '2026-A-001' WHERE 사번 = 'A-001'`);
// 출력: 인조키 표에서 사번 바꾸기 — 들어감

const 바뀐것 = (await db.query(`SELECT 작업자번호, 사번, 이름 FROM 작업자`)).rows[0];
console.log("작업자번호는 그대로:", JSON.stringify(바뀐것));
// 출력: 작업자번호는 그대로: {"작업자번호":1,"사번":"2026-A-001","이름":"김반장"}

// ★★ 사번은 바뀌었는데 **작업자번호는 그대로**입니다.
//   다른 표들은 작업자번호를 붙들고 있으니 아무 영향이 없습니다.
//   그리고 사번에 UNIQUE 를 걸어 두었으니 중복도 여전히 막힙니다.
//
// ★ 정리
//     인조키(BIGINT IDENTITY) 를 기본키로  ← 기본 선택
//     자연키(사번)는 UNIQUE 로              ← 규칙은 그대로 지켜집니다
//
//   "업무 값을 키로 쓰지 마라" 가 아니라 **"업무 값은 바뀔 수 있으니 키로 삼지 마라"** 입니다.
//
// ★★ 주민등록번호는 아예 저장하지 마세요. 키로도, 칸으로도요.
//   법적으로 아주 까다롭고, 유출되면 회사가 흔들립니다.


// ── 섹션 9: 복합 기본키 ──

// 칸 두 개를 묶어서 기본키로 삼을 수도 있습니다.

await db.exec(`
  CREATE TABLE 일일생산 (
    설비번호 INT NOT NULL,
    생산일 DATE NOT NULL,
    수량 INT NOT NULL CHECK (수량 >= 0),
    PRIMARY KEY (설비번호, 생산일)
  );
`);

await db.exec(`
  INSERT INTO 일일생산 VALUES (1,'2026-03-15',100), (1,'2026-03-16',120), (2,'2026-03-15',80)
`);

await 시도("같은 설비·같은 날을 또", `INSERT INTO 일일생산 VALUES (1,'2026-03-15',999)`);
// 출력: 같은 설비·같은 날을 또 — 23505
await 시도("같은 설비·다른 날", `INSERT INTO 일일생산 VALUES (1,'2026-03-17',90)`);
// 출력: 같은 설비·다른 날 — 들어감

const 복합정의 = (await db.query(`
  SELECT pg_get_constraintdef(oid) AS 정의 FROM pg_constraint
  WHERE conrelid = '일일생산'::regclass AND contype = 'p'
`)).rows[0];
console.log("복합 기본키:", 복합정의.정의);
// 출력: 복합 기본키: PRIMARY KEY ("설비번호", "생산일")

// ★ "설비 하나가 하루에 한 줄" 이라는 업무 규칙이 표 정의에 박혔습니다. 좋습니다.
//
// ★★ 그런데 복합 기본키는 불편한 점이 있습니다.
//   · 다른 표에서 이 줄을 가리키려면 **칸을 두 개** 들고 다녀야 합니다
//   · 프로그램에서 `/일일생산/1` 처럼 주소를 만들 수 없습니다
//   · 칸이 하나 더 늘면(교대조 같은 것) 기본키를 통째로 바꿔야 합니다
//
//   ★ 그래서 실무에서는 이렇게 하는 경우가 많습니다.
//       생산번호 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   ← 인조키
//       UNIQUE (설비번호, 생산일)                                    ← 규칙은 UNIQUE 로
//
//     기본키는 단순하게 두고, 업무 규칙은 UNIQUE 로 지킵니다.
//     "설비 하나가 하루에 한 줄" 은 똑같이 지켜집니다.
//
//   ★★ 복합 기본키가 자연스러운 자리도 있습니다.
//     04단원에서 배울 **N:M 연결표** (작업자–자격 같은 것) 가 그렇습니다.


// ============================================================
// 정리 — 기본키를 무엇으로 할 것인가
// ============================================================
//
//   방법                              언제 쓰나                    주의
//   ──────────────────────────────────────────────────────────────────────────
//   BIGINT GENERATED ALWAYS AS        ★ 기본 선택                  값을 직접 못 넣음
//     IDENTITY                                                     (그게 장점)
//   SERIAL / BIGSERIAL                오래된 코드에서 만남          ★ setval 잊으면 터짐
//   UUID DEFAULT gen_random_uuid()    여러 곳에서 만들 때           2배 큼, 순서 없음
//   자연키 (사번 등)                   거의 쓰지 않음                ★ 바뀌면 전부 고쳐야 함
//   복합 기본키                        N:M 연결표                   가리키기 불편
//
//   자동 번호에 대해 재 본 것
//   ──────────────────────────────────────────────────────────────────────────
//   지운 번호 재활용?                  ★ 안 합니다 (SQLite 와 다름)
//   롤백하면 번호가 돌아오나?           ★ 안 돌아옵니다
//   TRUNCATE 하면?                     안 돌아옵니다 (RESTART IDENTITY 를 붙여야)
//   그래서 번호는 연속인가?             **아닙니다.** 유일할 뿐입니다
//
//   에러 코드
//   ──────────────────────────────────────────────────────────────────────────
//   23505    중복 (PK · UNIQUE)
//   23502    NULL (PK 칸을 비움)
//   23503    외래키 위반 (다른 표가 붙들고 있음) — 04단원
//   428C9    IDENTITY ALWAYS 칸에 직접 값을 넣음
//
// ★ 세 줄 요약
//   ① 새 표는 `BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`
//   ② 업무 값(사번·설비코드)은 기본키가 아니라 **UNIQUE** 로
//   ③ 데이터를 옮긴 뒤에는 **setval** 을 잊지 마세요


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 3 을 IDENTITY 로 다시 해 보세요.
//                    `OVERRIDING SYSTEM VALUE` 로 2, 3 을 넣은 뒤 자동으로 넣으면
//                    SERIAL 과 똑같이 터지나요? (힌트: 시퀀스는 여전히 모릅니다)
//
// ✏️ 직접 해보기 2 — `SELECT nextval('설비_시리얼_설비번호_seq')` 를 세 번 불러 보세요.
//                    INSERT 를 안 했는데도 번호가 올라가나요?
//
// ✏️ 직접 해보기 3 — `ALTER SEQUENCE ... RESTART WITH 100` 으로 시퀀스를 100부터
//                    시작하게 해 보세요. 무엇에 쓸 수 있을까요?
//
// ✏️ 직접 해보기 4 — UUID 를 기본키로 쓰는 표와 BIGINT 를 쓰는 표에
//                    각각 1만 건을 넣고 시간을 재 보세요. 차이가 나나요?
//                    ★ 값은 기계마다 다릅니다. 판정은 `UUID쪽ms > BIGINT쪽ms` 로 찍으세요
//
// ✏️ 직접 해보기 5 — 섹션 8 의 `배정_자연키` 에 `ON UPDATE CASCADE` 를 붙여 보세요.
//                    사번을 바꿀 수 있게 되나요? 그러면 자연키를 써도 될까요?
//                    (힌트: 되긴 됩니다. 그런데 표가 열 개면 열 개가 다 같이 바뀝니다)
//
// ✏️ 직접 해보기 6 — 기본키가 없는 표를 만들고 완전히 똑같은 줄을 두 개 넣어 보세요.
//                    그중 하나만 지울 수 있나요? (힌트: WHERE 에 뭘 쓰죠?)
//
// ✏️ 직접 해보기 7 — 복합 기본키 `(설비번호, 생산일)` 에 교대조를 넣어
//                    `(설비번호, 생산일, 교대조)` 로 바꾸려면 어떻게 하나요?
//                    이미 데이터가 있으면 어떻게 되나요?


// ── 자주 하는 실수 ──

// [실수 1] 데이터를 옮기고 setval 을 안 함
//   ★★★ 이 파일에서 가장 자주 나는 사고입니다.
//   그날은 멀쩡하고 며칠 뒤에 23505 로 터집니다. 원인을 못 찾습니다.
//   ★ IDENTITY ALWAYS 를 쓰면 애초에 이 상황이 안 생깁니다.

// [실수 2] 자동 번호를 "몇 건" 으로 씀
//   롤백·삭제 때문에 번호는 건너뜁니다. 세는 것은 count(*) 로 하세요.

// [실수 3] 사번·설비코드를 기본키로 삼음
//   "이건 절대 안 바뀝니다" 는 3년 안에 틀립니다.
//   기본키는 인조키로, 업무 값은 UNIQUE 로.

// [실수 4] UUID 를 TEXT 로 저장
//   36바이트가 됩니다. UUID 타입은 16바이트입니다. 색인 크기가 두 배 넘게 차이납니다.

// [실수 5] 기본키 없는 표를 만듦
//   똑같은 줄이 두 개 생기면 하나만 지울 방법이 없습니다.
//   복제·백업 도구도 기본키가 없으면 제대로 못 씁니다.

// [실수 6] 키를 INT 로 잡음
//   21억은 생각보다 빨리 찹니다. 그리고 다 찬 다음에 바꾸려면 표를 통째로 다시 씁니다.
//   ★ 처음부터 BIGINT 로 잡으세요. 4바이트 아끼려다 새벽에 일어납니다.

await db.close();
