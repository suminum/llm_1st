// ============================================================
// 03단원 · 개념 05 — 한 번에 여러 건 다루기
// ------------------------------------------------------------
// 실행: node 개념05_한번에_여러_건_다루기.js
//
// ★★ 이 파일은 25초쯤 걸립니다. 10만 건을 네 가지 방법으로 진짜로 넣습니다.
//   그중 하나(한 건씩 넣기)가 아주 느려서 그렇습니다. 그게 이 파일의 요점입니다.
// ============================================================
//
// 지금까지는 몇 건씩 다뤘습니다. 실무에서는 이런 일이 옵니다.
//
//   · 옛 시스템에서 설비 이력 200만 건을 옮겨야 합니다
//   · 매일 새벽에 어제 생산실적 30만 건을 넣습니다
//   · 잘못 들어간 값 50만 건을 고쳐야 합니다
//
// 한 건 넣는 코드를 for 문으로 감싸면 될 것 같습니다. **안 됩니다.**
// 얼마나 안 되는지 재 보겠습니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

const 건수 = 100000;

await db.exec(`
  CREATE TABLE 방법1 (id SERIAL PRIMARY KEY, 이름 TEXT NOT NULL, 라인 TEXT NOT NULL);
  CREATE TABLE 방법2 (id SERIAL PRIMARY KEY, 이름 TEXT NOT NULL, 라인 TEXT NOT NULL);
  CREATE TABLE 방법3 (id SERIAL PRIMARY KEY, 이름 TEXT NOT NULL, 라인 TEXT NOT NULL);
  CREATE TABLE 방법4 (id SERIAL PRIMARY KEY, 이름 TEXT NOT NULL, 라인 TEXT NOT NULL);
`);

const 라인들 = ["A", "B", "C"];


// ── 방법 ①: 한 건씩 10만 번 ──

// 가장 먼저 떠오르는 방법입니다. 그리고 가장 많이 쓰입니다.

const 시작1 = performance.now();

for (let 번호 = 1; 번호 <= 건수; 번호 += 1) {
  await db.query("INSERT INTO 방법1 (이름, 라인) VALUES ($1, $2)", [
    `설비${번호}`,
    라인들[번호 % 3],
  ]);
}

const 걸린1 = performance.now() - 시작1;

console.log(`① 한 건씩 ${건수.toLocaleString()}번 : ${(걸린1 / 1000).toFixed(1)} 초`);
// 출력?: ① 한 건씩 100,000번 : 19.4 초


// ── 방법 ②: 값을 묶어서 한 문장으로 ──

// VALUES 뒤에 괄호를 여러 개 이어 붙입니다. 1000건씩 끊어서 보냅니다.
//
// ★ 왜 1000건씩 끊나: Postgres 의 파라미터 개수 상한이 65535 개입니다.
//   칸이 2개면 한 문장에 32767 건까지입니다.
//   그리고 너무 크게 묶으면 문장을 만드는 쪽이 메모리를 많이 씁니다.
//   1000 ~ 5000 이 무난합니다.

const 묶음크기 = 1000;
const 시작2 = performance.now();

for (let 시작번호 = 1; 시작번호 <= 건수; 시작번호 += 묶음크기) {
  const 값들 = [];
  const 자리표시 = [];

  for (let 자리 = 0; 자리 < 묶음크기; 자리 += 1) {
    const 번호 = 시작번호 + 자리;

    값들.push(`설비${번호}`, 라인들[번호 % 3]);
    자리표시.push(`($${값들.length - 1}, $${값들.length})`);
  }

  // ★ 이어 붙이는 것은 자리표시($1, $2)뿐입니다. 값은 전부 파라미터로 갑니다.
  const 문장 = `INSERT INTO 방법2 (이름, 라인) VALUES ${자리표시.join(", ")}`;

  await db.query(문장, 값들);
}

const 걸린2 = performance.now() - 시작2;

console.log(`② ${묶음크기}건씩 묶어서 : ${(걸린2 / 1000).toFixed(2)} 초`);
// 출력?: ② 1000건씩 묶어서 : 0.70 초


// ── 방법 ③: 서버 안에서 만들기 (generate_series) ──

// 값이 규칙적이면 아예 서버가 만들게 합니다. 오가는 데이터가 **문장 하나**뿐입니다.

const 시작3 = performance.now();

await db.query(`
  INSERT INTO 방법3 (이름, 라인)
  SELECT '설비' || i, (ARRAY['A','B','C'])[i % 3 + 1]
  FROM generate_series(1, $1) AS i
`, [건수]);

const 걸린3 = performance.now() - 시작3;

console.log(`③ generate_series : ${(걸린3 / 1000).toFixed(2)} 초`);
// 출력?: ③ generate_series : 0.31 초


// ── 방법 ④: COPY ──

// COPY 는 "표에 데이터를 통째로 부어 넣는" 전용 명령입니다.
// 한 줄씩 파싱하는 INSERT 와 달리 CSV 를 그대로 받아 넣습니다.
//
// ★ PGlite 에서는 파일 대신 '/dev/blob' 이라는 특별한 자리를 씁니다.
//   진짜 서버에서는 파일 경로를 쓰거나, 프로그램에서 스트림으로 보냅니다. (08단원)

const 줄들 = [];

for (let 번호 = 1; 번호 <= 건수; 번호 += 1) {
  줄들.push(`설비${번호},${라인들[번호 % 3]}`);
}

const 시작4 = performance.now();

const 복사결과 = await db.query(
  "COPY 방법4 (이름, 라인) FROM '/dev/blob' WITH (FORMAT csv)",
  [],
  { blob: new Blob([줄들.join("\n") + "\n"]) },
);

const 걸린4 = performance.now() - 시작4;

console.log(`④ COPY : ${(걸린4 / 1000).toFixed(2)} 초 · ${복사결과.affectedRows.toLocaleString()}건`);
// 출력?: ④ COPY : 0.26 초 · 100,000건


// ── 결과 ──

const 센것 = await db.query(`
  SELECT (SELECT count(*)::int FROM 방법1) AS 하나,
         (SELECT count(*)::int FROM 방법2) AS 둘,
         (SELECT count(*)::int FROM 방법3) AS 셋,
         (SELECT count(*)::int FROM 방법4) AS 넷
`);

const 센줄 = 센것.rows[0];

console.log("네 방법 모두 10만 건이 들어갔나:", [센줄.하나, 센줄.둘, 센줄.셋, 센줄.넷].every((수) => 수 === 건수));
// 출력: 네 방법 모두 10만 건이 들어갔나: true

console.log(`② 는 ① 보다 ${(걸린1 / 걸린2).toFixed(0)} 배 빠릅니다`);
// 출력?: ② 는 ① 보다 28 배 빠릅니다

console.log(`③ 은 ① 보다 ${(걸린1 / 걸린3).toFixed(0)} 배 빠릅니다`);
// 출력?: ③ 은 ① 보다 63 배 빠릅니다

console.log(`④ 는 ① 보다 ${(걸린1 / 걸린4).toFixed(0)} 배 빠릅니다`);
// 출력?: ④ 는 ① 보다 75 배 빠릅니다

console.log("한 건씩이 가장 느린가:", 걸린1 > 걸린2 && 걸린1 > 걸린3 && 걸린1 > 걸린4);
// 출력: 한 건씩이 가장 느린가: true

// ★★★ 왜 이렇게까지 차이가 나는가 — **왕복 횟수** 때문입니다.
//
//   한 건 넣는 일 자체는 아주 빠릅니다. 0.01밀리초도 안 걸립니다.
//   시간을 잡아먹는 것은 그 앞뒤에 붙는 고정 비용입니다.
//
//     문장을 보낸다 → 서버가 파싱한다 → 계획을 세운다 → 실행한다
//     → 결과를 만든다 → 돌려보낸다 → 클라이언트가 받는다
//
//   이 고정 비용이 한 번에 0.2밀리초라고 하면,
//   10만 번이면 그것만 20초입니다. **데이터를 넣는 시간이 아니라 오가는 시간입니다.**
//
//   ★ 여기는 PGlite 라서 네트워크가 아예 없습니다. 그런데도 27배가 났습니다.
//     진짜 서버가 네트워크 건너에 있으면 왕복 하나가 0.5~2밀리초입니다.
//     그러면 10만 건에 1~3분입니다. 차이가 훨씬 커집니다.
//
// ★ 정리하면
//     ① 한 건씩       — 사용자가 화면에서 한 건 넣을 때. 그때만.
//     ② 묶음 INSERT   — 값이 프로그램 쪽에 있을 때의 기본. 가장 많이 씁니다
//     ③ INSERT SELECT — 값이 이미 데이터베이스 안에 있거나 규칙적으로 만들 수 있을 때
//     ④ COPY          — 파일에서 대량으로 부어 넣을 때. 가장 빠릅니다


// ── COPY 를 조금 더 ──

// COPY 는 반대 방향도 됩니다. 표를 CSV 로 뽑아냅니다.

const 내보내기 = await db.query("COPY (SELECT 이름, 라인 FROM 방법4 LIMIT 3) TO '/dev/blob' WITH (FORMAT csv)");
const 나온글 = await 내보내기.blob.text();

console.log("COPY 로 뽑은 CSV:", JSON.stringify(나온글));
// 출력: COPY 로 뽑은 CSV: "설비1,B\n설비2,C\n설비3,A\n"

// ★★ COPY 의 한계
//     · 한 줄이라도 잘못되면 **전부 실패합니다.** 어느 줄인지는 알려 줍니다
//     · ON CONFLICT 를 못 씁니다. 중복이 있으면 그냥 터집니다
//     · 트리거나 기본값 계산이 있으면 INSERT 만큼 느려질 수 있습니다
//
// ★ 실무에서는 이렇게 합니다.
//     ① 임시 표에 COPY 로 부어 넣고
//     ② INSERT … SELECT … ON CONFLICT 로 진짜 표에 옮깁니다
//   이러면 빠르면서 중복도 처리됩니다.


// ── 대량 UPDATE 를 한 번에 하면 무슨 일이 나나 ──

// 10만 건을 한 문장으로 고쳐 봅니다.

const 전크기 = await db.query("SELECT pg_total_relation_size('방법3')::int AS 크기");

const 시작UP = performance.now();
const 한번에 = await db.query("UPDATE 방법3 SET 라인 = 'D'");   // 검증무시: WHERE 없는 대량 UPDATE 를 보여 주는 예
const 걸린UP = performance.now() - 시작UP;

const 후크기 = await db.query("SELECT pg_total_relation_size('방법3')::int AS 크기");

console.log(`한 번에 ${한번에.affectedRows.toLocaleString()}건 UPDATE : ${걸린UP.toFixed(0)} ms`);
// 출력?: 한 번에 100,000건 UPDATE : 525 ms

console.log(`표 크기 : ${(전크기.rows[0].크기 / 1024 / 1024).toFixed(1)} MB → ${(후크기.rows[0].크기 / 1024 / 1024).toFixed(1)} MB`);
// 출력?: 표 크기 : 7.2 MB → 14.3 MB

console.log("표가 커졌는가:", 후크기.rows[0].크기 > 전크기.rows[0].크기);
// 출력: 표가 커졌는가: true

// ★★★ 10만 건을 고쳤을 뿐인데 표가 **두 배**가 됐습니다.
//
//   Postgres 는 줄을 고칠 때 그 자리를 덮어쓰지 않습니다.
//   **새 줄을 뒤에 쓰고, 옛 줄에 '죽었다' 고 표시합니다.**
//   그래야 같은 순간에 읽고 있던 다른 사람이 옛 값을 그대로 볼 수 있습니다. (07단원)
//
//   그래서 대량 UPDATE 는 이런 일을 함께 일으킵니다.
//     · 디스크가 갑자기 두 배로 늡니다. 꽉 차면 데이터베이스가 멈춥니다
//     · 트랜잭션이 길어져 그동안 그 표를 건드리는 다른 작업이 밀립니다
//     · 중간에 실패하면 10만 건이 통째로 되돌아갑니다. 그 시간이 또 걸립니다
//     · 복제본으로 보내는 로그가 한꺼번에 몰립니다
//
// ★★ 그래서 **나눠서** 합니다.

await db.exec("CREATE TABLE 나눠서 AS SELECT i AS id, '설비' || i AS 이름, 'A' AS 라인 FROM generate_series(1, 100000) AS i");
await db.exec("ALTER TABLE 나눠서 ADD PRIMARY KEY (id)");

const 시작나눔 = performance.now();
let 고친수 = 0;
let 번째 = 0;

for (let 시작id = 1; 시작id <= 100000; 시작id += 10000) {
  const 결과 = await db.query(
    "UPDATE 나눠서 SET 라인 = 'D' WHERE id >= $1 AND id < $2",
    [시작id, 시작id + 10000],
  );

  고친수 += 결과.affectedRows;
  번째 += 1;

  // 진짜 서버에서는 여기서 잠깐 쉽니다. 다른 작업에 자리를 내주려고요.
  //   await new Promise((r) => setTimeout(r, 100));
}

const 걸린나눔 = performance.now() - 시작나눔;

console.log(`1만 건씩 ${번째}번에 나눠서 : ${걸린나눔.toFixed(0)} ms · ${고친수.toLocaleString()}건`);
// 출력?: 1만 건씩 10번에 나눠서 : 529 ms · 100,000건

console.log(`한 번에 : ${걸린UP.toFixed(0)} ms / 나눠서 : ${걸린나눔.toFixed(0)} ms`);
// 출력?: 한 번에 : 525 ms / 나눠서 : 529 ms

// ★ 총 시간은 비슷하거나 나눠서 하는 쪽이 조금 더 걸립니다.
//   그래도 실무에서는 나누는 쪽이 맞습니다.
//
//   한 번에 하면  : 300초 동안 아무도 그 표를 못 씁니다. 실패하면 처음부터입니다
//   나눠서 하면   : 3초짜리 작업이 100번입니다. 사이사이 남이 끼어들 수 있고,
//                  중간에 실패해도 거기서부터 다시 하면 됩니다
//
// ★★ 나누는 기준은 **정렬된 키의 범위**로 잡으세요.
//   LIMIT 만 쓰면 매번 같은 줄을 다시 볼 수 있습니다 (개념02 의 그 문제입니다).

// 대량 DELETE 도 같습니다. 지울 것을 id 범위로 끊어서 지웁니다.

const 시작삭제 = performance.now();
let 지운수 = 0;
let 회차 = 0;

for (;;) {
  const 결과 = await db.query(
    "DELETE FROM 나눠서 WHERE id IN (SELECT id FROM 나눠서 ORDER BY id LIMIT 10000)",
  );

  지운수 += 결과.affectedRows;
  회차 += 1;

  if (결과.affectedRows === 0) break;
}

console.log(`1만 건씩 지우기 : ${회차}번 돌아서 ${지운수.toLocaleString()}건 · ${(performance.now() - 시작삭제).toFixed(0)} ms`);
// 출력?: 1만 건씩 지우기 : 11번 돌아서 100,000건 · 608 ms

// ★ 마지막 한 번은 0건이 나옵니다. 그게 '다 지웠다' 는 신호입니다.
//
// ★★ 아주 많이 지울 거면 다른 방법이 낫습니다.
//     · 표의 90% 이상을 지운다   → 남길 것만 새 표에 넣고 표를 바꿔치기
//     · 기간별로 계속 지운다     → 파티션을 나눠서 통째로 떼어 내기 (10단원)


// ── generate_series 로 시험 데이터 만들기 ──

// 앞으로 계속 쓸 도구입니다. 이 함수 하나면 시험 데이터를 마음대로 만듭니다.

const 맛보기 = await db.query("SELECT i FROM generate_series(1, 5) AS i");

console.log("1부터 5까지:", 맛보기.rows.map((줄) => 줄.i).join(", "));
// 출력: 1부터 5까지: 1, 2, 3, 4, 5

const 건너뛰기 = await db.query("SELECT i FROM generate_series(0, 20, 5) AS i");

console.log("0부터 20까지 5씩:", 건너뛰기.rows.map((줄) => 줄.i).join(", "));
// 출력: 0부터 20까지 5씩: 0, 5, 10, 15, 20

const 날짜 = await db.query(`
  SELECT to_char(날, 'YYYY-MM-DD') AS 날짜
  FROM generate_series(DATE '2026-08-01', DATE '2026-08-05', INTERVAL '1 day') AS 날
`);

console.log("날짜도 됩니다:", 날짜.rows.map((줄) => 줄.날짜).join(", "));
// 출력: 날짜도 됩니다: 2026-08-01, 2026-08-02, 2026-08-03, 2026-08-04, 2026-08-05

// ★ 이 셋을 섞으면 그럴듯한 시험 데이터가 나옵니다.

await db.exec(`
  CREATE TABLE 생산실적 (
    id      SERIAL PRIMARY KEY,
    설비명  TEXT NOT NULL,
    라인    TEXT NOT NULL,
    생산일  DATE NOT NULL,
    수량    INT NOT NULL,
    불량    INT NOT NULL
  );
`);

await db.query(`
  INSERT INTO 생산실적 (설비명, 라인, 생산일, 수량, 불량)
  SELECT
    '설비' || (i % 50 + 1),
    (ARRAY['A','B','C'])[i % 3 + 1],
    DATE '2026-01-01' + (i % 180),
    800 + (i % 400),
    (i % 17)
  FROM generate_series(1, 50000) AS i
`);

const 요약 = await db.query(`
  SELECT 라인,
         count(*)::int   AS 건수,
         sum(수량)::int  AS 총생산,
         sum(불량)::int  AS 총불량
  FROM 생산실적
  GROUP BY 라인
  ORDER BY 라인
`);

for (const 줄 of 요약.rows) {
  console.log(`라인 ${줄.라인} — ${줄.건수}건 · 생산 ${줄.총생산.toLocaleString()} · 불량 ${줄.총불량.toLocaleString()}`);
}
// 출력: 라인 A — 16666건 · 생산 16,657,933 · 불량 133,326
// 출력: 라인 B — 16667건 · 생산 16,658,600 · 불량 133,333
// 출력: 라인 C — 16667건 · 생산 16,658,467 · 불량 133,323

// ★ 무작위가 필요하면 random() 을 씁니다.
//   단, 무작위를 쓰면 돌릴 때마다 값이 달라져서 결과를 비교하기 어렵습니다.
//   그래서 이 자료에서는 i % 나머지 를 씁니다. **언제 돌려도 같은 데이터**가 나옵니다.
//
// ★ 색인이 있을 때와 없을 때의 차이를 재려면 이런 데이터가 꼭 필요합니다.
//   06단원에서 이 방식으로 만든 표를 계속 씁니다.


// ============================================================
// 정리 — 한 번에 여러 건
// ============================================================
//
//   10만 건 넣기 (이 컴퓨터에서 잰 값)
//   ──────────────────────────────────────────────────────────────
//   ① 한 건씩 10만 번        가장 느립니다 (수십 배)
//   ② 1000건씩 묶은 INSERT    ① 보다 수십 배 빠름 · 가장 많이 씁니다
//   ③ INSERT … SELECT        ② 와 비슷하거나 조금 빠름 · 서버 안에서 만들 때
//   ④ COPY                   가장 빠름 · 파일에서 부어 넣을 때
//
//   왜 그런가 : 한 건을 넣는 시간이 아니라 **왕복하는 시간**이 대부분입니다
//
//   대량 UPDATE / DELETE
//   ──────────────────────────────────────────────────────────────
//   한 번에 하면    표가 두 배로 붑니다 · 그동안 다른 작업이 밀립니다
//                  실패하면 처음부터입니다
//   나눠서 하면     총 시간은 더 걸리지만 사이사이 남이 끼어들 수 있고
//                  실패해도 이어서 할 수 있습니다
//   나누는 기준     ★ 정렬된 키의 범위로. LIMIT 만 쓰면 같은 줄을 또 봅니다
//
//   generate_series
//   ──────────────────────────────────────────────────────────────
//   generate_series(1, 100)                       1부터 100까지
//   generate_series(0, 20, 5)                     5씩 건너뛰며
//   generate_series(날짜, 날짜, INTERVAL '1 day')  날짜도 됩니다


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 방법 ② 의 묶음크기를 100 · 1000 · 5000 으로 바꿔 재 보세요.
//                    계속 빨라지나요? 어디서 더 안 빨라지나요?
//
// ✏️ 직접 해보기 2 — 방법 ① 을 트랜잭션 하나로 감싸 보세요.
//                    db.transaction 안에서 10만 번 넣으면 얼마나 빨라지나요?
//                    (힌트: 문장마다 커밋하지 않게 되어 꽤 빨라집니다)
//
// ✏️ 직접 해보기 3 — 묶음크기를 40000 으로 해 보세요. 어떤 에러가 나나요?
//                    (힌트: 칸이 2개면 파라미터가 8만 개입니다. 상한은 65535 입니다)
//
// ✏️ 직접 해보기 4 — COPY 로 넣을 CSV 한 줄에 칸을 세 개 넣어 보세요.
//                    어떤 에러가 나고, 다른 줄은 들어가나요?
//
// ✏️ 직접 해보기 5 — 나눠서 UPDATE 하는 반복문에 100밀리초 쉬는 줄을 넣어 보세요.
//                    전체 시간은 얼마나 늘어나나요? 그만한 값어치가 있을까요?
//
// ✏️ 직접 해보기 6 — generate_series 와 random() 으로 시험 데이터를 만들어 보세요.
//                    두 번 돌리면 결과가 같나요? setseed() 를 쓰면 어떻게 되나요?


// ── 자주 하는 실수 ──

// [실수 1] for 문 안에서 await 로 한 건씩 넣음
//   이 파일에서 잰 그대로입니다. 10만 건이면 수십 배가 됩니다.
//   묶어서 보내거나 INSERT … SELECT 로 바꾸세요.

// [실수 2] Promise.all 로 한꺼번에 10만 개를 던짐
//   빨라지지 않습니다. 연결은 하나뿐이라 줄을 서고, 메모리만 터집니다.
//   동시에 던지는 게 아니라 **한 문장에 묶는 것**이 답입니다.

// [실수 3] 묶음 INSERT 를 문자열 이어 붙이기로 만듦
//   값이 10만 개면 인젝션 위험도 10만 배입니다.
//   자리표시($1, $2)만 이어 붙이고 값은 파라미터 배열로 보내세요. (개념03)

// [실수 4] 운영 시간에 대량 UPDATE 를 한 방에 돌림
//   표가 두 배로 붓고 다른 작업이 전부 밀립니다.
//   나눠서, 되도록 한가한 시간에 하세요.

// [실수 5] 나눌 때 LIMIT 만 씀
//   ORDER BY 없이 LIMIT 으로 끊으면 같은 줄을 또 보거나 어떤 줄을 건너뜁니다.
//   id 범위로 끊거나, 마지막으로 본 id 를 기억하세요.

// [실수 6] 대량 작업 뒤에 통계를 안 고침
//   많이 넣고 지우면 계획을 세우는 근거가 낡습니다. ANALYZE 를 한 번 돌려 주세요.
//   왜 그게 중요한지는 06단원에서 실행계획을 보며 다룹니다.


await db.close();
