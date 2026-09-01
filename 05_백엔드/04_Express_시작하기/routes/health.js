const express = require("express");
const router = express.Router();
let 문서 = [{ id: 1, title: "이것은 헬스파일" }];

router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// ★ 만든 라우터를 내보냅니다. 01단원에서 배운 module.exports 그대로입니다.
module.exports = router;
