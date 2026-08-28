// ============================================================
// middlewares/기록.js — 요청 기록 남기기
// ------------------------------------------------------------
// 개념02 에서 만든 것을 파일로 옮겼습니다.
// ============================================================

let 요청번호 = 0;

// 요청마다 번호를 붙입니다.
function 번호붙이기(req, res, next) {
  요청번호 += 1;
  req.요청번호 = 요청번호;
  res.set("X-Request-Id", String(요청번호));
  next();
}

// 요청과 걸린 시간을 터미널에 남깁니다.
function 요청기록(req, res, next) {
  const 시작 = Date.now();

  console.log(`#${req.요청번호}  ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const 걸린시간 = Date.now() - 시작;
    const 표시 = res.statusCode >= 400 ? "★" : " ";
    console.log(`   └${표시}#${req.요청번호}  ${res.statusCode} — ${걸린시간}ms`);
  });

  next();
}

// ★ 여러 개를 내보낼 때는 객체로 묶습니다. (01단원 개념02)
module.exports = { 번호붙이기, 요청기록 };

// 부르는 쪽에서는 이렇게 씁니다.
//   const { 번호붙이기, 요청기록 } = require("./middlewares/기록");
