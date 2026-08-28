// ============================================================
// 03단원 · 개념 04 — 고치고 지우기
// ------------------------------------------------------------
// 실행: node 개념04_고치고_지우기.js
//
// ★ 20만 건을 지우는 실험이 있어 3초쯤 걸립니다.
// ============================================================
//
// 넣었고(개념01) 읽었습니다(개념02). 이제 고치고 지웁니다.
//
// UPDATE 와 DELETE 는 문법이 아주 짧습니다. 반나절이면 다 배웁니다.
// 그런데 **운영 사고의 대부분이 이 둘에서 납니다.**
//
// 이유는 하나입니다. SELECT 는 틀려도 화면만 이상하지만,
// UPDATE 와 DELETE 는 **틀리는 순간 데이터가 사라집니다.**
//
// 그래서 이 파일은 문법보다 '안 틀리는 습관' 에 무게를 둡니다.
// WHERE 를 빠뜨렸을 때 무슨 일이 나는지 진짜로 돌려 봅니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();


// ── 섹션 0: 설비 표를 만듭니다 ──

await db.exec(`
  CREATE TABLE 설비 (
    id        SERIAL PRIMARY KEY,
    이름      TEXT NOT NULL,
    라인      TEXT NOT NULL,
    상태      TEXT NOT NULL,
    점검횟수  INT NOT NULL DEFAULT 0,
    삭제일시  TIMESTAMPTZ
  );

  INSERT INTO 설비 (이름, 라인, 상태) VALUES
    ('컨베이어 1호', 'A', '가동'),
    ('컨베이어 2호', 'A', '정지'),
    ('프레스 1호',   'B', '가동'),
    ('프레스 2호',   'B', '점검'),
    ('용접로봇 1호', 'C', '가동'),
    ('CNC 선반 1호', 'C', '고장');
`);

async function 상태보기() {
  const 결과 = await db.query("SELECT 이름, 상태 FROM 설비 ORDER BY id");
  return 결과.rows.map((줄) => `${줄.이름}=${줄.상태}`).join(" · ");
}

console.log("처음:", await 상태보기());
// 출력: 처음: 컨베이어 1호=가동 · 컨베이어 2호=정지 · 프레스 1호=가동 · 프레스 2호=점검 · 용접로봇 1호=가동 · CNC 선반 1호=고장


// ── 섹션 1: UPDATE 의 기본 ──

//   UPDATE 표이름
//   SET 칸1 = 값1, 칸2 = 값2
//   WHERE 조건
//
// ★ SET 은 쉼표로 여러 칸을 한 번에 바꿉니다.
// ★ WHERE 는 SELECT 의 WHERE 와 완전히 똑같습니다. 개념02 에서 배운 것 그대로입니다.

const 한건고침 = await db.query(
  "UPDATE 설비 SET 상태 = $1 WHERE 이름 = $2",
  ["점검", "컨베이어 1호"],
);

console.log("바뀐 줄 수:", 한건고침.affectedRows);
// 출력: 바뀐 줄 수: 1

// 여러 칸을 한 번에 바꿉니다. 지금 값을 계산에 쓸 수도 있습니다.

await db.query("UPDATE 설비 SET 상태 = '가동', 점검횟수 = 점검횟수 + 1 WHERE 라인 = 'A'");

const 라인A = await db.query("SELECT 이름, 상태, 점검횟수 FROM 설비 WHERE 라인 = 'A' ORDER BY id");

console.log("라인 A:", 라인A.rows.map((줄) => `${줄.이름}(${줄.상태}/${줄.점검횟수}회)`).join(" · "));
// 출력: 라인 A: 컨베이어 1호(가동/1회) · 컨베이어 2호(가동/1회)

// ★★ 점검횟수 = 점검횟수 + 1 은 **데이터베이스 안에서** 더합니다.
//   읽어 와서 자바스크립트로 더한 뒤 다시 쓰면, 그 사이에 남이 더한 값이 사라집니다.
//   01단원에서 파일로 겪은 그 사고와 같은 모양입니다.
//   숫자를 늘릴 때는 언제나 이 형태로 쓰세요.

// 조건에 맞는 줄이 없으면 그냥 0건입니다. 에러가 아닙니다.

const 없는것 = await db.query("UPDATE 설비 SET 상태 = '가동' WHERE id = 9999");

console.log("없는 id 를 고치면:", 없는것.affectedRows, "건 (에러 아님)");
// 출력: 없는 id 를 고치면: 0 건 (에러 아님)

// ★★ 그래서 "수정했습니다" 를 띄우기 전에 affectedRows 를 봐야 합니다.
//   0 이면 그 줄은 없거나, 남이 이미 지웠거나, 조건이 틀린 것입니다.


// ── 섹션 2: ★★★ WHERE 를 빠뜨리면 전부 바뀝니다 ──

// 이런 일이 실제로 벌어집니다.
//
//   개발자가 SQL 편집기에 이렇게 씁니다.
//
//     UPDATE 설비 SET 상태 = '정지'
//     WHERE 라인 = 'C'
//
//   그런데 실행 버튼을 누를 때 **첫 줄만 선택된 상태**였습니다.
//   또는 WHERE 를 쓰기 전에 실수로 실행했습니다.
//
// 진짜로 해 보겠습니다.

const 전체건수 = await db.query("SELECT count(*)::int AS 건수 FROM 설비");

console.log("설비는 모두", 전체건수.rows[0].건수, "대입니다");
// 출력: 설비는 모두 6 대입니다

const 사고 = await db.query("UPDATE 설비 SET 상태 = '정지'");   // 검증무시: WHERE 를 일부러 빠뜨린 예

console.log("바뀐 줄 수:", 사고.affectedRows);
// 출력: 바뀐 줄 수: 6

console.log("지금 상태:", await 상태보기());
// 출력: 지금 상태: 컨베이어 1호=정지 · 컨베이어 2호=정지 · 프레스 1호=정지 · 프레스 2호=정지 · 용접로봇 1호=정지 · CNC 선반 1호=정지

// ★★★ 여섯 대가 전부 '정지' 가 됐습니다.
//
//   에러도 경고도 없습니다. SQL 문법상 아무 잘못이 없습니다.
//   "WHERE 를 안 쓰면 전부" 가 규칙이기 때문입니다.
//
//   그리고 **되돌릴 수 없습니다.**
//   바뀌기 전 값이 어디에도 안 남습니다.
//   컨베이어 1호가 원래 '점검' 이었는지 '가동' 이었는지 아무도 모릅니다.
//
//   복구하려면 백업에서 표 전체를 되살려야 하는데,
//   그 사이에 들어온 정상 데이터도 같이 날아갑니다.

// 지금이 어떤 상태였는지 아무도 모르니, 실습을 위해 다시 만들어 둡니다.
await db.exec(`
  UPDATE 설비 SET 상태 = '가동' WHERE id IN (1, 3, 5);
  UPDATE 설비 SET 상태 = '정지' WHERE id = 2;
  UPDATE 설비 SET 상태 = '점검' WHERE id = 4;
  UPDATE 설비 SET 상태 = '고장' WHERE id = 6;
`);


// ── 섹션 3: 안 틀리는 습관 세 가지 ──

// ★ 습관 ① — 같은 WHERE 로 SELECT 를 먼저 돌립니다.
//
//   UPDATE 를 쓰기 전에 SELECT 로 바꿔서 돌려 봅니다.
//   몇 건이 나오는지 눈으로 확인하고, 그 숫자가 예상과 같을 때만 UPDATE 로 바꿉니다.

const 미리보기 = await db.query("SELECT id, 이름 FROM 설비 WHERE 라인 = 'A'");

console.log("바뀔 줄:", 미리보기.rowCount, "건 ·", 미리보기.rows.map((줄) => 줄.이름).join(", "));
// 출력: 바뀔 줄: 2 건 · 컨베이어 1호, 컨베이어 2호

// 숫자가 맞으면 그때 UPDATE 로 바꿉니다.

const 확인후 = await db.query("UPDATE 설비 SET 상태 = '점검' WHERE 라인 = 'A'");

console.log("실제로 바뀐 줄:", 확인후.affectedRows, "· 미리 본 것과 같은가:", 확인후.affectedRows === 미리보기.rowCount);
// 출력: 실제로 바뀐 줄: 2 · 미리 본 것과 같은가: true

// ★ 습관 ② — 트랜잭션 안에서 하고, 숫자가 이상하면 되돌립니다.
//
//   트랜잭션은 "묶어서 전부 되거나 전부 안 되게" 하는 장치입니다.
//   자세한 것은 07단원에서 합니다. 여기서는 되돌리기만 씁니다.

const 되돌린결과 = await db
  .transaction(async (tx) => {
    const 바뀜 = await tx.query("UPDATE 설비 SET 상태 = '폐기'");   // 검증무시: WHERE 를 빠뜨린 예

    if (바뀜.affectedRows > 3) {
      // 예상보다 많이 바뀌었습니다. 던지면 통째로 되돌아갑니다.
      throw new Error(`${바뀜.affectedRows}건이나 바뀝니다`);
    }

    return "커밋했습니다";
  })
  .catch((에러) => `되돌렸습니다 — ${에러.message}`);

console.log(되돌린결과);
// 출력: 되돌렸습니다 — 6건이나 바뀝니다

const 폐기건수 = await db.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 상태 = '폐기'");

console.log("폐기 상태로 남은 줄:", 폐기건수.rows[0].건수, "건");
// 출력: 폐기 상태로 남은 줄: 0 건

// ★★ 여섯 건이 바뀌었다가 통째로 되돌아왔습니다. 아무 흔적도 안 남았습니다.
//   운영 데이터베이스에서 손으로 UPDATE 를 칠 때는 반드시 이 형태로 하세요.
//
//     BEGIN;
//     UPDATE …;          ← 몇 건인지 봅니다
//     ROLLBACK;          ← 이상하면 되돌리고
//     COMMIT;            ← 맞으면 확정합니다
//
// ★ 습관 ③ — RETURNING 으로 무엇이 바뀌었는지 눈으로 봅니다. 다음 섹션에서 합니다.


// ── 섹션 4: RETURNING 으로 바뀐 것 확인하기 ──

// UPDATE 와 DELETE 에도 RETURNING 을 붙일 수 있습니다.
// 바뀐 줄이 그대로 돌아옵니다.

const 바뀐것 = await db.query(`
  UPDATE 설비 SET 점검횟수 = 점검횟수 + 1
  WHERE 라인 = 'B'
  RETURNING id, 이름, 점검횟수
`);

console.log("바뀐 줄들:", 바뀐것.rows.map((줄) => `${줄.이름}→${줄.점검횟수}회`).join(" · "));
// 출력: 바뀐 줄들: 프레스 1호→1회 · 프레스 2호→1회

// ★★ RETURNING 은 **바뀐 뒤의 값**을 줍니다. 바뀌기 전 값이 아닙니다.
//   바뀌기 전 값이 필요하면 미리 SELECT 해 두거나, 07단원의 트랜잭션 안에서 처리합니다.
//
// ★ 로그를 남길 때 아주 유용합니다.
//   "누가 무엇을 몇 건 바꿨는지" 를 왕복 한 번으로 기록할 수 있습니다.


// ── 섹션 5: DELETE 와 TRUNCATE ──

const 지움 = await db.query("DELETE FROM 설비 WHERE 상태 = '고장' RETURNING 이름");

console.log("지운 것:", 지움.affectedRows, "건 ·", 지움.rows.map((줄) => 줄.이름).join(", "));
// 출력: 지운 것: 1 건 · CNC 선반 1호

// ★★★ DELETE 도 WHERE 를 빠뜨리면 전부 지웁니다. UPDATE 와 똑같습니다.
//   `DELETE FROM 설비` 한 줄이면 표가 빕니다.

// TRUNCATE 는 표를 통째로 비웁니다. 둘이 어떻게 다른지 재 봅니다.

await db.exec(`
  CREATE TABLE 로그1 AS SELECT i AS id, '점검' AS 종류 FROM generate_series(1, 200000) AS i;
  CREATE TABLE 로그2 AS SELECT i AS id, '점검' AS 종류 FROM generate_series(1, 200000) AS i;
`);

const 지우기시작 = performance.now();
const 델리트 = await db.query("DELETE FROM 로그1");
const 델리트ms = performance.now() - 지우기시작;

const 자르기시작 = performance.now();
await db.query("TRUNCATE 로그2");
const 트렁케이트ms = performance.now() - 자르기시작;

console.log(`20만 건 · DELETE ${델리트ms.toFixed(0)} ms / TRUNCATE ${트렁케이트ms.toFixed(0)} ms`);
// 출력?: 20만 건 · DELETE 107 ms / TRUNCATE 3 ms

console.log("TRUNCATE 가 더 빠른가:", 트렁케이트ms < 델리트ms);
// 출력: TRUNCATE 가 더 빠른가: true

console.log("DELETE 는 몇 건인지 알려 주는가:", 델리트.affectedRows);
// 출력: DELETE 는 몇 건인지 알려 주는가: 200000

// 디스크 자리도 다릅니다.

const 자리 = await db.query(`
  SELECT pg_total_relation_size('로그1')::int AS 델리트후,
         pg_total_relation_size('로그2')::int AS 트렁케이트후
`);

console.log("남은 자리 — DELETE 후:", 자리.rows[0].델리트후, "바이트 / TRUNCATE 후:", 자리.rows[0].트렁케이트후, "바이트");
// 출력?: 남은 자리 — DELETE 후: 8921088 바이트 / TRUNCATE 후: 8192 바이트

console.log("DELETE 후에도 자리가 남아 있는가:", 자리.rows[0].델리트후 > 0);
// 출력: DELETE 후에도 자리가 남아 있는가: true

// ★★ 왜 이렇게 다른가
//
//   DELETE   는 줄을 하나씩 '지웠다고 표시' 합니다.
//            옛 줄이 그대로 남아 있어서 자리를 차지합니다. (VACUUM 이 나중에 치웁니다)
//            그 대신 WHERE 를 쓸 수 있고, 트랜잭션 안에서 되돌릴 수 있고,
//            RETURNING 으로 무엇을 지웠는지 받을 수 있습니다.
//
//   TRUNCATE 는 파일을 통째로 새로 만듭니다. 그래서 순식간입니다.
//            그 대신 WHERE 가 없고, RETURNING 도 없습니다. 전부 아니면 아무것도 아닙니다.
//
//   ★ TRUNCATE … RESTART IDENTITY 를 쓰면 SERIAL 번호도 1 부터 다시 시작합니다.
//     그냥 TRUNCATE 만 하면 번호는 이어집니다.

const 잘못된시도 = await db.query("TRUNCATE 로그2 RETURNING id").catch((에러) => 에러);

console.log("TRUNCATE 에 RETURNING:", 잘못된시도.code);
// 출력: TRUNCATE 에 RETURNING: 42601

// ★ 실무에서는: 시험 데이터를 갈아엎을 때만 TRUNCATE 를 씁니다.
//   운영 표에는 거의 안 씁니다. 되돌릴 여지가 너무 적습니다.


// ── 섹션 6: ★ UPSERT — 있으면 고치고 없으면 넣기 ──

// 이런 요구가 아주 흔합니다.
//
//   "설비별 일일 생산량을 기록하는데, 같은 날 두 번 오면 더해 주세요"
//
// 이걸 순진하게 짜면 이렇게 됩니다.
//
//   ① SELECT 로 있는지 본다
//   ② 있으면 UPDATE, 없으면 INSERT
//
// ★★ ① 과 ② 사이에 남이 넣으면 깨집니다. 그리고 왕복이 두 번입니다.
//   Postgres 는 이걸 한 문장으로 합니다.

await db.exec(`
  CREATE TABLE 일일생산 (
    설비명  TEXT NOT NULL,
    날짜    DATE NOT NULL,
    수량    INT NOT NULL,
    PRIMARY KEY (설비명, 날짜)
  );
`);

async function 생산기록(설비명, 수량) {
  const 결과 = await db.query(
    `INSERT INTO 일일생산 (설비명, 날짜, 수량)
     VALUES ($1, DATE '2026-08-01', $2)
     ON CONFLICT (설비명, 날짜)
     DO UPDATE SET 수량 = 일일생산.수량 + EXCLUDED.수량
     RETURNING 수량`,
    [설비명, 수량],
  );

  return 결과.rows[0].수량;
}

console.log("첫 기록:", await 생산기록("컨베이어 1호", 100));
// 출력: 첫 기록: 100

console.log("같은 날 또:", await 생산기록("컨베이어 1호", 30));
// 출력: 같은 날 또: 130

console.log("또 한 번:", await 생산기록("컨베이어 1호", 5));
// 출력: 또 한 번: 135

// ★ EXCLUDED 가 무엇인가
//
//   **"넣으려다 부딪힌 그 값들"** 을 담고 있는 가상의 줄입니다.
//
//     일일생산.수량   → 이미 표에 들어 있던 값   (100)
//     EXCLUDED.수량   → 이번에 넣으려던 값       (30)
//
//   그래서 `일일생산.수량 + EXCLUDED.수량` 이 "쌓기" 가 됩니다.
//   `EXCLUDED.수량` 만 쓰면 "덮어쓰기" 가 됩니다.

await db.query(
  `INSERT INTO 일일생산 (설비명, 날짜, 수량) VALUES ('컨베이어 1호', DATE '2026-08-01', 7)
   ON CONFLICT (설비명, 날짜) DO UPDATE SET 수량 = EXCLUDED.수량`,
);

const 덮어쓴것 = await db.query("SELECT 수량 FROM 일일생산 WHERE 설비명 = '컨베이어 1호'");

console.log("덮어쓰기 뒤:", 덮어쓴것.rows[0].수량);
// 출력: 덮어쓰기 뒤: 7

// ★ DO NOTHING — 부딪히면 그냥 넘어갑니다. 에러도 안 냅니다.

const 아무것도안함 = await db.query(
  `INSERT INTO 일일생산 (설비명, 날짜, 수량) VALUES ('컨베이어 1호', DATE '2026-08-01', 999)
   ON CONFLICT DO NOTHING
   RETURNING 수량`,
);

console.log("DO NOTHING 결과:", 아무것도안함.affectedRows, "건 · 값은 그대로", (await db.query("SELECT 수량 FROM 일일생산 WHERE 설비명 = '컨베이어 1호'")).rows[0].수량);
// 출력: DO NOTHING 결과: 0 건 · 값은 그대로 7

// ★★ 언제 무엇을 쓰나
//
//   DO UPDATE   설정값 저장, 일별 집계 쌓기, 외부 시스템에서 받은 데이터 동기화
//   DO NOTHING  같은 요청이 두 번 와도 한 번만 처리해야 할 때 (중복 방지)
//
// ★ 주의: ON CONFLICT 의 괄호에는 **UNIQUE 나 PRIMARY KEY 가 걸린 칸**만 쓸 수 있습니다.
//   그냥 아무 칸이나 쓰면 42P10 에러가 납니다.


// ── 섹션 7: UPDATE ... FROM — 다른 표를 보고 고치기 ──

// "라인별 기본 상태표대로 설비 상태를 맞춰 주세요" 같은 요구입니다.

await db.exec(`
  CREATE TABLE 라인정책 (
    라인      TEXT PRIMARY KEY,
    기본상태  TEXT NOT NULL
  );

  INSERT INTO 라인정책 VALUES ('A', '가동'), ('B', '정지');
`);

const 정책적용 = await db.query(`
  UPDATE 설비
  SET 상태 = 라인정책.기본상태
  FROM 라인정책
  WHERE 설비.라인 = 라인정책.라인
  RETURNING 설비.이름, 설비.상태
`);

console.log(
  "정책 적용:",
  정책적용.rows.map((줄) => `${줄.이름}=${줄.상태}`).sort().join(" · "),
);
// 출력: 정책 적용: 컨베이어 1호=가동 · 컨베이어 2호=가동 · 프레스 1호=정지 · 프레스 2호=정지

// ★ FROM 에 다른 표를 적고 WHERE 로 이어 줍니다. JOIN 과 같은 모양입니다.
//   라인정책에 없는 라인 C 는 안 바뀌었습니다. WHERE 로 이어지지 않았으니까요.
//
// ★★ 실수 주의: WHERE 의 이어 주는 조건을 빼먹으면
//   모든 조합이 만들어져서 **전부 아무 값으로나 바뀝니다.** WHERE 없는 UPDATE 보다 나쁩니다.


// ── 섹션 8: 소프트 삭제 vs 진짜 삭제 ──

// 지우는 대신 '지웠다는 표시' 만 하는 방법입니다.
// 설비 표에 만들어 둔 삭제일시 칸을 씁니다.

await db.query("UPDATE 설비 SET 삭제일시 = now() WHERE 이름 = $1", ["프레스 2호"]);

const 살아있는것 = await db.query("SELECT 이름 FROM 설비 WHERE 삭제일시 IS NULL ORDER BY id");
const 전부 = await db.query("SELECT 이름 FROM 설비 ORDER BY id");

console.log("살아 있는 설비:", 살아있는것.rows.length, "대 / 표에 있는 줄:", 전부.rows.length, "줄");
// 출력: 살아 있는 설비: 4 대 / 표에 있는 줄: 5 줄

// ★★ 트레이드오프
//
//   소프트 삭제가 좋은 점
//     · 실수로 지워도 되살립니다 (삭제일시 = NULL 로)
//     · 언제 누가 지웠는지 남습니다
//     · 지워진 설비를 가리키던 점검기록이 깨지지 않습니다
//
//   소프트 삭제의 대가
//     · ★★ **모든 조회에 `AND 삭제일시 IS NULL` 을 붙여야 합니다.**
//       한 군데라도 빠뜨리면 지운 설비가 화면에 나옵니다. 이게 제일 자주 나는 버그입니다
//     · UNIQUE 제약이 깨집니다. 같은 이름을 지웠다 또 만들면 중복이 됩니다
//       (부분 색인으로 풀 수 있습니다. 06단원에서 다룹니다)
//     · 데이터가 계속 쌓입니다. 지워도 안 줄어듭니다
//     · 개인정보는 법적으로 진짜로 지워야 하는 경우가 많습니다
//
// ★ 실무 판단 기준
//     · 되살릴 일이 있는가 → 있으면 소프트 삭제
//     · 다른 표가 이 줄을 가리키는가 → 가리키면 소프트 삭제
//     · 개인정보인가 → 그러면 진짜 삭제 (또는 값만 비우기)
//     · 로그·이력 성격인가 → 애초에 지우지 말고 기간별로 옮기세요

const 되살리기 = await db.query(
  "UPDATE 설비 SET 삭제일시 = NULL WHERE 이름 = $1 RETURNING 이름",
  ["프레스 2호"],
);

console.log("되살린 설비:", 되살리기.affectedRows, "건");
// 출력: 되살린 설비: 1 건

// ── MySQL 은 여기가 다릅니다 ──
//   · UPSERT 문법이 INSERT … ON DUPLICATE KEY UPDATE 입니다
//   · EXCLUDED 대신 VALUES(칸) 또는 new.칸 을 씁니다
//   · UPDATE … FROM 이 없습니다. UPDATE 설비 JOIN 라인정책 … 형태로 씁니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다


// ============================================================
// 정리 — 고치고 지우기
// ============================================================
//
//   무엇                      쓰는 법                          주의
//   ──────────────────────────────────────────────────────────────────
//   고치기                    UPDATE 표 SET 칸=값 WHERE 조건    ★★★ WHERE 없으면 전부
//   숫자 늘리기               SET 횟수 = 횟수 + 1               읽어 와서 더하지 마세요
//   지우기                    DELETE FROM 표 WHERE 조건         ★★★ WHERE 없으면 전부
//   통째로 비우기             TRUNCATE 표                       빠르지만 되돌리기 어려움
//   바뀐 것 보기              … RETURNING 칸들                  바뀐 '뒤' 값입니다
//   있으면 고치고 없으면 넣기  INSERT … ON CONFLICT DO UPDATE    EXCLUDED = 넣으려던 값
//   중복이면 넘어가기          ON CONFLICT DO NOTHING            에러 안 남
//   다른 표 보고 고치기        UPDATE … FROM … WHERE             이어 주는 조건 필수
//   지운 척하기               UPDATE SET 삭제일시 = now()       모든 조회에 조건 추가
//
//   DELETE 와 TRUNCATE
//   ──────────────────────────────────────────────────────────────────
//                  DELETE                    TRUNCATE
//   WHERE          됩니다                     안 됩니다
//   RETURNING      됩니다                     42601 에러
//   속도(20만 건)   느립니다                   수십 배 빠릅니다
//   디스크 자리     그대로 남습니다             바로 돌려줍니다
//   되돌리기        트랜잭션 안에서 됩니다       사실상 못 합니다
//
// ★★★ 이 파일에서 꼭 가져갈 것
//   UPDATE 와 DELETE 는 **먼저 SELECT 로 몇 건인지 확인하고** 씁니다.
//   운영 데이터에 손으로 칠 때는 트랜잭션으로 감쌉니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 2 의 사고를 DELETE 로 재현해 보세요.
//                    DELETE FROM 설비 를 트랜잭션 안에서 돌리고 되돌려 보세요.
//
// ✏️ 직접 해보기 2 — 점검횟수를 "읽어 와서 +1 해서 쓰기" 로 바꿔 보세요.
//                    Promise.all 로 열 번 동시에 부르면 몇이 되나요?
//                    SET 점검횟수 = 점검횟수 + 1 로 하면 몇이 되나요?
//
// ✏️ 직접 해보기 3 — 일일생산에 DO UPDATE 대신 DO NOTHING 을 쓰면
//                    같은 날 두 번째 기록은 어떻게 되나요? 어느 쪽이 맞는 설계일까요?
//
// ✏️ 직접 해보기 4 — 섹션 7 의 UPDATE … FROM 에서 WHERE 줄을 지워 보세요.
//                    (트랜잭션 안에서 하세요!) 몇 건이 바뀌고 값은 어떻게 되나요?
//
// ✏️ 직접 해보기 5 — 소프트 삭제한 설비를 빼먹고 조회하는 코드를 하나 만들어 보세요.
//                    그다음 그 조건을 뷰(VIEW)로 감싸면 어떻게 편해질까요?
//
// ✏️ 직접 해보기 6 — TRUNCATE … RESTART IDENTITY 로 표를 비운 뒤 새로 넣으면
//                    id 가 몇 번부터 시작하나요? 그냥 TRUNCATE 와 비교해 보세요.


// ── 자주 하는 실수 ──

// [실수 1] WHERE 를 안 쓰거나, 쓴 줄이 실행 범위에서 빠짐
//   SQL 편집기에서 여러 줄 중 일부만 선택해 실행하면 이렇게 됩니다.
//   습관: UPDATE 를 칠 때 WHERE 를 **먼저** 쓰고 SET 을 나중에 채우세요.

// [실수 2] affectedRows 를 안 보고 성공 처리
//   0건이어도 에러가 아닙니다. "수정되었습니다" 만 뜨고 아무 일도 안 일어납니다.

// [실수 3] 읽어 와서 계산한 뒤 다시 씀
//   const 줄 = await SELECT…; await UPDATE SET 횟수 = 줄.횟수 + 1;
//   동시에 두 번 들어오면 한 번이 사라집니다. SET 횟수 = 횟수 + 1 로 쓰세요.

// [실수 4] 운영 DB 에서 트랜잭션 없이 손으로 UPDATE 를 침
//   되돌릴 방법이 없습니다. BEGIN 을 먼저 치는 습관을 들이세요.

// [실수 5] TRUNCATE 를 DELETE 대신 습관적으로 씀
//   빠르다고 좋은 게 아닙니다. WHERE 도 없고 되돌리기도 어렵습니다.

// [실수 6] 소프트 삭제를 도입하고 조회 조건을 빠뜨림
//   지운 설비가 목록에 다시 나타납니다. 표를 직접 조회하지 말고
//   `삭제일시 IS NULL` 을 넣은 뷰를 만들어 그것만 쓰게 하세요.


await db.close();
