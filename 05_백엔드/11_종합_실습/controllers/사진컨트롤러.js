// ============================================================
// controllers/사진컨트롤러.js
// ============================================================

const path = require("path");
const 사진서비스 = require("../services/사진서비스");
const { 에러 } = require("../utils/AppError");

async function 목록(req, res) {
  const 사진들 = await 사진서비스.목록(req.번호);

  res.json({
    data: 사진들.map((사진) => ({
      id: 사진.id,
      원래이름: 사진.원래이름,
      크기: 사진.크기,
      보기: `/api/v1/photos/${사진.id}/view`,
      내려받기: `/api/v1/photos/${사진.id}/download`,
    })),
  });
}

async function 등록(req, res) {
  if (!req.file) throw 에러.검증실패([{ 키: "photo", 이유: "사진이 없습니다" }]);

  const 사진 = await 사진서비스.등록(req.번호, req.file);

  res.status(201).json({ data: { id: 사진.id, 원래이름: 사진.원래이름, 크기: 사진.크기 } });
}

async function 보기(req, res) {
  const 사진 = await 사진서비스.하나(req.번호);
  res.sendFile(path.join(사진서비스.사진폴더, 사진.저장이름));
}

async function 내려받기(req, res) {
  const 사진 = await 사진서비스.하나(req.번호);

  // ★ res.download 가 한글 이름을 알아서 인코딩해 줍니다.
  //   Content-Disposition 을 직접 쓰면 한글에서 500 이 납니다. (09단원)
  res.download(path.join(사진서비스.사진폴더, 사진.저장이름), 사진.원래이름);
}

async function 삭제(req, res) {
  await 사진서비스.삭제(req.번호);
  res.sendStatus(204);
}

async function 고아확인(req, res) {
  res.json({ data: await 사진서비스.고아세기() });
}

module.exports = { 목록, 등록, 보기, 내려받기, 삭제, 고아확인 };
