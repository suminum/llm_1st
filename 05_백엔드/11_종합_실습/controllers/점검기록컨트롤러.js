// ============================================================
// controllers/점검기록컨트롤러.js
// ============================================================

const 점검기록서비스 = require("../services/점검기록서비스");

async function 목록(req, res) {
  const { equipmentId } = req.query;

  // ★ Number(undefined) 는 NaN 입니다.
  //   "전부 달라" 가 "NaN번 설비 달라" 가 되면 안 됩니다.
  const 기록들 = await 점검기록서비스.목록(
    equipmentId === undefined ? undefined : Number(equipmentId)
  );

  res.json({ data: 기록들 });
}

async function 설비별목록(req, res) {
  res.json({ data: await 점검기록서비스.목록(req.번호) });
}

async function 하나(req, res) {
  res.json({ data: await 점검기록서비스.하나(req.번호) });
}

async function 등록(req, res) {
  const { result, 내용 } = req.body || {};

  // ★ 담당자는 본문에서 안 받습니다. 로그인한 사람으로 정합니다.
  const 새기록 = await 점검기록서비스.등록(
    { equipmentId: req.번호, result, 내용 },
    req.user.name
  );

  res.status(201).json({ data: 새기록 });
}

async function 삭제(req, res) {
  await 점검기록서비스.삭제(req.번호);
  res.sendStatus(204);
}

module.exports = { 목록, 설비별목록, 하나, 등록, 삭제 };
