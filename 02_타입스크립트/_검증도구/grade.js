// ============================================================
// grade.js — 연습문제 채점기 (출력 대조)
// ------------------------------------------------------------
// 사용법:
//   node _검증도구/grade.js            (전 단원)
//   node _검증도구/grade.js 03          (03단원만)
//   npm run grade
//
// 왜 필요한가
//   npm run check(타입 검사)는 132문항 중 21개만 잡는다.
//   "예상한 값을 출력하세요" 같은 문제는 안 풀어도 타입 에러가 안 나기 때문이다.
//   그래서 '검사가 조용하면 다 맞은 것' 이라는 말은 사실이 아니었다.
//
//   이 도구는 연습문제를 실제로 돌려서 화면에 찍힌 것과
//   문제에 적힌 '기대 출력' 을 줄 단위로 맞춰 본다. 그래야 채점이 된다.
//
// 강사용으로 --answer 를 주면 정답 파일로 대조한다.
//   node _검증도구/grade.js --answer
//   → 문제의 '기대 출력' 과 정답 파일의 실제 출력이 어긋나지 않는지 본다.
//     (어긋나면 학생이 정답대로 풀어도 채점에서 틀린 것으로 나온다)
//
// 07단원은 브라우저라서 출력 대조를 못 한다. drive_07.js 로 본다.
// ============================================================

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ANSWER_MODE = process.argv.includes("--answer");
const FILTER = process.argv.slice(2).find((a) => !a.startsWith("--"));

// 문제 파일에서 '// 기대 출력:' 아래 줄들을 순서대로 모은다.
function expectedLines(src) {
  const lines = src.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*\/\/ 기대 출력:\s*$/.test(lines[i])) continue;
    for (let j = i + 1; j < lines.length; j++) {
      const m = lines[j].match(/^\/\/ ?(.*)$/);
      if (!m) break;
      const t = m[1];
      if (t.trim() === "") break;
      if (/^기대 검사 결과:/.test(t.trim())) break;
      out.push({ text: t.replace(/\s+$/, ""), line: j + 1 });
    }
  }
  return out;
}

function run(file) {
  return execFileSync(process.execPath, [file], {
    cwd: path.dirname(file), encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "pipe"],
  });
}

// 채점 대상 = (문제 파일, 정답 파일) 짝.
// 01~06·08단원은 연습문제.ts 하나씩, 09단원은 종합0N_*.ts 여러 개다.
function pairs() {
  const out = [];
  for (const u of fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d) && !d.startsWith("07_")).sort()) {
    if (FILTER && !u.startsWith(FILTER)) continue;
    const dir = path.join(ROOT, u);
    for (const f of fs.readdirSync(dir).sort()) {
      if (!/\.ts$/.test(f) || /_정답\.ts$/.test(f)) continue;
      if (!/^(연습문제|종합\d\d_)/.test(f)) continue;
      const a = path.join(dir, f.replace(/\.ts$/, "_정답.ts"));
      if (!fs.existsSync(a)) continue;
      out.push({ unit: u, label: /^연습문제/.test(f) ? u.replace(/_/g, " ") : `${u.slice(0, 2)} ${f.replace(/\.ts$/, "")}`, q: path.join(dir, f), a });
    }
  }
  return out;
}

let okUnits = 0, badUnits = 0;
const reports = [];

console.log("=".repeat(72));
console.log(ANSWER_MODE
  ? "연습문제 '기대 출력' ↔ 정답 파일 실제 출력 대조 (강사용)"
  : "연습문제 채점 — 실제 출력 ↔ 기대 출력");
console.log("=".repeat(72));

for (const { label: unit, q: qPath, a: aPath } of pairs()) {
  const expected = expectedLines(fs.readFileSync(qPath, "utf8"));
  const target = ANSWER_MODE ? aPath : qPath;

  let stdout = "";
  try { stdout = run(target); }
  catch (e) {
    badUnits++;
    reports.push({ unit, msg: `실행이 실패했습니다:\n      ${String(e.stderr || e.message).split("\n").slice(0, 4).join("\n      ")}` });
    console.log(`  실패 ${unit.replace(/_/g, " ")}  (실행 오류)`);
    continue;
  }

  // 머리글(=== 03단원 연습문제 ===)은 자료가 미리 넣어 둔 줄이라
  // 문제의 '기대 출력' 에는 안 적혀 있다. 양쪽에서 빼고 비교한다.
  const actual = (stdout === "" ? [] : stdout.replace(/\n$/, "").split("\n"))
    .filter((l) => !/^=+ .* =+$/.test(l));
  const diffs = [];
  const n = Math.max(expected.length, actual.length);
  for (let i = 0; i < n; i++) {
    const e = expected[i]?.text, a = actual[i];
    if (e !== a) diffs.push({ i, e, a, line: expected[i]?.line });
  }

  if (diffs.length === 0) {
    okUnits++;
    console.log(`  OK   ${unit.replace(/_/g, " ").padEnd(30)} ${expected.length}줄 전부 일치`);
  } else {
    badUnits++;
    console.log(`  ${ANSWER_MODE ? "실패" : "미완"} ${unit.replace(/_/g, " ").padEnd(30)} ${diffs.length}/${n}줄 다름`);
    reports.push({
      unit,
      msg: diffs.slice(0, 6).map((d) =>
        `${d.i + 1}번째 줄${d.line ? ` (문제 파일 ${d.line}줄)` : ""}\n        기대: ${JSON.stringify(d.e ?? "(없음)")}\n        실제: ${JSON.stringify(d.a ?? "(없음)")}`
      ).join("\n      ") + (diffs.length > 6 ? `\n      ... ${diffs.length - 6}줄 더` : ""),
    });
  }
}

console.log("\n" + "=".repeat(72));
if (reports.length) {
  for (const r of reports) console.log(`\n[${r.unit}]\n      ${r.msg}`);
  console.log();
}

if (ANSWER_MODE) {
  console.log(`단원 ${okUnits + badUnits}개 — 일치 ${okUnits} · 어긋남 ${badUnits}`);
  console.log(badUnits
    ? "★ 어긋난 곳이 있으면 학생이 정답대로 풀어도 채점에서 틀린 것으로 나옵니다."
    : "문제의 기대 출력과 정답의 실제 출력이 전부 일치합니다.");
} else {
  console.log(`단원 ${okUnits + badUnits}개 — 다 맞음 ${okUnits} · 아직 ${badUnits}`);
  console.log("07단원은 브라우저라 여기서 안 봅니다. 화면으로 확인하세요.");
}
console.log("=".repeat(72));
process.exit(ANSWER_MODE && badUnits ? 1 : 0);
