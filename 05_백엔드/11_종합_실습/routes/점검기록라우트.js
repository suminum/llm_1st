// ============================================================
// routes/점검기록라우트.js
// ============================================================

const express = require("express");

const 점검기록컨트롤러 = require("../controllers/점검기록컨트롤러");
const { 인증, 역할확인 } = require("../middlewares/인증");
const { 에러 } = require("../utils/AppError");

const router = express.Router();

router.param("id", (req, res, next, 값) => {
  const 번호 = Number(값);
  if (!Number.isInteger(번호)) {
    return next(에러.검증실패([{ 키: "id", 이유: "숫자여야 합니다" }]));
  }
  req.번호 = 번호;
  next();
});

router.get("/", 점검기록컨트롤러.목록);
router.get("/:id", 점검기록컨트롤러.하나);
router.delete("/:id", 인증, 역할확인("admin"), 점검기록컨트롤러.삭제);

module.exports = router;

// ★ PATCH 가 없습니다. 점검기록은 '일어난 사실' 이라 고치는 게 이상합니다.
//   잘못 적었으면 지우고 다시 남깁니다.
