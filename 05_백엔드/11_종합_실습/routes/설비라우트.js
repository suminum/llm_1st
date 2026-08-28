// ============================================================
// routes/설비라우트.js — 주소 ↔ 함수, 그리고 누가 할 수 있는가
// ============================================================

const express = require("express");

const 설비컨트롤러 = require("../controllers/설비컨트롤러");
const 점검기록컨트롤러 = require("../controllers/점검기록컨트롤러");
const 사진컨트롤러 = require("../controllers/사진컨트롤러");
const { 인증, 역할확인 } = require("../middlewares/인증");
const { 사진업로드 } = require("../middlewares/업로드");
const { 에러 } = require("../utils/AppError");

const router = express.Router();

// :id 를 숫자로 바꿔 req.번호 에 담습니다. 이 라우터의 모든 :id 에 걸립니다.
router.param("id", (req, res, next, 값) => {
  const 번호 = Number(값);

  if (!Number.isInteger(번호)) {
    return next(에러.검증실패([{ 키: "id", 이유: "숫자여야 합니다" }]));
  }

  req.번호 = 번호;
  next();
});

// ── 설비 ──
router.get("/", 설비컨트롤러.목록);
router.get("/:id", 설비컨트롤러.하나);
router.post("/", 인증, 역할확인("admin"), 설비컨트롤러.등록);
router.patch("/:id", 인증, 설비컨트롤러.상태바꾸기);
router.delete("/:id", 인증, 역할확인("admin"), 설비컨트롤러.삭제);

// ── 그 설비의 점검기록 (중첩 자원) ──
router.get("/:id/logs", 점검기록컨트롤러.설비별목록);
router.post("/:id/logs", 인증, 점검기록컨트롤러.등록);

// ── 그 설비의 사진 ──
router.get("/:id/photos", 사진컨트롤러.목록);
router.post("/:id/photos", 인증, 사진업로드.single("photo"), 사진컨트롤러.등록);

module.exports = router;

// ★ 이 파일만 보면 "누가 무엇을 할 수 있는가" 가 한눈에 보입니다.
//   조회는 누구나, 등록은 로그인, 설비 등록·삭제는 admin.
//   컨트롤러를 열어 볼 필요가 없습니다.
//
// ★ 업로드에서 미들웨어 순서
//   인증 → 사진업로드 순입니다.
//   반대로 두면 로그인도 안 한 사람의 파일을 먼저 받아 저장하게 됩니다.
