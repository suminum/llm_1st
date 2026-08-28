// ============================================================
// check_xref.js — 자료 안의 상호 참조가 실제로 있는지 본다
// ------------------------------------------------------------
// 사용법: node _검증도구/check_xref.js
//
// "04단원 개념02 섹션5 를 보세요" 같은 안내가 자료에 300개 넘게 있다.
// 손으로 쓴 것이라 단원 구성이 바뀌면 조용히 어긋난다.
// HTMLCSS자료에서 반복해서 나온 오류 유형이 바로 이것이다
// ('다른 단원을 가리키는 예고·회고가 실제와 다름').
//
// 여기서는 TS자료 안을 가리키는 참조만 본다.
// JS자료·React자료를 가리키는 것은 이 폴더 밖이라 확인할 수 없으므로 세기만 한다.
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 실제로 있는 것을 먼저 모은다
const units = fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d)).sort();
const real = new Map();   // "04" -> Map("02" -> 섹션 개수)

function conceptDir(unit) {
  return unit.startsWith("07_")
    ? path.join(ROOT, unit, "실습프로젝트", "src", unit)
    : path.join(ROOT, unit);
}

for (const unit of units) {
  const no = unit.slice(0, 2);
  const dir = conceptDir(unit);
  const m = new Map();
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      const g = f.match(/^개념(\d\d)_.*\.tsx?$/);
      if (!g) continue;
      const src = fs.readFileSync(path.join(dir, f), "utf8");
      const secs = [...src.matchAll(/^\/\/ ── 섹션 (\d+)/gm)].map((x) => +x[1]);
      m.set(g[1], secs.length ? Math.max(...secs) : 0);
    }
  }
  real.set(no, m);
}

function allFiles() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (!["node_modules", "dist"].includes(e.name)) walk(full); continue; }
      if (/\.(tsx?|md)$/.test(e.name) && !e.name.endsWith(".d.ts")) out.push(full);
    }
  };
  for (const u of units) walk(path.join(ROOT, u));
  for (const f of ["README.md", "수업_진행_가이드.md"]) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) out.push(p);
  }
  return out;
}

let FAIL = 0, checked = 0, external = 0;
const problems = [];

for (const abs of allFiles()) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  const lines = fs.readFileSync(abs, "utf8").split(/\r?\n/);

  lines.forEach((line, i) => {
    // 'JS자료 08단원' · 'React자료 03단원' 은 밖이라 세기만 한다
    // 'JS자료 08단원' 뿐 아니라 'JS자료(01~13단원)' 처럼 괄호가 낀 표기도 밖으로 본다.
    const re = /(JS자료|React자료|HTMLCSS자료)?[\s(~\d]*?(\d\d)단원(?:\s*개념(\d\d))?(?:\s*섹션\s*(\d+))?/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      const [,외부, u, c, s] = m;
      if (외부) { external++; continue; }
      checked++;

      const unit = real.get(u);
      if (!unit) {
        FAIL++;
        problems.push({ rel, line: i + 1, msg: `${u}단원 이 없습니다`, text: line.trim().slice(0, 80) });
        continue;
      }
      if (c === undefined) continue;
      if (!unit.has(c)) {
        FAIL++;
        problems.push({ rel, line: i + 1, msg: `${u}단원에 개념${c} 이 없습니다 (있는 것: ${[...unit.keys()].join(", ")})`, text: line.trim().slice(0, 80) });
        continue;
      }
      if (s === undefined) continue;
      const max = unit.get(c);
      if (+s > max) {
        FAIL++;
        problems.push({ rel, line: i + 1, msg: `${u}단원 개념${c} 에는 섹션이 ${max}개뿐인데 섹션 ${s} 를 가리킵니다`, text: line.trim().slice(0, 80) });
      }
    }
  });
}

console.log("=".repeat(72));
console.log("상호 참조 검사 — 가리키는 단원·개념·섹션이 실제로 있는가");
console.log("=".repeat(72));
console.log("있는 것:");
for (const [u, m] of real) {
  console.log(`  ${u}단원  개념 ${[...m.entries()].map(([c, s]) => `${c}(섹션${s})`).join(" ")}`);
}
console.log(`\nTS자료 안을 가리키는 참조 ${checked}건 · 다른 자료를 가리키는 것 ${external}건(확인 안 함)`);
if (problems.length) {
  for (const p of problems) console.log(`\n[확인] ${p.rel}:${p.line}\n      ${p.msg}\n      ${p.text}`);
  console.log();
}
console.log("=".repeat(72));
console.log(`어긋난 참조 ${FAIL}건`);
console.log("=".repeat(72));
process.exit(FAIL ? 1 : 0);
