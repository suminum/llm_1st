// ============================================================
// routes/equipments.js — 설비 관련 라우트만 모아 둔 파일
// ------------------------------------------------------------
// documents.js 와 완전히 같은 모양입니다.
// 자원이 하나 늘 때마다 이런 파일이 하나씩 늘어납니다.
// ============================================================

const express = require("express");

const router = express.Router();

const 설비들 = [
  { id: 1, name: "컨베이어", line: "A" },
  { id: 2, name: "프레스", line: "B" },
];

router.get("/", (req, res) => {
  const 라인 = req.query.line;
  const 결과 = 라인 ? 설비들.filter((설비) => 설비.line === 라인) : 설비들;

  res.json(결과);
});

router.get("/:id", (req, res) => {
  const 번호 = Number(req.params.id);
  const 설비 = 설비들.find((설비) => 설비.id === 번호);

  if (!설비) {
    return res.status(404).json({ error: `${번호}번 설비가 없습니다` });
  }

  res.json(설비);
});

module.exports = router;

// ★ 두 파일에 똑같은 모양이 반복되는 게 보이나요?
//   목록 / 하나 / 만들기 / 지우기는 어느 자원이든 똑같습니다.
//   07단원(저장소로 묶기)에서 이 반복을 어떻게 다루는지 봅니다.
