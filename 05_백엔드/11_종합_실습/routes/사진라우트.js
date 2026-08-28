// ============================================================
// routes/사진라우트.js
// ============================================================

const express = require("express");

const 사진컨트롤러 = require("../controllers/사진컨트롤러");
const { 인증, 역할확인 } = require("../middlewares/인증");
const { 에러 } = require("../utils/AppError");

const router = express.Router();

// ★★ /orphans 를 /:id 보다 먼저 등록합니다.
//   아래에 두면 :id 에 "orphans" 가 들어갑니다. (04단원 개념02 섹션 7)
router.get("/orphans", 사진컨트롤러.고아확인);

router.param("id", (req, res, next, 값) => {
  const 번호 = Number(값);
  if (!Number.isInteger(번호)) {
    return next(에러.검증실패([{ 키: "id", 이유: "숫자여야 합니다" }]));
  }
  req.번호 = 번호;
  next();
});

router.get("/:id/view", 사진컨트롤러.보기);
router.get("/:id/download", 사진컨트롤러.내려받기);
router.delete("/:id", 인증, 역할확인("admin"), 사진컨트롤러.삭제);

module.exports = router;
