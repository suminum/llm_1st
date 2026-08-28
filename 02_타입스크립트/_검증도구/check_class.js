// ============================================================
// check_class.js — 수업으로 굴러가는가 (강사 관점)
// ------------------------------------------------------------
// 사용법: node _검증도구/check_class.js
//
// stats.js 는 단원 합계를 낸다. 그런데 수업은 단원이 아니라
// '한 자리에 앉아서 하는 덩어리' 로 굴러간다. 그래서 파일 단위로 본다.
//
//   ① 파일 하나가 몇 분짜리인가 — 40분 넘으면 중간에 끊어야 한다
//   ② 하루 4시간(240분) 경계가 파일 중간에 떨어지는가
//   ③ 학생이 쳐야 하는 명령이 파일마다 일관된가
//   ④ 파일을 열기 전에 준비가 필요한데 안 적힌 곳이 있는가
//
// ★ ①②는 어림이다. 실제 수업 속도는 반마다 다르다.
//   '여기서 끊으면 되겠다' 를 미리 정해 두는 용도로 쓴다.
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIN = { 섹션: 4, 실습: 3, 기본: 5, 응용: 8, 도전: 12, 에러확인: 3, 종합: 12 };
const units = fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d)).sort();

const conceptDir = (u) => u.startsWith("07_")
  ? path.join(ROOT, u, "실습프로젝트", "src", u)
  : path.join(ROOT, u);
// 09단원의 React 종합은 실습프로젝트 안에 있다
const extraDir = (u) => u.startsWith("09_")
  ? path.join(ROOT, "07_React와_타입스크립트", "실습프로젝트", "src", u)
  : null;

function fileMinutes(abs) {
  const src = fs.readFileSync(abs, "utf8");
  const base = path.basename(abs);
  if (/^개념\d\d_/.test(base)) {
    const sec = (src.match(/^\/\/ ── 섹션 \d+/gm) ?? []).length;
    const ex = (src.match(/^\/\/ ✏️ 직접 해보기 \d+/gm) ?? []).length;
    return sec * MIN.섹션 + ex * MIN.실습;
  }
  if (/^종합\d\d_.*\.tsx?$/.test(base) && !/_정답\./.test(base)) {
    return (src.match(/^\s*\/\/ ───── 문제 \d+ ─────/gm) ?? []).length * MIN.종합;
  }
  if (/^연습문제\.tsx?$/.test(base)) {
    let m = 0;
    for (const g of src.matchAll(/^\s*\/\/ ───── 문제 \d+ ─────(.*)$/gm)) {
      const t = g[1];
      m += /에러 확인/.test(t) ? MIN.에러확인 : /도전/.test(t) ? MIN.도전 : /응용/.test(t) ? MIN.응용 : MIN.기본;
    }
    return m;
  }
  return 0;
}

// ── ① 파일별 시간 ──
console.log("=".repeat(74));
console.log("① 파일 하나가 몇 분짜리인가 (40분 넘으면 중간에 끊을 자리를 정해 둘 것)");
console.log("=".repeat(74));

const all = [];
const pick = (d) => (fs.existsSync(d)
  ? fs.readdirSync(d)
      .filter((f) => /^(개념\d\d_|연습문제\.|종합\d\d_)/.test(f) && /\.tsx?$/.test(f) && !/_정답\./.test(f))
      .map((f) => [d, f])
  : []);

for (const u of units) {
  const files = [...pick(conceptDir(u)), ...(extraDir(u) ? pick(extraDir(u)) : [])]
    .sort((a, b) => a[1].localeCompare(b[1]));
  if (files.length === 0) continue;
  console.log(`\n  ${u.replace(/_/g, " ")}`);
  for (const [d, f] of files) {
    const m = fileMinutes(path.join(d, f));
    if (m === 0) continue;
    all.push({ u, f, m });
    const flag = m > 40 ? "  ← 김" : "";
    console.log(`    ${String(m).padStart(3)}분  ${f}${flag}`);
  }
}

// ── ② 4시간 경계 ──
console.log("\n" + "=".repeat(74));
console.log("② 하루 4시간(240분) 경계가 어디에 떨어지는가");
console.log("=".repeat(74));
let acc = 0, day = 1;
const breaks = [];
for (const x of all) {
  if (acc + x.m > 240) { breaks.push({ day, at: `${x.u} / ${x.f} 앞`, used: acc }); day++; acc = 0; }
  acc += x.m;
}
breaks.push({ day, at: "(끝)", used: acc });
for (const b of breaks) {
  console.log(`  ${b.day}일차  ${String(b.used).padStart(3)}분 (${(b.used / 60).toFixed(1)}h)  → 다음은 ${b.at}`);
}
console.log(`\n  총 ${breaks.length}일. 파일 중간에서 끊기는 일은 없습니다(파일 단위로 나눔).`);

// ── ③ 명령 일관성 ──
console.log("\n" + "=".repeat(74));
console.log("③ 학생이 쳐야 하는 명령 — 파일마다 다르게 적혀 있지 않은가");
console.log("=".repeat(74));
const cmds = new Map();
for (const u of units) {
  const dir = conceptDir(u);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((f) => /\.tsx?$/.test(f))) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    for (const g of src.matchAll(/^\/\/ (실행|보기|검사|채점): (.+)$/gm)) {
      const key = `${g[1]}: ${g[2].split("←")[0].trim()}`;
      if (!cmds.has(key)) cmds.set(key, []);
      cmds.get(key).push(`${u.slice(0, 2)}/${f}`);
    }
  }
}
for (const [k, v] of [...cmds.entries()].sort()) {
  console.log(`  ${String(v.length).padStart(2)}개  ${k}`);
}

// ── ④ 준비가 필요한데 안 적힌 곳 ──
console.log("\n" + "=".repeat(74));
console.log("④ 열기 전에 준비가 필요한 자리에 안내가 있는가");
console.log("=".repeat(74));
const needs = [
  { what: "07단원 실습프로젝트 npm install", where: "07_React와_타입스크립트/README.md", must: /npm install/ },
  { what: "루트 npm install", where: "README.md", must: /npm install/ },
  { what: "01단원 틀린예제 실행법", where: "01_타입스크립트_시작하기/개념02_실행과_검사는_따로다.ts", must: /틀린예제/ },
  { what: "08단원 옮기기예제 실행법", where: "08_기존_프로젝트에_타입_입히기/개념02_기존_JS_옮기기.ts", must: /옮기기_예제/ },
];
for (const n of needs) {
  const p = path.join(ROOT, n.where);
  const ok = fs.existsSync(p) && n.must.test(fs.readFileSync(p, "utf8"));
  console.log(`  ${ok ? "OK  " : "없음"} ${n.what.padEnd(34)} (${n.where})`);
}
console.log("\n" + "=".repeat(74));
