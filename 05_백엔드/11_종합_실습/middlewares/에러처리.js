// ============================================================
// middlewares/에러처리.js — 404 와 에러 처리기
// ============================================================

const { AppError, 에러 } = require("../utils/AppError");

function 없는주소(req, res, next) {
  next(에러.주소없음());
}

function 에러처리기(err, req, res, next) {
  // ★ 터미널에는 전부 남깁니다. 요청 번호와 함께요.
  console.error(`[에러] #${req.요청번호} ${req.method} ${req.path} — ${err.name}: ${err.message}`);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "INVALID_JSON", message: "JSON 형식이 아닙니다" } });
  }

  if (err.name === "MulterError") {
    const 안내 = {
      LIMIT_FILE_SIZE: "파일이 너무 큽니다 (최대 2000바이트)",
      LIMIT_FILE_COUNT: "사진은 한 번에 한 장만 올릴 수 있습니다",
      LIMIT_UNEXPECTED_FILE: "필드 이름이 photo 가 맞나요? (한글로 쓰면 안 됩니다)",
    };

    return res.status(400).json({ error: { code: err.code, message: 안내[err.code] ?? err.message } });
  }

  if (err instanceof AppError) {
    const 몸통 = { code: err.code, message: err.message };
    if (err.details !== undefined) 몸통.details = err.details;
    return res.status(err.status).json({ error: 몸통 });
  }

  // fileFilter 처럼 우리가 status 만 붙여 던진 에러
  if (err.status) {
    return res.status(err.status).json({ error: { code: err.code ?? "BAD_REQUEST", message: err.message } });
  }

  // ★ 예상 못 한 에러는 자세한 내용을 밖으로 안 보냅니다.
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
}

module.exports = { 없는주소, 에러처리기 };
