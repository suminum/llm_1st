// ============================================================
// 05단원 · 개념 02 — 없는 쪽도 보기
// ------------------------------------------------------------
// 실행: node 개념02_없는_쪽도_보기.js
// ============================================================
//
// 개념01 에서 INNER JOIN 을 했습니다. 그런데 INNER JOIN 은 **짝이 있는 것만** 남깁니다.
// 설비는 5대인데 점검기록과 이어 보면 4대만 나옵니다.
// 포장기 1호(설비5)는 점검기록이 하나도 없어서 **결과에서 조용히 사라집니다.**
// 하필 그게 관리자가 제일 보고 싶은 것입니다.
// "점검을 한 번도 안 한 설비" 야말로 당장 손봐야 할 설비니까요.
//
// 이 파일에서는 **짝이 없는 쪽도 살려 두는 방법**을 봅니다.
// 그리고 그 방법을 한 줄로 망가뜨리는 실수를 아주 자세히 봅니다.
// 실무에서 제일 자주 터지는 조인 사고입니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

// ── 예제 데이터 ──

await db.exec(`
  CREATE TABLE 라인 (
    라인코드 TEXT PRIMARY KEY,
    이름     TEXT NOT NULL,
    동       TEXT NOT NULL
  );
  CREATE TABLE 설비 (
    설비번호 INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인코드 TEXT REFERENCES 라인(라인코드),
    도입년도 INT  NOT NULL
  );
  CREATE TABLE 작업자 (
    사번     INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    소속라인 TEXT REFERENCES 라인(라인코드)
  );
  CREATE TABLE 점검기록 (
    점검번호 INT  PRIMARY KEY,
    설비번호 INT  REFERENCES 설비(설비번호),
    점검일   DATE NOT NULL,
    결과     TEXT NOT NULL,
    점수     INT,
    담당사번 INT  REFERENCES 작업자(사번)
  );
  INSERT INTO 라인 VALUES
    ('A', '조립1라인', '1동'),
    ('B', '가공2라인', '1동'),
    ('C', '포장3라인', '2동'),
    ('D', '신설4라인', '2동');
  INSERT INTO 설비 VALUES
    (1, '컨베이어 1호', 'A', 2015),
    (2, '프레스 1호',   'A', 2019),
    (3, '용접로봇 1호', 'B', 2021),
    (4, '검사기 1호',   'B', 2018),
    (5, '포장기 1호',   'C', 2022);
  INSERT INTO 작업자 VALUES
    (101, '김반장', 'A'),
    (102, '이기사', 'B'),
    (103, '박주임', 'B'),
    (104, '최사원', 'C'),
    (105, '정신입', NULL);
  INSERT INTO 점검기록 VALUES
    ( 1, 1, '2024-01-05', '정상',   92,  101),
    ( 2, 1, '2024-02-05', '정상',   88,  101),
    ( 3, 1, '2024-03-06', '주의',   71,  102),
    ( 4, 1, '2024-04-05', '정상',   90,  101),
    ( 5, 2, '2024-01-12', '주의',   65,  102),
    ( 6, 2, '2024-02-14', '불량',   48,  103),
    ( 7, 2, '2024-03-15', '정상',   88,  101),
    ( 8, 3, '2024-01-20', '정상',   95,  103),
    ( 9, 3, '2024-02-20', '정상', NULL,  103),
    (10, 3, '2024-03-21', '주의',   74,  102),
    (11, 3, '2024-04-22', '정상',   90, NULL),
    (12, 3, '2024-05-23', '불량',   52,  103),
    (13, 4, '2024-01-28', '정상', NULL,  104),
    (14, 4, '2024-03-29', '정상',   88,  104),
    (15, 4, '2024-05-30', '주의',   69, NULL);
`);

// NULL 을 그대로 찍으면 "null" 이라 눈에 잘 안 들어옵니다. 보기 좋게 바꿉니다.
const 없으면 = (값) => (값 === null ? "(없음)" : 값);

// ── 섹션 1: INNER JOIN 이 빠뜨리는 것 ──

// ★ 먼저 짚고 갈 것이 있습니다. count(*) 는 Postgres 에서 **BIGINT** 입니다.
//   BIGINT 는 자바스크립트 number 에 다 안 들어갑니다. 그래서 타입이 왔다 갔다 합니다.

const 개수확인 = await db.query(`SELECT count(*) AS 설비수, 9007199254740993::BIGINT AS 아주큰수 FROM 설비`);

console.log("설비 수:", 개수확인.rows[0].설비수, "· 타입:", typeof 개수확인.rows[0].설비수);
// 출력: 설비 수: 5 · 타입: number
console.log("아주 큰 수:", 개수확인.rows[0].아주큰수, "· 타입:", typeof 개수확인.rows[0].아주큰수);
// 출력: 아주 큰 수: 9007199254740993n · 타입: bigint

try {
  JSON.stringify(개수확인.rows[0]);
} catch (에러) {
  console.log("bigint 를 JSON.stringify 하면:", 에러.message);
}
// 출력: bigint 를 JSON.stringify 하면: Do not know how to serialize a BigInt

// ★★ 같은 BIGINT 인데 하나는 number, 하나는 bigint 로 왔습니다.
//   PGlite 는 number 로 정확히 담기는 값이면 number 로, 넘어가면 bigint 로 줍니다.
//   **데이터가 커지면 타입이 바뀝니다.** 개발할 때는 number 였다가 운영에서 bigint 가 오고,
//   JSON 응답을 만들다가 위처럼 터집니다. ★ 그래서 세는 값에는 **항상 `Number(...)`** 를 씌웁니다.

const 안쪽 = await db.query(`
  SELECT s.설비번호, s.이름, p.점검일, p.결과
  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
  ORDER BY s.설비번호, p.점검번호`);
console.log("INNER JOIN 결과 줄 수:", 안쪽.rows.length);
// 출력: INNER JOIN 결과 줄 수: 15

const 나온설비 = await db.query(`
  SELECT DISTINCT s.설비번호, s.이름
  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
  ORDER BY s.설비번호`);
console.log("INNER JOIN 에 나온 설비:", 나온설비.rows.length, "대");
// 출력: INNER JOIN 에 나온 설비: 4 대

for (const 줄 of 나온설비.rows) console.log(`· ${줄.설비번호} · ${줄.이름}`);
// 출력: · 1 · 컨베이어 1호
// 출력: · 2 · 프레스 1호
// 출력: · 3 · 용접로봇 1호
// 출력: · 4 · 검사기 1호

console.log("포장기 1호가 결과에 있는가:", 나온설비.rows.some((줄) => 줄.이름 === "포장기 1호"));
// 출력: 포장기 1호가 결과에 있는가: false

// ★★ 설비는 5대인데 4대만 나왔습니다. INNER JOIN 은 **양쪽 다 짝이 있는 줄만** 남깁니다.
//   포장기 1호는 점검기록이 0건이라 짝이 없고, 그래서 사라졌습니다.
//
//   이게 왜 사고인가: 이 결과를 "전체 설비 점검 현황" 으로 보고하면 4대가 전부 점검받은 것으로
//   보입니다. **점검을 한 번도 안 받은 설비만 골라서 안 보입니다.** 에러도 경고도 없습니다.
//   개념01 에서 본 조용한 버그와 같은 종류입니다.
//
//   ★ 조인 결과의 줄 수가 예상보다 적으면 **먼저 짝 없는 줄을 의심하세요.**

// ── 섹션 2: LEFT JOIN — 왼쪽은 무조건 살립니다 ──

const 왼쪽 = await db.query(`
  SELECT s.설비번호, s.이름, p.점검번호, p.결과
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  ORDER BY s.설비번호, p.점검번호`);
console.log("LEFT JOIN 결과 줄 수:", 왼쪽.rows.length);
// 출력: LEFT JOIN 결과 줄 수: 16

// 15건(점검기록 전부) + 1줄(짝 없는 포장기 1호) = 16줄입니다. 그 1줄을 그대로 봅니다.
console.log("마지막 줄:", JSON.stringify(왼쪽.rows[왼쪽.rows.length - 1]));
// 출력: 마지막 줄: {"설비번호":5,"이름":"포장기 1호","점검번호":null,"결과":null}

// ★ 짝을 못 찾으면 **오른쪽 표의 칸이 전부 NULL 로 채워진 가짜 줄**이 하나 생깁니다.
//   줄을 버리는 게 아니라, 빈 줄을 붙여서 왼쪽을 살려 두는 것입니다.
// ★ LEFT JOIN 은 LEFT OUTER JOIN 의 줄임말입니다. OUTER 는 생략해도 됩니다.
// ★ 왼쪽/오른쪽이 어느 쪽인가: **FROM 에 먼저 쓴 표가 왼쪽**입니다.
//   위 질의에서는 설비가 왼쪽, 점검기록이 오른쪽입니다.
//   그래서 "설비는 다 나오고 점검기록은 있으면 붙는다" 가 됩니다.

const 세보기 = await db.query(`
  SELECT s.설비번호, s.이름, count(*) AS 전체줄수, count(p.점검번호) AS 진짜점검수
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY s.설비번호, s.이름
  ORDER BY s.설비번호`);
for (const 줄 of 세보기.rows) {
  console.log(`· ${줄.이름} · count(*)=${줄.전체줄수} · count(점검번호)=${줄.진짜점검수}`);
}
// 출력: · 컨베이어 1호 · count(*)=4 · count(점검번호)=4
// 출력: · 프레스 1호 · count(*)=3 · count(점검번호)=3
// 출력: · 용접로봇 1호 · count(*)=5 · count(점검번호)=5
// 출력: · 검사기 1호 · count(*)=3 · count(점검번호)=3
// 출력: · 포장기 1호 · count(*)=1 · count(점검번호)=0

console.log("포장기 1호를 count(*) 로 세면 0인가:", Number(세보기.rows[4].전체줄수) === 0);
// 출력: 포장기 1호를 count(*) 로 세면 0인가: false

// ★★ 여기가 함정입니다. 포장기 1호는 점검이 0건인데 count(*) 는 **1** 이라고 합니다.
//   NULL 로 채워진 가짜 줄도 "줄" 이기 때문입니다. 0으로 세려면 **오른쪽 표의 칸을 지정해서** 세야 합니다. count(p.점검번호) 는 0 입니다.
//   count(칸) 은 그 칸이 NULL 인 줄을 안 셉니다. ★ 집계는 이 단원 개념03 에서 합니다.

// ── 섹션 3: RIGHT JOIN 과 FULL OUTER JOIN ──

// RIGHT JOIN 은 LEFT JOIN 의 좌우를 뒤집은 것입니다. 줄 수가 같은지 봅니다.

const 오른쪽 = await db.query(`
  SELECT s.설비번호, s.이름, p.점검번호
  FROM 점검기록 p RIGHT JOIN 설비 s ON s.설비번호 = p.설비번호
  ORDER BY s.설비번호, p.점검번호`);
console.log("RIGHT JOIN 결과 줄 수:", 오른쪽.rows.length);
// 출력: RIGHT JOIN 결과 줄 수: 16
console.log("LEFT 로 만든 것과 줄 수가 같은가:", 오른쪽.rows.length === 왼쪽.rows.length);
// 출력: LEFT 로 만든 것과 줄 수가 같은가: true

// ★ 실무에서는 거의 LEFT 만 씁니다. RIGHT 를 보면 FROM 에 쓴 표가 기준이라는 감각이 깨져서
//   읽는 사람이 한 번 멈춥니다. 표 순서를 바꿔 LEFT 로 쓸 수 있으면 그렇게 쓰세요.
//
// FULL OUTER JOIN 은 양쪽 다 짝 없는 것까지 살립니다. 그런데 지금은 짝 없는 쪽이
// 라인 D(설비 없음) 하나뿐이라, 라인이 없는 설비를 하나 넣어 봅니다.

await db.exec(`INSERT INTO 설비 VALUES (6, '이동대차 1호', NULL, 2023);`);

const 라인왼쪽 = await db.query(`SELECT count(*) AS 개수 FROM 라인 l LEFT  JOIN 설비 s ON l.라인코드 = s.라인코드`);
const 라인오른쪽 = await db.query(`SELECT count(*) AS 개수 FROM 라인 l RIGHT JOIN 설비 s ON l.라인코드 = s.라인코드`);

console.log("라인 LEFT  JOIN 설비:", Number(라인왼쪽.rows[0].개수), "줄");
// 출력: 라인 LEFT  JOIN 설비: 6 줄
console.log("라인 RIGHT JOIN 설비:", Number(라인오른쪽.rows[0].개수), "줄");
// 출력: 라인 RIGHT JOIN 설비: 6 줄

const 양쪽 = await db.query(`
  SELECT l.라인코드, l.이름 AS 라인이름, s.이름 AS 설비이름
  FROM 라인 l FULL OUTER JOIN 설비 s ON l.라인코드 = s.라인코드
  ORDER BY l.라인코드, s.설비번호`);
console.log("라인 FULL OUTER JOIN 설비:", 양쪽.rows.length, "줄");
// 출력: 라인 FULL OUTER JOIN 설비: 7 줄

for (const 줄 of 양쪽.rows) {
  console.log(`· ${없으면(줄.라인코드)} · ${없으면(줄.라인이름)} · ${없으면(줄.설비이름)}`);
}
// 출력: · A · 조립1라인 · 컨베이어 1호
// 출력: · A · 조립1라인 · 프레스 1호
// 출력: · B · 가공2라인 · 용접로봇 1호
// 출력: · B · 가공2라인 · 검사기 1호
// 출력: · C · 포장3라인 · 포장기 1호
// 출력: · D · 신설4라인 · (없음)
// 출력: · (없음) · (없음) · 이동대차 1호

// ★ 마지막 두 줄을 보세요. 라인 D 는 설비 쪽이 (없음) — 왼쪽만 있는 줄이고,
//   이동대차 1호는 라인 쪽이 (없음) — 오른쪽만 있는 줄입니다. FULL 은 둘 다 살립니다.
// ★ FULL OUTER JOIN 은 자주 안 씁니다. 보통 기준 표가 정해져 있어서 LEFT 로 충분합니다.
//   두 시스템에서 받은 목록을 맞춰 볼 때(대사 작업) 정도가 쓸모 있는 자리입니다.

// ── MySQL 은 여기가 다릅니다 ──
//   · MySQL 8.0 에는 FULL OUTER JOIN 이 없습니다. LEFT 와 RIGHT 를 UNION 으로 이어 흉내 냅니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다

// 실험이 끝났으니 되돌립니다. 안 그러면 뒤 섹션 결과가 흔들립니다.
await db.exec(`DELETE FROM 설비 WHERE 설비번호 = 6;`);
const 되돌림 = await db.query(`SELECT count(*) AS 개수 FROM 설비`);
console.log("되돌린 뒤 설비 수:", Number(되돌림.rows[0].개수));
// 출력: 되돌린 뒤 설비 수: 5

// ── 섹션 4: ★★★ LEFT JOIN 뒤의 WHERE 가 INNER JOIN 으로 바꿔 버립니다 ──

// 이 파일에서 제일 중요한 섹션입니다. 실무에서 정말 자주 터집니다.
// 하고 싶은 일: "설비별 **불량** 점검이 몇 건인지 보고 싶다. 불량이 한 건도 없는 설비도,
//   점검을 안 한 설비도 나와야 한다." 세 가지 방법을 나란히 돌려 봅니다.

// ① INNER JOIN + WHERE
const 방법1 = await db.query(`
  SELECT s.이름, p.점검번호
  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
  WHERE p.결과 = '불량'`);
console.log("① INNER + WHERE:", 방법1.rows.length, "줄");
// 출력: ① INNER + WHERE: 2 줄

// ② LEFT JOIN + WHERE  ← 흔히 이렇게 씁니다. 그런데 틀립니다.
const 방법2 = await db.query(`
  SELECT s.이름, p.점검번호
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  WHERE p.결과 = '불량'`);
console.log("② LEFT + WHERE:", 방법2.rows.length, "줄");
// 출력: ② LEFT + WHERE: 2 줄
console.log("①과 ②의 줄 수가 같은가:", 방법1.rows.length === 방법2.rows.length);
// 출력: ①과 ②의 줄 수가 같은가: true

// ★★★ LEFT 라고 써 놓았는데 INNER 와 결과가 똑같습니다. 실행 순서로 보면 답이 나옵니다.
//     1단계  ON 으로 짝을 짓습니다   → 16줄 (설비5는 NULL 줄로 살아 있음)
//     2단계  WHERE 로 줄을 버립니다  → p.결과 = '불량' 이 아닌 줄을 전부 버립니다
//
//   2단계에서 설비5의 줄은 p.결과 가 **NULL** 입니다.
//   `NULL = '불량'` 은 거짓이 아니라 **UNKNOWN** 이고, WHERE 는 참인 줄만 남깁니다.
//   (02단원에서 배운 NULL 3값 논리입니다. NULL 은 "모른다" 라서 비교가 안 됩니다)
//   그래서 LEFT JOIN 이 살려 둔 줄을 WHERE 가 다시 죽입니다. 불량이 없는 설비1·4 도 사라집니다.
//
//   ★★★ **LEFT JOIN 을 써 놓고 오른쪽 표 칸을 WHERE 에 걸면 INNER JOIN 이 됩니다.**

// ③ 조건을 ON 절로 옮깁니다. ← 이게 정답입니다.
const 방법3 = await db.query(`
  SELECT s.설비번호, s.이름, p.점검번호
  FROM 설비 s
  LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호 AND p.결과 = '불량'
  ORDER BY s.설비번호`);
console.log("③ LEFT + ON:", 방법3.rows.length, "줄");
// 출력: ③ LEFT + ON: 5 줄

for (const 줄 of 방법3.rows) console.log(`· ${줄.이름} · 불량점검번호 ${없으면(줄.점검번호)}`);
// 출력: · 컨베이어 1호 · 불량점검번호 (없음)
// 출력: · 프레스 1호 · 불량점검번호 6
// 출력: · 용접로봇 1호 · 불량점검번호 12
// 출력: · 검사기 1호 · 불량점검번호 (없음)
// 출력: · 포장기 1호 · 불량점검번호 (없음)

// ★ 설비 5대가 전부 나왔습니다. 불량이 없는 설비는 점검번호가 (없음) 입니다.
//
// ★ ON 과 WHERE 는 이렇게 다릅니다.
//   ON     — **짝을 지을 때** 쓰는 조건. 안 맞으면 왼쪽 줄에 NULL 을 붙여 살려 둡니다.
//   WHERE  — **짝을 다 지은 다음** 줄을 버리는 조건. 살려 둔 줄도 가리지 않고 버립니다.
//   INNER JOIN 에서는 둘의 결과가 같습니다(살려 둘 줄이 없으니까요).
//   **OUTER JOIN 에서만 갈립니다.** 그래서 헷갈립니다.

// ④ WHERE 를 쓰면서 NULL 을 봐주면 어떻게 되나
const 방법4 = await db.query(`
  SELECT s.설비번호, s.이름, p.결과
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  WHERE p.결과 IS NULL OR p.결과 = '불량'
  ORDER BY s.설비번호`);
console.log("④ LEFT + WHERE(NULL 봐주기):", 방법4.rows.length, "줄");
// 출력: ④ LEFT + WHERE(NULL 봐주기): 3 줄

for (const 줄 of 방법4.rows) console.log(`· ${줄.이름} · ${없으면(줄.결과)}`);
// 출력: · 프레스 1호 · 불량
// 출력: · 용접로봇 1호 · 불량
// 출력: · 포장기 1호 · (없음)

console.log("불량이 없는 설비1이 살아났는가:", 방법4.rows.some((줄) => 줄.설비번호 === 1));
// 출력: 불량이 없는 설비1이 살아났는가: false

// ★ 절반만 고쳐졌습니다. 짝이 아예 없던 포장기 1호는 살아났습니다(결과가 NULL 이니까요).
//   그런데 **불량만 없는** 설비1·4 는 여전히 안 나옵니다. '정상' 줄이 있어서
//   NULL 도 아니고 '불량' 도 아니기 때문입니다.
//   ★ 조건을 WHERE 에 두는 한 제대로 안 됩니다. **ON 으로 옮기는 게 정답입니다.**
//     읽기도 ON 쪽이 쉽습니다. `IS NULL OR` 이 붙으면 다음 사람이 한참 들여다봅니다.

// ⑤ ★ 반대로 **왼쪽 표 조건은 WHERE 에 써도 안전합니다.**
const 방법5 = await db.query(`
  SELECT s.설비번호, s.이름, p.점검번호
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  WHERE s.도입년도 >= 2019`);
console.log("⑤ 왼쪽 표 조건을 WHERE 에:", 방법5.rows.length, "줄");
// 출력: ⑤ 왼쪽 표 조건을 WHERE 에: 9 줄
console.log("짝 없는 포장기 1호가 살아있는가:", 방법5.rows.some((줄) => 줄.설비번호 === 5));
// 출력: 짝 없는 포장기 1호가 살아있는가: true

// ★ 왼쪽 표 칸은 NULL 로 채워지지 않으니 WHERE 에 걸어도 UNKNOWN 이 안 생깁니다.
//   ★ 외울 것은 한 줄입니다. **오른쪽 표 조건 → ON.  왼쪽 표 조건 → WHERE.**

// ── 섹션 5: LEFT JOIN … WHERE 오른쪽.칸 IS NULL — "짝이 없는 것만" ──

// 방금 WHERE 가 줄을 죽인다고 했습니다. 그걸 **일부러** 쓰는 관용구가 있습니다.

const 점검없는설비 = await db.query(`
  SELECT s.설비번호, s.이름
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  WHERE p.점검번호 IS NULL
  ORDER BY s.설비번호`);
console.log("점검을 한 번도 안 한 설비:", 점검없는설비.rows.length, "대");
// 출력: 점검을 한 번도 안 한 설비: 1 대
for (const 줄 of 점검없는설비.rows) console.log(`· ${줄.설비번호} · ${줄.이름}`);
// 출력: · 5 · 포장기 1호

// ★ 원리: LEFT JOIN 은 짝 없는 줄에만 NULL 을 채웁니다. 그러니 "오른쪽 칸이 NULL 인 줄"
//   은 곧 "짝이 없던 줄" 입니다.

const 설비없는라인 = await db.query(`
  SELECT l.라인코드, l.이름
  FROM 라인 l LEFT JOIN 설비 s ON l.라인코드 = s.라인코드
  WHERE s.설비번호 IS NULL`);
for (const 줄 of 설비없는라인.rows) console.log(`· 설비 없는 라인 — ${줄.라인코드} ${줄.이름}`);
// 출력: · 설비 없는 라인 — D 신설4라인

// ★★★ NULL 검사는 반드시 **오른쪽 표의 NOT NULL 인 칸**(보통 기본키)으로 하세요.
//   NULL 이 들어갈 수 있는 칸으로 검사하면 엉뚱한 줄이 딸려옵니다. 재현해 봅니다.

const 잘못된검사 = await db.query(`
  SELECT s.설비번호, s.이름, p.점검번호
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  WHERE p.점수 IS NULL
  ORDER BY s.설비번호`);
console.log("점수 칸으로 검사했을 때:", 잘못된검사.rows.length, "줄");
// 출력: 점수 칸으로 검사했을 때: 3 줄
for (const 줄 of 잘못된검사.rows) console.log(`· ${줄.이름} · 점검번호 ${없으면(줄.점검번호)}`);
// 출력: · 용접로봇 1호 · 점검번호 9
// 출력: · 검사기 1호 · 점검번호 13
// 출력: · 포장기 1호 · 점검번호 (없음)

// ★ 1대만 나와야 하는데 3줄이 나왔습니다. 점검은 했는데 **점수만 안 적은**
//   기록(점검 9, 점검 13)이 딸려 왔습니다.
//   점수는 NULL 이 허용된 칸이라 "짝이 없다" 와 "값을 안 적었다" 가 구별이 안 됩니다.
//   점검번호는 기본키라 NULL 이 없습니다. NULL 이면 짝이 없는 것이 확실합니다.
// ★ 같은 것을 `NOT EXISTS` 로도 쓸 수 있습니다. 그쪽이 뜻이 더 분명할 때가 많습니다.
//   `WHERE NOT EXISTS (SELECT 1 FROM 점검기록 p WHERE p.설비번호 = s.설비번호)`
//   서브쿼리는 이 단원 개념04 에서 합니다.

// ── 섹션 6: CROSS JOIN — 일부러 모든 조합 만들기 ──

// 개념01 에서 ON 을 빠뜨리면 카테시안 곱이 되어 사고가 난다고 했습니다.
// CROSS JOIN 은 그것을 **일부러** 쓰겠다고 밝히는 문법입니다.
// 제일 쓸모 있는 자리는 **빈칸 채우기** 입니다. 월별 표에서 점검이 없던 달은 줄이 안 생깁니다.

const 달목록 = await db.query(`
  SELECT to_char(월, 'YYYY-MM') AS 월
  FROM generate_series('2024-01-01'::date, '2024-05-01'::date, '1 month') AS 달(월)
  ORDER BY 월`);
for (const 줄 of 달목록.rows) console.log(`· ${줄.월}`);
// 출력: · 2024-01
// 출력: · 2024-02
// 출력: · 2024-03
// 출력: · 2024-04
// 출력: · 2024-05

// ★ generate_series 로 만든 날짜는 자바스크립트에 Date 객체로 옵니다. 그대로 찍으면 시간대
//   때문에 하루 어긋나 보입니다. SQL 안에서 to_char 로 문자열을 만들어 받는 쪽이 안전합니다.

const 달곱설비 = await db.query(`
  SELECT count(*) AS 개수
  FROM generate_series('2024-01-01'::date, '2024-05-01'::date, '1 month') AS 달(월)
  CROSS JOIN 설비 s`);
console.log("5개월 × 설비 5대 =", Number(달곱설비.rows[0].개수), "줄");
// 출력: 5개월 × 설비 5대 = 25 줄

const 월별표 = await db.query(`
  SELECT to_char(달.월, 'YYYY-MM') AS 월, s.이름, count(p.점검번호) AS 점검수
  FROM generate_series('2024-01-01'::date, '2024-05-01'::date, '1 month') AS 달(월)
  CROSS JOIN 설비 s
  LEFT JOIN 점검기록 p
    ON p.설비번호 = s.설비번호 AND date_trunc('month', p.점검일) = 달.월
  WHERE s.설비번호 = 1
  GROUP BY 달.월, s.이름
  ORDER BY 달.월`);
for (const 줄 of 월별표.rows) console.log(`· ${줄.월} · ${줄.이름} · ${Number(줄.점검수)}건`);
// 출력: · 2024-01 · 컨베이어 1호 · 1건
// 출력: · 2024-02 · 컨베이어 1호 · 1건
// 출력: · 2024-03 · 컨베이어 1호 · 1건
// 출력: · 2024-04 · 컨베이어 1호 · 1건
// 출력: · 2024-05 · 컨베이어 1호 · 0건

// 달력 없이 그냥 묶으면 어떻게 되는지 대조해 봅니다.
const 달력없이 = await db.query(`
  SELECT to_char(date_trunc('month', 점검일), 'YYYY-MM') AS 월, count(*) AS 점검수
  FROM 점검기록 WHERE 설비번호 = 1
  GROUP BY 1 ORDER BY 1`);
console.log("달력 없이 묶으면:", 달력없이.rows.length, "줄");
// 출력: 달력 없이 묶으면: 4 줄
for (const 줄 of 달력없이.rows) console.log(`· ${줄.월} · ${Number(줄.점검수)}건`);
// 출력: · 2024-01 · 1건
// 출력: · 2024-02 · 1건
// 출력: · 2024-03 · 1건
// 출력: · 2024-04 · 1건
console.log("5월 줄이 있는가:", 달력없이.rows.some((줄) => 줄.월 === "2024-05"));
// 출력: 5월 줄이 있는가: false

// ★ 5월에 점검이 없으니 5월 줄이 아예 안 생깁니다. 그래프를 그리면 5월이 통째로 빠집니다.
//   달력을 CROSS JOIN 으로 먼저 깔고 거기에 LEFT JOIN 을 붙이면 0 으로 채워집니다.

// ── 섹션 7: SELF JOIN — 자기 자신과 잇기 ──

// 표를 두 번 써서 자기 자신과 잇습니다. 별칭을 반드시 달아야 구분이 됩니다.
// ① 같은 라인에 있는 설비끼리 짝짓기

const 짝짓기전부 = await db.query(`SELECT count(*) AS 개수 FROM 설비 a JOIN 설비 b ON a.라인코드 = b.라인코드`);
const 짝짓기다름 = await db.query(`SELECT count(*) AS 개수 FROM 설비 a JOIN 설비 b ON a.라인코드 = b.라인코드 AND a.설비번호 <> b.설비번호`);
const 짝짓기작음 = await db.query(`
  SELECT a.이름 AS 설비가, b.이름 AS 설비나
  FROM 설비 a JOIN 설비 b ON a.라인코드 = b.라인코드 AND a.설비번호 < b.설비번호
  ORDER BY a.설비번호, b.설비번호`);

console.log("조건 없이:", Number(짝짓기전부.rows[0].개수), "줄");
// 출력: 조건 없이: 9 줄
console.log("a <> b:", Number(짝짓기다름.rows[0].개수), "줄");
// 출력: a <> b: 4 줄
console.log("a < b:", 짝짓기작음.rows.length, "줄");
// 출력: a < b: 2 줄
for (const 줄 of 짝짓기작음.rows) console.log(`· ${줄.설비가} ↔ ${줄.설비나}`);
// 출력: · 컨베이어 1호 ↔ 프레스 1호
// 출력: · 용접로봇 1호 ↔ 검사기 1호

// ★ 조건 없이 이으면 자기 자신끼리도 짝이 됩니다 (컨베이어 ↔ 컨베이어).
//   `<>` 는 그건 빼 주지만 (1,2)와 (2,1)이 둘 다 나옵니다. 같은 짝인데 두 번입니다.
//   `<` 를 쓰면 한 번만 나옵니다. **짝을 만들 때는 부등호를 쓰세요.**
//
// ② 같은 설비의 바로 앞 점검을 찾아 간격 계산하기

const 직전점검 = await db.query(`
  SELECT to_char(이번.점검일, 'YYYY-MM-DD')      AS 이번일,
         to_char(max(이전.점검일), 'YYYY-MM-DD') AS 직전일,
         (이번.점검일 - max(이전.점검일))        AS 간격일
  FROM 점검기록 이번
  LEFT JOIN 점검기록 이전
    ON 이전.설비번호 = 이번.설비번호 AND 이전.점검일 < 이번.점검일
  WHERE 이번.설비번호 = 1
  GROUP BY 이번.점검번호, 이번.점검일
  ORDER BY 이번.점검일`);
for (const 줄 of 직전점검.rows) {
  console.log(`· ${줄.이번일} · 직전 ${없으면(줄.직전일)} · ${없으면(줄.간격일)}일`);
}
// 출력: · 2024-01-05 · 직전 (없음) · (없음)일
// 출력: · 2024-02-05 · 직전 2024-01-05 · 31일
// 출력: · 2024-03-06 · 직전 2024-02-05 · 30일
// 출력: · 2024-04-05 · 직전 2024-03-06 · 30일

// ★ 첫 점검은 앞이 없어서 (없음) 입니다. LEFT JOIN 이라 줄은 살아 있습니다.
//   INNER JOIN 이었으면 첫 점검이 사라집니다. 여기서도 같은 이야기입니다.
// ★ 이 질의가 까다로운 이유: "바로 앞" 을 찾으려고 **앞선 것 전부를 이어 놓고 그 중
//   최댓값**을 골랐습니다. 점검이 많아지면 이어지는 줄이 확 늘어납니다.
//   `LAG` 라는 창 함수를 쓰면 훨씬 짧고 빠릅니다. 이 단원 개념05 에서 합니다.
// ★ 사원-상사 같은 계층 구조도 SELF JOIN 으로 폅니다. 단계가 정해져 있지 않으면
//   재귀 질의가 필요합니다. 그건 개념04 에서 합니다.

// ── 섹션 8: JOIN 종류별 결과 줄 수 ──

// 설비(5줄) ↔ 점검기록(15줄) 을 설비번호로 이었을 때 몇 줄이 나오는지 전부 세어 봅니다.
const 종류들 = [
  ["INNER JOIN      ", `설비 s JOIN            점검기록 p ON s.설비번호 = p.설비번호`],
  ["LEFT JOIN       ", `설비 s LEFT JOIN       점검기록 p ON s.설비번호 = p.설비번호`],
  ["RIGHT JOIN      ", `설비 s RIGHT JOIN      점검기록 p ON s.설비번호 = p.설비번호`],
  ["FULL OUTER JOIN ", `설비 s FULL OUTER JOIN 점검기록 p ON s.설비번호 = p.설비번호`],
  ["CROSS JOIN      ", `설비 s CROSS JOIN      점검기록 p`],
];
for (const [이름, 절] of 종류들) {
  const 결과 = await db.query(`SELECT count(*) AS 개수 FROM ${절}`);
  console.log(`· ${이름} · ${Number(결과.rows[0].개수)}줄`);
}
// 출력: · INNER JOIN       · 15줄
// 출력: · LEFT JOIN        · 16줄
// 출력: · RIGHT JOIN       · 15줄
// 출력: · FULL OUTER JOIN  · 16줄
// 출력: · CROSS JOIN       · 75줄

// ★ RIGHT 가 15줄인 이유: 점검기록은 전부 실제 설비를 가리켜서 짝 없는 점검기록이 없습니다.
//   그래서 INNER 와 같아집니다. 외래키가 지켜 주고 있기 때문입니다 (04단원).
// ★ CROSS 가 75줄인 이유: 5 × 15. ON 을 빠뜨리면 이 숫자가 나옵니다.
//   여기서는 75줄이지만 만 줄 × 만 줄이면 1억 줄입니다. 서버가 멈춥니다.

// ============================================================
// 정리 — 언제 무엇을 쓰나
// ============================================================
//
//   무엇                무슨 줄이 남나                    설비↔점검기록
//   ────────────────────────────────────────────────────────────────
//   INNER JOIN          양쪽 다 짝이 있는 줄              15줄
//   LEFT  JOIN          왼쪽 전부 + 짝 있으면 붙임        16줄
//   RIGHT JOIN          오른쪽 전부 + 짝 있으면 붙임      15줄
//   FULL OUTER JOIN     양쪽 전부                         16줄
//   CROSS JOIN          모든 조합 (곱하기)                75줄
//   ★ 오른쪽 표 조건 → ON 에      짝 없는 줄이 삽니다
//   ★ 오른쪽 표 조건 → WHERE 에   ★★★ INNER 가 됩니다
//   ★ 왼쪽 표 조건  → WHERE 에    안전합니다
//   짝 없는 것만 찾기    LEFT JOIN … WHERE 오른쪽.기본키 IS NULL
//   빈칸 채우기          달력 CROSS JOIN 대상 LEFT JOIN 사실
//   자기끼리 짝짓기      SELF JOIN … ON a.키 < b.키

// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 작업자 표로 같은 것을 해 보세요. 점검을 한 번도 담당한 적 없는 작업자는?
//                    (정신입 하나만 나와야 합니다. 담당사번이 NULL 인 점검기록 2건에
//                     낚이지 않도록 어느 칸으로 IS NULL 검사를 할지 잘 고르세요)
//
// ✏️ 직접 해보기 2 — 섹션 4 의 ③ 을 고쳐서 설비별 불량 건수를 0 포함해서 세어 보세요.
//                    count(*) 로 세면 왜 틀리나요? 무엇으로 세야 하나요?
//
// ✏️ 직접 해보기 3 — 섹션 4 의 ③ 에서 `AND p.결과 = '불량'` 을 ON 에서 WHERE 로
//                    옮겨 보세요. 줄 수가 몇 줄로 바뀌나요? 왜 그런가요?
//
// ✏️ 직접 해보기 4 — 라인 · 설비 · 점검기록 세 표를 이어서 "라인별 점검 건수" 를 만들어
//                    보세요. 설비가 없는 라인 D 도 0 이어야 합니다.
//                    (힌트: LEFT JOIN 을 두 번. 중간에 INNER 를 쓰면 D 가 죽습니다)
//
// ✏️ 직접 해보기 5 — 섹션 6 의 달력을 2024-01-01 ~ 2024-12-01 로 늘려 보세요.
//                    설비 5대와 CROSS JOIN 하면 몇 줄인가요? 6월 이후는 몇 건인가요?
//
// ✏️ 직접 해보기 6 — 섹션 7 의 ① 에서 `<` 를 `<=` 로 바꾸면 몇 줄이 되나요? 왜 늘어나나요?
//
// ✏️ 직접 해보기 7 — 설비 6번(라인 없음)을 다시 넣고 `설비 LEFT JOIN 라인` 을 해 보세요.
//                    `ON s.라인코드 = l.라인코드` 에서 NULL 은 무엇과도 안 맞습니다.
//                    라인코드가 NULL 인 설비는? ★ 끝나면 꼭 지우세요.

// ── 자주 하는 실수 ──

// [실수 1] ★★★ LEFT JOIN 을 해 놓고 오른쪽 표 조건을 WHERE 에 씀
//   `LEFT JOIN 점검기록 p ON … WHERE p.결과 = '불량'` → NULL 줄이 UNKNOWN 으로 걸러져서
//   **INNER JOIN 이 됩니다.** 오른쪽 표 조건은 ON 에, 왼쪽 표 조건만 WHERE 에 쓰세요.

// [실수 2] IS NULL 검사를 NULL 이 들어갈 수 있는 칸으로 함
//   `WHERE p.점수 IS NULL` 로 하면 점수를 안 적은 기록까지 딸려옵니다.
//   **오른쪽 표의 기본키**로 검사하세요. 기본키에는 NULL 이 없습니다.

// [실수 3] 짝 없는 줄을 count(*) 로 세서 1건이 됨
//   LEFT JOIN 이 만든 NULL 줄도 줄은 줄입니다. count(*) 는 1 을 셉니다. 0 으로 세려면
//   `count(오른쪽표.칸)` 을 쓰세요. 집계는 개념03 에서 자세히 합니다.

// [실수 4] LEFT JOIN 을 여러 번 이으면서 중간에 INNER 를 섞음
//   `라인 LEFT JOIN 설비 JOIN 점검기록` 은 뒤의 INNER 가 앞의 LEFT 를 무효로 만듭니다.
//   라인 D 는 설비 칸이 NULL 인데, 다시 INNER 로 이으면 짝이 없어 죽습니다.

// [실수 5] RIGHT JOIN 을 섞어 써서 기준이 뭔지 알 수 없게 함
//   `A LEFT JOIN B RIGHT JOIN C` 는 못 따라갑니다. 표 순서를 바꿔 전부 LEFT 로 통일하세요.

// [실수 6] ON 을 빠뜨려서 CROSS JOIN 이 됨
//   `FROM 설비 s, 점검기록 p` 라고 쓰고 WHERE 조건을 잊으면 75줄이 나옵니다.
//   작은 표에서는 결과가 이상한 정도지만 큰 표에서는 서버가 멈춥니다.
//   조합이 진짜로 필요하면 `CROSS JOIN` 이라고 **밝혀서** 쓰세요.

await db.close();
