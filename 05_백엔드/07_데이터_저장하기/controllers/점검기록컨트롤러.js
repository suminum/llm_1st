// ============================================================
// controllers/점검기록컨트롤러.js
// ------------------------------------------------------------
// 설비컨트롤러.js 를 복사해서 서비스 이름만 바꿨습니다.
// ============================================================

const 점검기록서비스 = require("../services/점검기록서비스");

async function 목록(req, res) {
  // ?equipmentId=1 이 오면 숫자로 바꿔서 넘깁니다.
  // 없으면 undefined 를 그대로 넘깁니다. "전부 달라" 는 뜻입니다.
  const { equipmentId } = req.query;

  const 기록들 = await 점검기록서비스.목록(
    equipmentId === undefined ? undefined : Number(equipmentId)
  );

  res.json({ data: 기록들 });
}

async function 하나(req, res) {
  const 기록 = await 점검기록서비스.하나(Number(req.params.id));
  res.json({ data: 기록 });
}

async function 등록(req, res) {
  const { equipmentId, result, 담당자 } = req.body || {};

  const 새기록 = await 점검기록서비스.등록({
    equipmentId: Number(equipmentId),
    result,
    담당자,
  });

  res.status(201).location(`/api/v1/logs/${새기록.id}`).json({ data: 새기록 });
}

async function 삭제(req, res) {
  await 점검기록서비스.삭제(Number(req.params.id));
  res.sendStatus(204);
}

module.exports = { 목록, 하나, 등록, 삭제 };

// ★ 여기서도 규칙은 하나도 없습니다.
//   "없는 설비면 404" 도, "이상이면 점검중" 도 여기 없습니다.
//   꺼내고, 서비스를 부르고, 응답을 만드는 것뿐입니다.
//
// ★ Number(equipmentId) 가 여기 있는 이유
//   쿼리에서 온 값은 글자입니다. 그건 HTTP 사정입니다.
//   서비스는 숫자를 받는 게 당연하다고 생각합니다.
//   경계에서 타입을 맞춰 주는 것이 컨트롤러의 일입니다.
