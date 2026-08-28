// ============================================================
// middlewares/인증.js — 누구인지 확인하고 권한을 본다 (05단원)
// ============================================================

const { 에러 } = require("../utils/AppError");

// 진짜 서버라면 데이터베이스에서 찾습니다. PART 4 에서 바꿉니다.
const 키별사용자 = {
  "key-user-1": { name: "김민준", role: "user" },
  "key-admin-1": { name: "이서연", role: "admin" },
};

function 인증(req, res, next) {
  const 헤더값 = req.get("Authorization");
  if (!헤더값) return next(에러.로그인필요());

  const [방식, 키] = 헤더값.split(" ");
  if (방식 !== "Bearer" || !키) return next(에러.로그인필요());

  const 사용자 = 키별사용자[키];
  if (!사용자) return next(에러.로그인필요());

  req.user = 사용자;
  next();
}

function 역할확인(...허용역할들) {
  return (req, res, next) => {
    if (!req.user) return next(에러.로그인필요());
    if (!허용역할들.includes(req.user.role)) return next(에러.권한없음("이 작업을 할"));
    next();
  };
}

module.exports = { 인증, 역할확인, 키별사용자 };
