// ============================================================
// utils/파일이름.js — 업로드 파일 이름 다루기 (09단원)
// ============================================================

const path = require("path");

// multer 가 주는 이름은 latin1 로 읽혀 깨져 있습니다. 되돌립니다.
// ★ file.originalname 에만 씁니다. req.body 값에 쓰면 오히려 망가집니다.
function 되돌리기(이름) {
  return Buffer.from(이름, "latin1").toString("utf8");
}

// 겹치지 않고 안전한 저장 이름을 만듭니다.
// 원래 이름은 쓰지 않습니다. ../ 같은 것이 들어올 수 있습니다.
function 저장이름(원본이름) {
  const 확장자 = path.extname(되돌리기(원본이름)).toLowerCase();
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${확장자}`;
}

module.exports = { 되돌리기, 저장이름 };
