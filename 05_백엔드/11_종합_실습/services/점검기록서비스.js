// ============================================================
// services/점검기록서비스.js — 점검기록의 업무 규칙
// ============================================================

const 점검기록저장소 = require("../repositories/점검기록저장소");
const 설비저장소 = require("../repositories/설비저장소");
const { 에러 } = require("../utils/AppError");

const 결과값들 = ["정상", "이상"];

// 설비가 실제로 있는지 확인합니다. 없으면 404.
// ★ 이게 없으면 "없는 설비의 기록은 0건입니다" 라는 엉뚱한 답이 나갑니다.
async function 설비확인(equipmentId) {
  const 설비 = await 설비저장소.하나(equipmentId);
  if (설비 === null) throw 에러.없음("설비");
  return 설비;
}

async function 목록(equipmentId) {
  if (equipmentId === undefined) return 점검기록저장소.전부();

  await 설비확인(equipmentId);
  return 점검기록저장소.찾기((기록) => 기록.equipmentId === equipmentId);
}

async function 하나(id) {
  const 기록 = await 점검기록저장소.하나(id);
  if (기록 === null) throw 에러.없음("점검기록");
  return 기록;
}

async function 등록(값, 남긴사람) {
  const 설비 = await 설비확인(값.equipmentId);

  const 항목 = [];
  if (!결과값들.includes(값.result))
    항목.push({ 키: "result", 이유: `${결과값들.join(", ")} 중 하나여야 합니다` });
  if (!값.내용) 항목.push({ 키: "내용", 이유: "필수입니다" });
  else if (값.내용.length > 200) 항목.push({ 키: "내용", 이유: "200글자 이하여야 합니다" });

  if (항목.length > 0) throw 에러.검증실패(항목);

  const 새기록 = await 점검기록저장소.추가({
    equipmentId: 값.equipmentId,
    result: 값.result,
    내용: 값.내용,
    담당자: 남긴사람, // ★ 보낸 쪽이 정하게 두지 않습니다
  });

  // ── 규칙: 결과가 '이상' 이면 그 설비를 점검중으로 ──
  // ★ 서비스 층이 있는 이유를 가장 잘 보여 주는 규칙입니다.
  //   기록 하나를 남겼는데 다른 자원의 상태가 바뀝니다.
  //   저장소는 자기 파일만 알아서 못 하고,
  //   컨트롤러에 두면 다른 입구(배치·관리자도구)에서 안 지켜집니다.
  if (값.result === "이상" && 설비.status !== "점검중") {
    await 설비저장소.수정(값.equipmentId, { status: "점검중" });
  }

  return 새기록;
}

async function 삭제(id) {
  await 하나(id);
  // ★ 기록을 지워도 설비 상태는 안 되돌립니다.
  //   "잘못 적어서 지웠다" 와 "설비가 정상으로 돌아왔다" 는 다른 일입니다.
  await 점검기록저장소.삭제(id);
}

module.exports = { 목록, 하나, 등록, 삭제, 결과값들 };
