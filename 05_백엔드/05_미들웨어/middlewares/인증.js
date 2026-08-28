// ============================================================
// middlewares/인증.js — 누구인지 확인하고 권한을 본다
// ------------------------------------------------------------
// 개념03 에서 만든 것을 파일로 옮겼습니다.
// ============================================================

const { HttpError } = require("../utils/HttpError");

// 진짜 서버라면 데이터베이스에서 찾습니다. PART 4 에서 바꿉니다.
const 키별사용자 = {
  "key-user-1": { name: "김민준", role: "user" },
  "key-admin-1": { name: "이서연", role: "admin" },
};

function 인증(req, res, next) {
  const 헤더값 = req.get("Authorization");

  if (!헤더값) {
    return next(HttpError(401, "로그인이 필요합니다"));
  }

  const [방식, 키] = 헤더값.split(" ");

  if (방식 !== "Bearer" || !키) {
    return next(HttpError(401, "Authorization 형식이 올바르지 않습니다"));
  }

  const 사용자 = 키별사용자[키];

  if (!사용자) {
    return next(HttpError(401, "증표가 올바르지 않습니다"));
  }

  req.user = 사용자;
  next();
}

// 로그인은 했는지도 함께 확인합니다.
// 순서를 잘못 짜도 500 대신 401 이 나가게 하려는 것입니다. (개념03 섹션 9)
function 역할확인(...허용역할들) {
  return (req, res, next) => {
    if (!req.user) {
      return next(HttpError(401, "로그인이 필요합니다"));
    }

    if (!허용역할들.includes(req.user.role)) {
      return next(HttpError(403, `${허용역할들.join(" 또는 ")} 만 할 수 있습니다`));
    }

    next();
  };
}

module.exports = { 인증, 역할확인 };

// ★ 개념03 의 관리자만 을 역할확인("admin") 으로 바꿨습니다.
//   나중에 manager 역할이 생겨도 역할확인("admin", "manager") 로 끝납니다.
//   미들웨어를 새로 만들 필요가 없습니다.
