// ============================================================
// 03단원 · 연습문제 — 넣고 읽고 고치고 지우기
// ------------------------------------------------------------
// 실행: node 연습문제.js
//
// `// TODO:` 를 채우고 다시 돌리세요. 통과하면 ✅ 로 바뀝니다.
// 정답과 "왜 그런지" 는 연습문제_정답.js 에 있습니다.
//
// ★ 처음에는 15문제 전부 ❌ 입니다. 정상입니다.
// ============================================================

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

await db.exec(`
  CREATE TABLE 설비 (
    id        SERIAL PRIMARY KEY,
    이름      TEXT NOT NULL UNIQUE,
    라인      TEXT NOT NULL,
    상태      TEXT NOT NULL DEFAULT '정지',
    담당자    TEXT,
    도입연도  INT
  );

  INSERT INTO 설비 (이름, 라인, 상태, 담당자, 도입연도) VALUES
    ('컨베이어 1호', 'A', '가동', '김반장', 2019),
    ('컨베이어 2호', 'A', '정지', NULL,     2021),
    ('프레스 1호',   'B', '가동', '이기사', 2018),
    ('프레스 2호',   'B', '점검', '김반장', 2023),
    ('용접로봇 1호', 'C', '가동', '박주임', 2022),
    ('CNC 선반 1호', 'C', '고장', NULL,     2017);

  CREATE TABLE 점검기록 (
    id      SERIAL PRIMARY KEY,
    설비명  TEXT NOT NULL,
    결과    TEXT NOT NULL,
    점검일  DATE NOT NULL
  );

  INSERT INTO 점검기록 (설비명, 결과, 점검일)
  SELECT '설비' || (i % 10 + 1),
         (ARRAY['정상','주의','불량'])[i % 3 + 1],
         DATE '2026-06-01' + (i % 30)
  FROM generate_series(1, 300) AS i;

  CREATE TABLE 일일생산 (
    설비명  TEXT NOT NULL,
    날짜    DATE NOT NULL,
    수량    INT NOT NULL,
    PRIMARY KEY (설비명, 날짜)
  );

  CREATE TABLE 작업자 (
    사번     TEXT PRIMARY KEY,
    이름     TEXT NOT NULL,
    비밀번호 TEXT NOT NULL
  );

  INSERT INTO 작업자 VALUES
    ('A1001', '김반장', 'gongjang1'),
    ('A1002', '이기사', 'press2024');
`);

const 결과들 = [];

async function 채점(번호, 제목, 검사) {
  let 통과 = false;

  try {
    통과 = (await 검사()) === true;
  } catch {
    통과 = false;
  }

  결과들.push(통과);
  console.log(`${String(번호).padStart(2)}. ${제목} — ${통과 ? "✅ 통과" : "❌ 아직"}`);
}


// ============================================================
// 문제 1 — INSERT 한 건
// ============================================================
//
// 설비 표에 아래 설비를 넣으세요. 칸 이름을 반드시 적으세요.
//   이름 '포장기 1호' · 라인 'A' · 상태 '가동' · 도입연도 2025

const 문제1 = `
  -- TODO: 여기에 INSERT 문을 쓰세요
  SELECT 1
`;

await 채점(1, "INSERT 한 건", async () => {
  await db.query(문제1);
  const 확인 = await db.query("SELECT 라인, 상태, 도입연도 FROM 설비 WHERE 이름 = '포장기 1호'");
  const 줄 = 확인.rows[0];
  return 줄?.라인 === "A" && 줄?.상태 === "가동" && 줄?.도입연도 === 2025;
});
// 출력:  1. INSERT 한 건 — ❌ 아직


// ============================================================
// 문제 2 — 여러 건을 한 문장으로
// ============================================================
//
// 아래 세 대를 **한 문장**으로 넣으세요. 상태는 적지 말고 기본값이 들어가게 하세요.
//   ('검사기 1호','A',2024) ('검사기 2호','B',2024) ('검사기 3호','C',2025)

const 문제2 = `
  -- TODO: VALUES 를 세 벌 이어 붙인 INSERT 문 하나를 쓰세요
  SELECT 1
`;

await 채점(2, "여러 건을 한 문장으로", async () => {
  const 넣기 = await db.query(문제2);
  const 확인 = await db.query("SELECT 상태 FROM 설비 WHERE 이름 LIKE '검사기%' ORDER BY 이름");
  return 넣기.affectedRows === 3 && 확인.rows.length === 3 && 확인.rows.every((줄) => 줄.상태 === "정지");
});
// 출력:  2. 여러 건을 한 문장으로 — ❌ 아직


// ============================================================
// 문제 3 — RETURNING 으로 id 받기
// ============================================================
//
// 설비를 넣고 **방금 넣은 줄의 id 와 이름**을 바로 돌려받으세요.
// 이름과 도입연도는 파라미터 $1, $2 로 받습니다. (문자열을 이어 붙이지 마세요)

async function 설비추가(이름, 도입연도) {
  // TODO: INSERT … RETURNING 을 써서 { id, 이름 } 을 돌려주세요
  return null;
}

await 채점(3, "RETURNING 으로 id 받기", async () => {
  const 돌아온것 = await 설비추가("레이저 커터 1호", 2020);
  const 확인 = await db.query("SELECT id FROM 설비 WHERE 이름 = '레이저 커터 1호'");
  return typeof 돌아온것?.id === "number" && 돌아온것.id === 확인.rows[0]?.id;
});
// 출력:  3. RETURNING 으로 id 받기 — ❌ 아직


// ============================================================
// 문제 4 — WHERE 와 IN
// ============================================================
//
// 상태가 '점검' 이거나 '고장' 인 설비의 **이름만** 골라 id 순으로 돌려주세요.
// IN 을 쓰세요.

const 문제4 = `
  -- TODO: 여기에 SELECT 문을 쓰세요
  SELECT 이름 FROM 설비 WHERE false
`;

await 채점(4, "WHERE 와 IN", async () => {
  const 결과 = await db.query(문제4);
  const 이름들 = 결과.rows.map((줄) => 줄.이름).join(",");
  const 칸들 = Object.keys(결과.rows[0] ?? {});
  return 이름들 === "프레스 2호,CNC 선반 1호" && 칸들.length === 1;
});
// 출력:  4. WHERE 와 IN — ❌ 아직


// ============================================================
// 문제 5 — NULL 찾기
// ============================================================
//
// 담당자가 정해지지 않은 설비가 몇 대인지 세어 주세요.
// 결과 칸 이름은 건수, 타입은 number 여야 합니다. (힌트: ::int)

const 문제5 = `
  -- TODO: 여기에 SELECT 문을 쓰세요
  SELECT -1 AS 건수
`;

await 채점(5, "NULL 찾기", async () => {
  const 결과 = await db.query(문제5);
  const 기대 = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 담당자 IS NULL");
  return 결과.rows[0]?.건수 === 기대.rows[0].건수 && 기대.rows[0].건수 > 0;
});
// 출력:  5. NULL 찾기 — ❌ 아직


// ============================================================
// 문제 6 — LIKE 로 검색하기
// ============================================================
//
// 이름에 'cnc' 가 들어간 설비를 **대소문자 상관없이** 찾으세요.
// 검색어는 파라미터 $1 로 받습니다.

async function 설비검색(검색어) {
  // TODO: ILIKE 와 파라미터를 써서 이름 배열을 돌려주세요
  return [];
}

await 채점(6, "LIKE 로 검색하기", async () => {
  const 찾은것 = await 설비검색("cnc");
  const 없는것 = await 설비검색("zzz");
  return 찾은것.join(",") === "CNC 선반 1호" && 없는것.length === 0;
});
// 출력:  6. LIKE 로 검색하기 — ❌ 아직


// ============================================================
// 문제 7 — 정렬과 자르기
// ============================================================
//
// 도입연도가 오래된 순으로 3대를 뽑으세요.
// ★ 도입연도가 같아도 순서가 흔들리지 않게 **id 를 정렬에 덧붙이세요.**

const 문제7 = `
  -- TODO: 여기에 SELECT 문을 쓰세요
  SELECT 이름 FROM 설비 WHERE false
`;

await 채점(7, "정렬과 자르기", async () => {
  const 결과 = await db.query(문제7);
  const 이름들 = 결과.rows.map((줄) => 줄.이름).join(",");
  return 이름들 === "CNC 선반 1호,프레스 1호,컨베이어 1호" && /ORDER\s+BY[\s\S]*,\s*id/i.test(문제7);
});
// 출력:  7. 정렬과 자르기 — ❌ 아직


// ============================================================
// 문제 8 — 별칭과 계산 칸
// ============================================================
//
// 설비마다 '이름' 과 '사용연수'(2026 - 도입연도)를 뽑되,
// 사용연수가 많은 순으로 2대만 보여 주세요. 별칭은 사용연수 로 하세요.
// ★ 도입연도가 비어 있는 설비는 빼세요.

const 문제8 = `
  -- TODO: 여기에 SELECT 문을 쓰세요
  SELECT 이름, 0 AS 사용연수 FROM 설비 WHERE false
`;

await 채점(8, "별칭과 계산 칸", async () => {
  const 결과 = await db.query(문제8);
  const 줄들 = 결과.rows.map((줄) => `${줄.이름}:${줄.사용연수}`).join(",");
  return 줄들 === "CNC 선반 1호:9,프레스 1호:8";
});
// 출력:  8. 별칭과 계산 칸 — ❌ 아직


// ============================================================
// 문제 9 — UPDATE 와 affectedRows
// ============================================================
//
// 라인 'C' 설비의 상태를 전부 '점검' 으로 바꾸고, **바뀐 줄 수**를 돌려주세요.
// ★ WHERE 를 빠뜨리지 마세요.

async function 라인점검(라인) {
  // TODO: UPDATE 를 실행하고 바뀐 줄 수(number)를 돌려주세요
  return -1;
}

await 채점(9, "UPDATE 와 affectedRows", async () => {
  const 대상 = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 라인 = 'C'");
  const 바뀐수 = await 라인점검("C");
  const 확인 = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 라인 = 'C' AND 상태 = '점검'");
  const 다른라인 = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 라인 <> 'C' AND 상태 = '점검'");

  // ★ WHERE 를 빠뜨렸으면 다른 라인까지 '점검' 이 되어 여기서 걸립니다.
  return 바뀐수 === 대상.rows[0].건수 && 확인.rows[0].건수 === 대상.rows[0].건수 && 다른라인.rows[0].건수 === 1;
});
// 출력:  9. UPDATE 와 affectedRows — ❌ 아직


// ============================================================
// 문제 10 — DELETE 와 RETURNING
// ============================================================
//
// 점검기록에서 결과가 '불량' 인 줄을 지우고, **지운 줄 수**를 돌려주세요.

async function 불량기록지우기() {
  // TODO: DELETE … RETURNING 을 쓰고 지운 줄 수를 돌려주세요
  return -1;
}

await 채점(10, "DELETE 와 RETURNING", async () => {
  const 지운수 = await 불량기록지우기();
  const 남은것 = await db.query("SELECT count(*)::int AS 건수 FROM 점검기록 WHERE 결과 = '불량'");
  return 지운수 === 100 && 남은것.rows[0].건수 === 0;
});
// 출력: 10. DELETE 와 RETURNING — ❌ 아직


// ============================================================
// 문제 11 — UPSERT
// ============================================================
//
// 같은 설비·같은 날짜로 여러 번 들어오면 수량을 **더하세요.**
// 처음이면 그냥 넣습니다. 한 문장으로 하세요. (힌트: ON CONFLICT · EXCLUDED)

async function 생산기록(설비명, 날짜, 수량) {
  // TODO: INSERT … ON CONFLICT … DO UPDATE 를 써서 최종 수량(number)을 돌려주세요
  return -1;
}

await 채점(11, "UPSERT", async () => {
  const 첫번 = await 생산기록("컨베이어 1호", "2026-08-01", 100);
  const 두번 = await 생산기록("컨베이어 1호", "2026-08-01", 30);
  const 다른날 = await 생산기록("컨베이어 1호", "2026-08-02", 7);
  const 줄수 = await db.query("SELECT count(*)::int AS 건수 FROM 일일생산");
  return 첫번 === 100 && 두번 === 130 && 다른날 === 7 && 줄수.rows[0].건수 === 2;
});
// 출력: 11. UPSERT — ❌ 아직


// ============================================================
// 문제 12 — ★ SQL 인젝션 막기
// ============================================================
//
// 아래 로그인 함수는 문자열을 이어 붙여서 뚫립니다.
// **파라미터 바인딩**으로 고치세요. 동작(정상 로그인)은 그대로여야 합니다.
//
//   원래 코드:
//     const 문장 = `SELECT 이름 FROM 작업자
//                   WHERE 사번 = '${사번}' AND 비밀번호 = '${비밀번호}'`;
//     return (await db.query(문장)).rows;

async function 로그인(사번, 비밀번호) {
  // TODO: $1, $2 를 써서 안전하게 고치세요. 줄 배열을 돌려줍니다
  return [];
}

await 채점(12, "★ SQL 인젝션 막기", async () => {
  const 정상 = await 로그인("A1001", "gongjang1");
  const 공격1 = await 로그인("A1001", "' OR '1'='1");
  const 공격2 = await 로그인("' OR 1=1 --", "아무거나");
  return 정상.length === 1 && 정상[0].이름 === "김반장" && 공격1.length === 0 && 공격2.length === 0;
});
// 출력: 12. ★ SQL 인젝션 막기 — ❌ 아직


// ============================================================
// 문제 13 — [도전] ★ 허용 목록으로 정렬 막기
// ============================================================
//
// 정렬 기준과 방향은 파라미터로 못 넣습니다. **허용 목록**으로 고르세요.
//
//   · 정렬칸은 '이름' · '라인' · '도입연도' 만 허용합니다
//   · 방향은 '오름' → ASC, '내림' → DESC 만 허용합니다
//   · 허용 목록에 없으면 정렬칸은 id, 방향은 ASC 로 떨어뜨립니다
//   · ★ 같은 값이 있어도 순서가 흔들리지 않게 정렬 끝에 id 를 붙이세요

async function 설비목록(정렬칸, 방향) {
  // TODO: 허용 목록에서 고른 값만 SQL 에 넣으세요. 이름 배열을 돌려줍니다
  return [];
}

await 채점(13, "[도전] 허용 목록으로 정렬 막기", async () => {
  const 뽑기 = async (sql) => (await db.query(sql)).rows.map((줄) => 줄.이름).join(",");

  const 기대이름순 = await 뽑기("SELECT 이름 FROM 설비 ORDER BY 이름, id");
  const 기대연도역순 = await 뽑기("SELECT 이름 FROM 설비 ORDER BY 도입연도 DESC, id");
  const 기대기본 = await 뽑기("SELECT 이름 FROM 설비 ORDER BY id");

  const 이름순 = (await 설비목록("이름", "오름")).join(",");
  const 연도역순 = (await 설비목록("도입연도", "내림")).join(",");
  const 공격 = (await 설비목록("이름; DROP TABLE 설비 --", "; DROP TABLE 설비 --")).join(",");
  const 기본 = (await 설비목록(undefined, undefined)).join(",");
  const 표살아있나 = await db.query("SELECT count(*)::int AS 건수 FROM 설비");

  return (
    이름순 === 기대이름순 &&
    연도역순 === 기대연도역순 &&
    공격 === 기대기본 &&
    기본 === 기대기본 &&
    표살아있나.rows[0].건수 > 0
  );
});
// 출력: 13. [도전] 허용 목록으로 정렬 막기 — ❌ 아직


// ============================================================
// 문제 14 — [도전] 키셋 페이지 나누기
// ============================================================
//
// OFFSET 을 쓰지 않고 다음 쪽을 가져오세요.
// 마지막으로 본 id 보다 큰 것 중 앞에서 몇 개를 가져옵니다.
//
//   · 마지막id 가 null 이면 처음부터
//   · id 오름차순, 한 쪽에 개수만큼
//   · 돌려줄 것: { ids: [...], 다음: 마지막 id 또는 null }

async function 다음쪽(마지막id, 개수) {
  // TODO: WHERE 와 ORDER BY 와 LIMIT 으로 만드세요. OFFSET 은 쓰지 마세요
  return { ids: [], 다음: null };
}

await 채점(14, "[도전] 키셋 페이지 나누기", async () => {
  const 첫쪽 = await 다음쪽(null, 5);
  const 둘째쪽 = await 다음쪽(첫쪽.다음, 5);
  const 겹침 = 첫쪽.ids.filter((id) => 둘째쪽.ids.includes(id));

  return (
    첫쪽.ids.length === 5 &&
    둘째쪽.ids.length === 5 &&
    겹침.length === 0 &&
    첫쪽.다음 === 첫쪽.ids[4] &&
    둘째쪽.ids[0] > 첫쪽.ids[4]
  );
});
// 출력: 14. [도전] 키셋 페이지 나누기 — ❌ 아직


// ============================================================
// 문제 15 — [도전] 대량으로 넣기
// ============================================================
//
// 점검기록에 1000건을 넣으세요. **왕복은 한 번**이어야 합니다.
//   · 설비명 : '대량설비' || i   (i 는 1부터 1000까지)
//   · 결과   : '정상'
//   · 점검일 : 2026-09-01 부터 하루씩 (i % 30 일을 더하세요)
//
// 힌트: generate_series 를 쓰면 INSERT … SELECT 한 문장으로 끝납니다.

async function 대량넣기() {
  // TODO: 한 문장으로 1000건을 넣고 넣은 줄 수를 돌려주세요
  return -1;
}

await 채점(15, "[도전] 대량으로 넣기", async () => {
  const 넣은수 = await 대량넣기();
  const 확인 = await db.query(`
    SELECT count(*)::int AS 건수,
           min(점검일) AS 처음,
           max(점검일) AS 마지막
    FROM 점검기록 WHERE 설비명 LIKE '대량설비%'
  `);
  const 줄 = 확인.rows[0];

  return (
    넣은수 === 1000 &&
    줄.건수 === 1000 &&
    줄.처음.toISOString().slice(0, 10) === "2026-09-01" &&
    줄.마지막.toISOString().slice(0, 10) === "2026-09-30"
  );
});
// 출력: 15. [도전] 대량으로 넣기 — ❌ 아직


// ============================================================

console.log(`\n맞힌 문제: ${결과들.filter(Boolean).length} / ${결과들.length}`);
// 출력:
// 출력: 맞힌 문제: 0 / 15

await db.close();
