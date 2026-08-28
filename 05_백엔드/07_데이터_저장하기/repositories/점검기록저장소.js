// ============================================================
// repositories/점검기록저장소.js — 점검기록을 읽고 쓰는 곳
// ------------------------------------------------------------
// 설비저장소.js 를 복사해서 파일 이름과 변수 이름만 바꿨습니다.
// 구조를 정해 두면 두 번째 자원부터는 이렇게 빨라집니다.
// ============================================================

const fs = require("fs");
const path = require("path");

const 파일경로 = path.join(__dirname, "..", "data", "점검기록.json");
fs.mkdirSync(path.dirname(파일경로), { recursive: true });

let 대기줄 = Promise.resolve();

function 줄서서(작업) {
  const 다음 = 대기줄.then(작업, 작업);
  대기줄 = 다음.catch(() => {});
  return 다음;
}

async function 읽기() {
  try {
    return JSON.parse(await fs.promises.readFile(파일경로, "utf-8"));
  } catch (에러) {
    if (에러.code === "ENOENT") return [];
    throw 에러;
  }
}

async function 쓰기(목록) {
  const 임시경로 = `${파일경로}.tmp`;
  await fs.promises.writeFile(임시경로, JSON.stringify(목록, null, 2), "utf-8");
  await fs.promises.rename(임시경로, 파일경로);
}

async function 전부() {
  return 읽기();
}

async function 설비별(equipmentId) {
  const 목록 = await 읽기();
  return 목록.filter((기록) => 기록.equipmentId === equipmentId);
}

async function 하나(id) {
  const 목록 = await 읽기();
  return 목록.find((기록) => 기록.id === id) ?? null;
}

async function 추가(값) {
  return 줄서서(async () => {
    const 목록 = await 읽기();
    const 다음번호 = 목록.length === 0 ? 1 : Math.max(...목록.map((기록) => 기록.id)) + 1;
    const 새기록 = { id: 다음번호, ...값 };

    목록.push(새기록);
    await 쓰기(목록);

    return 새기록;
  });
}

async function 삭제(id) {
  return 줄서서(async () => {
    const 목록 = await 읽기();
    const 남길것 = 목록.filter((기록) => 기록.id !== id);

    if (남길것.length === 목록.length) return false;

    await 쓰기(남길것);
    return true;
  });
}

async function 초기화(목록) {
  return 줄서서(() => 쓰기(목록));
}

module.exports = { 전부, 설비별, 하나, 추가, 삭제, 초기화 };

// ★ 설비저장소에 없던 함수가 하나 있습니다 — 설비별(equipmentId)
//   자원마다 필요한 조회가 조금씩 다릅니다.
//   그 차이만 더하고 나머지는 그대로 두면 됩니다.
