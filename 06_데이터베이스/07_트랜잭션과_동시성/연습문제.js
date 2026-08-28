// ============================================================
// 07단원 · 연습문제 — 트랜잭션과 동시성
// ------------------------------------------------------------
// 실행: node 연습문제.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ============================================================
//
// 각 문제의 `// TODO:` 를 채우세요. 채우면 아래 채점이 "통과" 로 바뀝니다.
// 지금 실행하면 전부 "아직" 이 나옵니다. 정상입니다.
//
// ★ 순서대로 푸세요. 뒤로 갈수록 어렵습니다. 마지막 셋은 [도전] 입니다.
// ★ 막히면 개념01~05 를 다시 보세요. 문제마다 어느 개념인지 적어 뒀습니다.
// ★ 답을 보기 전에 **직접 돌려 보세요.** 동시성은 눈으로 봐야 이해됩니다.

import pg from "pg";

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434,
  user: "factory",
  password: "secret",
  database: "factory_db",
  application_name: "unit07-exercise",
};

let 가;

try {
  가 = new pg.Client(접속정보);
  await 가.connect();
} catch (에러) {
  console.log("Docker Postgres 에 못 붙었습니다. 먼저 이걸 실행하세요:"); // 검증무시: Docker 가 없을 때만 나오는 안내입니다
  console.log("  docker compose up -d"); // 검증무시:
  console.log(`  (원인: ${에러.message})`); // 검증무시:
  process.exit(0);
}

await 가.query("CREATE SCHEMA IF NOT EXISTS 단원07");
await 가.query("SET search_path TO 단원07");

async function 새연결() {
  const 연결 = new pg.Client(접속정보);
  await 연결.connect();
  await 연결.query("SET search_path TO 단원07");
  return 연결;
}

const 나 = await 새연결();
const 다 = await 새연결();
const 모든연결 = [가, 나, 다];
const 잠깐 = (밀리초) => new Promise((끝) => setTimeout(끝, 밀리초));
const 한값 = async (문장, 값들 = []) => Object.values((await 가.query(문장, 값들)).rows[0])[0];

await 가.query("DROP TABLE IF EXISTS 연습_점검, 연습_설비, 연습_재고, 연습_큐, 연습_당직 CASCADE");
await 가.query("CREATE TABLE 연습_설비 (번호 INT PRIMARY KEY, 이름 TEXT NOT NULL, 상태 TEXT NOT NULL)");
await 가.query("CREATE TABLE 연습_점검 (번호 SERIAL PRIMARY KEY, 설비번호 INT NOT NULL REFERENCES 연습_설비(번호), 내용 TEXT NOT NULL)");
await 가.query("CREATE TABLE 연습_재고 (부품번호 INT PRIMARY KEY, 이름 TEXT NOT NULL, 수량 INT NOT NULL, 버전 INT NOT NULL DEFAULT 0)");
await 가.query("CREATE TABLE 연습_큐 (번호 INT PRIMARY KEY, 내용 TEXT NOT NULL, 상태 TEXT NOT NULL DEFAULT '대기', 처리자 TEXT)");
await 가.query("CREATE TABLE 연습_당직 (번호 INT PRIMARY KEY, 이름 TEXT NOT NULL, 당직여부 BOOLEAN NOT NULL)");

async function 초기화() {
  for (const 연결 of 모든연결) {
    try {
      await 연결.query("ROLLBACK");
    } catch {
      // 열린 트랜잭션이 없으면 넘어갑니다
    }
  }

  await 가.query("TRUNCATE 연습_점검, 연습_설비, 연습_재고, 연습_큐, 연습_당직 RESTART IDENTITY CASCADE");
  await 가.query("INSERT INTO 연습_설비 VALUES (1, '컨베이어 1호', '가동'), (2, '프레스 1호', '가동')");
  await 가.query("INSERT INTO 연습_점검 (설비번호, 내용) VALUES (1, '벨트 점검'), (2, '유압 점검')");
  await 가.query("INSERT INTO 연습_재고 VALUES (1, '베어링', 100, 0), (2, '벨트', 100, 0)");
  await 가.query("INSERT INTO 연습_큐 (번호, 내용) SELECT g, '작업' || g FROM generate_series(1, 9) g");
  await 가.query("INSERT INTO 연습_당직 VALUES (1, '김반장', true), (2, '이반장', true)");
}

// ★ 채점하다가 실패해도 임시 연결은 **반드시** 닫아야 합니다.
//   안 닫으면 노드가 끝나지 않아서 채점이 멈춘 것처럼 보입니다.
//   (이것도 실무에서 자주 하는 실수입니다. finally 를 쓰세요)
async function 연결여럿(개수, 할일) {
  const 연결들 = [];

  for (let 자리 = 0; 자리 < 개수; 자리 += 1) 연결들.push(await 새연결());

  try {
    return await 할일(연결들);
  } finally {
    for (const 연결 of 연결들) await 연결.end().catch(() => {});
  }
}

let 통과수 = 0;
const 전체문제수 = 15;

async function 채점(번호, 제목, 검사) {
  let 결과 = "아직";

  try {
    await 초기화();
    결과 = (await 검사()) === true ? "통과" : "아직";
  } catch (에러) {
    결과 = `아직 (${에러.code ?? String(에러.message).slice(0, 30)})`;
  }

  if (결과 === "통과") 통과수 += 1;
  console.log(`${String(번호).padStart(2)}번 · ${제목} — ${결과}`);
}


// ============================================================
// 문제 1 — 되돌리기 (개념01)
// ============================================================
//
// 설비 1번의 상태를 '폐기' 로 바꾸고, **바꾼 직후에 읽은 값**을 돌려주고, 되돌리세요.
//   · 돌려주는 값은 '폐기' 여야 합니다 (내 트랜잭션 안에서는 바뀌어 보입니다)
//   · 함수가 끝났을 때 DB 의 상태는 '가동' 그대로여야 합니다

async function 문제1(연결) {
  // TODO: BEGIN → UPDATE 로 '폐기' → SELECT 해서 기억 → 되돌리기 → 기억한 값 돌려주기
  return null;
}


// ============================================================
// 문제 2 — 자동 커밋 (개념01)
// ============================================================
//
// BEGIN 없이 UPDATE 두 개를 보내고, 두 번째에서 일부러 에러를 내세요.
// (없는 표를 건드리면 됩니다)
// 첫 번째 UPDATE 는 **살아남아야** 합니다. 왜 그런지 생각해 보세요.

async function 문제2(연결) {
  // TODO: BEGIN 을 쓰지 말고 연습_재고 1번 수량을 50 으로 바꾼 뒤,
  //       없는 표를 SELECT 해서 에러를 내고, 그 에러를 try/catch 로 삼키세요
}


// ============================================================
// 문제 3 — 오염된 트랜잭션 되살리기 (개념01)
// ============================================================
//
// 트랜잭션 안에서 에러가 나면 그 뒤 모든 문장이 25P02 로 거부됩니다.
// 아래 함수는 에러를 낸 뒤에도 **그 연결로 SELECT 1 이 되게** 만들어야 합니다.

async function 문제3(연결) {
  await 연결.query("BEGIN");

  try {
    await 연결.query("SELECT * FROM 없는표");
  } catch {
    // TODO: 여기서 무엇을 해야 이 연결을 다시 쓸 수 있나요?
  }
}


// ============================================================
// 문제 4 — SAVEPOINT (개념01)
// ============================================================
//
// 점검기록 세 건을 넣는데 가운데 한 건이 잘못됐습니다(없는 설비 99번).
// **잘못된 한 건만 버리고 나머지 두 건은 커밋** 하세요.

async function 문제4(연결) {
  await 연결.query("BEGIN");
  await 연결.query("INSERT INTO 연습_점검 (설비번호, 내용) VALUES (1, '정상 1')");

  // TODO: 세이브포인트를 찍고, 잘못된 INSERT 를 시도하고,
  //       실패하면 세이브포인트로 되돌린 뒤, 마지막 정상 건을 넣고 커밋하세요
  //       (잘못된 것: INSERT INTO 연습_점검 (설비번호, 내용) VALUES (99, '잘못'))
  //       (마지막 정상 건: INSERT INTO 연습_점검 (설비번호, 내용) VALUES (2, '정상 2'))
}


// ============================================================
// 문제 5 — 갱신 손실을 원자적 UPDATE 로 막기 (개념02)
// ============================================================
//
// 열 명이 동시에 재고를 1씩 늘립니다. 결과가 110 이 돼야 합니다.
// **읽어서 더하지 마세요.** 한 문장으로 하세요.

async function 문제5(연결) {
  // TODO: 연습_재고 1번의 수량을 1 늘리는 문장 하나를 보내세요
}


// ============================================================
// 문제 6 — 재고가 모자라면 못 빼게 (개념02)
// ============================================================
//
// 수량이 100 인 부품에서 30 씩 빼는 요청이 다섯 번 옵니다.
// 세 번은 성공하고 두 번은 실패해야 합니다. 수량은 절대 음수가 되면 안 됩니다.
// 성공하면 true, 재고가 모자라 못 뺐으면 false 를 돌려주세요.

async function 문제6(연결, 뺄수량) {
  // TODO: 조건을 WHERE 에 넣은 UPDATE 한 문장으로 하고, rowCount 로 판정하세요
  return false;
}


// ============================================================
// 문제 7 — 비관적 잠금 (개념02)
// ============================================================
//
// 읽은 값으로 자바스크립트에서 계산해야 하는 상황입니다.
// 열 명이 동시에 해도 결과가 110 이 되게 만드세요. FOR UPDATE 를 쓰세요.

async function 문제7(연결) {
  await 연결.query("BEGIN");

  // TODO: 아래 SELECT 가 줄을 잡도록 고치세요
  const 지금 = (await 연결.query("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1")).rows[0].수량;

  await 잠깐(3); // 계산하는 시간이라고 칩시다

  await 연결.query("UPDATE 연습_재고 SET 수량 = $1 WHERE 부품번호 = 1", [지금 + 1]);
  await 연결.query("COMMIT");
}


// ============================================================
// 문제 8 — 낙관적 잠금 (개념02)
// ============================================================
//
// 이번엔 잠그지 말고 버전 칸으로 하세요.
// 남이 먼저 고쳤으면(rowCount 가 0) 다시 읽고 다시 시도하세요.
// 성공할 때까지 반복하고, 몇 번 만에 성공했는지 돌려주세요.

async function 문제8(연결) {
  for (let 시도 = 1; 시도 <= 100; 시도 += 1) {
    // TODO: 수량과 버전을 읽고, 버전이 그대로일 때만 쓰는 UPDATE 를 보내고,
    //       rowCount 가 1 이면 시도 를 돌려주세요
  }

  throw new Error("100번 시도했는데 실패");
}


// ============================================================
// 문제 9 — 반복 불가 읽기 막기 (개념03)
// ============================================================
//
// 한 트랜잭션 안에서 같은 SELECT 를 두 번 합니다.
// 사이에 남이 값을 바꿔도 **두 번 다 같은 값**이 나오게 만드세요.

async function 문제9(연결, 사이에할일) {
  // TODO: 적절한 격리수준으로 BEGIN 하세요
  await 연결.query("BEGIN");

  const 첫번째 = (await 연결.query("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1")).rows[0].수량;
  await 사이에할일();
  const 두번째 = (await 연결.query("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1")).rows[0].수량;

  await 연결.query("COMMIT");
  return { 첫번째, 두번째 };
}


// ============================================================
// 문제 10 — 작업 큐 (개념04)
// ============================================================
//
// 일꾼 셋이 큐에서 작업을 집어 갑니다.
// **같은 작업을 두 명이 집으면 안 되고, 서로 기다려도 안 됩니다.**
// 한 건을 집어서 '완료' 로 바꾸고 그 번호를 돌려주세요. 없으면 null 을 돌려주세요.

async function 문제10(연결, 일꾼이름) {
  await 연결.query("BEGIN");

  // TODO: 대기 중인 작업 한 건을 집으세요. 두 사람이 겹치지도, 기다리지도 않게.
  const 집기 = { rowCount: 0, rows: [] };

  if (집기.rowCount === 0) {
    await 연결.query("COMMIT");
    return null;
  }

  const 번호 = 집기.rows[0].번호;
  await 잠깐(5);
  await 연결.query("UPDATE 연습_큐 SET 상태 = '완료', 처리자 = $1 WHERE 번호 = $2", [일꾼이름, 번호]);
  await 연결.query("COMMIT");
  return 번호;
}


// ============================================================
// 문제 11 — 기다리지 않기 (개념04)
// ============================================================
//
// 남이 잡고 있는 줄을 잡으려 할 때, **기다리지 말고 바로 포기**하세요.
// 못 잡았으면 "못잡음", 잡았으면 "잡음" 을 돌려주세요.

async function 문제11(연결) {
  await 연결.query("BEGIN");

  try {
    // TODO: 기다리지 않고 바로 실패하도록 고치세요
    await 연결.query("SELECT * FROM 연습_재고 WHERE 부품번호 = 1 FOR UPDATE");
    await 연결.query("ROLLBACK");
    return "잡음";
  } catch {
    await 연결.query("ROLLBACK");
    return "못잡음";
  }
}


// ============================================================
// 문제 12 — ★ 이 코드의 동시성 버그를 찾아 고치세요 (개념02)
// ============================================================
//
// 아래는 실제로 흔히 보는 출고 코드입니다. 테스트도 통과했고 혼자 눌러 보면 잘 됩니다.
// 그런데 **두 명이 동시에 부르면 재고가 음수가 됩니다.**
//
//   ① 버그가 무엇인지 말로 설명해 보세요
//   ② 고치세요. 재고가 절대 음수가 되지 않아야 합니다
//   ③ 재고가 모자라면 Error("재고 부족") 을 던지세요
//
// ★ 힌트: 읽는 시점과 쓰는 시점 사이에 무슨 일이 일어날 수 있나요?

async function 문제12(연결, 주문수) {
  await 연결.query("BEGIN");

  // ↓↓↓ 여기가 버그입니다 ↓↓↓
  const 지금 = (await 연결.query("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1")).rows[0].수량;

  if (지금 < 주문수) {
    await 연결.query("ROLLBACK");
    throw new Error("재고 부족");
  }

  await 잠깐(10); // 배송지 확인 같은 다른 일을 하는 시간
  await 연결.query("UPDATE 연습_재고 SET 수량 = $1 WHERE 부품번호 = 1", [지금 - 주문수]);
  // ↑↑↑ 여기까지 ↑↑↑

  await 연결.query("COMMIT");
}


// ============================================================
// 문제 13 — [도전] 데드락 안 나게 만들기 (개념05)
// ============================================================
//
// 아래 함수는 부품 목록을 받아 순서대로 잠그고 1씩 뺍니다.
// 두 사람이 [1, 2] 와 [2, 1] 을 동시에 넘기면 데드락이 납니다.
// **함수 안에서** 데드락이 안 나게 고치세요. (부르는 쪽은 못 고칩니다)

async function 문제13(연결, 부품번호들) {
  await 연결.query("BEGIN");

  // TODO: 한 줄만 넣으면 됩니다. 무엇을 넣어야 할까요?
  for (const 번호 of 부품번호들) {
    await 연결.query("UPDATE 연습_재고 SET 수량 = 수량 - 1 WHERE 부품번호 = $1", [번호]);
    await 잠깐(60);
  }

  await 연결.query("COMMIT");
}


// ============================================================
// 문제 14 — [도전] 재시도 함수 만들기 (개념05)
// ============================================================
//
// 데드락(40P01)과 직렬화 실패(40001)를 잡아서 **트랜잭션 전체를 다시** 하세요.
//   · 그 밖의 에러는 그대로 던지세요 (23505 를 재시도하면 안 됩니다)
//   · 실패하면 반드시 ROLLBACK 하세요
//   · 상한을 두고, 넘으면 마지막 에러를 던지세요
//   · 몇 번 만에 성공했는지 { 시도 } 로 돌려주세요

async function 문제14(연결, 할일, 최대시도 = 20) {
  // TODO: BEGIN → 할일(연결) → COMMIT 을 감싸고, 재시도 가능한 에러만 다시 하세요
  return { 시도: 0 };
}


// ============================================================
// 문제 15 — [도전] 쓰기 왜곡 막기 (개념03)
// ============================================================
//
// 당직은 항상 최소 한 명이어야 합니다.
// 두 사람이 동시에 "당직이 2명이니 나는 빠져도 되겠지" 하고 각자 자기 줄을 뺍니다.
// 서로 **다른 줄**을 고치므로 잠금으로는 못 막습니다.
//
// 한쪽이 반드시 실패하게 만드세요. 실패한 쪽은 에러를 던지면 됩니다.

async function 문제15(연결, 내번호) {
  // TODO: 적절한 격리수준으로 BEGIN 하세요
  await 연결.query("BEGIN");

  const 당직수 = Number((await 연결.query("SELECT count(*) FROM 연습_당직 WHERE 당직여부")).rows[0].count);

  if (당직수 <= 1) {
    await 연결.query("ROLLBACK");
    throw new Error("당직이 한 명뿐입니다");
  }

  await 잠깐(30);
  await 연결.query("UPDATE 연습_당직 SET 당직여부 = false WHERE 번호 = $1", [내번호]);
  await 연결.query("COMMIT");
}


// ============================================================
// 채점
// ============================================================

console.log(`===== 07단원 연습문제 채점 (전체 ${전체문제수}문제) =====`);
// 출력?: ===== 07단원 연습문제 채점 (전체 15문제) =====

await 채점(1, "되돌리기", async () => {
  const 트랜잭션안에서본것 = await 문제1(가);
  const 되돌린뒤 = await 한값("SELECT 상태 FROM 연습_설비 WHERE 번호 = 1");
  return 트랜잭션안에서본것 === "폐기" && 되돌린뒤 === "가동";
});
// 출력?:  1번 · 되돌리기 — 아직

await 채점(2, "자동 커밋", async () => {
  await 문제2(가);
  return Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1")) === 50;
});
// 출력?:  2번 · 자동 커밋 — 아직

await 채점(3, "오염된 트랜잭션 되살리기", async () => {
  await 문제3(가);
  return (await 가.query("SELECT 1 AS 값")).rows[0].값 === 1;
});
// 출력?:  3번 · 오염된 트랜잭션 되살리기 — 아직 (25P02)

await 채점(4, "SAVEPOINT", async () => {
  await 문제4(가);
  const 건수 = Number(await 한값("SELECT count(*) FROM 연습_점검"));
  const 잘못 = Number(await 한값("SELECT count(*) FROM 연습_점검 WHERE 내용 = '잘못'"));
  return 건수 === 4 && 잘못 === 0;
});
// 출력?:  4번 · SAVEPOINT — 아직

await 채점(5, "원자적 UPDATE", async () => {
  await 연결여럿(10, (사람들) => Promise.all(사람들.map(문제5)));
  return Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1")) === 110;
});
// 출력?:  5번 · 원자적 UPDATE — 아직

await 채점(6, "재고 부족 판정", async () => {
  const 결과들 = [];
  for (let 회차 = 0; 회차 < 5; 회차 += 1) 결과들.push(await 문제6(가, 30));
  const 성공수 = 결과들.filter(Boolean).length;
  const 남은수량 = Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1"));
  return 성공수 === 3 && 남은수량 === 10;
});
// 출력?:  6번 · 재고 부족 판정 — 아직

await 채점(7, "비관적 잠금", async () => {
  await 연결여럿(10, (사람들) => Promise.all(사람들.map(문제7)));
  return Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1")) === 110;
});
// 출력?:  7번 · 비관적 잠금 — 아직

await 채점(8, "낙관적 잠금", async () => {
  const 시도들 = await 연결여럿(10, (사람들) => Promise.all(사람들.map(문제8)));
  const 수량 = Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1"));
  const 버전 = Number(await 한값("SELECT 버전 FROM 연습_재고 WHERE 부품번호 = 1"));
  return 수량 === 110 && 버전 === 10 && 시도들.every((시도) => 시도 >= 1);
});
// 출력?:  8번 · 낙관적 잠금 — 아직 (100번 시도했는데 실패)

await 채점(9, "반복 불가 읽기 막기", async () => {
  const 결과 = await 문제9(가, () => 나.query("UPDATE 연습_재고 SET 수량 = 999 WHERE 부품번호 = 1"));
  return 결과 !== undefined && 결과.첫번째 === 결과.두번째;
});
// 출력?:  9번 · 반복 불가 읽기 막기 — 아직

await 채점(10, "작업 큐", async () => {
  const 집은것 = await 연결여럿(3, (일꾼들) =>
    Promise.all(
      일꾼들.map(async (연결, 자리) => {
        const 목록 = [];
        let 하나;
        while ((하나 = await 문제10(연결, `일꾼${자리 + 1}`)) != null) 목록.push(하나);
        return 목록;
      }),
    ),
  );

  const 전부 = 집은것.flat();
  return 전부.length === 9 && new Set(전부).size === 9;
});
// 출력?: 10번 · 작업 큐 — 아직

await 채점(11, "기다리지 않기", async () => {
  await 나.query("BEGIN");
  await 나.query("SELECT * FROM 연습_재고 WHERE 부품번호 = 1 FOR UPDATE");

  // ★ 아직 안 고친 코드는 **영원히** 기다립니다. 채점이 멈추면 안 되니 2초로 끊습니다.
  //   2초를 다 쓰고 끝나면 "기다린" 것이므로 통과가 아닙니다.
  await 가.query("SET statement_timeout = '2s'");

  const 시작 = performance.now();
  let 결과;

  try {
    결과 = await 문제11(가);
  } finally {
    await 가.query("SET statement_timeout = 0");
  }

  const 걸린 = performance.now() - 시작;
  await 나.query("ROLLBACK");

  return 결과 === "못잡음" && 걸린 < 1000;
});
// 출력?: 11번 · 기다리지 않기 — 아직

await 채점(12, "★ 동시성 버그 찾아 고치기", async () => {
  const 결과 = await 연결여럿(2, ([하나, 둘]) =>
    Promise.allSettled([문제12(하나, 60), 문제12(둘, 60)]),
  );

  const 남은수량 = Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1"));
  const 성공수 = 결과.filter((하나) => 하나.status === "fulfilled").length;

  // 100 에서 60 을 두 번 뺄 수는 없습니다. 하나만 성공하고 40 이 남아야 합니다.
  return 남은수량 === 40 && 성공수 === 1;
});
// 출력?: 12번 · ★ 동시성 버그 찾아 고치기 — 아직

await 채점(13, "[도전] 데드락 안 나게", async () => {
  const 결과 = await 연결여럿(2, ([하나, 둘]) =>
    Promise.allSettled([문제13(하나, [1, 2]), 문제13(둘, [2, 1])]),
  );

  const 데드락난것 = 결과.filter((하나) => hasCode(하나, "40P01")).length;
  const 수량1 = Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1"));
  const 수량2 = Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 2"));

  return 데드락난것 === 0 && 수량1 === 98 && 수량2 === 98;
});
// 출력?: 13번 · [도전] 데드락 안 나게 — 아직

await 채점(14, "[도전] 재시도 함수", async () => {
  const 결과 = await 연결여럿(6, (사람들) =>
    Promise.all(
      사람들.map((연결, 자리) =>
        문제14(연결, async (연결) => {
          const 순서 = 자리 % 2 === 0 ? [1, 2] : [2, 1]; // 일부러 어긋나게
          for (const 번호 of 순서) {
            await 연결.query("UPDATE 연습_재고 SET 수량 = 수량 - 1 WHERE 부품번호 = $1", [번호]);
            await 잠깐(20);
          }
        }),
      ),
    ),
  );

  const 수량1 = Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 1"));
  const 수량2 = Number(await 한값("SELECT 수량 FROM 연습_재고 WHERE 부품번호 = 2"));

  // 재시도해서 여섯 명 다 성공해야 합니다
  return 수량1 === 94 && 수량2 === 94 && 결과.every((하나) => 하나 && 하나.시도 >= 1);
});
// 출력?: 14번 · [도전] 재시도 함수 — 아직

await 채점(15, "[도전] 쓰기 왜곡 막기", async () => {
  const 결과 = await 연결여럿(2, ([하나, 둘]) =>
    Promise.allSettled([문제15(하나, 1), 문제15(둘, 2)]),
  );

  const 남은당직 = Number(await 한값("SELECT count(*) FROM 연습_당직 WHERE 당직여부"));
  const 실패수 = 결과.filter((하나) => 하나.status === "rejected").length;

  return 남은당직 === 1 && 실패수 === 1;
});
// 출력?: 15번 · [도전] 쓰기 왜곡 막기 — 아직

console.log(`===== 채점 결과: ${통과수} / ${전체문제수} 통과 =====`);
// 출력?: ===== 채점 결과: 0 / 15 통과 =====

// 채점을 도와주는 작은 함수입니다.
function hasCode(정착결과, 코드) {
  return 정착결과.status === "rejected" && 정착결과.reason && 정착결과.reason.code === 코드;
}


// ── 풀 때 참고할 것 ──
//
// · 문제 5, 7, 8 은 같은 목표(110 만들기)를 세 가지 방법으로 푸는 것입니다.
//   셋을 다 풀고 나서 "언제 뭘 쓸까" 를 스스로 정리해 보세요.
//
// · 문제 12 는 실무에서 가장 자주 보는 버그입니다.
//   고치는 방법이 두 가지 이상 있습니다. 다 찾아보세요.
//
// · 문제 14 를 풀 때는 개념05 섹션 6 을 보지 말고 먼저 직접 써 보세요.
//   재시도 코드는 한 번 직접 써 봐야 몸에 남습니다.
//
// · 채점이 "아직 (40P01)" 처럼 나오면 괄호 안이 실패한 이유입니다.
//   에러 코드를 개념 파일에서 찾아보세요.


for (const 연결 of 모든연결) await 연결.end();
