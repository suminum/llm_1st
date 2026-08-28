// ============================================================
// _검증도구/브라우저검증.js — 진짜 크롬으로 CORS 를 확인한다
// ------------------------------------------------------------
// 사용:
//   node _검증도구/브라우저검증.js 08_정적파일과_CORS/개념02_CORS란_무엇인가.js
//   node _검증도구/브라우저검증.js                 ← 08단원 서버 전부
//
// 준비:
//   npm install --save-dev puppeteer-core
//   (크롬 브라우저는 이미 깔려 있어야 합니다. 새로 받지 않습니다)
//
// 왜 따로 있나:
//   CORS 는 '브라우저만' 막습니다.
//   Node 의 fetch·Postman·curl 은 CORS 를 아예 안 따집니다.
//   그래서 서버검증.js 로는 "정말 막히는지" 를 확인할 수 없습니다.
//
//   이 도구는 진짜 크롬을 띄워서
//   다른 출처의 페이지가 우리 API 를 부를 수 있는지 직접 눌러 봅니다.
// ============================================================

const path = require("path");
const fs = require("fs");
const http = require("http");
const cp = require("child_process");

const 자료뿌리 = path.join(__dirname, "..");
const CORS단원 = path.join(자료뿌리, "08_정적파일과_CORS");
const 시험페이지 = path.join(CORS단원, "front", "다른출처.html");

const API포트 = 3000;
const 프론트포트 = 5500;

// 크롬 위치. 다른 데 깔았다면 여기를 고치세요.
const 크롬후보 = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS
  process.env.CHROME_PATH,
].filter(Boolean);


function 크롬찾기() {
  for (const 경로 of 크롬후보) {
    if (fs.existsSync(경로)) return 경로;
  }
  return null;
}


function 퍼페티어불러오기() {
  try {
    return require("puppeteer-core");
  } catch {
    return null;
  }
}


// front/다른출처.html 을 5500 포트로 띄웁니다.
// Live Server 를 쓰는 것과 같은 상황을 만드는 것입니다.
function 프론트띄우기() {
  const html = fs.readFileSync(시험페이지, "utf8");

  return new Promise((resolve) => {
    const 서버 = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    });

    서버.listen(프론트포트, () => resolve(서버));
  });
}


async function 서버하나확인(퍼페티어, 크롬, 서버파일) {
  const 자식 = cp.spawn("node", [서버파일], {
    env: { ...process.env, PORT: String(API포트) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  await new Promise((r) => setTimeout(r, 1500));

  const 브라우저 = await 퍼페티어.launch({ executablePath: 크롬, headless: "new" });
  const 페이지 = await 브라우저.newPage();

  const 콘솔에러 = [];
  페이지.on("console", (메시지) => {
    if (메시지.type() === "error") 콘솔에러.push(메시지.text());
  });

  await 페이지.goto(`http://localhost:${프론트포트}/`, { waitUntil: "load" });

  console.log(`\n===== ${path.basename(서버파일)} =====`);

  const 결과들 = [];

  for (const 종류 of ["단순", "본문", "증표", "삭제", "헤더읽기"]) {
    콘솔에러.length = 0;

    await 페이지.click(`button[data-종류="${종류}"]`);
    await new Promise((r) => setTimeout(r, 500));

    const 글 = await 페이지.$eval("#결과", (el) => el.textContent);
    const 줄들 = 글.split("\n");
    const 성공 = 줄들[0].startsWith("성공");

    결과들.push({ 종류, 성공 });

    console.log(`  ${종류.padEnd(5)} → ${줄들[0]}${성공 ? "  |  " + (줄들[1] ?? "") : ""}`);

    if (콘솔에러.length) {
      const 이유 = 콘솔에러[0].replace(
        /^Access to fetch at '[^']*' from origin '[^']*' has been blocked by CORS policy: /,
        ""
      );
      console.log(`          콘솔: ${이유.slice(0, 160)}`);
    }
  }

  await 브라우저.close();
  자식.kill();
  await new Promise((r) => setTimeout(r, 200));

  return 결과들;
}


(async () => {
  const 퍼페티어 = 퍼페티어불러오기();

  if (!퍼페티어) {
    console.log("puppeteer-core 가 없습니다. 이 검증은 건너뜁니다.");
    console.log("쓰려면:  npm install --save-dev puppeteer-core");
    process.exit(0);
  }

  const 크롬 = 크롬찾기();

  if (!크롬) {
    console.log("크롬을 찾지 못했습니다. 이 검증은 건너뜁니다.");
    console.log("크롬 경로를 CHROME_PATH 환경변수로 알려 주거나, 이 파일의 크롬후보를 고치세요.");
    process.exit(0);
  }

  if (!fs.existsSync(시험페이지)) {
    console.log(`시험 페이지가 없습니다: ${시험페이지}`);
    process.exit(1);
  }

  const 넘어온것 = process.argv.slice(2);
  const 대상들 =
    넘어온것.length > 0
      ? 넘어온것.map((대상) => (path.isAbsolute(대상) ? 대상 : path.join(자료뿌리, 대상)))
      : fs
          .readdirSync(CORS단원)
          // ★ 개념05 는 빠져 있습니다.
          //   그건 프록시 방식이라 '같은 출처' 로 부르는 것이 정상입니다.
          //   다른 출처 페이지로 부르면 당연히 막힙니다. 확인 대상이 아닙니다.
          //   개념05 는 http://localhost:3000 을 직접 열어서 확인하세요.
          .filter((f) => /^(개념0[234]|연습문제_서버_정답).*\.js$/.test(f))
          .sort()
          .map((f) => path.join(CORS단원, f));

  const 프론트 = await 프론트띄우기();

  console.log(`크롬: ${크롬}`);
  console.log(`프론트: http://localhost:${프론트포트}  /  API: http://localhost:${API포트}`);

  for (const 서버파일 of 대상들) {
    await 서버하나확인(퍼페티어, 크롬, 서버파일);
  }

  프론트.close();

  console.log("\n########## 브라우저 확인 끝 ##########");
  console.log("★ 이 결과는 사람이 읽고 판단합니다.");
  console.log("  개념02 는 전부 '실패' 여야 맞습니다. (CORS 를 일부러 안 열었습니다)");
  console.log("  개념03·04 와 연습문제 정답은 전부 '성공' 이어야 맞습니다.");
})();
