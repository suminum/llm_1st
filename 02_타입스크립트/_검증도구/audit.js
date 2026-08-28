// ============================================================
// audit.js — 구조 감사 (기계가 볼 수 있는 것만)
// ------------------------------------------------------------
// 사용법: node _검증도구/audit.js
//
// verify.js 가 '내용이 맞는가' 를 본다면, 이쪽은 '빠진 게 없는가' 를 본다.
// JS자료·React자료에서 실제로 사고가 났던 항목들이다.
//
//   · ✏️ 번호가 1부터 빠짐없이 이어지는가
//   · ✏️ 마다 정답이 있는가 (React자료에서 45곳이 어긋났던 자리)
//   · 모든 섹션에 ✏️ 가 하나는 있는가 (사용자 피드백: 커버리지)
//   · 연습문제 번호가 이어지고, 정답에 다 있는가
//   · 파일 머리글에 실행·검사 방법이 적혀 있는가
//   · 다른 단원을 가리키는 참조가 실제로 있는 단원인가
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let WARN = 0, FAIL = 0;
const rows = [];
const fail = (f, m) => { FAIL++; rows.push({ kind: "실패", f, m }); };
const warn = (f, m) => { WARN++; rows.push({ kind: "경고", f, m }); };

const units = fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d)).sort();
const unitNums = new Set(units.map((u) => u.slice(0, 2)));

function conceptFiles(unit) {
  // 07단원의 개념 파일은 실습프로젝트 안에 .tsx 로 있다.
  const dir = unit.startsWith("07_")
    ? path.join(ROOT, unit, "실습프로젝트", "src", unit)
    : path.join(ROOT, unit);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => /^개념\d\d_.*\.tsx?$/.test(f))
    .sort()
    .map((f) => path.relative(ROOT, path.join(dir, f)));
}

const stat = { 섹션: 0, 연습: 0, 문항: 0 };

for (const unit of units) {
  // ── 개념 파일 ──
  for (const rel of conceptFiles(unit)) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const lines = src.split(/\r?\n/);

    // 머리글 (07단원은 브라우저라 '실행' 대신 '보기' 다)
    if (!/^\/\/ (실행: node |보기: )/m.test(src)) fail(rel, "머리글에 '// 실행: node ...' 또는 '// 보기: ...' 가 없습니다.");
    if (!/^\/\/ 검사: /m.test(src)) fail(rel, "머리글에 '// 검사: ...' 가 없습니다.");

    // 섹션
    const sections = lines.filter((l) => /^\/\/ ── 섹션 \d+/.test(l));
    stat.섹션 += sections.length;
    if (sections.length === 0) warn(rel, "섹션 구분선이 없습니다.");
    // 07단원(.tsx)은 정리를 주석이 아니라 <Summary> 로 화면에 렌더링한다.
    // (React자료에서 "브라우저만 열면 설명이 안 보인다" 던 문제를 해소한 방식)
    const hasSummary = rel.endsWith(".tsx")
      ? /<Summary\s/.test(src)
      : /^\/\/ ── 정리 ──/m.test(src);
    if (!hasSummary) fail(rel, rel.endsWith(".tsx") ? "<Summary> 정리가 없습니다." : "'── 정리 ──' 가 없습니다.");
    if (!/자주 하는 실수/.test(src)) warn(rel, "'자주 하는 실수' 섹션이 없습니다.");

    // ✏️ 번호 연속성
    const marks = [...src.matchAll(/^\/\/ ✏️ 직접 해보기 (\d+)/gm)].map((m) => +m[1]);
    if (marks.length === 0) { warn(rel, "✏️ 가 하나도 없습니다."); continue; }
    for (let i = 0; i < marks.length; i++) {
      if (marks[i] !== i + 1) {
        fail(rel, `✏️ 번호가 어긋납니다. ${i + 1}번째가 ${marks[i]} 입니다.`);
        break;
      }
    }

    // 정답 블록
    const answerAt = lines.findIndex((l, i) => i >= 10 && /^\s*\/\/\s*직접 해보기 정답\s*$/.test(l));
    if (answerAt === -1) { fail(rel, "'직접 해보기 정답' 블록이 없습니다."); continue; }
    const answerBody = lines.slice(answerAt).join("\n");
    const answers = [...answerBody.matchAll(/^\/\/ (\d+)\)/gm)].map((m) => +m[1]);
    if (answers.length !== marks.length) {
      fail(rel, `✏️ ${marks.length}개인데 정답은 ${answers.length}개입니다.`);
    } else {
      for (let i = 0; i < answers.length; i++) {
        if (answers[i] !== i + 1) { fail(rel, `정답 번호가 어긋납니다(${i + 1}번째가 ${answers[i]}).`); break; }
      }
    }

    // 섹션 커버리지 — 섹션마다 ✏️ 가 하나는 있어야 한다
    // ('자주 하는 실수'·마지막 정리성 섹션은 제외)
    let cur = null;
    const has = new Map();
    // 읽기만 하는 섹션은 파일에 '// (✏️ 없음: 이유)' 를 적어 두면 넘어간다.
    // 남발하면 커버리지 검사가 무의미해지므로, 이유를 반드시 적는다.
    for (const line of lines) {
      const s = line.match(/^\/\/ ── 섹션 (\d+): (.*?) ──/);
      if (s) { cur = `섹션 ${s[1]}: ${s[2]}`; if (!/자주 하는 실수/.test(s[2])) has.set(cur, false); continue; }
      if (/^\/\/ ── 정리 ──/.test(line)) cur = null;
      if (cur && has.has(cur) && /^\/\/ ✏️ 직접 해보기/.test(line)) has.set(cur, true);
      if (cur && has.has(cur) && /^\/\/ \(✏️ 없음:/.test(line)) has.set(cur, true);
    }
    for (const [name, ok] of has) if (!ok) warn(rel, `${name} 에 ✏️ 가 없습니다.`);

    // 다른 단원 참조가 실제로 있는 단원인지
    for (const m of src.matchAll(/(\d\d)단원/g)) {
      if (!unitNums.has(m[1]) && !/^(0[1-9]|1[0-4])$/.test(m[1])) {
        warn(rel, `없는 단원을 가리킵니다: ${m[1]}단원`);
      }
    }
  }

  // ── 09단원: 종합 실습은 (문제, 정답) 짝이 여럿이다 ──
  if (unit.startsWith("09_")) {
    const dirs = [path.join(ROOT, unit),
                  path.join(ROOT, "07_React와_타입스크립트", "실습프로젝트", "src", unit)];
    let pairs = 0;
    for (const d of dirs) {
      if (!fs.existsSync(d)) continue;
      for (const f of fs.readdirSync(d).sort()) {
        if (!/^종합\d\d_.*\.tsx?$/.test(f) || /_정답\.tsx?$/.test(f)) continue;
        const a = path.join(d, f.replace(/\.(tsx?)$/, "_정답.$1"));
        const rel = path.relative(ROOT, path.join(d, f)).split(path.sep).join("/");
        if (!fs.existsSync(a)) { fail(rel, "정답 파일이 없습니다."); continue; }
        pairs++;
        const qs = fs.readFileSync(path.join(d, f), "utf8");
        const as = fs.readFileSync(a, "utf8");
        const qn = [...qs.matchAll(/^\s*\/\/ ───── 문제 (\d+) ─────/gm)].map((m) => +m[1]);
        const an = [...as.matchAll(/^\s*\/\/ ───── 문제 (\d+) ─────/gm)].map((m) => +m[1]);
        stat.문항 += qn.length;
        for (let i = 0; i < qn.length; i++) {
          if (qn[i] !== i + 1) { fail(rel, `문제 번호가 어긋납니다(${i + 1}번째가 ${qn[i]}).`); break; }
        }
        const missingQ = qn.filter((n) => !an.includes(n));
        if (missingQ.length) fail(rel, `정답이 없는 문제: ${missingQ.join(", ")}`);
        if (!/^\/\/ (실행|보기): /m.test(qs)) fail(rel, "머리글에 실행·보기 방법이 없습니다.");
        const withExpect = (qs.match(/^\s*\/\/ 기대 (출력|화면):/gm) ?? []).length;
        if (withExpect < qn.length - 2) {
          warn(rel, `'기대 출력'·'기대 화면' 이 ${withExpect}개뿐입니다(문제 ${qn.length}개).`);
        }
      }
    }
    stat.연습 += pairs;
    if (pairs === 0) fail(unit, "종합 실습 파일이 없습니다.");
    continue;
  }

  // ── 연습문제 / 정답 ──
  // 07단원은 브라우저에서 도는 .tsx 라 실습프로젝트 안에 있다.
  const isReactUnit = unit.startsWith("07_");
  const qDir = isReactUnit
    ? path.join(ROOT, unit, "실습프로젝트", "src", unit)
    : path.join(ROOT, unit);
  const q = path.join(qDir, isReactUnit ? "연습문제.tsx" : "연습문제.ts");
  const a = path.join(qDir, isReactUnit ? "연습문제_정답.tsx" : "연습문제_정답.ts");
  if (!fs.existsSync(q)) { fail(unit, "연습문제.ts 가 없습니다."); continue; }
  if (!fs.existsSync(a)) { fail(unit, "연습문제_정답.ts 가 없습니다."); continue; }
  stat.연습 += 1;

  const qs = fs.readFileSync(q, "utf8");
  const as = fs.readFileSync(a, "utf8");
  const qn = [...qs.matchAll(/^\s*\/\/ ───── 문제 (\d+) ─────/gm)].map((m) => +m[1]);
  const an = [...as.matchAll(/^\s*\/\/ ───── 문제 (\d+) ─────/gm)].map((m) => +m[1]);
  stat.문항 += qn.length;

  for (let i = 0; i < qn.length; i++) {
    if (qn[i] !== i + 1) { fail(`${unit}/연습문제.ts`, `문제 번호가 어긋납니다(${i + 1}번째가 ${qn[i]}).`); break; }
  }
  if (qn.length !== an.length) {
    fail(`${unit}/연습문제_정답.ts`, `문제 ${qn.length}개인데 정답은 ${an.length}개입니다.`);
  }
  const missing = qn.filter((n) => !an.includes(n));
  if (missing.length) fail(`${unit}/연습문제_정답.ts`, `정답이 없는 문제: ${missing.join(", ")}`);

  // 정오 판정 기준이 적혀 있는지 (혼자 푸는 학생이 맞았는지 알 수 있어야 한다)
  // 07단원은 브라우저라서 '기대 출력' 대신 '기대 화면' 을 쓴다.
  const withExpect = (qs.match(/^\s*\/\/ 기대 (출력|화면):/gm) ?? []).length;
  if (withExpect < qn.length - 3) {
    warn(`${unit}/연습문제.ts`, `'기대 출력' 이 ${withExpect}개뿐입니다(문제 ${qn.length}개). 혼자 푸는 학생이 맞았는지 알 수 없습니다.`);
  }
}

console.log("=".repeat(64));
console.log("TS자료 구조 감사");
console.log("=".repeat(64));
console.log(`단원 ${units.length} · 섹션 ${stat.섹션} · 연습문제 ${stat.연습}세트 ${stat.문항}문항`);
if (rows.length) {
  for (const r of rows) console.log(`\n[${r.kind}] ${r.f}\n      ${r.m}`);
  console.log();
}
console.log(`실패 ${FAIL} · 경고 ${WARN}`);
console.log("=".repeat(64));
process.exit(FAIL ? 1 : 0);
