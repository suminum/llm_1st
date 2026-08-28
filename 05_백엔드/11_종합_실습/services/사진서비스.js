// ============================================================
// services/사진서비스.js — 설비 사진의 업무 규칙
// ============================================================

const path = require("path");
const fs = require("fs");

const 사진저장소 = require("../repositories/사진저장소");
const 설비저장소 = require("../repositories/설비저장소");
const { 에러 } = require("../utils/AppError");
const { 되돌리기 } = require("../utils/파일이름");

const 사진폴더 = path.join(__dirname, "..", "uploads");
fs.mkdirSync(사진폴더, { recursive: true });

const 설비당최대 = 3;

// 이미 없는 파일을 지우려 한 것은 실패가 아닙니다.
async function 파일지우기(저장이름) {
  try {
    await fs.promises.unlink(path.join(사진폴더, 저장이름));
  } catch (에러) {
    if (에러.code !== "ENOENT") throw 에러;
  }
}

async function 설비확인(equipmentId) {
  const 설비 = await 설비저장소.하나(equipmentId);
  if (설비 === null) throw 에러.없음("설비");
  return 설비;
}

async function 목록(equipmentId) {
  await 설비확인(equipmentId);
  return 사진저장소.찾기((사진) => 사진.equipmentId === equipmentId);
}

async function 하나(id) {
  const 사진 = await 사진저장소.하나(id);
  if (사진 === null) throw 에러.없음("사진");
  return 사진;
}

// ★★ 이 함수는 '이미 저장된 파일' 을 받습니다.
//   multer 가 라우트보다 먼저 돌기 때문입니다.
//   그래서 규칙에 걸리면 그 파일을 우리가 지워야 합니다. (09단원 개념05)
async function 등록(equipmentId, 파일) {
  const 지우고던지기 = async (던질에러) => {
    await 파일지우기(파일.filename);
    throw 던질에러;
  };

  const 설비 = await 설비저장소.하나(equipmentId);
  if (설비 === null) await 지우고던지기(에러.없음("설비"));

  const 지금 = await 사진저장소.찾기((사진) => 사진.equipmentId === equipmentId);
  if (지금.length >= 설비당최대) {
    await 지우고던지기(에러.상태충돌(`설비당 사진은 ${설비당최대}장까지입니다`));
  }

  return 사진저장소.추가({
    equipmentId,
    저장이름: 파일.filename,
    원래이름: 되돌리기(파일.originalname),
    크기: 파일.size,
  });
}

async function 삭제(id) {
  const 사진 = await 하나(id);

  // ★ 기록을 먼저, 파일을 나중에. (09단원 개념05)
  //   보이지 않는 쓰레기가, 보이는 고장보다 낫습니다.
  await 사진저장소.삭제(id);
  await 파일지우기(사진.저장이름);
}

// 청소용. 기록 없는 파일을 셉니다.
async function 고아세기() {
  const 기록이름 = new Set((await 사진저장소.전부()).map((사진) => 사진.저장이름));
  const 디스크 = fs.readdirSync(사진폴더).filter((이름) => !이름.endsWith(".tmp"));

  return {
    디스크파일수: 디스크.length,
    기록수: 기록이름.size,
    고아파일수: 디스크.filter((이름) => !기록이름.has(이름)).length,
  };
}

module.exports = { 목록, 하나, 등록, 삭제, 고아세기, 사진폴더, 설비당최대 };
