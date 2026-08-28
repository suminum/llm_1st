// ============================================================
// 14단원 연습용 서버 — 설치할 것이 없습니다
// ------------------------------------------------------------
// 켜는 법 (터미널을 하나 더 열어서):
//
//     cd 실습프로젝트/14단원_서버
//     node 서버.js
//
//     → 서버가 http://localhost:4000 에서 돕니다
//
// 끄는 법: 그 터미널에서 Ctrl+C
// ------------------------------------------------------------
// ★ 이 파일은 **읽지 않아도 됩니다.** 지금은 "그냥 도는 것" 으로 두세요.
//   서버를 어떻게 만드는지는 PART 3 (백엔드) 에서 배웁니다.
//   여기서는 **React 가 서버에 붙는 쪽**만 봅니다.
//
// ★★ 일부러 npm 설치 없이 만들었습니다.
//   Node 만 깔려 있으면 바로 돕니다. (개념01에서 확인한 그 Node 입니다)
//   그래서 express·multer 같은 것이 안 나옵니다. PART 3 에서 만납니다.
// ============================================================

// ★ import 로 씁니다. 실습프로젝트가 "type": "module" 이라서 그렇습니다.
//   (React 자료 08단원 개념03 에서 배운 그 import 입니다)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const 포트 = 4000;
const 올린곳 = path.join(import.meta.dirname, "올라온파일");

if (!fs.existsSync(올린곳)) fs.mkdirSync(올린곳);

// ── 자료(메모리에만 둡니다. 서버를 끄면 사라집니다) ──
let 다음번호 = 4;
const 설비들 = [
  { 번호: 1, 이름: "3호 프레스", 상태: "가동", 담당: "김철수" },
  { 번호: 2, 이름: "5호 컨베이어", 상태: "점검중", 담당: "이영희" },
  { 번호: 3, 이름: "7호 절단기", 상태: "가동", 담당: "박민수" },
];

// ── CORS ──
//
// 화면은 http://localhost:5173 (Vite), 서버는 http://localhost:4000 입니다.
// 포트가 다르면 **다른 출처**입니다. 그래서 브라우저가 막습니다.
// 아래 헤더가 "저기서 오는 요청은 받아 주겠다" 는 뜻입니다.
//
// ★ 이 세 줄이 없으면 개념02가 CORS 오류로 막힙니다. 일부러 꺼 보세요.
function CORS붙이기(응답) {
  응답.setHeader("Access-Control-Allow-Origin", "*");
  응답.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  응답.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function JSON으로(응답, 상태, 값) {
  CORS붙이기(응답);
  응답.writeHead(상태, { "Content-Type": "application/json; charset=utf-8" });
  응답.end(JSON.stringify(값));
}

function 본문모으기(요청) {
  return new Promise((풀기) => {
    const 조각들 = [];
    요청.on("data", (조각) => 조각들.push(조각));
    요청.on("end", () => 풀기(Buffer.concat(조각들)));
  });
}

// ── multipart/form-data 를 손으로 뜯습니다 ──
//
// ★ 이건 원래 손으로 안 합니다. PART 3 에서 multer 라는 것이 대신해 줍니다.
//   여기서는 설치 없이 돌게 하려고 최소한만 만들었습니다.
//   읽지 않아도 됩니다.
function 멀티파트뜯기(본문, 종류) {
  const 맞은것 = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(종류 || "");
  if (!맞은것) return null;

  const 경계 = "--" + (맞은것[1] || 맞은것[2]).trim();
  const 조각들 = [];
  let 자리 = 본문.indexOf(경계);

  while (자리 !== -1) {
    const 시작 = 자리 + 경계.length;
    if (본문.slice(시작, 시작 + 2).toString() === "--") break; // 마지막 경계

    const 다음 = 본문.indexOf(경계, 시작);
    if (다음 === -1) break;

    // 앞의 \r\n 과 뒤의 \r\n 을 뺍니다
    const 덩어리 = 본문.slice(시작 + 2, 다음 - 2);
    const 나눔 = 덩어리.indexOf("\r\n\r\n");
    if (나눔 !== -1) {
      조각들.push({
        머리: 덩어리.slice(0, 나눔).toString("utf-8"),
        몸: 덩어리.slice(나눔 + 4),
      });
    }
    자리 = 다음;
  }

  const 값들 = {};
  const 파일들 = [];

  for (const 조각 of 조각들) {
    const 이름 = /name="([^"]*)"/.exec(조각.머리);
    const 파일이름 = /filename="([^"]*)"/.exec(조각.머리);
    if (!이름) continue;

    if (파일이름 && 파일이름[1]) {
      파일들.push({ 칸: 이름[1], 원래이름: 파일이름[1], 내용: 조각.몸 });
    } else {
      값들[이름[1]] = 조각.몸.toString("utf-8");
    }
  }

  return { 값들, 파일들 };
}

// ── ★ 주소는 영문으로 씁니다 ──
//
//   이 자료는 코드 안의 이름을 한글로 씁니다. 그런데 **주소는 영문**입니다.
//   왜냐하면 —
//
//     fetch("/api/설비")  →  실제로 나가는 것은  /api/%EC%84%A4%EB%B9%84
//
//   한글은 주소에서 퍼센트 인코딩됩니다. (JS자료 14단원 개념02)
//   그러면 서버에서 `길 === "/api/설비"` 로 비교할 때 안 맞습니다.
//
//   ★ 이 서버를 만들면서 실제로 그렇게 만들었다가 404 가 났습니다.
//     decodeURIComponent 로 풀어서 비교할 수도 있지만,
//     **주소는 그냥 영문으로 쓰는 게 맞습니다.** PART 3 도 그렇게 씁니다.
//
//   경로 이름은 백엔드자료와 똑같이 맞췄습니다.
//   PART 3 에서 이 주소를 그대로 다시 만납니다.

// ── 요청 처리 ──
const 서버 = http.createServer(async (요청, 응답) => {
  // ★ 요청 하나가 터져도 서버 전체가 죽으면 안 됩니다.
  //   Node 는 async 함수 안의 오류를 안 잡아 주면 프로세스를 끝냅니다.
  //   실습 중에 서버가 조용히 사라지면 원인을 못 찾습니다.
  try {
    await 처리(요청, 응답);
  } catch (오류) {
    console.error("요청 처리 중 오류:", 오류.message);
    if (!응답.headersSent) JSON으로(응답, 500, { 메시지: "서버 안에서 문제가 생겼습니다" });
  }
});

async function 처리(요청, 응답) {
  const 주소 = new URL(요청.url, `http://localhost:${포트}`);
  const 길 = 주소.pathname;

  console.log(`${요청.method} ${길}`);

  // 브라우저가 본 요청 전에 물어보는 것 (사전 요청)
  if (요청.method === "OPTIONS") {
    CORS붙이기(응답);
    응답.writeHead(204);
    return 응답.end();
  }

  // 목록
  if (요청.method === "GET" && 길 === "/api/v1/equipments") {
    // 느린 서버를 흉내 냅니다. '불러오는 중' 을 눈으로 보려고요.
    const 늦추기 = Number(주소.searchParams.get("slow") || 0);
    if (늦추기 > 0) await new Promise((풀기) => setTimeout(풀기, 늦추기));

    if (주소.searchParams.get("fail") === "yes") {
      return JSON으로(응답, 500, { 메시지: "서버가 잠깐 이상합니다" });
    }
    return JSON으로(응답, 200, { 설비들 });
  }

  // 추가 (JSON)
  if (요청.method === "POST" && 길 === "/api/v1/equipments") {
    const 본문 = await 본문모으기(요청);
    let 받은것;
    try {
      받은것 = JSON.parse(본문.toString("utf-8"));
    } catch {
      return JSON으로(응답, 400, { 메시지: "JSON 이 아닙니다" });
    }

    // ★ 서버도 검사합니다. 화면에서 막았다고 서버가 안 봐도 되는 게 아닙니다.
    if (!받은것.이름 || 받은것.이름.trim() === "") {
      return JSON으로(응답, 400, { 메시지: "이름은 꼭 넣어야 합니다", 칸: "이름" });
    }
    if (설비들.some((하나) => 하나.이름 === 받은것.이름)) {
      return JSON으로(응답, 409, { 메시지: "이미 있는 이름입니다", 칸: "이름" });
    }

    const 새것 = {
      번호: 다음번호++,
      이름: 받은것.이름,
      상태: 받은것.상태 || "가동",
      담당: 받은것.담당 || "",
    };
    설비들.push(새것);
    return JSON으로(응답, 201, { 설비: 새것 });
  }

  // 업로드 (multipart/form-data)
  if (요청.method === "POST" && 길 === "/api/v1/files") {
    const 본문 = await 본문모으기(요청);
    const 뜯은것 = 멀티파트뜯기(본문, 요청.headers["content-type"]);

    if (!뜯은것) {
      return JSON으로(응답, 400, { 메시지: "multipart/form-data 가 아닙니다" });
    }
    if (뜯은것.파일들.length === 0) {
      return JSON으로(응답, 400, { 메시지: "파일이 안 왔습니다", 칸: "파일" });
    }

    const 파일 = 뜯은것.파일들[0];

    // ★ 크기 제한. 없으면 큰 파일이 서버를 잡아먹습니다.
    const 최대 = 2 * 1024 * 1024; // 2MB
    if (파일.내용.length > 최대) {
      return JSON으로(응답, 413, { 메시지: "파일이 너무 큽니다 (2MB 까지)" });
    }

    // ★ 원래 이름을 그대로 쓰면 안 됩니다. 덮어쓰기도 되고 위험한 이름도 옵니다.
    const 확장자 = path.extname(파일.원래이름).toLowerCase().slice(0, 10);
    const 저장이름 = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${확장자}`;
    fs.writeFileSync(path.join(올린곳, 저장이름), 파일.내용);

    return JSON으로(응답, 201, {
      원래이름: 파일.원래이름,
      저장이름,
      크기: 파일.내용.length,
      메모: 뜯은것.값들.메모 || "",
    });
  }

  JSON으로(응답, 404, { 메시지: "그런 주소가 없습니다" });
}

// ★ 서버를 두 번 켜면 나는 오류입니다. 학생이 반드시 한 번은 만납니다.
서버.on("error", (오류) => {
  if (오류.code === "EADDRINUSE") {
    console.error("");
    console.error(`  ★ ${포트}번 문이 이미 쓰이고 있습니다.`);
    console.error("");
    console.error("  이 서버를 이미 켜 두신 것 같습니다.");
    console.error("  켜 둔 터미널에서 Ctrl+C 로 끄고 다시 켜세요.");
    console.error("");
    console.error("  어느 터미널인지 모르겠으면 (윈도우):");
    console.error(`    netstat -ano | findstr :${포트}`);
    console.error("    taskkill /PID 그번호 /F");
    console.error("");
    process.exit(1);
  }
  console.error("서버 오류:", 오류.message);
  process.exit(1);
});

서버.listen(포트, () => {
  console.log("");
  console.log("  14단원 연습용 서버가 떴습니다");
  console.log(`  http://localhost:${포트}`);
  console.log("");
  console.log("  GET  /api/v1/equipments             목록");
  console.log("  GET  /api/v1/equipments?slow=1500   느린 서버 흉내");
  console.log("  GET  /api/v1/equipments?fail=yes    500 을 내 봄");
  console.log("  POST /api/v1/equipments             추가 (JSON)");
  console.log("  POST /api/v1/files                  파일 (FormData)");
  console.log("");
  console.log("  끄기: Ctrl+C");
  console.log("");
});
