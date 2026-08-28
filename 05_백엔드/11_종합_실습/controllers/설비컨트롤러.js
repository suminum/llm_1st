// ============================================================
// controllers/설비컨트롤러.js — 꺼내고, 부르고, 응답한다
// ============================================================

const 설비서비스 = require("../services/설비서비스");

async function 목록(req, res) {
  const 결과 = await 설비서비스.목록(req.query);
  res.json(결과); // 서비스가 { data, meta } 를 그대로 줍니다
}

async function 하나(req, res) {
  res.json({ data: await 설비서비스.하나(req.번호) });
}

async function 등록(req, res) {
  const { name, line } = req.body || {};
  const 새설비 = await 설비서비스.등록({ name, line });

  res.status(201).location(`/api/v1/equipments/${새설비.id}`).json({ data: 새설비 });
}

async function 상태바꾸기(req, res) {
  const { status } = req.body || {};
  res.json({ data: await 설비서비스.상태바꾸기(req.번호, status) });
}

async function 삭제(req, res) {
  await 설비서비스.삭제(req.번호);
  res.sendStatus(204);
}

module.exports = { 목록, 하나, 등록, 상태바꾸기, 삭제 };

// ★ 검증도 404 도 여기 없습니다. 전부 서비스가 던집니다.
//   컨트롤러는 '잘된 경우' 만 적으면 됩니다.
