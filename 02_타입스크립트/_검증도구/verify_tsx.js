// ============================================================
// verify_tsx.js — 07단원(.tsx) 에러 예제 대조기
// ------------------------------------------------------------
// 사용법:
//   node _검증도구/verify_tsx.js
//
// verify.js 의 [트랙 2] 를 실습프로젝트에 맞게 옮긴 것이다.
// .tsx 는 브라우저에서 도니까 node 로 실행할 수 없다. 그래서 두 가지만 본다.
//
//   ① 프로젝트 전체 tsc --noEmit 이 조용한지
//   ② 주석 처리된 실수 예제를 한 블록씩 되살렸을 때
//      // 에러: 선언대로 에러가 나는지
//
// ②를 하려면 파일을 잠깐 고쳐야 한다(tsc -p 는 실제 경로를 읽으므로).
// 원본은 반드시 되돌린다. 중간에 끊겨도 .bak 이 남으니 그것으로 복구하면 된다.
// ============================================================

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT = path.join(ROOT, "07_React와_타입스크립트", "실습프로젝트");
const TSC_JS = path.join(PROJECT, "node_modules", "typescript", "bin", "tsc");
const SRC = path.join(PROJECT, "src");

const PROSE = ["실수:", "고치면:", "설명:", "참고:", "→", "에러:", "화면:", "✏️", "["];

let PASS = 0, FAIL = 0;
const problems = [];
const fail = (file, msg) => { FAIL++; problems.push({ file, msg }); };

function runTsc() {
  try {
    execFileSync(process.execPath, [TSC_JS, "--noEmit", "-p", "."], {
      cwd: PROJECT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
    return "";
  } catch (e) {
    return String(e.stdout || "") + String(e.stderr || "");
  }
}

function parseErrors(raw) {
  const out = [];
  for (const l of raw.split(/\r?\n/)) {
    const m = l.match(/\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.*)$/);
    if (m) out.push({ line: +m[1], code: m[3], msg: m[4].trim() });
  }
  return out;
}

// verify.js 와 같은 규칙으로 '// 에러:' 블록을 모은다.
function collectBlocks(lines) {
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*\/\/\s*에러:/.test(lines[i])) continue;
    const declared = [];
    let j = i;
    while (j < lines.length && /^\s*\/\/\s*에러:/.test(lines[j])) {
      const m = lines[j].match(/^\s*\/\/\s*에러:\s*(TS\d+)\s*(.*)$/);
      if (!m) return { error: `${j + 1}줄: '// 에러:' 형식이 틀렸습니다.` };
      declared.push({ code: m[1], msg: m[2].trim(), line: j + 1 });
      j++;
    }
    const code = [];
    while (j < lines.length) {
      const m = lines[j].match(/^(\s*)\/\/ ?(.*)$/);
      if (!m) break;
      const content = m[2];
      if (content.trim() === "") break;
      if (PROSE.some((p) => content.trimStart().startsWith(p))) break;
      code.push({ line: j, indent: m[1], text: content });
      j++;
    }
    if (code.length === 0) return { error: `${i + 1}줄: '// 에러:' 아래에 되살릴 코드가 없습니다.` };
    blocks.push({ declared, code, at: i + 1 });
    i = j - 1;
  }
  return { blocks };
}

const normalize = (s) => s.replace(/\s+/g, " ").trim();

function tsxFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules") out.push(...tsxFiles(full)); continue; }
    // 연습문제.tsx 는 TODO 상태에서 걸리는 게 정상이라 여기서 안 본다.
    if (e.name.endsWith(".tsx") && e.name !== "연습문제.tsx") out.push(full);
  }
  return out;
}

function main() {
  if (!fs.existsSync(TSC_JS)) {
    console.log("실습프로젝트에 typescript 가 없습니다. 먼저 이렇게 하세요:");
    console.log("  cd 07_React와_타입스크립트/실습프로젝트 && npm install");
    process.exit(1);
  }

  console.log("=".repeat(64));
  console.log("07단원 실습프로젝트 검증");
  console.log("=".repeat(64));

  process.stdout.write("\n전체 타입 검사 (tsc --noEmit -p .) ... ");
  const baseline = runTsc();
  if (baseline.trim() === "") { console.log("조용함 = 통과"); PASS++; }
  else {
    console.log("실패");
    fail("(프로젝트 전체)", baseline.split("\n").slice(0, 15).join("\n      "));
    console.log("\n먼저 이것부터 고치세요. 기준선이 깨끗해야 에러 예제 대조가 됩니다.");
    report();
    return;
  }

  for (const abs of tsxFiles(SRC)) {
    const rel = path.relative(PROJECT, abs).replace(/\\/g, "/");
    const src = fs.readFileSync(abs, "utf8");
    const lines = src.split(/\r?\n/);
    const got = collectBlocks(lines);
    if (got.error) { fail(rel, got.error); continue; }
    if (got.blocks.length === 0) { console.log(`  --   ${path.basename(rel)}  (에러 예제 없음)`); continue; }

    const before = FAIL;
    const bak = abs + ".bak";
    fs.writeFileSync(bak, src, "utf8");
    try {
      for (const block of got.blocks) {
        const revived = lines.slice();
        for (const c of block.code) revived[c.line] = c.indent + c.text;
        fs.writeFileSync(abs, revived.join("\n"), "utf8");

        const found = parseErrors(runTsc());
        const lo = block.code[0].line + 1;
        const hi = block.code[block.code.length - 1].line + 1;
        const inBlock = found.filter((f) => f.line >= lo && f.line <= hi);
        const outside = found.filter((f) => f.line < lo || f.line > hi);

        if (outside.length) {
          fail(rel, `${block.at}줄 실수 예제: 되살리니 블록 밖(${outside[0].line}줄)에서도 에러 — ${outside[0].code} ${outside[0].msg}`);
        }

        const pool = inBlock.slice();
        for (const d of block.declared) {
          const idx = pool.findIndex((f) => f.code === d.code && normalize(f.msg).startsWith(normalize(d.msg).slice(0, 40)));
          if (idx >= 0) { pool.splice(idx, 1); continue; }
          const codeOnly = pool.findIndex((f) => f.code === d.code);
          if (codeOnly >= 0) {
            fail(rel, `${d.line}줄  // 에러: 메시지가 다릅니다\n      선언: ${d.code} ${d.msg}\n      실제: ${pool[codeOnly].code} ${pool[codeOnly].msg}`);
            pool.splice(codeOnly, 1);
          } else {
            fail(rel, `${d.line}줄  // 에러: ${d.code} 를 선언했는데 안 났습니다`
              + (inBlock.length ? `\n      실제로 난 것: ${inBlock.map((f) => `${f.code} ${f.msg}`).join(" / ")}` : `\n      이 블록은 에러가 하나도 안 났습니다.`));
          }
        }
        for (const f of pool) fail(rel, `${block.at}줄 실수 예제: 선언하지 않은 에러 — ${f.code} ${f.msg}`);
      }
    } finally {
      fs.writeFileSync(abs, src, "utf8");   // 원본 복구
      fs.unlinkSync(bak);
    }
    if (FAIL === before) PASS += got.blocks.length;
    console.log(`  ${FAIL === before ? "OK  " : "실패"} ${path.basename(rel)}  (에러 예제 ${got.blocks.length}개)`);
  }

  report();
}

function report() {
  console.log("\n" + "=".repeat(64));
  for (const p of problems) console.log(`\n[실패] ${p.file}\n      ${p.msg}`);
  console.log(`\n통과 ${PASS} · 실패 ${FAIL}`);
  console.log("=".repeat(64));
  process.exit(FAIL ? 1 : 0);
}

main();
