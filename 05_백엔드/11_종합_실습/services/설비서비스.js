// ============================================================
// services/설비서비스.js — 설비의 업무 규칙
// ============================================================

const 설비저장소 = require("../repositories/설비저장소");
const { 에러 } = require("../utils/AppError");

const 라인값들 = ["A", "B", "C"];
const 상태값들 = ["가동", "정지", "점검중"];

// ── 목록 (검색·필터·정렬·페이징) ──
async function 목록(조건) {
  const q = (조건.q ?? "").trim().toLowerCase();
  let 결과 = await 설비저장소.전부();

  if (q) {
    결과 = 결과.filter((설비) =>
      ["name", "line", "status"].some((키) => String(설비[키]).toLowerCase().includes(q))
    );
  }

  if (조건.line) {
    const 라인들 = 조건.line.split(",").map((조각) => 조각.trim());
    결과 = 결과.filter((설비) => 라인들.includes(설비.line));
  }

  if (조건.status) 결과 = 결과.filter((설비) => 설비.status === 조건.status);

  if (조건.sort) {
    const 조건들 = 조건.sort
      .split(",")
      .map((조각) => 조각.trim())
      .filter(Boolean)
      .map((조각) =>
        조각.startsWith("-") ? { 키: 조각.slice(1), 방향: -1 } : { 키: 조각, 방향: 1 }
      );

    결과 = [...결과].sort((a, b) => {
      for (const { 키, 방향 } of 조건들) {
        const 왼쪽 = a[키];
        const 오른쪽 = b[키];

        if (typeof 왼쪽 === "string" && typeof 오른쪽 === "string") {
          const 결 = 왼쪽.localeCompare(오른쪽, "ko", { numeric: true });
          if (결 !== 0) return 결 * 방향;
          continue;
        }

        if (왼쪽 < 오른쪽) return -1 * 방향;
        if (왼쪽 > 오른쪽) return 1 * 방향;
      }
      return 0;
    });
  }

  // ★ total 은 자르기 전에 셉니다. (06단원)
  const total = 결과.length;

  let page = Number(조건.page);
  let limit = Number(조건.limit);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const 시작 = (page - 1) * limit;

  return {
    data: 결과.slice(시작, 시작 + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function 하나(id) {
  const 설비 = await 설비저장소.하나(id);
  if (설비 === null) throw 에러.없음("설비");
  return 설비;
}

// ── 규칙 ① 모양이 맞아야 한다 ──
function 검증(값) {
  const 항목 = [];

  if (!값.name) 항목.push({ 키: "name", 이유: "필수입니다" });
  else if (값.name.length < 2) 항목.push({ 키: "name", 이유: "2글자 이상이어야 합니다" });
  else if (값.name.length > 20) 항목.push({ 키: "name", 이유: "20글자 이하여야 합니다" });

  if (!값.line) 항목.push({ 키: "line", 이유: "필수입니다" });
  else if (!라인값들.includes(값.line))
    항목.push({ 키: "line", 이유: `${라인값들.join(", ")} 중 하나여야 합니다` });

  return 항목;
}

async function 등록(값) {
  const 항목 = 검증(값);
  if (항목.length > 0) throw 에러.검증실패(항목);

  // ── 규칙 ② 이름이 겹치면 안 된다 ──
  const 전부 = await 설비저장소.전부();
  if (전부.some((설비) => 설비.name === 값.name)) throw 에러.중복("설비 이름");

  // ── 규칙 ③ 새 설비는 언제나 '정지' 로 시작한다 ──
  return 설비저장소.추가({ name: 값.name, line: 값.line, status: "정지" });
}

async function 상태바꾸기(id, 새상태) {
  if (!상태값들.includes(새상태)) {
    throw 에러.검증실패([{ 키: "status", 이유: `${상태값들.join(", ")} 중 하나여야 합니다` }]);
  }

  const 설비 = await 하나(id);

  // ── 규칙 ④ 점검중 → 가동 으로 바로 못 간다 ──
  if (설비.status === "점검중" && 새상태 === "가동") {
    throw 에러.상태충돌("점검중인 설비는 정지를 거쳐야 가동할 수 있습니다");
  }

  return 설비저장소.수정(id, { status: 새상태 });
}

async function 삭제(id) {
  const 설비 = await 하나(id);

  // ── 규칙 ⑤ 가동 중인 설비는 못 지운다 ──
  if (설비.status === "가동") {
    throw 에러.상태충돌("가동 중인 설비는 삭제할 수 없습니다. 먼저 정지시키세요");
  }

  await 설비저장소.삭제(id);
}

module.exports = { 목록, 하나, 등록, 상태바꾸기, 삭제, 라인값들, 상태값들 };

// ============================================================
// 설비의 업무 규칙 다섯 가지
// ============================================================
//   ① 이름은 2~20글자, 라인은 A/B/C
//   ② 같은 이름의 설비는 못 만든다
//   ③ 새 설비는 언제나 '정지' 로 시작한다
//   ④ 점검중 → 가동 으로 바로 못 간다
//   ⑤ 가동 중인 설비는 못 지운다
//
// 이 파일에 res 도 req 도 없습니다. 그래서 서버를 안 켜고 시험할 수 있습니다.
