// ============================================================
// check_exercises.js — 채점 기준이 사실인지 확인한다
// ------------------------------------------------------------
// 사용법: node _검증도구/check_exercises.js
//
// 자료는 학생에게 이렇게 약속한다.
//
//     npm run check 가 조용해지면 다 맞은 것입니다.
//
// 이 약속이 사실이려면 두 가지가 맞아야 한다.
//
//   ① 지금 나는 에러가 전부 '학생이 풀어야 할 자리(TODO)' 안에 있어야 한다.
//      엉뚱한 곳에서 나면 학생이 못 고치고, 영원히 조용해지지 않는다.
//   ② 문제마다 정답이 있고, 그 정답이 검사를 통과해야 한다.
//      (②는 audit.js 와 npm run typecheck 가 이미 본다)
//
// 이 도구는 ①을 본다. 그리고 덤으로
// '검사로는 안 잡히고 출력·화면으로만 판정하는 문제' 를 뽑아 준다.
// 강사가 그 문제들만 따로 봐 주면 되니까 수업에서 쓸모가 있다.
// ============================================================

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REACT = path.join(ROOT, "07_React와_타입스크립트", "실습프로젝트");

let FAIL = 0;
const problems = [];
const fail = (f, m) => { FAIL++; problems.push({ f, m }); };

async function tscOn(cwd, args) {
  const tsc = path.join(cwd, "node_modules", "typescript", "bin", "tsc");
  try {
    const r = await execFileP(process.execPath, [tsc, ...args], { cwd, encoding: "utf8", timeout: 120000 });
    return r.stdout;
  } catch (e) { return String(e.stdout || "") + String(e.stderr || ""); }
}

// 파일을 '문제 N' 블록으로 쪼갠다.
function splitProblems(src) {
  const lines = src.split(/\r?\n/);
  const marks = [];
  lines.forEach((l, i) => {
    const m = l.match(/^\s*\/\/ ───── 문제 (\d+) ─────/);
    if (m) marks.push({ no: +m[1], line: i + 1 });
  });
  return marks.map((m, i) => ({
    no: m.no,
    from: m.line,
    to: i + 1 < marks.length ? marks[i + 1].line - 1 : lines.length,
    hasTodo: lines.slice(m.line - 1, i + 1 < marks.length ? marks[i + 1].line - 1 : lines.length)
      .some((l) => /TODO/.test(l)),
  }));
}

async function main() {
  console.log("=".repeat(72));
  console.log("연습문제 채점 기준 확인 — 에러가 전부 TODO 안에서 나는가");
  console.log("=".repeat(72));

  // 01~06·08단원
  const raw = await tscOn(ROOT, ["--noEmit", "-p", "tsconfig.exercises.json"]);
  // 07단원
  const rawReact = await tscOn(REACT, ["--noEmit", "-p", "tsconfig.exercises.json"]);

  const byFile = new Map();
  for (const line of (raw + "\n" + rawReact).split(/\r?\n/)) {
    const m = line.match(/^(.*?)\((\d+),\d+\):\s*error\s*(TS\d+)/);
    if (!m) continue;
    const f = m[1].replace(/\\/g, "/");
    if (!byFile.has(f)) byFile.set(f, []);
    byFile.get(f).push({ line: +m[2], code: m[3] });
  }

  const units = fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d)).sort();
  let totalQ = 0, caught = 0, screenOnly = [];

  // 단원마다 볼 문제 파일 목록. 09단원은 종합0N 여러 개다.
  function problemFiles(unit) {
    if (unit.startsWith("09_")) {
      const out = [];
      for (const d of [path.join(ROOT, unit), path.join(REACT, "src", unit)]) {
        if (!fs.existsSync(d)) continue;
        for (const f of fs.readdirSync(d).sort()) {
          if (/^종합\d\d_.*\.tsx?$/.test(f) && !/_정답\./.test(f)) out.push(path.join(d, f));
        }
      }
      return out;
    }
    const p = unit.startsWith("07_")
      ? path.join(REACT, "src", unit, "연습문제.tsx")
      : path.join(ROOT, unit, "연습문제.ts");
    return fs.existsSync(p) ? [p] : [];
  }

  for (const unit of units) {
   const files = problemFiles(unit);
   if (files.length === 0) { fail(unit, "문제 파일이 없습니다."); continue; }
   for (const abs of files) {
    const src = fs.readFileSync(abs, "utf8");
    const blocks = splitProblems(src);
    totalQ += blocks.length;

    // tsc 가 낸 경로와 맞추기
    // tsc 는 자기 프로젝트 기준의 상대경로를 찍는다.
    // 루트 프로젝트면 ROOT 기준, React 프로젝트면 REACT 기준으로 맞춘다.
    const base = abs.startsWith(REACT) ? REACT : ROOT;
    const rel = path.relative(base, abs).split(path.sep).join("/");
    const key = [...byFile.keys()].find((k) => k === rel);
    const errs = key ? byFile.get(key) : [];

    const inside = new Set();
    for (const e of errs) {
      const b = blocks.find((x) => e.line >= x.from && e.line <= x.to);
      if (!b) {
        fail(`${unit}/${path.basename(abs)}`, `${e.line}줄 ${e.code} — 어느 문제 블록에도 속하지 않습니다. 학생이 고칠 수 없습니다.`);
        continue;
      }
      if (!b.hasTodo) {
        fail(`${unit}/${path.basename(abs)}`, `${e.line}줄 ${e.code} — 문제 ${b.no} 안이지만 TODO 가 없습니다. 무엇을 고치라는 건지 알 수 없습니다.`);
        continue;
      }
      inside.add(b.no);
    }
    caught += inside.size;

    const notCaught = blocks.filter((b) => !inside.has(b.no)).map((b) => b.no);
    if (notCaught.length) screenOnly.push({ unit, list: notCaught });

    const label = files.length > 1
      ? `${unit.slice(0, 2)} ${path.basename(abs).replace(/\.tsx?$/, "")}`
      : unit.replace(/_/g, " ");
    console.log(`  ${label.padEnd(30)} 문제 ${String(blocks.length).padStart(2)}개 · 검사로 잡히는 것 ${String(inside.size).padStart(2)}개`);
   }
  }

  console.log("\n" + "-".repeat(72));
  console.log(`전체 ${totalQ}문항 중 ${caught}문항이 npm run check 로 잡힙니다 (${Math.round(caught / totalQ * 100)}%).`);
  console.log("\n검사로는 안 잡히는 문제 — '기대 출력'·'기대 화면' 으로 판정해야 합니다:");
  for (const s of screenOnly) {
    console.log(`  ${s.unit.replace(/_/g, " ").padEnd(30)} 문제 ${s.list.join(", ")}`);
  }

  console.log("\n" + "=".repeat(72));
  if (problems.length) { for (const p of problems) console.log(`\n[실패] ${p.f}\n      ${p.m}`); console.log(); }
  console.log(`문제 블록 밖 에러 ${FAIL}건`);
  console.log("=".repeat(72));
  process.exit(FAIL ? 1 : 0);
}

main();
