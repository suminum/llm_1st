// ============================================================
// verify.js — TS자료 2트랙 검증기
// ------------------------------------------------------------
// 사용법:
//   node _검증도구/verify.js            (전 단원)
//   node _검증도구/verify.js 02         (02로 시작하는 단원만)
//   node _검증도구/verify.js 02_기본_타입과_추론/개념01_타입_붙이기.ts
//
// 무엇을 하는가
//   [트랙 1] 실행 결과 대조
//       node 로 파일을 실제로 돌려서 stdout 을 걷고,
//       파일 안의  // 출력:  선언과 줄 단위로 맞춰 본다.
//
//   [트랙 2] 타입 에러 대조                     ← 이 자료의 핵심
//       주석 처리된 '틀린 코드' 를 한 블록씩 되살려 임시 파일을 만들고
//       tsc 에 걸어서,  // 에러:  선언과 실제 에러를 대조한다.
//       JS자료에서 "주석 처리된 실수 예제는 실행이 안 되니 틀려도 안 잡힌다"
//       (실제로 5건이 틀렸음) 던 구멍을 막기 위한 장치다.
//
//   [트랙 3] 프로젝트 전체 tsc --noEmit 가 조용한지
// ============================================================

import { execFileSync, execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// .bin/tsc.cmd 를 execFile 로 직접 띄우면 윈도우에서 막힌다(Node 가 .cmd 실행을 거부).
// 패키지 진입점을 node 로 부르면 윈도우·맥 양쪽에서 그냥 된다.
const TSC_JS = path.join(ROOT, "node_modules", "typescript", "bin", "tsc");
const runTsc = (args, opts) => execFileP(process.execPath, [TSC_JS, ...args], opts);
const runTscSync = (args, opts) => execFileSync(process.execPath, [TSC_JS, ...args], opts);

// 임시 파일에 tsc 를 걸 때 쓰는 옵션. tsconfig.json 과 반드시 같아야 한다.
// (파일을 명령줄로 직접 주면 tsconfig.json 은 무시되기 때문에 손으로 맞춰 준다)
const TSC_FLAGS = [
  // tsconfig.json 이 있는데 파일을 명령줄로 주면 tsc 7 이 TS5112 로 거부한다.
  "--ignoreConfig",
  "--noEmit", "--strict",
  "--target", "ES2022",
  "--lib", "ES2022",
  "--module", "nodenext",
  "--moduleResolution", "nodenext",
  "--types", "node",
  "--erasableSyntaxOnly",
  "--skipLibCheck",
];

// 주석 블록에서 '코드가 아니라 설명' 인 줄을 가려내는 접두사
const PROSE = ["실수:", "고치면:", "설명:", "참고:", "→", "에러:", "출력:", "✏️", "["];

let PASS = 0, FAIL = 0, WARN = 0;
const problems = [];

function fail(file, msg) { FAIL++; problems.push({ kind: "실패", file, msg }); }
function warn(file, msg) { WARN++; problems.push({ kind: "경고", file, msg }); }

// ------------------------------------------------------------
// 공통 — 파일 본문만 자른다 (맨 아래 '정답' 블록은 검증 대상이 아니다)
// ------------------------------------------------------------
function bodyLines(src) {
  const lines = src.split(/\r?\n/);
  // 개념 파일 맨 아래의 '직접 해보기 정답' 블록만 잘라 낸다.
  // 머리글(1~10줄)에 있는 '... 연습문제 정답 ...' 같은 제목을 구분선으로 오인하면
  // 파일 전체가 잘려서 '선언 0줄' 이 되므로 10줄 아래에서만 찾는다.
  const cut = lines.findIndex((l, i) => i >= 10 && /^\s*\/\/\s*직접 해보기 정답\s*$/.test(l));
  if (cut === -1) return lines;
  // 정답 머리말 위의 구분선(// ====)까지 잘라 낸다
  let end = cut;
  while (end > 0 && /^\/\/\s*=+\s*$/.test(lines[end - 1])) end--;
  return lines.slice(0, end);
}

// ------------------------------------------------------------
// 트랙 1 — // 출력: 대조
// ------------------------------------------------------------
function collectExpectedOutput(lines) {
  const out = [];
  lines.forEach((line, i) => {
    const m = line.match(/^\s*\/\/\s*출력:\s?(.*)$/);
    if (m) out.push({ text: m[1].replace(/\s+$/, ""), line: i + 1 });
  });
  return out;
}

function checkInlineOutput(lines, file) {
  lines.forEach((line, i) => {
    // 코드 뒤에 붙여 쓴 // 출력: 은 수집이 안 된다 (JS자료에서 겪은 것)
    if (/\S/.test(line.split("//")[0] || "") && /\/\/\s*출력:/.test(line)) {
      warn(file, `${i + 1}줄: // 출력: 이 코드와 같은 줄에 붙어 있습니다. 다음 줄에 단독으로 쓰세요.`);
    }
  });
}

function trackOutput(absFile, rel, lines) {
  const expected = collectExpectedOutput(lines);
  checkInlineOutput(lines, rel);

  let stdout = "";
  try {
    stdout = execFileSync(process.execPath, [absFile], {
      cwd: path.dirname(absFile), encoding: "utf8", timeout: 20000,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    fail(rel, `node 실행이 실패했습니다:\n      ${String(e.stderr || e.message).split("\n").slice(0, 6).join("\n      ")}`);
    return;
  }

  const actual = stdout.replace(/\s+$/, "").split("\n").filter((l) => l !== "" || false);
  const actualAll = stdout === "" ? [] : stdout.replace(/\n$/, "").split("\n");

  if (expected.length === 0 && actualAll.length === 0) { PASS++; return; }

  if (expected.length !== actualAll.length) {
    fail(rel, `출력 줄 수가 다릅니다. 선언 ${expected.length}줄 / 실제 ${actualAll.length}줄`
      + diffPreview(expected.map((e) => e.text), actualAll));
    return;
  }

  let bad = 0;
  expected.forEach((e, i) => {
    if (e.text !== actualAll[i]) {
      bad++;
      if (bad <= 5) {
        fail(rel, `${e.line}줄  // 출력: 이 실제와 다릅니다\n      선언: ${JSON.stringify(e.text)}\n      실제: ${JSON.stringify(actualAll[i])}`);
      }
    }
  });
  if (bad === 0) PASS++;
  else if (bad > 5) fail(rel, `... 그 밖에 ${bad - 5}건 더 다릅니다.`);
  void actual;
}

function diffPreview(exp, act) {
  const n = Math.max(exp.length, act.length);
  let s = "\n      ── 선언 ──────────────── │ ── 실제 ────────────────";
  for (let i = 0; i < Math.min(n, 12); i++) {
    const a = (exp[i] ?? "(없음)").slice(0, 24).padEnd(24);
    const b = (act[i] ?? "(없음)").slice(0, 24);
    s += `\n      ${a} │ ${b}`;
  }
  if (n > 12) s += `\n      ... ${n - 12}줄 더`;
  return s;
}

// ------------------------------------------------------------
// 트랙 2 — // 에러: 대조
// ------------------------------------------------------------
//   // 에러: TS2322 Type 'string' is not assignable to type 'number'.
//   // const price: number = "4000";
//
// '// 에러:' 를 여러 줄 연달아 쓰면 한 블록이 에러를 여러 개 낸다는 뜻이다.
function collectErrorBlocks(lines) {
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*\/\/\s*에러:/.test(lines[i])) continue;

    const declared = [];
    let j = i;
    while (j < lines.length && /^\s*\/\/\s*에러:/.test(lines[j])) {
      const m = lines[j].match(/^\s*\/\/\s*에러:\s*(TS\d+)\s*(.*)$/);
      if (!m) return { error: `${j + 1}줄: '// 에러:' 형식이 틀렸습니다. '// 에러: TS2322 메시지' 형태여야 합니다.` };
      declared.push({ code: m[1], msg: m[2].trim(), line: j + 1 });
      j++;
    }

    // 이어지는 주석 줄 = 되살릴 코드
    const code = [];
    while (j < lines.length) {
      const line = lines[j];
      const m = line.match(/^(\s*)\/\/ ?(.*)$/);
      if (!m) break;                                   // 주석이 아니면 끝
      const content = m[2];
      if (content.trim() === "") break;                // 빈 주석 줄이면 끝
      if (PROSE.some((p) => content.trimStart().startsWith(p))) break;  // 설명 줄이면 끝
      code.push({ line: j, indent: m[1], text: content });
      j++;
    }

    if (code.length === 0) {
      return { error: `${i + 1}줄: '// 에러:' 아래에 되살릴 코드 줄이 없습니다.` };
    }
    blocks.push({ declared, code, at: i + 1 });
    i = j - 1;
  }
  return { blocks };
}

async function trackTypeErrors(absFile, rel, lines) {
  const got = collectErrorBlocks(lines);
  if (got.error) { fail(rel, got.error); return; }
  const blocks = got.blocks;
  if (blocks.length === 0) return;

  const all = fs.readFileSync(absFile, "utf8").split(/\r?\n/);
  const dir = path.dirname(absFile);

  for (let b = 0; b < blocks.length; b++) {
    const block = blocks[b];
    const tmpName = `_에러확인_임시_${path.basename(absFile, ".ts")}_${b}.ts`;
    const tmpPath = path.join(dir, tmpName);

    // 원본 전체를 그대로 두고, 이 블록만 주석을 푼다 (앞 섹션의 type 선언 등 문맥이 살아 있어야 한다)
    const revived = all.slice();
    for (const c of block.code) revived[c.line] = c.indent + c.text;
    fs.writeFileSync(tmpPath, revived.join("\n"), "utf8");

    let raw = "";
    try {
      const r = await runTsc([...TSC_FLAGS, tmpName], { cwd: dir, encoding: "utf8", timeout: 60000 });
      raw = r.stdout;
    } catch (e) {
      raw = String(e.stdout || "") + String(e.stderr || "");
    } finally {
      try { fs.unlinkSync(tmpPath); } catch { /* 이미 지워짐 */ }
    }

    const found = [];
    for (const l of raw.split(/\r?\n/)) {
      const m = l.match(/\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.*)$/);
      if (m) found.push({ line: +m[1], code: m[3], msg: m[4].trim() });
    }

    // 이 블록이 되살아난 줄 범위에서 난 에러만 본다
    const lo = block.code[0].line + 1, hi = block.code[block.code.length - 1].line + 1;
    const inBlock = found.filter((f) => f.line >= lo && f.line <= hi);
    const outside = found.filter((f) => f.line < lo || f.line > hi);

    if (outside.length) {
      fail(rel, `${block.at}줄 실수 예제: 되살리니 블록 밖(${outside[0].line}줄)에서도 에러가 났습니다 — ${outside[0].code} ${outside[0].msg}`);
    }

    // ① 선언했는데 안 난 것 (자료가 거짓말을 하고 있는 것)
    const unmatched = [];
    const pool = inBlock.slice();
    for (const d of block.declared) {
      const idx = pool.findIndex((f) => f.code === d.code && normalize(f.msg).startsWith(normalize(d.msg)));
      if (idx >= 0) { pool.splice(idx, 1); continue; }
      const codeOnly = pool.findIndex((f) => f.code === d.code);
      if (codeOnly >= 0) {
        fail(rel, `${d.line}줄  // 에러: 메시지가 실제와 다릅니다\n      선언: ${d.code} ${d.msg}\n      실제: ${pool[codeOnly].code} ${pool[codeOnly].msg}`);
        pool.splice(codeOnly, 1);
      } else unmatched.push(d);
    }
    for (const d of unmatched) {
      fail(rel, `${d.line}줄  // 에러: ${d.code} 를 선언했는데 실제로는 안 났습니다`
        + (inBlock.length ? `\n      실제로 난 것: ${inBlock.map((f) => f.code).join(", ")}` : `\n      이 블록은 에러가 하나도 안 났습니다.`));
    }
    // ② 안 났다고 안 적었는데 난 것
    for (const f of pool) {
      fail(rel, `${block.at}줄 실수 예제: 선언하지 않은 에러가 났습니다 — ${f.code} ${f.msg}`);
    }
    if (!unmatched.length && !pool.length && !outside.length) PASS++;
  }
}

function normalize(s) { return s.replace(/\s+/g, " ").trim(); }

// ------------------------------------------------------------
// 트랙 2-b — '일부러 틀린 파일'
// ------------------------------------------------------------
// 머리글에 '일부러 틀린 파일' 이라고 적힌 파일은 코드가 주석이 아니라 살아 있다.
// (node 로는 돌아가는데 tsc 로는 걸린다 — 를 보여 주는 파일)
// 이때는 // 에러: 바로 다음의 '살아 있는 코드 줄' 에서 그 에러가 나야 한다.
function isIntentional(src) {
  return src.split(/\r?\n/).slice(0, 18).some((l) => /일부러 틀린 파일/.test(l));
}

async function trackIntentionalErrors(absFile, rel, lines) {
  const dir = path.dirname(absFile);
  const declared = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*\/\/\s*에러:\s*(TS\d+)\s*(.*)$/);
    if (!m) continue;
    let j = i + 1;
    while (j < lines.length && (lines[j].trim() === "" || lines[j].trim().startsWith("//"))) j++;
    if (j >= lines.length) { fail(rel, `${i + 1}줄: '// 에러:' 아래에 코드 줄이 없습니다.`); continue; }
    declared.push({ code: m[1], msg: m[2].trim(), at: i + 1, codeLine: j + 1 });
  }
  if (!declared.length) { fail(rel, `'일부러 틀린 파일' 인데 // 에러: 선언이 하나도 없습니다.`); return; }

  let raw = "";
  try {
    const r = await runTsc([...TSC_FLAGS, path.basename(absFile)], { cwd: dir, encoding: "utf8", timeout: 60000 });
    raw = r.stdout;
  } catch (e) { raw = String(e.stdout || "") + String(e.stderr || ""); }

  const found = [];
  for (const l of raw.split(/\r?\n/)) {
    const m = l.match(/\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.*)$/);
    if (m) found.push({ line: +m[1], code: m[3], msg: m[4].trim() });
  }

  const pool = found.slice();
  for (const d of declared) {
    const idx = pool.findIndex((f) => f.line === d.codeLine && f.code === d.code);
    if (idx < 0) {
      const same = pool.find((f) => f.line === d.codeLine);
      fail(rel, `${d.at}줄  // 에러: ${d.code} 가 ${d.codeLine}줄에서 안 났습니다`
        + (same ? `\n      그 줄에서 실제로 난 것: ${same.code} ${same.msg}` : `\n      그 줄에서는 에러가 안 났습니다.`));
      continue;
    }
    if (!normalize(pool[idx].msg).startsWith(normalize(d.msg))) {
      fail(rel, `${d.at}줄  // 에러: 메시지가 실제와 다릅니다\n      선언: ${d.msg}\n      실제: ${pool[idx].msg}`);
    }
    pool.splice(idx, 1);
  }
  for (const f of pool) fail(rel, `${f.line}줄: 선언하지 않은 에러가 났습니다 — ${f.code} ${f.msg}`);
  if (!pool.length) PASS++;
}

// ------------------------------------------------------------
// 트랙 4 — ✏️ 정답 블록 안의 주장 실행 대조
// ------------------------------------------------------------
// 파일 맨 아래 '직접 해보기 정답' 블록은 전부 주석이라 실행되지 않는다.
// JS자료에서 바로 이 자리가 구멍이었다(손으로 센 글자 수가 틀린 것 등).
// 여기서는 아래 형태만 뽑아 원본 뒤에 붙여 실제로 돌려 본다.
//
//     //    console.log(greet("홍길동").length);     // 출력: 10
//
// 여러 줄짜리 답안은 자동 대조가 안 되므로 건너뛰고 몇 건인지만 알린다.
// 주석에서 벗겨 낸 한 줄이 '코드' 인지 '해설 문장' 인지 가른다.
//
// ★ '=> 가 들어 있으면 코드' 로 판정하면 안 된다.
//   해설 문장에도 (n) => fn(n) 같은 표기가 자주 들어가서 통째로 오인한다.
//   실제로 그 규칙 때문에 한글 해설이 코드로 붙어 실행이 깨졌다.
//   대신 '코드 키워드로 시작' 하거나 '이름 뒤에 바로 ( = . 가 오는' 줄만 코드로 본다.
//   시작만 보면 'prices[0] 이 number 라서...' 같은 한글 해설도 코드로 걸린다.
//   그래서 '코드처럼 시작하고 코드처럼 끝나는' 줄만 코드로 본다.
const CODE_START = /^(const|let|var|async|await|export|function|console\.log|return|if|for|while|switch|try|type|interface|\}|\{)/;
const CALL_OR_ASSIGN = /^[A-Za-z_$][\w$]*\s*[(=.]/;
const CODE_END = /[;{},]$/;
const isCodeLine = (s) => {
  const t = s.trim();
  return (CODE_START.test(t) || CALL_OR_ASSIGN.test(t)) && CODE_END.test(t);
};

// 정답 블록을  // 1)  // 2)  단위로 쪼갠다. 한 항목이 여러 줄이어도 통째로 살린다.
function collectAnswerItems(src) {
  const lines = src.split(/\r?\n/);
  const start = lines.findIndex((l, i) => i >= 10 && /^\s*\/\/\s*직접 해보기 정답\s*$/.test(l));
  if (start === -1) return [];

  const items = [];
  let cur = null;
  const push = (item, content, lineNo) => {
    // 인라인 '// 출력:' 을 먼저 떼어 내야 줄 끝 판정이 제대로 된다.
    const m = content.match(/^(.*?)\s*\/\/\s*출력:\s?(.*)$/);
    const code = (m ? m[1] : content).trimEnd();
    if (!isCodeLine(code)) return;
    item.code.push({ text: code, expect: m ? m[2].replace(/\s+$/, "") : null, line: lineNo });
  };

  for (let i = start + 1; i < lines.length; i++) {
    const head = lines[i].match(/^\s*\/\/\s*(\d+)\)\s?(.*)$/);
    if (head) {
      if (cur) items.push(cur);
      cur = { no: head[1], line: i + 1, code: [] };
      push(cur, head[2], i + 1);
      continue;
    }
    if (!cur) continue;
    const body = lines[i].match(/^\s*\/\/\s?(.*)$/);
    if (body) push(cur, body[1], i + 1);
  }
  if (cur) items.push(cur);
  return items.filter((it) => it.code.some((c) => c.expect !== null));
}

function trackAnswerClaims(absFile, rel, src) {
  const items = collectAnswerItems(src);
  if (!items.length) return;

  const dir = path.dirname(absFile);
  const tmpPath = path.join(dir, `_에러확인_임시_정답_${path.basename(absFile, ".ts")}.ts`);
  const MARK = "___정답대조___";
  const body = src.split(/\r?\n/);
  const cut = body.findIndex((l, i) => i >= 10 && /^\s*\/\/\s*직접 해보기 정답\s*$/.test(l));
  const head = (cut === -1 ? body : body.slice(0, cut)).join("\n");

  // 항목마다 { } 로 감싸서 이름이 겹치지 않게 한다.
  const expects = [];
  let out = "";
  for (const it of items) {
    out += "{\n";
    for (const c of it.code) {
      if (c.expect !== null) { out += `console.log("${MARK}");\n`; expects.push(c); }
      out += c.text + "\n";
    }
    out += "}\n";
  }
  fs.writeFileSync(tmpPath, head + "\n\n" + out, "utf8");

  let stdout = "";
  try {
    stdout = execFileSync(process.execPath, [tmpPath], { cwd: dir, encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    fs.unlinkSync(tmpPath);
    fail(rel, `✏️ 정답 코드를 실행하다 실패했습니다 (정답 자체가 안 돌아가는 코드입니다):\n      ${String(e.stderr || e.message).split("\n").slice(0, 6).join("\n      ")}`);
    return;
  }
  fs.unlinkSync(tmpPath);

  const chunks = stdout.split(MARK + "\n").slice(1);
  let bad = 0;
  expects.forEach((c, i) => {
    const got = (chunks[i] ?? "").replace(/\n$/, "");
    if (got !== c.expect) {
      bad++;
      fail(rel, `${c.line}줄  ✏️ 정답의 // 출력: 이 실제와 다릅니다\n      코드: ${c.text}\n      선언: ${JSON.stringify(c.expect)}\n      실제: ${JSON.stringify(got)}`);
    }
  });
  if (!bad) PASS++;
}

// ------------------------------------------------------------
// 트랙 3 — 프로젝트 전체 검사
// ------------------------------------------------------------
function trackProject() {
  process.stdout.write("전체 타입 검사 (tsc --noEmit) ... ");
  try {
    runTscSync(["--noEmit"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    console.log("조용함 = 통과");
    PASS++;
  } catch (e) {
    const out = String(e.stdout || e.stderr || "").trim();
    console.log("실패");
    fail("(프로젝트 전체)", out.split("\n").slice(0, 20).join("\n      "));
  }
}

// ------------------------------------------------------------
function targets(arg) {
  const units = fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d) && fs.statSync(path.join(ROOT, d)).isDirectory());
  const files = [];
  const walk = (dir, rel) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      // 실습프로젝트(07단원)는 브라우저에서 도는 .tsx 라 여기서 안 본다.
      // 그쪽은 실습프로젝트/ 안에서 npm run typecheck 로 따로 검사한다.
      if (e.isDirectory()) {
        if (e.name !== "node_modules" && e.name !== "실습프로젝트") walk(path.join(dir, e.name), rel);
        continue;
      }
      if (e.name.endsWith(".ts") && !e.name.endsWith(".d.ts") && !e.name.startsWith("_에러확인_임시")) {
        files.push(path.join(dir, e.name));
      }
    }
  };
  for (const u of units.sort()) walk(u, u);
  if (!arg) return files;
  const norm = arg.replace(/\\/g, "/");
  return files.filter((f) => f.replace(/\\/g, "/").includes(norm));
}

async function main() {
  const arg = process.argv[2];
  const list = targets(arg);
  if (!list.length) { console.log(`대상 파일이 없습니다: ${arg ?? "(전체)"}`); process.exit(1); }

  console.log("=".repeat(64));
  console.log(`TS자료 검증 — 파일 ${list.length}개`);
  console.log("=".repeat(64));

  let unit = "";
  for (const rel of list) {
    const u = rel.split(/[\\/]/)[0];
    if (u !== unit) { unit = u; console.log(`\n[${unit}]`); }

    const abs = path.join(ROOT, rel);
    const src = fs.readFileSync(abs, "utf8");
    const lines = bodyLines(src);
    const before = FAIL;

    if (isIntentional(src)) {
      trackOutput(abs, rel, lines);          // node 로는 멀쩡히 돌아야 한다
      await trackIntentionalErrors(abs, rel, lines);   // tsc 로는 걸려야 한다
      console.log(`  ${FAIL === before ? "OK  " : "실패"} ${path.basename(rel)}  (일부러 틀린 파일)`);
      continue;
    }

    // 연습문제·종합 문제 파일은 TODO 상태라 출력이 머리글뿐이다. 에러 대조만 한다.
    // (정답 파일은 여기 안 걸리므로 출력까지 대조된다)
    const isExercise = /(연습문제|종합\d\d_[^\/]*)\.ts$/.test(rel) && !/_정답\.ts$/.test(rel);
    if (!isExercise) trackOutput(abs, rel, lines);
    else {
      try {
        execFileSync(process.execPath, [abs], { cwd: path.dirname(abs), encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"] });
        PASS++;
      } catch (e) {
        fail(rel, `TODO 상태에서 실행이 실패했습니다 (문제 파일은 안 풀어도 에러 없이 돌아야 합니다):\n      ${String(e.stderr || e.message).split("\n").slice(0, 5).join("\n      ")}`);
      }
    }
    await trackTypeErrors(abs, rel, lines);
    if (!isExercise) trackAnswerClaims(abs, rel, src);

    console.log(`  ${FAIL === before ? "OK  " : "실패"} ${path.basename(rel)}`);
  }

  console.log();
  trackProject();

  console.log("\n" + "=".repeat(64));
  if (problems.length) {
    for (const p of problems) console.log(`\n[${p.kind}] ${p.file}\n      ${p.msg}`);
    console.log();
  }
  console.log(`통과 ${PASS} · 실패 ${FAIL} · 경고 ${WARN}`);
  console.log("=".repeat(64));
  process.exit(FAIL ? 1 : 0);
}

main();
