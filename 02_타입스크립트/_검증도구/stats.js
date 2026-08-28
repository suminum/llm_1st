// ============================================================
// stats.js — 분량·수업 시간 산정
// ------------------------------------------------------------
// 사용법: node _검증도구/stats.js
//
// 항목을 실제로 세어서 시간을 곱한다. 손으로 세면 반드시 틀린다
// (JS자료·HTMLCSS자료에서 반복해서 겪은 것).
//
// 항목당 분은 JS자료 수업_진행_가이드와 같은 기준을 쓴다.
//   섹션 4분 / ✏️ 3분 / 기본 5분 / 응용 8분 / 도전 12분 / 에러확인 3분
//
// 단, 이 자료는 명령이 둘(node·tsc)이라 단원마다 '검사 돌려 보기' 시간이 붙는다.
// 그것을 단원당 10분으로 잡았다.
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const MIN = { 섹션: 4, 실습: 3, 기본: 5, 응용: 8, 도전: 12, 에러확인: 3, 단원검사: 10, 종합: 12 };
// 종합 실습은 여러 단원을 엮는 것이라 한 문제가 도전 난이도다. JS자료와 같은 12분을 쓴다.

const units = fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d)).sort();
const rows = [];
const total = { 파일: 0, 줄: 0, 섹션: 0, 실습: 0, 문항: 0, 분: 0, 한글: 0 };

function countHangul(s) {
  return (s.match(/[가-힣]/g) ?? []).length;
}

for (const unit of units) {
  const isReact = unit.startsWith("07_");
  const dirs = isReact
    ? [path.join(ROOT, unit, "실습프로젝트", "src", unit)]
    : [path.join(ROOT, unit)];
  // 09단원의 React 종합은 실습프로젝트 안에 있다
  if (unit.startsWith("09_")) {
    dirs.push(path.join(ROOT, "07_React와_타입스크립트", "실습프로젝트", "src", unit));
  }
  // 부속 폴더(틀린예제·옮기기_예제)도 분량에 넣는다
  if (!isReact) {
    for (const e of fs.readdirSync(path.join(ROOT, unit), { withFileTypes: true })) {
      if (e.isDirectory()) dirs.push(path.join(ROOT, unit, e.name));
    }
  }

  const row = { unit, 파일: 0, 줄: 0, 섹션: 0, 실습: 0, 기본: 0, 응용: 0, 도전: 0, 에러확인: 0, 종합: 0, 한글: 0 };

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/\.(ts|tsx|js)$/.test(f)) continue;
      const src = fs.readFileSync(path.join(dir, f), "utf8");
      row.파일 += 1;
      row.줄 += src.split(/\r?\n/).length;
      row.한글 += countHangul(src);

      if (/^개념\d\d_/.test(f)) {
        row.섹션 += (src.match(/^\/\/ ── 섹션 \d+/gm) ?? []).length;
        row.실습 += (src.match(/^\/\/ ✏️ 직접 해보기 \d+/gm) ?? []).length;
      }
      // 종합 실습 — 문제 파일의 '문제 N' 을 센다
      if (/^종합\d\d_.*\.(ts|tsx)$/.test(f) && !/_정답\./.test(f)) {
        row.종합 += (src.match(/^\s*\/\/ ───── 문제 \d+ ─────/gm) ?? []).length;
      }
      if (/^연습문제\.(ts|tsx)$/.test(f)) {
        // 문제 머리의 꼬리표로 난이도를 가른다
        for (const m of src.matchAll(/^\s*\/\/ ───── 문제 \d+ ─────(.*)$/gm)) {
          const tag = m[1];
          if (/에러 확인/.test(tag)) row.에러확인 += 1;
          else if (/도전/.test(tag)) row.도전 += 1;
          else if (/응용/.test(tag)) row.응용 += 1;
          else row.기본 += 1;
        }
      }
    }
  }

  row.분 =
    row.섹션 * MIN.섹션 +
    row.실습 * MIN.실습 +
    row.기본 * MIN.기본 +
    row.응용 * MIN.응용 +
    row.도전 * MIN.도전 +
    row.에러확인 * MIN.에러확인 +
    row.종합 * MIN.종합 +
    MIN.단원검사;

  rows.push(row);
  total.파일 += row.파일;
  total.줄 += row.줄;
  total.섹션 += row.섹션;
  total.실습 += row.실습;
  total.문항 += row.기본 + row.응용 + row.도전 + row.에러확인 + row.종합;
  total.분 += row.분;
  total.한글 += row.한글;
}

const pad = (s, n) => String(s).padEnd(n, " ");
const num = (s, n) => String(s).padStart(n, " ");

console.log("=".repeat(78));
console.log("TS자료 분량 · 수업 시간 산정");
console.log("=".repeat(78));
console.log(pad("단원", 30) + num("파일", 5) + num("줄", 7) + num("섹션", 5) + num("✏️", 5) + num("문항", 5) + num("분", 6) + num("시간", 6));
console.log("-".repeat(78));
for (const r of rows) {
  const 문항 = r.기본 + r.응용 + r.도전 + r.에러확인 + r.종합;
  console.log(
    pad(r.unit.replace(/_/g, " "), 30) +
      num(r.파일, 5) + num(r.줄, 7) + num(r.섹션, 5) + num(r.실습, 5) +
      num(문항, 5) + num(r.분, 6) + num((r.분 / 60).toFixed(1), 6),
  );
}
console.log("-".repeat(78));
console.log(
  pad("합계", 30) + num(total.파일, 5) + num(total.줄, 7) + num(total.섹션, 5) +
    num(total.실습, 5) + num(total.문항, 5) + num(total.분, 6) + num((total.분 / 60).toFixed(1), 6),
);
console.log("=".repeat(78));
console.log(`한글 설명 ${total.한글.toLocaleString("ko-KR")}자`);
console.log(`표준 ${(total.분 / 60).toFixed(1)}시간 · 하루 4시간이면 ${Math.ceil(total.분 / 240)}일`);
console.log();
console.log("자르는 순서 (시간이 모자랄 때)");
const cut1 = total.분 - rows.reduce((a, r) => a + r.도전 * MIN.도전, 0);
const cut2 = cut1 - Math.floor(total.실습 / 2) * MIN.실습;
const cut3 = cut2 - rows.reduce((a, r) => a + r.응용 * MIN.응용, 0) / 2;
console.log(`  1단계 [도전] 문제 빼기        → ${(cut1 / 60).toFixed(1)}시간`);
console.log(`  2단계 ✏️ 절반만 하기           → ${(cut2 / 60).toFixed(1)}시간`);
console.log(`  3단계 응용 문제 절반만 하기    → ${(cut3 / 60).toFixed(1)}시간`);
console.log("=".repeat(78));
