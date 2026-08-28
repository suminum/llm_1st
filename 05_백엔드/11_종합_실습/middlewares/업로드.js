// ============================================================
// middlewares/업로드.js — multer 설정 (09단원)
// ============================================================

const multer = require("multer");
const path = require("path");

const { 저장이름, 되돌리기 } = require("../utils/파일이름");
const { 사진폴더 } = require("../services/사진서비스");

const 허용확장자 = [".jpg", ".jpeg", ".png", ".gif"];

const 사진업로드 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 사진폴더),
    // ★ 원래 이름을 그대로 쓰지 않습니다. ../ 같은 것이 들어올 수 있습니다.
    filename: (req, file, cb) => cb(null, 저장이름(file.originalname)),
  }),

  limits: { fileSize: 2000, files: 1 }, // 시험용. 실제로는 5 * 1024 * 1024

  fileFilter: (req, file, cb) => {
    // ★ 여기서도 이름을 되돌려야 합니다. 안 하면 한글 이름이 전부 거절됩니다.
    const 확장자 = path.extname(되돌리기(file.originalname)).toLowerCase();

    if (!허용확장자.includes(확장자)) {
      const 에러 = new Error(`${확장자 || "확장자 없는 파일"} 은(는) 올릴 수 없습니다`);
      에러.status = 400;
      에러.code = "BAD_EXTENSION";
      return cb(에러);
    }

    cb(null, true);
  },
});

module.exports = { 사진업로드, 허용확장자 };

// ★ 필드 이름은 "photo" 입니다. 한글로 쓰면 Unexpected field 가 납니다. (09단원)
