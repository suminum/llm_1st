// ============================================================
// 08단원 · 연습문제 — 애플리케이션과 잇기
// ------------------------------------------------------------
// 실행: node 연습문제.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ============================================================
//
// `// TODO:` 를 채우고 실행하세요. 채점이 자동으로 됩니다.
//
//   ✓ 이면 통과, ✗ 이면 아직입니다.
//
// 지금 실행하면 전부 ✗ 입니다. 위에서부터 하나씩 채우세요.
// 막히면 개념01~05 를 다시 보세요. 정답은 연습문제_정답.js 에 있습니다.
//
// ★ 15번까지 있습니다. 13~15번은 [도전] 입니다.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import pg from "pg";

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434,
  user: "factory",
  password: "secret",
  database: "factory_db",
};

let 준비;

try {
  준비 = new pg.Client(접속정보);
  await 준비.connect();
} catch (에러) {
  // 검증무시: Docker 가 없는 사람을 위한 안내입니다. 정상 종료합니다.
  console.log("데이터베이스에 연결하지 못했습니다.", 에러.code ?? 에러.message);
  console.log("이 파일은 Docker 가 필요합니다. 아래를 치고 다시 실행하세요.");
  console.log("  docker compose up -d");
  process.exit(0);
}

await 준비.query("DROP SCHEMA IF EXISTS 단원08_연습 CASCADE");
await 준비.query("CREATE SCHEMA 단원08_연습");
await 준비.query("SET search_path TO 단원08_연습");
await 준비.query(`
  CREATE TABLE 설비 (
    설비번호 TEXT PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인     TEXT NOT NULL,
    상태     TEXT NOT NULL DEFAULT '정지',
    도입가   NUMERIC(12, 2) NOT NULL DEFAULT 0,
    설치일   DATE NOT NULL DEFAULT DATE '2026-01-01'
  )
`);
await 준비.query(`
  CREATE TABLE 점검기록 (
    번호     SERIAL PRIMARY KEY,
    설비번호 TEXT NOT NULL REFERENCES 설비(설비번호),
    결과     TEXT NOT NULL
  )
`);
await 준비.query(`
  INSERT INTO 설비 (설비번호, 이름, 라인, 상태, 도입가, 설치일) VALUES
    ('EQ-001', '컨베이어 1호', 'A', '가동', 1200000.50, DATE '2026-03-02'),
    ('EQ-002', '프레스 1호',   'B', '정지', 3400000.25, DATE '2026-04-11'),
    ('EQ-003', '용접로봇 1호', 'A', '가동',  980000.25, DATE '2026-05-20')
`);
await 준비.query(`
  INSERT INTO 점검기록 (설비번호, 결과)
  SELECT 'EQ-' || lpad(설비::text, 3, '0'), '정상'
  FROM generate_series(1, 3) AS 설비, generate_series(1, 4) AS 회차
`);
await 준비.query("CREATE TABLE 잔고 (계정 TEXT PRIMARY KEY, 값 INT NOT NULL)");
await 준비.query("INSERT INTO 잔고 VALUES ('A라인', 100), ('B라인', 100)");

const 풀 = new pg.Pool({ ...접속정보, max: 5, options: "-c search_path=단원08_연습" });

// ── 채점 도구 (고치지 마세요) ──

const 채점결과 = [];

async function 문제(번호, 제목, 검사) {
  try {
    채점결과.push(`${(await 검사()) ? "✓" : "✗"} ${번호}. ${제목}`);
  } catch (에러) {
    채점결과.push(`✗ ${번호}. ${제목} (${에러.constructor.name})`);
  }
}

// 풀에서 빌려 간 연결을 추적합니다. 학생 코드가 새어도 파일이 끝나게 하려고요.
function 감시풀(설정) {
  const 새풀 = new pg.Pool(설정);
  const 빌려준것 = new Set();
  const 원래connect = 새풀.connect.bind(새풀);

  새풀.connect = async (...인자들) => {
    const 연결 = await 원래connect(...인자들);
    const 원래release = 연결.release.bind(연결);

    빌려준것.add(연결);
    연결.release = (...것들) => {
      빌려준것.delete(연결);
      return 원래release(...것들);
    };

    return 연결;
  };

  새풀.강제정리 = () => {
    for (const 연결 of 빌려준것) {
      try {
        연결.release();
      } catch {
        // 이미 돌아간 것입니다
      }
    }

    빌려준것.clear();
  };

  return 새풀;
}


// ============================================================
// 1. 접속 설정 객체 만들기
// ============================================================
//
// docker-compose.yml 의 postgres 는 이렇게 떠 있습니다.
//   포트 5434 · 계정 factory · 비밀번호 secret · DB factory_db
//
// 그 정보로 pg.Client 설정 객체를 만드세요. host 는 "127.0.0.1" 입니다.

function 설정만들기() {
  // TODO: { host, port, user, password, database } 를 돌려주세요
  return null;
}

await 문제(1, "접속 설정 객체 만들기", async () => {
  const 설정 = 설정만들기();
  if (설정 === null) return false;

  const 시험 = new pg.Client(설정);
  await 시험.connect();
  const 값 = (await 시험.query("SELECT 1 AS 값")).rows[0].값;
  await 시험.end();

  return 값 === 1;
});


// ============================================================
// 2. 연결 문자열 만들기
// ============================================================
//
// 설정 객체를 `postgres://사용자:비밀번호@호스트:포트/DB이름` 으로 바꾸세요.
// ★ 비밀번호에 @ 나 / 가 들어갈 수 있습니다. encodeURIComponent 를 쓰세요.

function 연결문자열만들기({ host, port, user, password, database }) {
  // TODO: 연결 문자열을 돌려주세요
  return null;
}

await 문제(2, "연결 문자열 만들기", () => {
  const 보통 = 연결문자열만들기(접속정보);
  const 특수 = 연결문자열만들기({ ...접속정보, password: "a@b/c" });

  return (
    보통 === "postgres://factory:secret@127.0.0.1:5434/factory_db" &&
    특수 === "postgres://factory:a%40b%2Fc@127.0.0.1:5434/factory_db"
  );
});


// ============================================================
// 3. 비밀번호 가리기
// ============================================================
//
// 로그에 연결 문자열을 찍을 때 비밀번호만 `****` 로 바꾸세요.
//   postgres://factory:secret@127.0.0.1:5434/factory_db
//   → postgres://factory:****@127.0.0.1:5434/factory_db

function 비밀가리기(문자열) {
  // TODO: 비밀번호 자리만 **** 로 바꿔서 돌려주세요
  return null;
}

await 문제(3, "비밀번호 가리기", () =>
  비밀가리기("postgres://factory:secret@127.0.0.1:5434/factory_db") ===
    "postgres://factory:****@127.0.0.1:5434/factory_db" &&
  비밀가리기("postgres://kim:p@ss@db.example.com:5432/prod") ===
    "postgres://kim:****@db.example.com:5432/prod",
);


// ============================================================
// 4. 연결 에러를 사람 말로 바꾸기
// ============================================================
//
// 연결에 실패했을 때 나오는 코드를 보고 한국어 안내를 돌려주세요.
//
//   ECONNREFUSED → "데이터베이스가 안 떠 있거나 포트가 틀립니다"
//   28P01        → "계정이나 비밀번호가 틀립니다"
//   3D000        → "그 이름의 데이터베이스가 없습니다"
//   그 밖에      → "알 수 없는 오류입니다"

function 연결에러설명(코드) {
  // TODO: 코드에 맞는 안내 문구를 돌려주세요
  return null;
}

await 문제(4, "연결 에러를 사람 말로", () =>
  연결에러설명("ECONNREFUSED") === "데이터베이스가 안 떠 있거나 포트가 틀립니다" &&
  연결에러설명("28P01") === "계정이나 비밀번호가 틀립니다" &&
  연결에러설명("3D000") === "그 이름의 데이터베이스가 없습니다" &&
  연결에러설명("42601") === "알 수 없는 오류입니다",
);


// ============================================================
// 5. NUMERIC 을 제대로 더하기
// ============================================================
//
// `도입가` 는 NUMERIC 이라 자바스크립트에 **문자열**로 옵니다.
// 그냥 더하면 글자가 이어 붙습니다.
//
// 설비 세 대의 도입가 합계를 **숫자**로 돌려주세요. (정답: 5580001)

async function 도입가합계(실행자) {
  // TODO: 설비의 도입가를 모두 더한 숫자를 돌려주세요
  return null;
}

await 문제(5, "NUMERIC 을 제대로 더하기", async () => {
  const 합 = await 도입가합계(풀);
  return typeof 합 === "number" && Math.abs(합 - 5580001) < 0.001;
});


// ============================================================
// 6. DATE 를 날짜 글자로 (시간대 함정 피하기)
// ============================================================
//
// EQ-001 의 설치일은 2026-03-02 입니다.
// 그런데 `설치일.toISOString().slice(0, 10)` 을 하면 한국에서는 2026-03-01 이 나옵니다.
//
// "2026-03-02" 를 정확히 돌려주세요.
// ★ 힌트: SQL 쪽에서 글자로 만들어 받으면 시간대를 안 탑니다.

async function 설치일글자(실행자, 설비번호) {
  // TODO: "YYYY-MM-DD" 모양의 문자열을 돌려주세요
  return null;
}

await 문제(6, "DATE 를 날짜 글자로", async () =>
  (await 설치일글자(풀, "EQ-001")) === "2026-03-02" &&
  (await 설치일글자(풀, "EQ-002")) === "2026-04-11",
);


// ============================================================
// 7. 저장소 — 하나 조회하기
// ============================================================
//
// 설비번호로 한 대를 찾습니다.
//   · 있으면 { 번호, 이름, 라인 } 을 돌려주세요 (칸 이름을 바꿉니다)
//   · ★ 없으면 `null` 을 돌려주세요. `undefined` 가 아닙니다

async function 설비하나(실행자, 설비번호) {
  // TODO: 채우세요
  return null;
}

await 문제(7, "저장소 — 하나 조회하기", async () => {
  const 있는것 = await 설비하나(풀, "EQ-001");
  const 없는것 = await 설비하나(풀, "EQ-999");

  return (
    없는것 === null &&
    있는것 !== null &&
    있는것.번호 === "EQ-001" &&
    있는것.이름 === "컨베이어 1호" &&
    있는것.라인 === "A" &&
    Object.keys(있는것).length === 3
  );
});


// ============================================================
// 8. 저장소 — 없는 줄을 고쳤을 때
// ============================================================
//
// 상태를 바꿉니다.
//   · 바꿨으면 바뀐 설비 객체 { 번호, 상태 } 를 돌려주세요
//   · ★ 그 설비가 없으면 `null` 을 돌려주세요 (rowCount 를 보세요)
//
// 이걸 안 하면 "수정했습니다" 라고 200 을 주고 화면은 안 바뀝니다.

async function 상태바꾸기(실행자, 설비번호, 새상태) {
  // TODO: 채우세요
  return null;
}

await 문제(8, "저장소 — 없는 줄을 고쳤을 때", async () => {
  const 바뀐것 = await 상태바꾸기(풀, "EQ-002", "가동");
  const 없는것 = await 상태바꾸기(풀, "EQ-999", "가동");

  await 풀.query("UPDATE 설비 SET 상태 = '정지' WHERE 설비번호 = 'EQ-002'");

  return 없는것 === null && 바뀐것 !== null && 바뀐것.번호 === "EQ-002" && 바뀐것.상태 === "가동";
});


// ============================================================
// 9. 에러 코드를 도메인 말로
// ============================================================
//
// 이미 있는 설비번호를 또 넣으면 `23505` 가 납니다.
// 그 에러를 잡아서 `Error("이미 있는 설비번호입니다")` 로 바꿔 던지세요.
// ★ 다른 코드의 에러는 **손대지 말고 그대로** 던져야 합니다.

async function 설비추가(실행자, { 번호, 이름, 라인 }) {
  // TODO: INSERT 하고, 23505 면 "이미 있는 설비번호입니다" 로 바꿔 던지세요
  return null;
}

await 문제(9, "에러 코드를 도메인 말로", async () => {
  const 새것 = await 설비추가(풀, { 번호: "EQ-100", 이름: "새설비", 라인: "C" });

  const 중복 = await 설비추가(풀, { 번호: "EQ-100", 이름: "또새설비", 라인: "C" })
    .then(() => "성공")
    .catch((에러) => 에러.message);

  const 낫널 = await 설비추가(풀, { 번호: "EQ-101", 이름: null, 라인: "C" })
    .then(() => "성공")
    .catch((에러) => 에러.code);

  await 풀.query("DELETE FROM 설비 WHERE 설비번호 IN ('EQ-100', 'EQ-101')");

  return 새것 !== null && 중복 === "이미 있는 설비번호입니다" && 낫널 === "23502";
});


// ============================================================
// 10. ★ 버그 찾기 — 풀이 마릅니다
// ============================================================
//
// 아래 코드는 잘 돌아가는 것처럼 보이는데, 몇 번 부르면 서비스가 멈춥니다.
//
//   async function 설비수세기(풀) {
//     const 연결 = await 풀.connect();
//     const 결과 = await 연결.query("SELECT count(*)::int AS 건수 FROM 설비");
//     연결.release();
//     return 결과.rows[0].건수;
//   }
//
// 무엇이 문제인지 찾아서 고친 것을 아래에 쓰세요.
// ★ 힌트: 쿼리가 **실패하면** 어떻게 되나요?

async function 설비수세기(풀, SQL = "SELECT count(*)::int AS 건수 FROM 설비") {
  // TODO: 어떤 경우에도 연결이 풀로 돌아가게 쓰세요
  return null;
}

await 문제(10, "버그 찾기 — 풀이 마릅니다", async () => {
  const 작은풀 = 감시풀({ ...접속정보, max: 2, connectionTimeoutMillis: 1000, options: "-c search_path=단원08_연습" });

  try {
    // ★ 일부러 세 번 실패시킵니다. 그래도 연결이 돌아와야 합니다.
    for (let 회차 = 0; 회차 < 3; 회차 += 1) {
      await 설비수세기(작은풀, "SELEC 1").catch(() => {});   // 검증무시: 일부러 낸 문법 오류
    }

    const 건수 = await 설비수세기(작은풀);

    return 건수 === 3 && 작은풀.idleCount > 0;
  } finally {
    작은풀.강제정리();
    await 작은풀.end();
  }
});


// ============================================================
// 11. ★ 버그 찾기 — 롤백이 안 됩니다
// ============================================================
//
// 아래 코드는 테스트에서는 잘 되는데 운영에서 가끔 돈이 사라집니다.
//
//   async function 이체(풀, 보내는곳, 받는곳, 금액) {
//     await 풀.query("BEGIN");
//     await 풀.query("UPDATE 잔고 SET 값 = 값 - $2 WHERE 계정 = $1", [보내는곳, 금액]);
//     await 풀.query("UPDATE 잔고 SET 값 = 값 + $2 WHERE 계정 = $1", [받는곳, 금액]);
//     await 풀.query("COMMIT");
//   }
//
// 무엇이 문제인지 찾아서 고치세요.
// ★ 중간에 에러가 나면 **아무것도 안 바뀌어야** 합니다.

async function 이체(풀, 보내는곳, 받는곳, 금액) {
  // TODO: 트랜잭션이 진짜로 걸리게 고쳐 쓰세요
  //   금액이 0 이하이면 Error("금액이 잘못됐습니다") 를 던지세요
  //   (던지기 전에 이미 UPDATE 한 것이 있어도 롤백되어야 합니다)
  return null;
}

await 문제(11, "버그 찾기 — 롤백이 안 됩니다", async () => {
  await 풀.query("UPDATE 잔고 SET 값 = 100");

  await 이체(풀, "A라인", "B라인", 30);

  const 정상뒤 = (await 풀.query("SELECT 계정, 값 FROM 잔고 ORDER BY 계정")).rows;

  // 실패해야 하는 이체 — 금액이 0 이하입니다
  const 실패 = await 이체(풀, "A라인", "B라인", -50).then(() => "성공").catch(() => "실패");

  const 실패뒤 = (await 풀.query("SELECT 계정, 값 FROM 잔고 ORDER BY 계정")).rows;

  return (
    정상뒤[0].값 === 70 && 정상뒤[1].값 === 130 &&
    실패 === "실패" &&
    실패뒤[0].값 === 70 && 실패뒤[1].값 === 130
  );
});


// ============================================================
// 12. 여러 저장소를 한 트랜잭션으로 묶기
// ============================================================
//
// 설비를 등록하면서 첫 점검기록도 같이 남깁니다.
// ★ 둘 다 성공하거나 둘 다 안 되어야 합니다.
// ★ 저장소 함수에는 **빌린 연결**을 넘겨야 합니다.

async function 트랜잭션으로(풀, 할일) {
  // TODO: BEGIN / COMMIT / ROLLBACK / release 를 갖춘 껍데기를 만드세요
  //   할일(연결) 을 부르고 그 결과를 돌려주면 됩니다
  return null;
}

async function 등록하고첫점검(풀, 설비, 첫결과) {
  // TODO: 트랜잭션으로 를 써서 설비 INSERT + 점검기록 INSERT 를 묶으세요
  return null;
}

await 문제(12, "여러 저장소를 한 트랜잭션으로", async () => {
  await 등록하고첫점검(풀, { 번호: "EQ-200", 이름: "포장기", 라인: "C" }, "정상");

  const 좋은쪽 = (await 풀.query(
    "SELECT count(*)::int AS 건수 FROM 점검기록 WHERE 설비번호 = 'EQ-200'",
  )).rows[0].건수;

  // 점검기록의 결과는 NOT NULL 입니다. 여기서 터져야 합니다.
  await 등록하고첫점검(풀, { 번호: "EQ-201", 이름: "포장기2", 라인: "C" }, null).catch(() => {});

  const 남았나 = (await 풀.query(
    "SELECT count(*)::int AS 건수 FROM 설비 WHERE 설비번호 = 'EQ-201'",
  )).rows[0].건수;

  await 풀.query("DELETE FROM 점검기록 WHERE 설비번호 = 'EQ-200'");
  await 풀.query("DELETE FROM 설비 WHERE 설비번호 IN ('EQ-200', 'EQ-201')");

  return 좋은쪽 === 1 && 남았나 === 0;
});


// ============================================================
// 13. [도전] 테스트를 롤백으로 뒷정리하기
// ============================================================
//
// 시험 하나를 트랜잭션으로 감싸고, **성공해도 롤백**하는 껍데기를 만드세요.
// 시험이 넣은 데이터가 하나도 안 남아야 합니다.
//
//   · 시험이 통과하면 true, 던지면 false 를 돌려주세요
//   · 어느 쪽이든 ROLLBACK 하고 연결을 돌려주세요

async function 시험하기(풀, 할일) {
  // TODO: 채우세요
  return null;
}

await 문제(13, "[도전] 테스트를 롤백으로 뒷정리", async () => {
  const 전 = (await 풀.query("SELECT count(*)::int AS 건수 FROM 설비")).rows[0].건수;

  const 통과 = await 시험하기(풀, async (연결) => {
    await 연결.query("INSERT INTO 설비 (설비번호, 이름, 라인) VALUES ('TEST-1', '시험', 'Z')");

    const 있나 = (await 연결.query(
      "SELECT count(*)::int AS 건수 FROM 설비 WHERE 설비번호 = 'TEST-1'",
    )).rows[0].건수;

    if (있나 !== 1) throw new Error("안 들어갔습니다");
  });

  const 실패 = await 시험하기(풀, async (연결) => {
    await 연결.query("INSERT INTO 설비 (설비번호, 이름, 라인) VALUES ('TEST-2', '시험', 'Z')");
    throw new Error("일부러 던집니다");
  });

  const 후 = (await 풀.query("SELECT count(*)::int AS 건수 FROM 설비")).rows[0].건수;

  return 통과 === true && 실패 === false && 전 === 후;
});


// ============================================================
// 14. [도전] N+1 을 고치기
// ============================================================
//
// 아래는 설비 목록과 각 설비의 점검기록 개수를 가져옵니다. **쿼리가 4번 나갑니다.**
//
//   const 설비들 = (await 실행자.query("SELECT 설비번호, 이름 FROM 설비")).rows;
//   for (const 설비 of 설비들) {
//     설비.점검수 = (await 실행자.query(
//       "SELECT count(*)::int AS 건수 FROM 점검기록 WHERE 설비번호 = $1", [설비.설비번호],
//     )).rows[0].건수;
//   }
//
// **쿼리 한 번**으로 같은 결과를 만드세요.
// 돌려줄 모양: [{ 번호, 이름, 점검수 }, ...] — 설비번호 순서
//
// ★ 힌트: LEFT JOIN + GROUP BY, 또는 서브쿼리.
// ★ 점검기록이 없는 설비도 빠지면 안 됩니다. 그 설비의 점검수는 0 입니다.

async function 설비와점검수(실행자) {
  // TODO: 쿼리 한 번으로 만드세요
  return null;
}

await 문제(14, "[도전] N+1 을 고치기", async () => {
  await 풀.query("INSERT INTO 설비 (설비번호, 이름, 라인) VALUES ('EQ-300', '점검없는설비', 'C')");

  let 쿼리수 = 0;
  const 세는실행자 = {
    query: (...인자들) => {
      쿼리수 += 1;
      return 풀.query(...인자들);
    },
  };

  const 목록 = await 설비와점검수(세는실행자);

  await 풀.query("DELETE FROM 설비 WHERE 설비번호 = 'EQ-300'");

  if (!Array.isArray(목록) || 목록.length !== 4) return false;

  const 맞나 =
    목록[0].번호 === "EQ-001" && 목록[0].점검수 === 4 &&
    목록[3].번호 === "EQ-300" && 목록[3].점검수 === 0;

  return 쿼리수 === 1 && 맞나;
});


// ============================================================
// 15. [도전] 마이그레이션 러너
// ============================================================
//
// 폴더의 `.sql` 파일을 이름 순으로 적용하는 함수를 만드세요.
//
//   · 기록 표 `_이사기록 (이름 TEXT PRIMARY KEY)` 이 없으면 만듭니다
//   · 이미 적용한 파일은 건너뜁니다
//   · 파일 하나를 **트랜잭션으로 감쌉니다** (중간에 실패하면 통째로 롤백)
//   · 이번에 **적용한 파일 이름 배열**을 돌려줍니다

const 시험폴더 = fs.mkdtempSync(path.join(os.tmpdir(), "db자료-08연습-"));

fs.writeFileSync(path.join(시험폴더, "001_첫표.sql"), "CREATE TABLE 이사_가 (번호 INT);\n");
fs.writeFileSync(path.join(시험폴더, "002_둘째표.sql"), "CREATE TABLE 이사_나 (번호 INT);\n");
// ★ 003 은 두 문장인데 두 번째가 틀렸습니다. 첫 문장도 롤백되어야 합니다.
fs.writeFileSync(
  path.join(시험폴더, "003_틀린것.sql"),
  "CREATE TABLE 이사_다 (번호 INT);\nALTER TABLE 없는표 ADD COLUMN 뭔가 TEXT;\n",
);

async function 이사돌리기(연결, 폴더) {
  // TODO: 채우세요
  return null;
}

await 문제(15, "[도전] 마이그레이션 러너", async () => {
  const 연결 = new pg.Client(접속정보);
  await 연결.connect();
  await 연결.query("SET search_path TO 단원08_연습");

  try {
    const 첫번 = await 이사돌리기(연결, 시험폴더).catch(() => "터짐");
    const 둘째 = await 이사돌리기(연결, 시험폴더).catch(() => "터짐");

    const 있나 = async (이름) =>
      (await 연결.query("SELECT to_regclass($1) AS 있나", [`단원08_연습.${이름}`])).rows[0].있나 !== null;

    return (
      첫번 === "터짐" &&              // 003 에서 터져야 합니다
      둘째 === "터짐" &&              // 다시 돌려도 003 에서 또 터집니다
      (await 있나("이사_가")) &&      // 001 은 남아 있어야 합니다
      (await 있나("이사_나")) &&      // 002 도 남아 있어야 합니다
      !(await 있나("이사_다"))        // ★ 003 의 앞 문장은 롤백되어야 합니다
    );
  } finally {
    await 연결.end();
  }
});


// ── 채점 결과 ──

for (const 줄 of 채점결과) console.log(줄);
// 출력: ✗ 1. 접속 설정 객체 만들기
// 출력: ✗ 2. 연결 문자열 만들기
// 출력: ✗ 3. 비밀번호 가리기
// 출력: ✗ 4. 연결 에러를 사람 말로
// 출력: ✗ 5. NUMERIC 을 제대로 더하기
// 출력: ✗ 6. DATE 를 날짜 글자로
// 출력: ✗ 7. 저장소 — 하나 조회하기
// 출력: ✗ 8. 저장소 — 없는 줄을 고쳤을 때
// 출력: ✗ 9. 에러 코드를 도메인 말로
// 출력: ✗ 10. 버그 찾기 — 풀이 마릅니다
// 출력: ✗ 11. 버그 찾기 — 롤백이 안 됩니다
// 출력: ✗ 12. 여러 저장소를 한 트랜잭션으로
// 출력: ✗ 13. [도전] 테스트를 롤백으로 뒷정리
// 출력: ✗ 14. [도전] N+1 을 고치기
// 출력: ✗ 15. [도전] 마이그레이션 러너

const 통과수 = 채점결과.filter((줄) => 줄.startsWith("✓")).length;

console.log(`통과 ${통과수} / ${채점결과.length}`);
// 출력: 통과 0 / 15

// 뒷정리
fs.rmSync(시험폴더, { recursive: true, force: true });
await 풀.end();
await 준비.query("DROP SCHEMA IF EXISTS 단원08_연습 CASCADE");
await 준비.end();
