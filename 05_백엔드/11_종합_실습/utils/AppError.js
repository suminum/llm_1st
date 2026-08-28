// ============================================================
// utils/AppError.js — 상태코드와 코드가 붙은 에러
// ============================================================

const { 조사 } = require("./한국어");

class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const 에러 = {
  없음: (무엇) => new AppError(404, "NOT_FOUND", `${조사(무엇, "을", "를")} 찾을 수 없습니다`),
  검증실패: (항목들) => new AppError(400, "VALIDATION_FAILED", "입력값이 올바르지 않습니다", 항목들),
  중복: (무엇) => new AppError(409, "DUPLICATED", `이미 있는 ${무엇}입니다`),
  상태충돌: (메시지) => new AppError(409, "CONFLICT", 메시지),
  로그인필요: () => new AppError(401, "UNAUTHENTICATED", "로그인이 필요합니다"),
  권한없음: (무엇) => new AppError(403, "FORBIDDEN", `${무엇} 권한이 없습니다`),
  주소없음: () => new AppError(404, "ROUTE_NOT_FOUND", "그런 주소가 없습니다"),
};

module.exports = { AppError, 에러 };
