// ============================================================
// 03단원 서버 연습문제 — 설비 관리 API 만들기
// ------------------------------------------------------------
// 실행: node 연습문제_서버.js
//       고칠 때마다 Ctrl + C 로 끄고 다시 켜야 반영됩니다.
// ============================================================
//
// 개념05 에서 만든 문서 API 를 흉내 내어, 이번에는 '설비' API 를 만듭니다.
// 아래 일곱 문제를 위에서부터 순서대로 채우세요.
//
// 확인은 Postman 으로 합니다. (개념04 아래쪽에 쓰는 법이 있습니다)
// 한 문제 만들 때마다 서버를 다시 켜고 Postman 으로 눌러 보세요.
// 일곱 개를 다 만들고 한 번에 확인하려 하지 마세요. 어디가 틀렸는지 못 찾습니다.
//
// 만들 주소는 이렇습니다.
//
//   GET    /health              서버가 살아 있나
//   GET    /equipments          목록
//   GET    /equipments?line=A   A라인만
//   GET    /equipments/1        하나만
//   POST   /equipments          새로 등록
//   PATCH  /equipments/1        상태만 바꾸기
//   DELETE /equipments/1        지우기

const http = require("http");

const PORT = process.env.PORT || 3000;


// ───── 준비 (여기는 그대로 두세요) ─────

let 설비들 = [
  { id: 1, name: "컨베이어", line: "A", status: "가동" },
  { id: 2, name: "프레스", line: "B", status: "정지" },
];

let 다음번호 = 3;

const 상태값들 = ["가동", "정지"];

function JSON응답(res, 상태코드, 데이터) {
  res.writeHead(상태코드, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(데이터));
}

function 본문읽기(req) {
  return new Promise((resolve, reject) => {
    let 쌓은글자 = "";
    req.setEncoding("utf-8");
    req.on("data", (조각) => (쌓은글자 += 조각));
    req.on("end", () => resolve(쌓은글자));
    req.on("error", reject);
  });
}

// 본문을 읽고 JSON 으로 바꾸는 것까지 한 번에 합니다.
// 형식이 틀리면 null 을 돌려줍니다. 부르는 쪽에서 400 을 내면 됩니다.
async function JSON본문(req) {
  const 글자 = await 본문읽기(req);
  try {
    return JSON.parse(글자 || "{}");
  } catch {
    return null;
  }
}


const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  const 주소 = new URL(req.url, `http://${req.headers.host}`);
  const 경로 = 주소.pathname;


  // ───── 문제 1 ───── /health 만들기
  // GET /health 에 200 과 { status: "ok" } 를 돌려주세요.
  //
  // 기대 결과:
  //   GET /health  →  200  {"status":"ok"}
  //
  // 힌트: JSON응답(res, 200, { status: "ok" }) 한 줄이면 됩니다.
  //       응답한 뒤 return 을 꼭 붙이세요.

  // TODO: 여기에 코드를 쓰세요


  // ───── 준비 (여기도 그대로 두세요) ─────
  const 조각들 = 경로.split("/").filter(Boolean);
  const 첫조각 = 조각들[0];
  const 번호글자 = 조각들[1];

  if (첫조각 !== "equipments") {
    JSON응답(res, 404, { error: "그런 주소가 없습니다" });
    return;
  }

  // 여기부터는 첫조각이 반드시 equipments 입니다.
  //   /equipments      →  번호글자 는 undefined
  //   /equipments/1    →  번호글자 는 "1"


  // ───── 문제 2 ───── 목록 보기 + 라인으로 걸러 보기
  // GET /equipments 에 설비들 전부를 돌려주세요.
  // ?line=A 가 붙어 오면 그 라인 것만 걸러서 돌려주세요.
  //
  // 기대 결과:
  //   GET /equipments        →  200  설비 2건
  //   GET /equipments?line=A →  200  컨베이어 1건
  //   GET /equipments?line=Z →  200  []      ★ 404 가 아닙니다
  //
  // 힌트: 조건은 (번호글자 === undefined && req.method === "GET") 입니다.
  //       쿼리는 주소.searchParams.get("line") 으로 꺼냅니다. 없으면 null 입니다.

  // TODO: 여기에 코드를 쓰세요


  // ───── 문제 3 ───── 하나만 보기
  // GET /equipments/1 에 1번 설비를 돌려주세요.
  //
  // 세 가지 경우를 모두 처리해야 합니다.
  //   숫자가 아닌 번호  →  400  { error: "번호는 숫자여야 합니다" }
  //   그 번호가 없음    →  404  { error: "99번 설비가 없습니다" }
  //   찾음              →  200  설비 객체
  //
  // 기대 결과:
  //   GET /equipments/1    →  200  {"id":1,"name":"컨베이어","line":"A","status":"가동"}
  //   GET /equipments/99   →  404
  //   GET /equipments/abc  →  400
  //
  // ★ 순서가 중요합니다. 숫자인지 먼저 보고, 그다음에 찾으세요.
  //   순서를 바꾸면 /equipments/abc 에 404 가 나갑니다.
  //   "없는 설비" 와 "잘못 쓴 주소" 는 다른 문제입니다.
  //
  // 힌트: Number(번호글자) 로 바꾸고 Number.isInteger 로 확인합니다.
  //       find 는 못 찾으면 undefined 를 줍니다. 반드시 if (!설비) 를 붙이세요.

  // TODO: 여기에 코드를 쓰세요


  // ───── 문제 4 ───── 새로 등록하기
  // POST /equipments 로 온 본문을 읽어 새 설비를 만드세요.
  //
  //   - JSON 형식이 아니면        →  400  { error: "JSON 형식이 아닙니다" }
  //   - name 이나 line 이 없으면  →  400  빠진 이름을 알려 주세요
  //   - 잘 왔으면                 →  201  만든 설비를 그대로 돌려주세요
  //
  // 새 설비의 모양:
  //   { id: 다음번호, name: 받은name, line: 받은line, status: "정지" }
  //
  // 기대 결과:
  //   POST /equipments  { "name": "용접로봇" }
  //     →  400  {"error":"line 을(를) 넣어 주세요"}
  //
  //   POST /equipments  { "name": "용접로봇", "line": "C" }
  //     →  201  {"id":3,"name":"용접로봇","line":"C","status":"정지"}
  //
  // ★ status 는 보낸 값을 쓰지 말고 무조건 "정지" 로 시작하세요.
  //   보낸 쪽이 { "status": "폭발" } 을 넣어도 데이터가 안 망가져야 합니다.
  //   규칙은 서버가 쥐고 있어야 합니다.
  //
  // 힌트: const 데이터 = await JSON본문(req);  ← await 를 빠뜨리지 마세요
  //       빠진 것 모으기는 연습문제.js 문제 11 과 같습니다.
  //         ["name", "line"].filter((키) => !데이터[키])
  //       만든 뒤 다음번호 += 1 과 설비들.push(새설비) 를 잊지 마세요.

  // TODO: 여기에 코드를 쓰세요


  // ───── 문제 5 ───── 상태만 바꾸기
  // PATCH /equipments/3 으로 온 { "status": "가동" } 을 반영하세요.
  //
  //   - 그 번호가 없으면              →  404
  //   - status 가 가동/정지가 아니면  →  400  { error: "status 는 가동 또는 정지여야 합니다" }
  //   - 잘 왔으면                     →  200  바뀐 설비를 돌려주세요
  //
  // 기대 결과 (문제 4에서 3번을 만든 뒤에 해 보세요):
  //   PATCH /equipments/3  { "status": "폭발" }
  //     →  400
  //   PATCH /equipments/3  { "status": "가동" }
  //     →  200  {"id":3,"name":"용접로봇","line":"C","status":"가동"}
  //
  // ★ PUT 이 아니라 PATCH 인 이유
  //   PUT   전체를 통째로 바꾼다 (안 보낸 값은 사라지는 게 원칙)
  //   PATCH 일부만 바꾼다
  //   "상태만 바꾼다" 니까 PATCH 가 어울립니다.
  //
  // 힌트: 정해진 값만 받으려면 상태값들.includes(데이터.status) 를 쓰세요.
  //       find 로 찾은 객체의 속성을 바꾸면 배열 안의 것도 함께 바뀝니다.
  //       (객체는 주소를 들고 있기 때문입니다 — JS자료 07단원)

  // TODO: 여기에 코드를 쓰세요


  // ───── 문제 6 ───── 지우기
  // DELETE /equipments/3 으로 그 설비를 지우세요.
  //
  //   - 그 번호가 없으면  →  404
  //   - 지웠으면          →  204  ★ 본문은 보내지 않습니다
  //
  // 기대 결과:
  //   DELETE /equipments/3  →  204, 본문 없음
  //   DELETE /equipments/3  →  404   (이미 지웠으니)
  //
  // 힌트: 있는지 확인은 some 이 편합니다.
  //       지우기는 설비들 = 설비들.filter((설비) => 설비.id !== 번호) 입니다.
  //       204 는 JSON응답 을 쓰지 말고 직접 쓰세요.
  //         res.writeHead(204);
  //         res.end();

  // TODO: 여기에 코드를 쓰세요


  // ───── 문제 7 ───── 여기까지 안 걸린 요청
  // 위 어디에도 안 걸렸다면, 주소는 맞는데 메서드가 다른 경우입니다.
  // 405 와 { error: "이 주소에서는 쓸 수 없는 방법입니다" } 를 돌려주세요.
  //
  // 기대 결과:
  //   PUT /equipments  →  405
  //
  // ★ 왜 404 가 아닌가
  //   /equipments 는 있는 주소입니다. PUT 을 안 만들었을 뿐입니다.
  //   404 를 주면 상대가 "주소를 잘못 썼나?" 하고 엉뚱한 데를 찾습니다.

  // TODO: 여기에 코드를 쓰세요
});


server.listen(PORT, () => {
  console.log(`설비 관리 API 가 켜졌습니다.  http://localhost:${PORT}/equipments`);
});


// ============================================================
// 다 만들었으면 이 순서대로 눌러 보세요
// ============================================================
//
//   1  GET    /health                        200 {"status":"ok"}
//   2  GET    /equipments                    2건
//   3  GET    /equipments?line=A             1건 (컨베이어)
//   4  GET    /equipments?line=Z             0건 — 200 과 [] 입니다
//   5  GET    /equipments/1                  컨베이어 하나
//   6  GET    /equipments/99                 404
//   7  GET    /equipments/abc                400
//   8  POST   /equipments                    400 — line 을 안 넣었으니
//              { "name": "용접로봇" }
//   9  POST   /equipments                    201, id 3, status 는 "정지"
//              { "name": "용접로봇", "line": "C" }
//  10  PATCH  /equipments/3                  400
//              { "status": "폭발" }
//  11  PATCH  /equipments/3                  200, status 가 "가동" 으로
//              { "status": "가동" }
//  12  DELETE /equipments/3                  204, 본문 없음
//  13  DELETE /equipments/3                  404
//  14  PUT    /equipments                    405
//
// 4번과 6번의 차이를 꼭 눈으로 확인하세요.
// 둘 다 "없다" 인데 하나는 200, 하나는 404 입니다.
// 왜 그런지 말로 설명할 수 있으면 이 단원은 끝난 것입니다.


// ============================================================
// 잘 안 될 때 보는 곳
// ============================================================
//
// 브라우저가 계속 빙빙 돕니다
//   → 그 갈래에서 res.end 를 안 불렀습니다.
//
// Cannot set headers after they are sent
//   → 응답 뒤에 return 을 빠뜨려서 두 번 보내려 한 것입니다.
//
// 고쳤는데 그대로입니다
//   → 서버를 다시 안 켰습니다. Ctrl + C 후 다시 node 로 실행하세요.
//
// EADDRINUSE
//   → 앞서 켠 서버가 아직 살아 있습니다. 그 터미널에서 Ctrl + C 를 누르세요.
//     터미널을 닫아 버렸다면 아래로 찾아서 끕니다.
//       netstat -ano | findstr :3000
//       taskkill /PID <번호> /F
//
// 본문이 undefined 입니다
//   → await 를 빠뜨렸거나, Postman 에서 Body → raw → JSON 을 안 골랐습니다.
//
// 한글이 깨집니다
//   → Content-Type 에 charset=utf-8 이 빠졌습니다.
//
// 아무리 해도 404 만 나옵니다
//   → console.log(경로, 번호글자, req.method) 를 맨 위에 찍어 보세요.
//     내가 생각한 값과 실제 값이 다른 경우가 대부분입니다.
