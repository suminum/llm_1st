// ============================================================
// 03단원 서버 연습문제 정답 — 설비 관리 API
// ------------------------------------------------------------
// 실행: node 연습문제_서버_정답.js
//       끄려면 Ctrl + C
// ============================================================
//
// 먼저 스스로 만들어 본 다음에 보세요.

const http = require("http");

const PORT = process.env.PORT || 3000;


// ───── 준비 ─────

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
// 세 번 넘게 반복될 코드라 미리 묶었습니다.
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


  // ───── 문제 1 ───── /health
  if (경로 === "/health") {
    JSON응답(res, 200, { status: "ok" });
    return;
  }

  // 확인: GET /health
  // 응답: 200 {"status":"ok"}
  //
  // 서버가 살아 있는지 확인하는 주소입니다.
  // PART 4 에서 배포할 때, 이 주소가 200 을 주는지로 서버 상태를 감시합니다.


  const 조각들 = 경로.split("/").filter(Boolean);
  const 첫조각 = 조각들[0];
  const 번호글자 = 조각들[1];

  if (첫조각 !== "equipments") {
    JSON응답(res, 404, { error: "그런 주소가 없습니다" });
    return;
  }

  // 확인: GET /없는주소
  // 응답: 404 {"error":"그런 주소가 없습니다"}


  // ───── 문제 2 ───── 목록 + 라인으로 걸러 보기
  if (번호글자 === undefined && req.method === "GET") {
    const 라인 = 주소.searchParams.get("line");
    const 결과 = 라인 ? 설비들.filter((설비) => 설비.line === 라인) : 설비들;

    JSON응답(res, 200, 결과);
    return;
  }

  // 확인: GET /equipments
  // 응답: 200 [{"id":1,"name":"컨베이어","line":"A","status":"가동"},{"id":2,"name":"프레스","line":"B","status":"정지"}]

  // 확인: GET /equipments?line=A
  // 응답: 200 [{"id":1,"name":"컨베이어","line":"A","status":"가동"}]
  //
  // 조건에 맞는 게 없으면 빈 배열 [] 과 200 입니다. 404 가 아닙니다.
  // ?line=Z 로 시험해 보세요.


  // ───── 문제 3 ───── 하나만 보기
  if (번호글자 !== undefined && req.method === "GET") {
    const 번호 = Number(번호글자);

    if (!Number.isInteger(번호)) {
      JSON응답(res, 400, { error: "번호는 숫자여야 합니다" });
      return;
    }

    // 확인: GET /equipments/abc
    // 응답: 400 {"error":"번호는 숫자여야 합니다"}

    const 설비 = 설비들.find((설비) => 설비.id === 번호);

    if (!설비) {
      JSON응답(res, 404, { error: `${번호}번 설비가 없습니다` });
      return;
    }

    // 확인: GET /equipments/99
    // 응답: 404 {"error":"99번 설비가 없습니다"}

    JSON응답(res, 200, 설비);
    return;
  }

  // 확인: GET /equipments/1
  // 응답: 200 {"id":1,"name":"컨베이어","line":"A","status":"가동"}
  //
  // ★ 숫자 검사를 먼저, 찾기를 나중에 하는 순서가 중요합니다.
  //   순서를 바꾸면 /equipments/abc 에 404 가 나갑니다.
  //   "없는 설비" 와 "잘못 쓴 주소" 는 다른 문제입니다.


  // ───── 문제 4 ───── 새로 만들기
  if (번호글자 === undefined && req.method === "POST") {
    const 데이터 = await JSON본문(req);

    if (데이터 === null) {
      JSON응답(res, 400, { error: "JSON 형식이 아닙니다" });
      return;
    }

    // 필수 값이 여러 개라 빠진 것을 모아서 알려 줍니다. (연습문제.js 문제 11)
    const 빠진것 = ["name", "line"].filter((키) => !데이터[키]);

    if (빠진것.length > 0) {
      JSON응답(res, 400, { error: `${빠진것.join(", ")} 을(를) 넣어 주세요` });
      return;
    }

    // 확인: POST /equipments {"name":"용접로봇"}
    // 응답: 400 {"error":"line 을(를) 넣어 주세요"}

    const 새설비 = {
      id: 다음번호,
      name: 데이터.name,
      line: 데이터.line,
      status: "정지", // 새로 등록한 설비는 일단 정지 상태
    };

    다음번호 += 1;
    설비들.push(새설비);

    res.writeHead(201, {
      "Content-Type": "application/json; charset=utf-8",
      Location: `/equipments/${새설비.id}`,
    });
    res.end(JSON.stringify(새설비));
    return;
  }

  // 확인: POST /equipments {"name":"용접로봇","line":"C"}
  // 응답: 201 {"id":3,"name":"용접로봇","line":"C","status":"정지"}
  //
  // ★ status 를 보낸 쪽이 정하게 두지 않았습니다.
  //   서버가 규칙을 쥐고 있어야 합니다. 보낸 값을 그대로 믿으면
  //   누군가 { "status": "폭발" } 을 보내는 순간 데이터가 망가집니다.


  // ───── 문제 5 ───── 상태만 바꾸기
  if (번호글자 !== undefined && req.method === "PATCH") {
    const 번호 = Number(번호글자);
    const 설비 = 설비들.find((설비) => 설비.id === 번호);

    if (!설비) {
      JSON응답(res, 404, { error: `${번호}번 설비가 없습니다` });
      return;
    }

    const 데이터 = await JSON본문(req);

    if (데이터 === null) {
      JSON응답(res, 400, { error: "JSON 형식이 아닙니다" });
      return;
    }

    // 정해진 값만 받습니다.
    if (!상태값들.includes(데이터.status)) {
      JSON응답(res, 400, { error: "status 는 가동 또는 정지여야 합니다" });
      return;
    }

    // 확인: PATCH /equipments/3 {"status":"이상한값"}
    // 응답: 400 {"error":"status 는 가동 또는 정지여야 합니다"}

    설비.status = 데이터.status;

    JSON응답(res, 200, 설비);
    return;
  }

  // 확인: PATCH /equipments/3 {"status":"가동"}
  // 응답: 200 {"id":3,"name":"용접로봇","line":"C","status":"가동"}
  //
  // ★ PUT 과 PATCH 의 차이
  //   PUT   전체를 통째로 바꾼다   → 안 보낸 값은 사라지는 게 원칙
  //   PATCH 일부만 바꾼다          → 보낸 것만 바뀐다
  //   "상태만 바꾼다" 는 PATCH 가 어울립니다.
  //
  // ★ includes 로 값을 제한한 이유
  //   status 에 아무 글자나 들어가면 나중에 "가동" 을 세는 코드가 다 틀립니다.
  //   받을 수 있는 값이 정해져 있으면 반드시 목록으로 막으세요.
  //   (TS 를 배우면 이걸 타입으로도 막을 수 있습니다)


  // ───── 문제 6 ───── 지우기
  if (번호글자 !== undefined && req.method === "DELETE") {
    const 번호 = Number(번호글자);
    const 있나 = 설비들.some((설비) => 설비.id === 번호);

    if (!있나) {
      JSON응답(res, 404, { error: `${번호}번 설비가 없습니다` });
      return;
    }

    설비들 = 설비들.filter((설비) => 설비.id !== 번호);

    res.writeHead(204);
    res.end();
    return;
  }

  // 확인: DELETE /equipments/3
  // 응답: 204

  // 확인: DELETE /equipments/3
  // 응답: 404 {"error":"3번 설비가 없습니다"}
  //
  // ★ 같은 요청을 두 번 보냈더니 답이 달라졌습니다. 이게 맞을까요?
  //   "지워라" 를 두 번 보내도 결과(그 설비가 없는 상태)는 똑같습니다.
  //   그래서 두 번째에 204 를 주는 서버도 많습니다. 둘 다 틀리지 않습니다.
  //
  //   여기서는 "없는 걸 지우라고 했으니 알려 주자" 쪽을 골랐습니다.
  //   중요한 건 어느 쪽이든 '정해 두고 일관되게' 하는 것입니다.


  // ───── 문제 7 ───── 남은 경우
  JSON응답(res, 405, { error: "이 주소에서는 쓸 수 없는 방법입니다" });

  // 확인: PUT /equipments
  // 응답: 405 {"error":"이 주소에서는 쓸 수 없는 방법입니다"}
  //
  // /equipments 는 있는 주소지만 PUT 은 안 만들었습니다.
  // 404(그런 주소 없음)가 아니라 405(그 방법은 안 됨)가 정확합니다.
});


server.listen(PORT, () => {
  console.log(`설비 관리 API 가 켜졌습니다.  http://localhost:${PORT}/equipments`);
});


// ── 지우고 나서 목록을 다시 보면 ──
//
// 확인: GET /equipments
// 응답: 200 [{"id":1,"name":"컨베이어","line":"A","status":"가동"},{"id":2,"name":"프레스","line":"B","status":"정지"}]


// ============================================================
// 이 코드를 보며 확인할 것
// ============================================================
//
// ① 갈래를 나누는 조건이 벌써 일곱 개입니다.
//    설비 말고 작업지시·불량기록까지 만들면 스무 개가 넘습니다.
//    04단원에서 Express 로 다시 만들면 이 if 들이 전부 사라집니다.
//
// ② 반복이 보입니다.
//      Number(번호글자)
//      find 하고 없으면 404
//      JSON본문 하고 null 이면 400
//    문제 3·5·6 에 똑같은 코드가 세 번씩 들어 있습니다.
//    05단원 미들웨어를 배우면 이걸 한 곳에 모을 수 있습니다.
//
// ③ 검사하는 코드가 진짜 일하는 코드보다 깁니다.
//    이건 잘못된 게 아니라 정상입니다.
//    남이 보내는 것은 무엇이든 틀릴 수 있다고 생각해야 합니다.
//
// ④ 서버를 끄면 3번 설비가 사라집니다.
//    PART 4 에서 데이터베이스를 붙이면 해결됩니다.


// ============================================================
// Postman 시나리오
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
// 둘 다 "없다" 인데 하나는 200, 하나는 404 입니다. 이유를 설명할 수 있어야 합니다.
