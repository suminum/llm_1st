// ============================================================
// 10단원 서버 연습문제 정답 — 설비 관리 화면 하나 완성하기
// ------------------------------------------------------------
// 실행: node 연습문제_서버_정답.js
//       브라우저에서 http://localhost:3000 을 여세요.
// ============================================================
//
// 감사무시: 대조 — 이 단원의 답은 서버가 아니라 화면(public/연습_관리화면.html)입니다.
//            이 파일은 문제에서 '고치지 마세요' 라고 준 서버 그대로라 번호 블록이 없습니다.
//
// 개념01~05 에서 배운 것을 한 화면에 모읍니다.
//
//   목록 + 검색 + 페이징 + 등록 폼 + 삭제
//   그리고 로딩·에러·빈 결과·검증 오류·중복 클릭 막기까지.

const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.redirect("/연습_관리화면.html"));

// 확인: GET /연습_관리화면.html
// 응답: 200


// ───── 서버 (06단원 형식 그대로) ─────

let 설비들 = [
  { id: 1, name: "컨베이어 1호", line: "A", status: "가동" },
  { id: 2, name: "프레스 1호", line: "B", status: "정지" },
  { id: 3, name: "용접로봇 1호", line: "C", status: "가동" },
  { id: 4, name: "검사기 1호", line: "A", status: "점검중" },
];

let 다음번호 = 5;

app.get("/api/v1/equipments", (req, res) => {
  const q = (req.query.q ?? "").trim().toLowerCase();
  const { line } = req.query;

  let 결과 = 설비들;

  if (q) {
    결과 = 결과.filter((설비) =>
      ["name", "line", "status"].some((키) => String(설비[키]).toLowerCase().includes(q))
    );
  }

  if (line) 결과 = 결과.filter((설비) => 설비.line === line);

  const total = 결과.length;

  let page = Number(req.query.page);
  let limit = Number(req.query.limit);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 10;

  const 시작 = (page - 1) * limit;

  res.json({
    data: 결과.slice(시작, 시작 + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// 확인: GET /api/v1/equipments?page=1&limit=3
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"},{"id":3,"name":"용접로봇 1호","line":"C","status":"가동"}],"meta":{"page":1,"limit":3,"total":4,"totalPages":2}}

app.post("/api/v1/equipments", (req, res) => {
  const { name, line } = req.body || {};
  const 항목 = [];

  if (!name) 항목.push({ 키: "name", 이유: "필수입니다" });
  else if (name.length < 2) 항목.push({ 키: "name", 이유: "2글자 이상이어야 합니다" });

  if (!line) 항목.push({ 키: "line", 이유: "필수입니다" });
  else if (!["A", "B", "C"].includes(line))
    항목.push({ 키: "line", 이유: "A, B, C 중 하나여야 합니다" });

  if (항목.length > 0) {
    return res.status(400).json({
      error: { code: "VALIDATION_FAILED", message: "입력값이 올바르지 않습니다", details: 항목 },
    });
  }

  if (설비들.some((설비) => 설비.name === name)) {
    return res.status(409).json({
      error: { code: "DUPLICATED", message: "이미 있는 설비 이름입니다" },
    });
  }

  const 새설비 = { id: 다음번호, name, line, status: "정지" };
  다음번호 += 1;
  설비들.push(새설비);

  res.status(201).json({ data: 새설비 });
});

// 확인: POST /api/v1/equipments {"name":"포장기 1호","line":"C"}
// 응답: 201 {"data":{"id":5,"name":"포장기 1호","line":"C","status":"정지"}}

app.delete("/api/v1/equipments/:id", (req, res) => {
  const 번호 = Number(req.params.id);
  const 설비 = 설비들.find((설비) => 설비.id === 번호);

  if (!설비) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "설비를 찾을 수 없습니다" } });
  }

  // 업무 규칙: 가동 중인 설비는 못 지웁니다. (07단원)
  if (설비.status === "가동") {
    return res.status(409).json({
      error: { code: "CONFLICT", message: "가동 중인 설비는 삭제할 수 없습니다" },
    });
  }

  설비들 = 설비들.filter((설비) => 설비.id !== 번호);
  res.sendStatus(204);
});

// 확인: DELETE /api/v1/equipments/2
// 응답: 204

// 확인: DELETE /api/v1/equipments/1
// 응답: 409 {"error":{"code":"CONFLICT","message":"가동 중인 설비는 삭제할 수 없습니다"}}


// ───── 화면 확인 ─────

// 처음 열면 3개씩 1쪽
// 화면: 연습_관리화면.html
// 보임: #요약  전체 4건 중 3건
// 보임: #쪽정보  1 / 2
// 보임: #본문  컨베이어 1호

// 다음 쪽
// 화면: 연습_관리화면.html  #다음쪽
// 보임: #쪽정보  2 / 2
// 보임: #본문  검사기 1호

// 검색하면 1쪽으로 돌아갑니다
// 화면: 연습_관리화면.html  #다음쪽 >> 입력(#검색=로봇) >> #라인거르기
// 보임: #쪽정보  1 / 1
// 보임: #본문  용접로봇 1호

// ★★ 2쪽을 보다가 검색했는데 1쪽으로 돌아왔습니다.
//   안 돌리면 page=2 로 요청해서 빈 화면이 나옵니다. (개념04 섹션 3)

// 결과 없음
// 화면: 연습_관리화면.html  입력(#검색=없는것) >> #라인거르기
// 보임: #요약  조건에 맞는 설비가 없습니다

// 빈 폼으로 등록
// 화면: 연습_관리화면.html  #보내기
// 보임: #오류-name  필수입니다
// 보임: #오류-line  필수입니다

// 라인이 Z
// 화면: 연습_관리화면.html  #보내기
// 입력: #name=포장기 2호  #line=Z
// 보임: #오류-line  A, B, C 중 하나여야 합니다

// 제대로 등록하면 목록이 새로 그려집니다
// 화면: 연습_관리화면.html  #보내기
// 입력: #name=적재로봇 1호  #line=A
// 보임: #알림  등록했습니다
// 보임: #요약  전체 5건

// 이름이 겹치면 409 가 이름 칸에
// 화면: 연습_관리화면.html  #보내기
// 입력: #name=컨베이어 1호  #line=A
// 보임: #오류-name  이미 있는 설비 이름입니다

// 가동 중인 설비를 지우려 하면 409
// 화면: 연습_관리화면.html  .지우기
// 보임: #알림  가동 중인 설비는 삭제할 수 없습니다

// ★ 첫 줄의 설비가 '컨베이어 1호(가동)' 라 삭제가 막힙니다.
//   07단원의 업무 규칙이 화면까지 그대로 전해졌습니다.


app.use((req, res) => {
  res.status(404).json({ error: { code: "ROUTE_NOT_FOUND", message: "그런 주소가 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
});


// ============================================================
// 이 화면이 챙긴 것
// ============================================================
//
//   개념01  api.js 로 에러를 한곳에서 처리
//   개념02  로딩 · 실패 · 빈 결과 · 버튼 잠금 · 늦게 온 응답 버리기
//   개념03  preventDefault · 오류 지우기 · details 를 칸마다 · 성공하면 폼 비우기
//   개념04  상태 한 곳에 · 조건 바뀌면 1쪽 · 빈 값은 주소에서 빼기 · 디바운스
//   개념05  (이 화면에는 업로드가 없습니다. 11단원에서 붙입니다)
//
// ★ 삭제 버튼에 이벤트 위임을 쓴 이유
//   표는 다시 그려질 때마다 버튼이 새로 만들어집니다.
//   버튼마다 addEventListener 를 달면, 다시 그린 뒤에 또 달아야 합니다.
//   tbody 에 한 번만 달아 두면 그럴 일이 없습니다. (JS자료 11단원)
//
// ★ 삭제 뒤에 목록을 다시 부르는 이유
//   화면에서만 그 줄을 지우면 meta.total 이 안 맞습니다.
//   쪽 수도 달라질 수 있습니다. 서버에 다시 물어보는 편이 정확합니다.
//
//   ★ 다만 요청이 한 번 더 갑니다.
//     목록이 아주 크면 화면에서 지우고 total 만 줄이는 방법도 씁니다.
//     둘 다 맞습니다. 무엇을 더 중요하게 볼지 정하는 문제입니다.


// ============================================================
// 직접 눌러 볼 것
// ============================================================
//
//   1  처음 화면                       3건 + "1 / 2"
//   2  '다음' 누르기                   2쪽, '다음' 이 잠김
//   3  2쪽에서 '로봇' 검색              1쪽으로 돌아가고 1건  ★
//   4  '없는것' 검색                    "조건에 맞는 설비가 없습니다"
//   5  빈 폼으로 등록                    두 칸에 빨간 글씨
//   6  라인을 Z 로 등록                  라인 칸에만 빨간 글씨
//   7  제대로 등록                       목록이 새로 그려지고 전체가 늘어남
//   8  같은 이름으로 또 등록              이름 칸에 "이미 있는 설비 이름입니다"
//   9  가동 중인 설비 삭제                "가동 중인 설비는 삭제할 수 없습니다"
//  10  정지 중인 설비 삭제                지워지고 목록이 새로 그려짐
//
// 3번과 9번이 이 실습의 핵심입니다.
//   3번은 화면이 챙겨야 할 것,
//   9번은 서버 규칙이 화면까지 그대로 전해지는 것입니다.
