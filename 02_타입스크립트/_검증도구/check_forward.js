// ============================================================
// check_forward.js — 안 배운 문법이 앞 단원에 새는지 본다
// ------------------------------------------------------------
// 사용법: node _검증도구/check_forward.js
//
// 자료 규칙: 그 시점까지 안 나온 것을 설명 없이 쓰지 않는다.
// 써야 한다면 "05단원에서 배웁니다" 처럼 언제 배우는지 표시한다.
//
// 이 도구는 문법 요소가 '처음 나오는 자리' 를 찾아서,
// 배우기로 한 단원보다 앞이면 알려 준다.
// 표시(N단원에서 / N단원의 / N단원 개념)가 그 파일에 있으면 통과로 본다.
//
// ★ 이 도구의 지적을 그대로 믿지 말 것.
//   JS자료·HTMLCSS자료에서 리뷰어 지적의 상당수가 실제로는 아니었다.
//   반드시 해당 파일을 열어 직접 판정할 것.
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 문법 요소 → 배우는 단원
const FEATURES = [
  { name: "기본 타입 표기 (: string 등)", unit: 1, re: /:\s*(string|number|boolean)\b/ },
  { name: "배열 타입 ([])", unit: 2, re: /:\s*\w+\[\]/ },
  { name: "any", unit: 2, re: /\bany\b/ },
  { name: "unknown", unit: 2, re: /:\s*unknown\b/ },
  { name: "함수 매개변수 타입", unit: 3, re: /function\s+\w+\s*\([^)]*:\s*\w/ },
  { name: "선택 매개변수·속성 (?)", unit: 3, re: /\w\?\s*:/ },
  { name: "함수 타입 (=>)", unit: 3, re: /:\s*\([^)]*\)\s*=>/ },
  { name: "객체 타입 ({ a: string })", unit: 4, re: /:\s*\{\s*\w+\s*:/ },
  { name: "type 별칭", unit: 4, re: /^\s*type\s+[A-Z]\w*\s*=/m },
  { name: "interface", unit: 4, re: /^\s*interface\s+[A-Z]/m },
  { name: "readonly", unit: 4, re: /\breadonly\b/ },
  { name: "유니온 (|)", unit: 5, re: /:\s*[\w"'\][]+\s*\|\s*[\w"'\[]/ },
  { name: "옵셔널 체이닝 (?.)", unit: 5, re: /\w\?\./ },
  { name: "널 병합 (??)", unit: 5, re: /\?\?/ },
  { name: "never", unit: 5, re: /:\s*never\b/ },
  { name: "제네릭 (<T>)", unit: 6, re: /function\s+\w+<[A-Z]\w*(,\s*[A-Z]\w*)*>/ },
  { name: "제네릭 호출 (<타입>)", unit: 6, re: /\w+<[A-Z]\w*(\[\])?>\s*\(/ },
  { name: "satisfies", unit: 8, re: /\bsatisfies\b/ },
  { name: "as 단언", unit: 8, re: /\bas\s+[A-Z]\w*/ },
];

const units = fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d)).sort();

function filesOf(unit) {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== "dist") walk(full); continue; }
      if (/\.tsx?$/.test(e.name) && !e.name.endsWith(".d.ts")) out.push(full);
    }
  };
  walk(path.join(ROOT, unit));
  return out;
}

const rows = [];
let WARN = 0;

for (const feature of FEATURES) {
  let firstAt = null;
  for (const unit of units) {
    const n = Number(unit.slice(0, 2));
    for (const abs of filesOf(unit)) {
      const src = fs.readFileSync(abs, "utf8");
      const lines = src.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 설명 주석은 건너뛴다 (설명은 미리 해도 된다)
        if (/^\s*\/\//.test(line)) continue;
        if (!feature.re.test(line)) continue;
        firstAt = { unit: n, rel: path.relative(ROOT, abs), line: i + 1, text: line.trim().slice(0, 60) };
        break;
      }
      if (firstAt) break;
    }
    if (firstAt) break;
  }

  if (!firstAt) { rows.push({ ok: true, feature, msg: "쓰인 곳 없음" }); continue; }

  if (firstAt.unit < feature.unit) {
    // 표시가 있으면 통과로 본다
    const src = fs.readFileSync(path.join(ROOT, firstAt.rel), "utf8");
    const marked = new RegExp(`0?${feature.unit}단원`).test(src);
    if (marked) {
      rows.push({ ok: true, feature, msg: `${firstAt.unit}단원에서 먼저 나오지만 "${feature.unit}단원" 표시가 있음` });
    } else {
      WARN++;
      rows.push({
        ok: false, feature,
        msg: `${feature.unit}단원에서 배우기로 했는데 ${firstAt.unit}단원에 먼저 나옵니다.\n      ${firstAt.rel}:${firstAt.line}\n      ${firstAt.text}`,
      });
    }
  } else {
    rows.push({ ok: true, feature, msg: `${firstAt.unit}단원 (${path.basename(firstAt.rel)})` });
  }
}

console.log("=".repeat(72));
console.log("선행 개념 검사 — 안 배운 문법이 앞 단원에 새는가");
console.log("=".repeat(72));
for (const r of rows) {
  console.log(`${r.ok ? "OK  " : "확인"} ${r.feature.name.padEnd(28)} ${r.msg}`);
}
console.log("=".repeat(72));
console.log(`확인 필요 ${WARN}건`);
console.log("이 도구의 지적을 그대로 믿지 마세요. 반드시 파일을 열어 직접 판정하세요.");
console.log("=".repeat(72));
