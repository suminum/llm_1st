// ============================================================
// 04단원 · 개념 03 — 외래키로 잇습니다
// ------------------------------------------------------------
// 실행: node 개념03_외래키로_잇습니다.js
// ============================================================
//
// 개념02 에서 「점검대장」 한 표를 넷으로 나눴습니다. 라인 · 설비 · 작업자 · 점검기록.
// 나누고 나니 새 문제가 생겼습니다.
//
//   점검기록에 적힌 설비번호 3번이 **진짜 있는 설비인가?**
//
// 한 표였을 때는 물어볼 필요가 없었습니다. 설비 이름이 그 줄에 같이 있었으니까요.
// 나누고 나서는 **아무도 안 지켜 줍니다.** 그걸 지켜 주는 것이 **외래키(foreign key)** 입니다.
//
//   ① 고아 데이터  ② 어떻게 거는가, 언제 못 거는가  ③ ON DELETE 다섯 가지
//   ④ CASCADE 가 왜 위험한가  ⑤ 외래키에는 색인이 자동으로 안 생깁니다

import { PGlite } from "@electric-sql/pglite";
const db = await PGlite.create();

// 이 파일에서 계속 쓰는 잔손입니다. 막히는 것을 보여 주는 게 목적이라 SQLSTATE 만 찍습니다.
async function 해보기(설명, 할일) {
  try {
    await 할일();
    console.log(`${설명} → 통과`);
  } catch (에러) {
    console.log(`${설명} → 막힘 (${에러.code})`);
  }
}

async function 세기(표, 조건 = "TRUE") {
  const 결과 = await db.query(`SELECT count(*)::int AS 수 FROM ${표} WHERE ${조건}`);
  return 결과.rows[0].수;
}


// ── 섹션 1: ★ 외래키가 없으면 — 고아 데이터 ──

// 개념02 가 만들어 낸 모양 그대로입니다. 단, **외래키는 아직 안 걸었습니다.**
await db.exec(`
  CREATE TABLE 설비 (
    설비번호 INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인코드 TEXT NOT NULL,
    도입년도 INT  NOT NULL
  );
  CREATE TABLE 점검기록 (
    점검번호 INT  PRIMARY KEY,
    설비번호 INT  NOT NULL,      -- ★ 그냥 숫자 칸입니다. 아무 숫자나 들어갑니다
    점검일   DATE NOT NULL,
    결과     TEXT NOT NULL,
    점수     INT
  );
  INSERT INTO 설비 VALUES
    (1, '컨베이어 1호', 'A', 2015), (2, '프레스 1호',   'A', 2019),
    (3, '용접로봇 1호', 'B', 2021), (4, '검사기 1호',   'B', 2018),
    (5, '포장기 1호',   'C', 2022);
  INSERT INTO 점검기록 VALUES
    (1, 1, '2024-01-05', '정상', 92), (2, 1, '2024-02-05', '정상', 88),
    (3, 1, '2024-03-05', '주의', 71), (4, 2, '2024-01-12', '정상', 95),
    (5, 2, '2024-02-12', '정상', 90), (6, 3, '2024-01-20', '정상', 97),
    (7, 3, '2024-02-20', '주의', 68), (8, 4, '2024-01-25', '정상', 85),
    (9, 5, '2024-02-28', '정상', 91);
`);

console.log("설비", await 세기("설비"), "대 · 점검기록", await 세기("점검기록"), "줄");
// 출력: 설비 5 대 · 점검기록 9 줄

// 이제 사고를 냅니다. 설비 999번은 없습니다. 그런데 999번의 점검기록을 넣어 봅니다.
await 해보기("없는 설비번호 999 로 점검기록 넣기", () =>
  db.exec(`INSERT INTO 점검기록 VALUES (10, 999, '2024-03-01', '정상', 80)`));
// 출력: 없는 설비번호 999 로 점검기록 넣기 → 통과

// ★★★ 그냥 들어갔습니다. 에러도 경고도 없습니다. 눈으로 확인해 봅니다.
console.log("설비 999번:", await 세기("설비", "설비번호 = 999"), "대");
// 출력: 설비 999번: 0 대
console.log("설비 999번의 점검기록:", await 세기("점검기록", "설비번호 = 999"), "줄");
// 출력: 설비 999번의 점검기록: 1 줄

// ★ 설비는 없는데 그 설비의 점검기록은 있습니다. 이런 줄을 **고아 데이터(orphan)** 라고
//   부릅니다. 부모가 없는 자식이라는 뜻입니다.
//   세는 쿼리는 NOT EXISTS 로 씁니다. (JOIN 으로도 되지만 JOIN 은 05단원 것입니다)
const 고아수 = await db.query(`
  SELECT count(*)::int AS 수 FROM 점검기록 기록
  WHERE NOT EXISTS (SELECT 1 FROM 설비 WHERE 설비.설비번호 = 기록.설비번호)
`);

console.log("고아 데이터:", 고아수.rows[0].수, "줄");
// 출력: 고아 데이터: 1 줄

// ★★★ 이게 왜 무서운가 — 에러가 안 납니다. 로그도 안 남습니다. 테스트도 통과합니다.
//   **몇 달 뒤 보고서를 뽑을 때** 발견됩니다. 건수 합이 안 맞거나, 목록 화면의 설비 이름
//   칸이 비어 나옵니다. 그때 "언제부터였지?" 를 알아내야 하는데 알 방법이 없습니다.
// ★ 개념01 정리표의 "관계를 표현 못 함 → 04단원 외래키" 가 이것입니다.


// ── 섹션 2: 외래키를 겁니다 ──

// 문법은 두 가지입니다. 하는 일은 똑같습니다.
//   ① 칸 뒤에 짧게 붙이는 형태 :  설비번호 INT REFERENCES 설비(설비번호)
//   ② 표 끝에 따로 쓰는 형태   :  FOREIGN KEY (설비번호) REFERENCES 설비(설비번호)
//   ★ ② 를 꼭 써야 하는 경우가 있습니다. 칸이 **둘 이상** 인 외래키입니다.
//        FOREIGN KEY (라인코드, 설비번호) REFERENCES 설비(라인코드, 설비번호)

// ★ 걸기 전에 알아야 할 것 (1) — 부모 쪽 칸은 PRIMARY KEY 나 UNIQUE 여야 합니다.
await 해보기("설비(이름) 을 가리키는 외래키 — 이름은 PK 가 아닙니다", () =>
  db.exec(`CREATE TABLE 시험표 (설비이름 TEXT REFERENCES 설비(이름))`));
// 출력: 설비(이름) 을 가리키는 외래키 — 이름은 PK 가 아닙니다 → 막힘 (42830)

try {
  await db.exec(`CREATE TABLE 시험표 (설비이름 TEXT REFERENCES 설비(이름))`);
} catch (에러) {
  console.log("메시지:", 에러.message);
  // 출력: 메시지: there is no unique constraint matching given keys for referenced table "설비"
}

// ★ 가리키는 쪽이 **한 줄로 딱 정해져야** 검사를 합니다. 이름이 같은 설비가 둘이면
//   "어느 쪽?" 이 되니까요. 부모 칸에 UNIQUE 라도 붙어 있어야 합니다.

// ★★ 걸기 전에 알아야 할 것 (2) — 이미 고아가 있으면 못 겁니다.
//   지금 점검기록에는 아까 넣은 999 번 줄이 그대로 있습니다.
await 해보기("고아가 남은 표에 외래키 걸기", () =>
  db.exec(`ALTER TABLE 점검기록 ADD CONSTRAINT 점검기록_설비_fk
             FOREIGN KEY (설비번호) REFERENCES 설비(설비번호)`));
// 출력: 고아가 남은 표에 외래키 걸기 → 막힘 (23503)

// ★★★ 운영에서 진짜 겪는 일입니다. "외래키를 안 걸었네, 지금이라도 걸자" 하고 ALTER 를
//   날리면 이렇게 막힙니다. 몇 년치 데이터에 고아가 쌓여 있기 때문입니다.
//   순서가 정해져 있습니다. **고아를 먼저 치우고, 그다음에 겁니다.**
const 치운것 = await db.query(`
  DELETE FROM 점검기록 기록
  WHERE NOT EXISTS (SELECT 1 FROM 설비 WHERE 설비.설비번호 = 기록.설비번호)
`);

console.log("치운 고아:", 치운것.affectedRows, "줄");
// 출력: 치운 고아: 1 줄

await 해보기("고아를 치운 뒤 다시 외래키 걸기", () =>
  db.exec(`ALTER TABLE 점검기록 ADD CONSTRAINT 점검기록_설비_fk
             FOREIGN KEY (설비번호) REFERENCES 설비(설비번호)`));
// 출력: 고아를 치운 뒤 다시 외래키 걸기 → 통과

// ★ 진짜 운영에서는 고아를 그냥 지우면 안 됩니다. 먼저 **따로 떠 놓고** 무슨 데이터였는지
//   확인하세요. 쓰레기일 수도 있고, 부모를 잘못 지운 사고의 흔적일 수도 있습니다.

// 이제 아까 통과했던 그 INSERT 를 똑같이 다시 해 봅니다.
await 해보기("다시 999 번으로 점검기록 넣기", () =>
  db.exec(`INSERT INTO 점검기록 VALUES (10, 999, '2024-03-01', '정상', 80)`));
// 출력: 다시 999 번으로 점검기록 넣기 → 막힘 (23503)

// ★★ 막혔습니다. SQLSTATE `23503` — 외래키 위반입니다.
//   같은 SQL 인데 결과가 뒤집혔습니다. 표에 규칙이 생겼기 때문입니다.

// 짧은 형태(①)도 실제로 써 봅니다. 담당자 칸을 붙입니다.
await db.exec(`
  CREATE TABLE 작업자 (사번 INT PRIMARY KEY, 이름 TEXT NOT NULL);
  INSERT INTO 작업자 VALUES (101,'김반장'), (102,'이기사'), (103,'박주임'), (104,'최사원');
  ALTER TABLE 점검기록 ADD COLUMN 담당사번 INT REFERENCES 작업자(사번);
`);

await 해보기("없는 사번 777 을 담당자로 넣기", () =>
  db.exec(`UPDATE 점검기록 SET 담당사번 = 777 WHERE 점검번호 = 1`));
// 출력: 없는 사번 777 을 담당자로 넣기 → 막힘 (23503)

// ── 걸린 제약을 확인합니다. ★★ 여기에 PG18 함정이 하나 있습니다 ──
const 제약전부 = await db.query(`
  SELECT conname AS 이름, contype AS 종류 FROM pg_constraint
  WHERE conrelid = '점검기록'::regclass ORDER BY contype, conname
`);

for (const 줄 of 제약전부.rows) console.log(`· ${줄.종류} — ${줄.이름}`);
// 출력: · f — 점검기록_담당사번_fkey
// 출력: · f — 점검기록_설비_fk
// 출력: · n — 점검기록_결과_not_null
// 출력: · n — 점검기록_설비번호_not_null
// 출력: · n — 점검기록_점검번호_not_null
// 출력: · n — 점검기록_점검일_not_null
// 출력: · p — 점검기록_pkey

// ★★ NOT NULL 이 `contype='n'` 으로 같이 잡힙니다. PostgreSQL 17 까지는 안 들어왔습니다.
//   18 부터 들어옵니다. 예전 자료의 쿼리를 그대로 쓰면 개수가 달라집니다.
//   ★ 제약을 조회할 때는 종류를 좁혀 주세요.
//        contype IN ('c','u','p','f')   -- CHECK · UNIQUE · PRIMARY KEY · FOREIGN KEY
const 외래키만 = await db.query(`
  SELECT conname AS 이름 FROM pg_constraint
  WHERE conrelid = '점검기록'::regclass AND contype = 'f' ORDER BY conname
`);

for (const 줄 of 외래키만.rows) console.log(`외래키: ${줄.이름}`);
// 출력: 외래키: 점검기록_담당사번_fkey
// 출력: 외래키: 점검기록_설비_fk


// ── 섹션 3: ★★ 부모를 지우면 자식은 어떻게 되나 — ON DELETE 다섯 가지 ──

// 설비를 폐기했습니다. 그 설비의 점검기록 40줄은 어떻게 됩니까?
// 답이 하나가 아니어서, 외래키를 걸 때 **정책을 골라 적습니다.** 전부 직접 돌려 봅니다.
await db.exec(`
  CREATE TABLE 실험설비 (설비번호 INT PRIMARY KEY, 이름 TEXT NOT NULL);
  INSERT INTO 실험설비 VALUES (1,'가'), (2,'나'), (3,'다'), (4,'라'), (5,'마'), (9,'미배정');
  CREATE TABLE 기록_막기       (점검번호 INT PRIMARY KEY, 설비번호 INT REFERENCES 실험설비(설비번호) ON DELETE RESTRICT);
  CREATE TABLE 기록_기본       (점검번호 INT PRIMARY KEY, 설비번호 INT REFERENCES 실험설비(설비번호) ON DELETE NO ACTION);
  CREATE TABLE 기록_같이삭제   (점검번호 INT PRIMARY KEY, 설비번호 INT REFERENCES 실험설비(설비번호) ON DELETE CASCADE);
  CREATE TABLE 기록_널로       (점검번호 INT PRIMARY KEY, 설비번호 INT REFERENCES 실험설비(설비번호) ON DELETE SET NULL);
  CREATE TABLE 기록_기본값으로 (점검번호 INT PRIMARY KEY, 설비번호 INT DEFAULT 9 REFERENCES 실험설비(설비번호) ON DELETE SET DEFAULT);
  INSERT INTO 기록_막기 VALUES (1,1);
  INSERT INTO 기록_기본 VALUES (1,2);
  INSERT INTO 기록_같이삭제 VALUES (1,3), (2,3), (3,3);
  INSERT INTO 기록_널로 VALUES (1,4);
  INSERT INTO 기록_기본값으로 VALUES (1,5);
`);

await 해보기("RESTRICT  — 설비 1 지우기", () => db.exec(`DELETE FROM 실험설비 WHERE 설비번호 = 1`));
// 출력: RESTRICT  — 설비 1 지우기 → 막힘 (23001)
await 해보기("NO ACTION — 설비 2 지우기", () => db.exec(`DELETE FROM 실험설비 WHERE 설비번호 = 2`));
// 출력: NO ACTION — 설비 2 지우기 → 막힘 (23503)

// ★★★ 둘 다 막혔는데 **SQLSTATE 가 다릅니다.**
//     RESTRICT → 23001 (foreign_key_violation 이 아닙니다) / NO ACTION → 23503
//   `e.code === "23503"` 만 보고 분기하는 코드는 RESTRICT 를 놓칩니다. 자주 나는 버그입니다.
console.log("같이삭제 — 지우기 전 자식:", await 세기("기록_같이삭제"), "줄");
// 출력: 같이삭제 — 지우기 전 자식: 3 줄
await 해보기("CASCADE   — 설비 3 지우기", () => db.exec(`DELETE FROM 실험설비 WHERE 설비번호 = 3`));
// 출력: CASCADE   — 설비 3 지우기 → 통과
console.log("같이삭제 — 지운 뒤 자식:", await 세기("기록_같이삭제"), "줄");
// 출력: 같이삭제 — 지운 뒤 자식: 0 줄

await 해보기("SET NULL  — 설비 4 지우기", () => db.exec(`DELETE FROM 실험설비 WHERE 설비번호 = 4`));
// 출력: SET NULL  — 설비 4 지우기 → 통과
const 널로 = await db.query(`SELECT 설비번호 FROM 기록_널로 WHERE 점검번호 = 1`);
console.log("널로 — 자식의 설비번호:", 널로.rows[0].설비번호);
// 출력: 널로 — 자식의 설비번호: null

await 해보기("SET DEFAULT — 설비 5 지우기", () => db.exec(`DELETE FROM 실험설비 WHERE 설비번호 = 5`));
// 출력: SET DEFAULT — 설비 5 지우기 → 통과
const 기본값으로 = await db.query(`SELECT 설비번호 FROM 기록_기본값으로 WHERE 점검번호 = 1`);
console.log("기본값으로 — 자식의 설비번호:", 기본값으로.rows[0].설비번호);
// 출력: 기본값으로 — 자식의 설비번호: 9

// ★ DEFAULT 9 ('미배정') 로 바뀌었습니다. "기록을 버리긴 아까우니 미배정에 모아 둔다" 입니다.

// ── ★ SET DEFAULT 의 함정 — 그 기본값이 부모에 없으면 ──
await db.exec(`
  CREATE TABLE 실험설비2 (설비번호 INT PRIMARY KEY);
  INSERT INTO 실험설비2 VALUES (5);
  CREATE TABLE 기록_기본값없음 (점검번호 INT PRIMARY KEY,
    설비번호 INT DEFAULT 77 REFERENCES 실험설비2(설비번호) ON DELETE SET DEFAULT);
  INSERT INTO 기록_기본값없음 VALUES (1, 5);
`);

await 해보기("SET DEFAULT 인데 기본값 77 이 부모에 없음", () =>
  db.exec(`DELETE FROM 실험설비2 WHERE 설비번호 = 5`));
// 출력: SET DEFAULT 인데 기본값 77 이 부모에 없음 → 막힘 (23503)

// ★★ 자식을 77 로 바꾸려는 순간 **그 77 이 또 외래키 검사에 걸립니다.** 그래서 23503 이고,
//   부모 삭제 자체가 통째로 실패합니다.
//   SET DEFAULT 를 쓸 거면 **그 기본값에 해당하는 부모 줄을 반드시 미리 만들어 두세요.**

// ── ★ SET NULL 의 함정 — 그 칸이 NOT NULL 이면 ──
await db.exec(`
  CREATE TABLE 실험설비3 (설비번호 INT PRIMARY KEY);
  INSERT INTO 실험설비3 VALUES (5);
  CREATE TABLE 기록_널못됨 (점검번호 INT PRIMARY KEY,
    설비번호 INT NOT NULL REFERENCES 실험설비3(설비번호) ON DELETE SET NULL);
  INSERT INTO 기록_널못됨 VALUES (1, 5);
`);

await 해보기("SET NULL 인데 그 칸이 NOT NULL", () =>
  db.exec(`DELETE FROM 실험설비3 WHERE 설비번호 = 5`));
// 출력: SET NULL 인데 그 칸이 NOT NULL → 막힘 (23502)

// ★ 23502 — NOT NULL 위반. 표는 아무 말 없이 만들어지고 **지울 때가 되어서야** 터집니다.

// ── ★★ RESTRICT 와 NO ACTION 의 진짜 차이 ──
// 위에서는 둘 다 막혔습니다. 차이는 **검사 시점** 입니다.
//   NO ACTION → 검사를 트랜잭션 끝까지 **미룰 수 있습니다**
//   RESTRICT  → 미루라고 해도 **그 자리에서 막습니다**
// `DEFERRABLE INITIALLY DEFERRED` 를 붙이면 차이가 드러납니다.
// (트랜잭션 자체는 07단원 것입니다. 여기서는 문법만 쓰고 넘어갑니다)
await db.exec(`
  CREATE TABLE 미룸설비 (설비번호 INT PRIMARY KEY);
  INSERT INTO 미룸설비 VALUES (1), (2);
  CREATE TABLE 미룸_기본 (점검번호 INT PRIMARY KEY,
    설비번호 INT REFERENCES 미룸설비(설비번호) ON DELETE NO ACTION DEFERRABLE INITIALLY DEFERRED);
  CREATE TABLE 미룸_막기 (점검번호 INT PRIMARY KEY,
    설비번호 INT REFERENCES 미룸설비(설비번호) ON DELETE RESTRICT  DEFERRABLE INITIALLY DEFERRED);
  INSERT INTO 미룸_기본 VALUES (1, 1);
  INSERT INTO 미룸_막기 VALUES (1, 2);
`);

// 한 트랜잭션 안에서 **부모를 먼저 지우고 자식을 지웁니다.**
// 중간 한순간만 보면 고아지만, 끝나고 보면 아무 문제가 없습니다.
await 해보기("NO ACTION + 미루기 — 부모 먼저, 자식 나중", () =>
  db.transaction(async (트) => {
    await 트.query(`DELETE FROM 미룸설비 WHERE 설비번호 = 1`);
    await 트.query(`DELETE FROM 미룸_기본 WHERE 설비번호 = 1`);
  }));
// 출력: NO ACTION + 미루기 — 부모 먼저, 자식 나중 → 통과

await 해보기("RESTRICT + 미루기 — 똑같이 해 보기", () =>
  db.transaction(async (트) => {
    await 트.query(`DELETE FROM 미룸설비 WHERE 설비번호 = 2`);
    await 트.query(`DELETE FROM 미룸_막기 WHERE 설비번호 = 2`);
  }));
// 출력: RESTRICT + 미루기 — 똑같이 해 보기 → 막힘 (23001)

console.log("남은 미룸설비:", await 세기("미룸설비"), "줄");
// 출력: 남은 미룸설비: 1 줄

// ★★ 이게 둘의 진짜 차이입니다. NO ACTION 은 "끝날 때 앞뒤가 맞으면 된다" 라서 1번이
//   지워졌고, RESTRICT 는 "자식이 달려 있으면 그 순간 안 된다" 라서 2번이 남았습니다.
//   ★ RESTRICT 가 더 엄격합니다. 아무것도 안 적으면 기본값인 NO ACTION 이 걸립니다.

// ── ON UPDATE 도 같은 다섯 가지가 있습니다 ──
await db.exec(`
  CREATE TABLE 라인코드표 (라인코드 TEXT PRIMARY KEY);
  INSERT INTO 라인코드표 VALUES ('A');
  CREATE TABLE 설비_코드추적 (설비번호 INT PRIMARY KEY,
    라인코드 TEXT REFERENCES 라인코드표(라인코드) ON UPDATE CASCADE);
  INSERT INTO 설비_코드추적 VALUES (1, 'A');
  UPDATE 라인코드표 SET 라인코드 = 'A1' WHERE 라인코드 = 'A';
`);

const 따라감 = await db.query(`SELECT 라인코드 FROM 설비_코드추적 WHERE 설비번호 = 1`);
console.log("부모 키를 A → A1 로 바꾸니 자식은:", 따라감.rows[0].라인코드);
// 출력: 부모 키를 A → A1 로 바꾸니 자식은: A1

// ★ ON UPDATE 는 덜 씁니다. 기본키를 바꾸는 일 자체가 드물기 때문입니다.


// ── 섹션 4: ★ CASCADE 의 위험 ──

// CASCADE 는 편합니다. 그래서 위험합니다.
// 04단원의 도착점인 네 표를 CASCADE 로 이어 놓고 실제로 사고를 내 봅니다.
await db.exec(`
  DROP TABLE 점검기록;
  DROP TABLE 설비;
  CREATE TABLE 라인 (라인코드 TEXT PRIMARY KEY, 이름 TEXT NOT NULL, 동 TEXT NOT NULL);
  CREATE TABLE 설비 (
    설비번호 INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인코드 TEXT REFERENCES 라인(라인코드) ON DELETE CASCADE,
    도입년도 INT  NOT NULL
  );
  CREATE TABLE 점검기록 (
    점검번호 INT  PRIMARY KEY,
    설비번호 INT  REFERENCES 설비(설비번호) ON DELETE CASCADE,
    점검일   DATE NOT NULL,
    결과     TEXT NOT NULL,
    점수     INT,
    담당사번 INT  REFERENCES 작업자(사번)
  );
`);

const 데이터넣기 = `
  DELETE FROM 라인;
  INSERT INTO 라인 VALUES ('A','조립1라인','1동'), ('B','가공2라인','1동'), ('C','포장3라인','2동'), ('D','신설4라인','2동');
  INSERT INTO 설비 VALUES
    (1,'컨베이어 1호','A',2015), (2,'프레스 1호','A',2019),
    (3,'용접로봇 1호','B',2021), (4,'검사기 1호','B',2018), (5,'포장기 1호','C',2022);
  INSERT INTO 점검기록 VALUES
    (1,1,'2024-01-05','정상',92,101), (2,1,'2024-02-05','정상',88,101), (3,1,'2024-03-05','주의',71,102),
    (4,2,'2024-01-12','정상',95,101), (5,2,'2024-02-12','정상',90,103),
    (6,3,'2024-01-20','정상',97,102), (7,3,'2024-02-20','주의',68,102),
    (8,4,'2024-01-25','정상',85,103), (9,5,'2024-02-28','정상',91,104);
`;
await db.exec(데이터넣기);

// ★ DELETE 한 줄이 몇 줄을 지울지 **미리 세어 보는 것**이 먼저입니다.
console.log("설비 1 을 지우면 같이 사라질 점검기록:", await 세기("점검기록", "설비번호 = 1"), "줄");
// 출력: 설비 1 을 지우면 같이 사라질 점검기록: 3 줄
console.log("지우기 전 점검기록:", await 세기("점검기록"), "줄");
// 출력: 지우기 전 점검기록: 9 줄
await db.exec(`DELETE FROM 설비 WHERE 설비번호 = 1`);
console.log("설비 1 대를 지운 뒤 점검기록:", await 세기("점검기록"), "줄");
// 출력: 설비 1 대를 지운 뒤 점검기록: 6 줄

// ★★ 설비 한 줄을 지웠는데 점검기록 세 줄이 무더기로 사라졌습니다.
//   DELETE 문에는 '점검기록' 이라는 글자가 없었습니다.

// ── ★★★ 더 무서운 것: 연쇄가 이어집니다 ──
//   라인 → 설비 → 점검기록. 3단으로 CASCADE 가 걸려 있습니다. 라인 하나를 지우면?
await db.exec(데이터넣기);

console.log("되돌림 — 라인", await 세기("라인"), "· 설비", await 세기("설비"), "· 점검기록", await 세기("점검기록"));
// 출력: 되돌림 — 라인 4 · 설비 5 · 점검기록 9
await db.exec(`DELETE FROM 라인 WHERE 라인코드 = 'A'`);
console.log("라인 A 하나 지운 뒤 — 라인", await 세기("라인"), "· 설비", await 세기("설비"), "· 점검기록", await 세기("점검기록"));
// 출력: 라인 A 하나 지운 뒤 — 라인 3 · 설비 3 · 점검기록 4

// ★★★ **라인 한 줄을 지웠는데 설비 두 대와 점검기록 다섯 줄이 사라졌습니다.**
//   지운 사람은 자기가 무엇을 지웠는지 모릅니다. 그리고 **되돌릴 방법이 없습니다.**
//   현장 사고는 대개 이렇습니다 — "안 쓰는 라인 정리할게요" → 3년치 점검 이력이 통째로.
// ★ 지우기 전에 반드시 세어 보세요. 한 줄이면 됩니다.
const 라인B파장 = await db.query(`
  SELECT count(*)::int AS 수 FROM 점검기록 기록
  WHERE EXISTS (SELECT 1 FROM 설비
                WHERE 설비.설비번호 = 기록.설비번호 AND 설비.라인코드 = 'B')
`);

console.log("라인 B 를 지우면 사라질 점검기록:", 라인B파장.rows[0].수, "줄");
// 출력: 라인 B 를 지우면 사라질 점검기록: 3 줄

// ── ★ 실무 조언 ──
//   사람 데이터 · 돈 데이터에는 CASCADE 를 걸지 마세요. 회원 · 주문 · 결제 · 급여 ·
//   점검 이력 같은 것들입니다. 대신 둘 중 하나를 씁니다.
//     ① RESTRICT 로 막고 **손으로 정리**합니다. 귀찮은 게 안전한 겁니다
//     ② **소프트 삭제** — 진짜로 안 지우고 '지워진 것으로 표시' 만 합니다
await db.exec(`
  ALTER TABLE 설비 ADD COLUMN 삭제여부 BOOLEAN NOT NULL DEFAULT FALSE;
  UPDATE 설비 SET 삭제여부 = TRUE WHERE 설비번호 = 4;   -- 지우는 대신 표시만
`);

console.log("소프트 삭제 — 살아 있는 설비:", await 세기("설비", "삭제여부 = FALSE"), "대");
// 출력: 소프트 삭제 — 살아 있는 설비: 2 대
console.log("소프트 삭제 — 점검기록은:", await 세기("점검기록"), "줄 (그대로)");
// 출력: 소프트 삭제 — 점검기록은: 4 줄 (그대로)

// ★ 소프트 삭제의 대가도 있습니다. **모든 조회에 `WHERE 삭제여부 = FALSE`** 를 빠뜨리면
//   안 됩니다. 한 군데만 빠뜨려도 지운 설비가 화면에 다시 나타납니다.
// ★ CASCADE 는 주문 → 주문상세처럼 **부모 없이는 의미가 없는 자식**에만 씁니다.


// ── 섹션 5: ★ 외래키에는 색인이 자동으로 안 생깁니다 ──

// PRIMARY KEY 를 걸면 색인이 자동으로 생깁니다. 외래키도 그럴 것 같습니다. 확인해 봅니다.
const 자식색인 = await db.query(`SELECT indexname FROM pg_indexes WHERE tablename = '점검기록' ORDER BY indexname`);
for (const 줄 of 자식색인.rows) console.log(`자식(점검기록) 색인: ${줄.indexname}`);
// 출력: 자식(점검기록) 색인: 점검기록_pkey
const 부모색인 = await db.query(`SELECT indexname FROM pg_indexes WHERE tablename = '설비' ORDER BY indexname`);
for (const 줄 of 부모색인.rows) console.log(`부모(설비) 색인: ${줄.indexname}`);
// 출력: 부모(설비) 색인: 설비_pkey

// ★★ 자식 표에는 `_pkey` 하나뿐입니다. 설비번호 칸에도 담당사번 칸에도 색인이 없습니다.
// ★ 헷갈리는 지점입니다. 정리하면
//     부모 쪽(설비.설비번호)     — 색인 **있습니다**. PRIMARY KEY 니까요
//     자식 쪽(점검기록.설비번호) — 색인 **없습니다**. 아무도 안 만들어 줍니다
// ★ 없으면 뭐가 문제인가 — **부모를 지울 때** 느려집니다. 설비 한 대를 지우려면
//   "이 설비를 가리키는 점검기록이 있나?" 를 확인해야 하는데, 자식 쪽에 색인이 없으면
//   **점검기록을 처음부터 끝까지 훑습니다.** 10만 줄로 재 봅니다.
await db.exec(`
  CREATE TABLE 설비_대량 (설비번호 INT PRIMARY KEY, 이름 TEXT NOT NULL);
  INSERT INTO 설비_대량 SELECT 번호, '설비' || 번호 FROM generate_series(1, 220) AS 번호;
  CREATE TABLE 점검_대량 (점검번호 INT PRIMARY KEY,
    설비번호 INT REFERENCES 설비_대량(설비번호), 점수 INT);
  INSERT INTO 점검_대량 SELECT 번호, (번호 % 200) + 1, 번호 % 100 FROM generate_series(1, 100000) AS 번호;
  ANALYZE;
`);

console.log("점검_대량:", await 세기("점검_대량"), "줄");
// 출력: 점검_대량: 100000 줄

// 설비 201~220 번에는 점검기록이 하나도 없습니다. 그래도 지우려면 자식 표를 확인해야 합니다.
async function 재기(할일) {
  const 시작 = performance.now();
  await 할일();
  return performance.now() - 시작;
}

function 중앙값(값들) {
  const 정렬 = [...값들].sort((가, 나) => 가 - 나);
  return 정렬[Math.floor(정렬.length / 2)];
}

const 색인없이 = [];
for (let 번호 = 201; 번호 <= 207; 번호 += 1) {
  색인없이.push(await 재기(() => db.query(`DELETE FROM 설비_대량 WHERE 설비번호 = ${번호}`)));
}

await db.exec(`CREATE INDEX 점검_대량_설비번호_idx ON 점검_대량(설비번호)`);

const 색인후 = [];
for (let 번호 = 208; 번호 <= 214; 번호 += 1) {
  색인후.push(await 재기(() => db.query(`DELETE FROM 설비_대량 WHERE 설비번호 = ${번호}`)));
}

const 없이ms = 중앙값(색인없이);
const 후ms = 중앙값(색인후);

console.log(`색인 없이 부모 1줄 삭제: ${없이ms.toFixed(1)} ms`);
// 출력?: 색인 없이 부모 1줄 삭제: 30.1 ms
console.log(`색인 걸고 부모 1줄 삭제: ${후ms.toFixed(1)} ms`);
// 출력?: 색인 걸고 부모 1줄 삭제: 2.7 ms
console.log("색인이 더 빠른가:", 후ms < 없이ms);
// 출력: 색인이 더 빠른가: true

// ★ **왜** 빨라지는지는 06단원에서 봅니다. 여기서는 "외래키를 걸었으면 자식 쪽 칸에
//   색인을 직접 만들어라" 만 가져가면 됩니다. 부모를 지울 일이 없는 표라면 안 걸어도 됩니다.
//        CREATE INDEX 점검기록_설비번호_idx ON 점검기록(설비번호);


// ── 섹션 6: 외래키를 안 쓰는 회사도 있습니다 ──

// 이유가 있습니다 — 대량 적재가 느려짐 / 샤딩·분산이면 못 걺 / 마이그레이션이 까다로움 /
// 애플리케이션이 이미 검사함. 전부 맞는 말입니다. ★ 그런데 **대가가 있습니다.**
await db.exec(`
  CREATE TABLE 점검_외래키없음 (점검번호 INT PRIMARY KEY, 설비번호 INT NOT NULL, 결과 TEXT NOT NULL);
  INSERT INTO 점검_외래키없음 VALUES
    (1, 1, '정상'), (2, 2, '정상'), (3, 3, '주의'),
    (4, 901, '정상'),   -- 배치가 잘못 돌아 들어간 줄
    (5, 902, '정상');   -- 코드 한 군데에서 검사를 빠뜨린 줄
`);

const 정기결과 = await db.query(`
  SELECT count(*)::int AS 고아수 FROM 점검_외래키없음 기록
  WHERE NOT EXISTS (SELECT 1 FROM 설비_대량 WHERE 설비_대량.설비번호 = 기록.설비번호)
`);

console.log("정기 점검 — 고아:", 정기결과.rows[0].고아수, "줄");
// 출력: 정기 점검 — 고아: 2 줄

// ★★ 고아 데이터는 **반드시 생깁니다.** 코드 한 군데만 빠뜨려도, 배치 한 번만 잘못 돌아도.
//   사람이 짠 검사는 언젠가 빠집니다. 데이터베이스의 검사는 안 빠집니다.
// ★ 균형 잡힌 결론 — **기본은 겁니다. 재 보고 진짜 문제가 되면 그때 뺍니다.**
//   처음부터 빼지 마세요. 빼는 건 언제든 됩니다. 뺐다면 위 쿼리를 **하루 한 번** 돌리고
//   0 이 아니면 알림이 오게 해 두세요. 몇 달이 아니라 하루 만에 발견합니다.

// ── MySQL 은 여기가 다릅니다 ──
//   ★ **MyISAM 엔진은 외래키를 조용히 무시합니다.** REFERENCES 를 적어도 에러 없이
//     만들어지고, 검사는 안 합니다 → 반드시 InnoDB 를 쓰세요 (5.5부터 기본값입니다)
//   · MySQL 은 외래키를 걸면 자식 쪽 색인을 **자동으로** 만들어 줍니다. PostgreSQL 과 반대입니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다


// ============================================================
// 정리 — ON DELETE 다섯 가지
// ============================================================
//
//   정책          부모를 지우면 자식은                 막히면 SQLSTATE
//   ──────────────────────────────────────────────────────────────────
//   RESTRICT      아무 일도 안 남 (부모가 안 지워짐)     23001  ★ 23503 아님
//   NO ACTION     아무 일도 안 남 (기본값)               23503
//   CASCADE       자식 줄이 **같이 삭제됨**              (안 막힘 · 그래서 위험)
//   SET NULL      자식의 그 칸이 **NULL 로** 바뀜        23502  (칸이 NOT NULL 이면)
//   SET DEFAULT   자식의 그 칸이 **DEFAULT 값으로** 바뀜  23503  (기본값이 부모에 없으면)
//
//   ★ RESTRICT vs NO ACTION — DEFERRABLE INITIALLY DEFERRED 를 걸면 갈립니다
//       NO ACTION : 트랜잭션 끝까지 미뤄져 통과 / RESTRICT : 미뤄도 즉시 막힘
//
//   ★ 그 밖에 기억할 것
//       · 부모 칸은 PRIMARY KEY 나 UNIQUE 여야 합니다        (아니면 42830)
//       · 이미 고아가 있으면 외래키를 못 겁니다              (23503 → 치우고 다시)
//       · 자식 쪽 칸에는 색인이 **자동으로 안 생깁니다**      (직접 CREATE INDEX)
//       · 제약 조회는 contype IN ('c','u','p','f') 로       (PG18 은 NOT NULL 이 'n')
//       · ON UPDATE 에도 같은 다섯 가지가 있습니다 (덜 씁니다)


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 1 에서 999 대신 -1 이나 0 을 넣어 보세요.
//                    외래키를 걸기 전과 건 뒤가 다른가요?
//
// ✏️ 직접 해보기 2 — 점검기록의 설비번호에 NULL 을 넣어 보세요. 외래키가 걸렸는데도 통과합니다.
//                    왜일까요? (힌트: NULL 은 "값이 없다" 입니다. 없는 것은 가리킬 것도 없습니다)
//                    → 반드시 있어야 하면 NOT NULL 을 같이 걸어야 합니다
//
// ✏️ 직접 해보기 3 — 섹션 4 의 CASCADE 를 RESTRICT 로 바꿔 보세요.
//                    라인 A 를 지우려면 몇 단계를 손으로 해야 하나요? 불편한가요, 안전한가요?
//
// ✏️ 직접 해보기 4 — 섹션 3 의 기록_기본값으로 에서 DEFAULT 9 를 지우면
//                    (기본값이 NULL 이 됩니다) SET DEFAULT 는 어떻게 되나요?
//
// ✏️ 직접 해보기 5 — 섹션 5 의 자식을 10만 대신 100만으로 늘려 보세요.
//                    색인 없는 삭제가 10배 느려지나요? 색인 있는 쪽은요?
//
// ✏️ 직접 해보기 6 — 작업자 표에 소속라인 칸을 만들고 라인(라인코드) 를 가리키게 해 보세요.
//                    ON DELETE 는 무엇으로 하시겠습니까? 사람 데이터입니다.


// ── 자주 하는 실수 ──

// [실수 1] CASCADE 를 '편해서' 검
//   지울 때 에러가 안 나니 편합니다. 그래서 사고가 납니다. 섹션 4 에서 라인 하나를 지웠더니
//   점검기록 다섯 줄이 사라졌습니다. 진짜 운영이면 다섯 줄이 아니라 3년치입니다.
//   ★ 부모 없이는 의미가 없는 자식(주문상세, 첨부파일)에만 쓰세요.

// [실수 2] 외래키 칸에 색인을 안 검
//   "외래키 걸었으니 색인도 생겼겠지" — 안 생깁니다. 평소에는 모르다가 **부모를 지울 때**
//   갑자기 느려집니다. ★ MySQL 은 자동으로 만들어 주니, 옮겨 온 사람이 더 자주 당합니다.

// [실수 3] RESTRICT 와 NO ACTION 이 같은 줄 앎
//   SQLSTATE 가 다릅니다. **23001 과 23503** 입니다. `if (e.code === "23503")` 로만
//   분기하면 RESTRICT 위반이 그냥 500 에러로 나갑니다. DEFERRABLE 이면 동작도 갈립니다.

// [실수 4] SET DEFAULT 를 걸어 놓고 기본값 줄을 안 만듦
//   `DEFAULT 0` 인데 부모에 0번 줄이 없으면 부모 삭제가 23503 으로 실패합니다.
//   **처음 지울 때** 터집니다. ★ '미배정' 같은 줄을 부모에 먼저 만들어 두세요.

// [실수 5] 고아가 있는 표에 외래키를 걸려다 실패하고 포기함
//   ALTER 가 23503 으로 막히면 "안 되나 보다" 하고 덮습니다. 고아는 계속 늘어납니다.
//   ★ 순서가 있습니다. ① 고아를 따로 떠 놓고 ② 확인하고 ③ 치우고 ④ 겁니다.

// [실수 6] pg_constraint 를 그냥 세다가 개수가 안 맞음
//   PG18 부터 NOT NULL 도 `contype='n'` 으로 들어옵니다. 예전 스크립트가 틀린 값을 냅니다.
//   ★ `contype IN ('c','u','p','f')` 로 좁히세요.

await db.close();
