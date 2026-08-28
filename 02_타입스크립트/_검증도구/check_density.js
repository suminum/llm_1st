// ============================================================
// check_density.js — 설명 밀도와 난이도 배열을 잰다
// ------------------------------------------------------------
// 사용법: node _검증도구/check_density.js
//
// 기계가 '내용이 맞는가' 는 못 본다. 하지만 '어디를 봐야 하는가' 는 짚어 줄 수 있다.
//
//   ① 설명:코드 비율 — JS자료 실측 2.12:1 이 기준선이다. 크게 낮으면 설명이 얇은 곳
//   ② 연속 코드 덩어리 — 설명 없이 코드만 N줄 이어지는 자리
//   ③ 난이도 배열 — 기본/응용/도전 문제의 '무게' 를 재서 역전이 있는지
//
// ★ 여기 나온 숫자를 그대로 믿지 말 것.
//   JS자료·HTMLCSS자료에서 리뷰어 지적의 절반 이상이 실제로는 아니었다.
//   '여기를 열어 보라' 는 목록으로만 쓰고, 판정은 사람이 한다.
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const units = fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d)).sort();

const conceptDir = (u) => u.startsWith("07_")
  ? path.join(ROOT, u, "실습프로젝트", "src", u)
  : path.join(ROOT, u);

// ── ① 설명:코드 비율 · ② 연속 코드 덩어리 ──
console.log("=".repeat(76));
console.log("① 설명 밀도 (설명 글자 : 코드 글자) — JS자료 기준선 2.12:1");
console.log("=".repeat(76));

const thin = [], runs = [];
for (const u of units) {
  const dir = conceptDir(u);
  if (!fs.existsSync(dir)) continue;
  let prose = 0, code = 0;
  for (const f of fs.readdirSync(dir).filter((f) => /^개념\d\d_.*\.tsx?$/.test(f))) {
    const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
    let fp = 0, fc = 0, run = 0, runStart = 0;
    lines.forEach((l, i) => {
      const t = l.trim();
      if (t === "") return;
      if (t.startsWith("//")) {
        fp += t.replace(/^\/+\s*/, "").length;
        if (run >= 12) runs.push({ u, f, from: runStart + 1, to: i, n: run });
        run = 0;
      } else {
        fc += t.length;
        if (run === 0) runStart = i;
        run++;
      }
    });
    if (run >= 12) runs.push({ u, f, from: runStart + 1, to: lines.length, n: run });
    prose += fp; code += fc;
    const r = fc === 0 ? 99 : fp / fc;
    if (r < 1.2) thin.push({ u, f, r });
  }
  const ratio = (prose / code).toFixed(2);
  const bar = "█".repeat(Math.round(prose / code * 4));
  console.log(`  ${u.replace(/_/g, " ").padEnd(30)} ${ratio.padStart(5)} : 1  ${bar}`);
}

if (thin.length) {
  console.log("\n  설명이 얇은 파일 (1.2:1 미만) — 열어서 확인:");
  for (const t of thin) console.log(`    ${t.u}/${t.f}  ${t.r.toFixed(2)}:1`);
} else {
  console.log("\n  설명이 얇은 파일 없음 (전부 1.2:1 이상)");
}

console.log("\n" + "=".repeat(76));
console.log("② 설명 없이 코드만 12줄 이상 이어지는 자리 — 중간에 한 줄 넣을 곳");
console.log("=".repeat(76));
if (runs.length === 0) console.log("  없음");
for (const r of runs) console.log(`  ${r.u}/${r.f}  ${r.from}~${r.to}줄 (${r.n}줄 연속)`);

// ── ③ 난이도 배열 ──
console.log("\n" + "=".repeat(76));
console.log("③ 난이도 배열 — 문제의 '무게' 가 기본 < 응용 < 도전 순인가");
console.log("=".repeat(76));
console.log("  무게 = 지문 줄수 + 주어진 코드 줄수×2 + 기대출력 줄수×2 (거친 어림)");

for (const u of units) {
  const p = u.startsWith("07_")
    ? path.join(conceptDir(u), "연습문제.tsx")
    : path.join(ROOT, u, "연습문제.ts");
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
  const marks = [];
  lines.forEach((l, i) => {
    const m = l.match(/^\/\/ ───── 문제 (\d+) ─────(.*)$/);
    if (m) marks.push({ no: +m[1], tag: m[2], line: i });
  });

  const items = marks.map((m, i) => {
    const to = i + 1 < marks.length ? marks[i + 1].line : lines.length;
    const body = lines.slice(m.line, to);
    const prose = body.filter((l) => l.trim().startsWith("//")).length;
    const code = body.filter((l) => l.trim() !== "" && !l.trim().startsWith("//")).length;
    const out = body.filter((l) => /^\/\/ 기대 (출력|화면):/.test(l.trim())).length;
    const kind = /에러 확인/.test(m.tag) ? "에러" : /도전/.test(m.tag) ? "도전" : /응용/.test(m.tag) ? "응용" : "기본";
    return { no: m.no, kind, w: prose + code * 2 + out * 2 };
  });

  const avg = (k) => {
    const xs = items.filter((x) => x.kind === k);
    return xs.length ? Math.round(xs.reduce((a, b) => a + b.w, 0) / xs.length) : null;
  };
  const b = avg("기본"), a = avg("응용"), c = avg("도전");
  const flag = (b !== null && a !== null && a < b) || (a !== null && c !== null && c < a) ? "  ← 역전 의심" : "";
  console.log(`\n  ${u.replace(/_/g, " ")}`);
  console.log(`    기본 ${String(b ?? "-").padStart(3)} · 응용 ${String(a ?? "-").padStart(3)} · 도전 ${String(c ?? "-").padStart(3)}${flag}`);
  // 기본인데 응용 평균보다 무거운 것, 응용인데 기본 평균보다 가벼운 것
  const odd = items.filter((x) =>
    (x.kind === "기본" && a !== null && x.w > a) || (x.kind === "응용" && b !== null && x.w < b));
  if (odd.length) console.log(`    눈에 띄는 것: ${odd.map((x) => `문제${x.no}(${x.kind} ${x.w})`).join(", ")}`);
}
console.log("\n" + "=".repeat(76));
console.log("이 숫자는 '열어 볼 곳' 목록일 뿐입니다. 판정은 직접 하세요.");
console.log("=".repeat(76));
