// ============================================================
// verify_claims.js — 정답 블록의 'error TSxxxx' 주장을 실제로 돌려서 대조
// ------------------------------------------------------------
// 사용법: node _검증도구/verify_claims.js
//
// verify.js 는 '// 에러:' 로 선언된 실수 예제를 검증한다(트랙 2).
// 그런데 ✏️ 정답과 연습문제 정답 안에는
//
//     // 2) error TS2322: Type 'number' is not assignable to type 'string'.
//
// 처럼 '이렇게 하면 이런 에러가 납니다' 라고 서술한 주장이 따로 있다.
// 이건 주석이라 아무도 안 돌려 본다. 실제로 표본 10건 중 1건이 틀렸었다
// (유니온이 목표면 TS2741 이 아니라 TS2322 가 난다).
//
// 그래서 주장마다 '재현' 코드를 두고 진짜로 돌린다.
//
//     // 2) error TS2322: Type 'number' is not assignable to type 'string'.
//     //    재현: const price: string = 4000;
//
// 여러 줄이면 이렇게 쓴다.
//
//     //    재현:
//     //    function f(memo?: string) { console.log(memo.length); }
//     //    f();
//
// 재현 코드는 '그것만으로 돌아가는 완결된 조각' 이어야 한다.
// 원본 파일에 붙이는 것이 아니라 따로 떼어 검사하기 때문이다.
// (원본에 붙이면 이름 충돌·앞 줄 영향으로 가짜 실패가 난다)
//
// 정말 재현할 수 없는 주장은 이렇게 적어 면제한다. 이유를 반드시 쓴다.
//
//     //    재현: 없음 — 실행 결과라 tsc 로 못 봄
// ============================================================

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TSC_JS = path.join(ROOT, "node_modules", "typescript", "bin", "tsc");
const REACT = path.join(ROOT, "07_React와_타입스크립트", "실습프로젝트");
const REACT_TSC = path.join(REACT, "node_modules", "typescript", "bin", "tsc");

const FLAGS_TS = [
  "--ignoreConfig", "--noEmit", "--strict",
  "--target", "ES2022", "--lib", "ES2022",
  "--module", "nodenext", "--moduleResolution", "nodenext",
  "--types", "node", "--erasableSyntaxOnly", "--skipLibCheck",
];
const FLAGS_TSX = [
  "--ignoreConfig", "--noEmit", "--strict",
  "--target", "ES2022", "--lib", "ES2022,DOM,DOM.Iterable",
  "--module", "esnext", "--moduleResolution", "bundler",
  "--jsx", "react-jsx", "--skipLibCheck",
];

const PROSE = ["실수:", "고치면:", "설명:", "참고:", "해설", "→", "재현:", "★"];
// 재현 블록이 끝나는 표시. 해설이 이 글자들로 시작하는 일이 잦다.
//   [갈래 2] 입니다. ...       ← 대괄호로 시작하는 해설
//   <Menu | null> 이라고 ...   ← 꺾쇠
//   : any 를 지우면 ...        ← 콜론
//   ? 를 붙인 순간 ...         ← 물음표
// 전부 코드로 딸려 들어가서 문법 에러를 냈다(실제로 4건).
// (여는 | 는 유니온 이어쓰기라 코드로 남겨 둔다)
const PROSE_START = /^[[<(★→:?!.]|^[가-힣]/;

let PASS = 0, FAIL = 0, EXEMPT = 0, MISSING = 0;
const problems = [];
const fail = (f, m) => { FAIL++; problems.push({ kind: "실패", f, m }); };
const missing = (f, m) => { MISSING++; problems.push({ kind: "재현없음", f, m }); };

function unitFiles() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (!["node_modules", "dist"].includes(e.name)) walk(full); continue; }
      if (/\.tsx?$/.test(e.name) && !e.name.endsWith(".d.ts")) out.push(full);
    }
  };
  for (const u of fs.readdirSync(ROOT).filter((d) => /^0\d_/.test(d)).sort()) walk(path.join(ROOT, u));
  return out;
}

// 정답 영역만 본다. 개념 파일은 '직접 해보기 정답' 아래, 정답 파일은 전체.
function answerRegion(rel, lines) {
  if (/연습문제_정답\.tsx?$/.test(rel)) return 10;
  const at = lines.findIndex((l, i) => i >= 10 && /^\s*\/\/\s*직접 해보기 정답\s*$/.test(l));
  return at === -1 ? -1 : at;
}

function collectClaims(rel, src) {
  const lines = src.split(/\r?\n/);
  const start = answerRegion(rel, lines);
  if (start === -1) return [];

  const claims = [];
  for (let i = start; i < lines.length; i++) {
    const m = lines[i].match(/error\s+(TS\d+):\s*(.+)$/);
    if (!m) continue;

    // 메시지가 다음 줄로 이어질 수 있다 (들여쓴 주석 줄이고 error/재현/번호로 시작하지 않으면)
    let msg = m[2].trim();
    let j = i + 1;
    while (j < lines.length) {
      const c = lines[j].match(/^\s*\/\/\s{2,}(.*)$/);
      if (!c) break;
      const t = c[1].trim();
      if (t === "" || /^\d+\)/.test(t) || /^재현:/.test(t) || /error TS/.test(t)) break;
      if (!/^[A-Za-z'"(]/.test(t)) break;
      // ★ 한글이 한 글자라도 있으면 해설이다. 메시지에 붙이면 안 된다.
      //   'unknown 은 확인하기 전에는...' 처럼 영문 단어로 시작하는 해설이 많아서
      //   '첫 글자가 ASCII 인가' 만 보면 통째로 삼킨다(실제로 5건 오탐).
      if (/[가-힣]/.test(t)) break;
      msg += " " + t;
      j++;
    }

    // 재현 블록 찾기
    // 재현 블록은 '다음 주장이 시작되기 전' 까지 어디에 있어도 된다.
    // (앞뒤로 해설을 몇 줄 붙이는 일이 흔해서 고정 폭으로 찾으면 놓친다)
    let repro = null, exempt = null;
    for (let k = j; k < lines.length; k++) {
      if (k > j && (/error\s+TS\d+:/.test(lines[k]) || /^\s*\/\/\s*\d+\)/.test(lines[k]))) break;
      const r = lines[k].match(/^\s*\/\/\s*재현:\s*(.*)$/);
      if (!r) continue;
      const head = r[1].trim();
      // \b 는 \w(영문·숫자·_) 기준이라 '없음' 처럼 한글로 끝나면 뒤에 공백이 와도
      // 경계로 안 잡힌다. 그래서 '없음 — 이유' 가 면제로 인식되지 않았다.
      // 뒤에 한글이 더 붙는 경우(없음이/없음은)만 빼면 된다.
      if (/^없음(?![가-힣])/.test(head)) { exempt = head; break; }
      const code = [];
      if (head !== "") code.push(head);
      let p = k + 1;
      while (p < lines.length) {
        const c = lines[p].match(/^\s*\/\/\s?(.*)$/);
        if (!c) break;
        const t = c[1];
        if (t.trim() === "") break;
        if (/^\s*\d+\)/.test(t)) break;
        if (PROSE.some((x) => t.trimStart().startsWith(x))) break;
        // 한글로 '시작' 하면 해설이다.
        // '한글이 들어 있으면' 으로 하면  | { status: "로딩중" }  같은 코드가 잘리고,
        // '따옴표가 있으면 코드' 로 예외를 두면  해설 ② 핵심은 '어디서'...  가 코드로 붙는다.
        if (PROSE_START.test(t.trim())) break;
        code.push(t.trim());
        p++;
      }
      repro = code;
      break;
    }

    claims.push({ line: i + 1, code: m[1], msg, repro, exempt });
    i = j - 1;
  }
  return claims;
}

const normalize = (s) => s.replace(/\s+/g, " ").replace(/\.$/, "").trim();

async function run(rel, claim, n) {
  const isTsx = rel.endsWith(".tsx");
  const dir = isTsx ? path.join(REACT, "src") : ROOT;
  const tmp = path.join(dir, `_주장확인_임시_${n}.${isTsx ? "tsx" : "ts"}`);
  const header = isTsx ? 'import { useState } from "react";\nvoid useState;\n' : "";
  fs.writeFileSync(tmp, header + claim.repro.join("\n") + "\n", "utf8");

  let raw = "";
  try {
    const r = await execFileP(process.execPath, [
      isTsx ? REACT_TSC : TSC_JS,
      ...(isTsx ? FLAGS_TSX : FLAGS_TS),
      path.basename(tmp),
    ], { cwd: dir, encoding: "utf8", timeout: 60000 });
    raw = r.stdout;
  } catch (e) { raw = String(e.stdout || "") + String(e.stderr || ""); }
  finally { try { fs.unlinkSync(tmp); } catch { /* 이미 지워짐 */ } }

  const found = [];
  for (const l of raw.split(/\r?\n/)) {
    const m = l.match(/error\s+(TS\d+):\s*(.*)$/);
    if (m) found.push({ code: m[1], msg: m[2].trim() });
  }

  if (!found.length) {
    fail(rel, `${claim.line}줄  ${claim.code} 를 주장했는데 재현 코드에서 에러가 하나도 안 났습니다.\n      재현: ${claim.repro.join(" / ")}`);
    return;
  }
  const same = found.filter((f) => f.code === claim.code);
  if (!same.length) {
    fail(rel, `${claim.line}줄  에러 번호가 다릅니다\n      주장: ${claim.code}\n      실제: ${found.map((f) => f.code).join(", ")}  (${found[0].msg.slice(0, 80)})`);
    return;
  }
  const want = normalize(claim.msg).slice(0, 45);
  if (!same.some((f) => normalize(f.msg).startsWith(want))) {
    fail(rel, `${claim.line}줄  ${claim.code} 는 맞는데 메시지가 다릅니다\n      주장: ${claim.msg.slice(0, 90)}\n      실제: ${same[0].msg.slice(0, 90)}`);
    return;
  }
  PASS++;
}

async function main() {
  console.log("=".repeat(70));
  console.log("정답 블록의 'error TSxxxx' 주장 검증");
  console.log("=".repeat(70));

  let n = 0, total = 0;
  for (const abs of unitFiles()) {
    const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
    const claims = collectClaims(rel, fs.readFileSync(abs, "utf8"));
    if (!claims.length) continue;
    total += claims.length;
    const before = FAIL + MISSING;

    for (const c of claims) {
      if (c.exempt) { EXEMPT++; continue; }
      if (!c.repro || !c.repro.length) {
        missing(rel, `${c.line}줄  ${c.code} — 재현 코드가 없습니다. '// 재현: ...' 를 다세요.`);
        continue;
      }
      await run(rel, c, n++);
    }
    console.log(`  ${FAIL + MISSING === before ? "OK  " : "확인"} ${path.basename(rel).padEnd(38)} 주장 ${claims.length}건`);
  }

  console.log("\n" + "=".repeat(70));
  for (const p of problems) console.log(`\n[${p.kind}] ${p.f}\n      ${p.m}`);
  console.log(`\n주장 ${total}건 — 통과 ${PASS} · 실패 ${FAIL} · 재현없음 ${MISSING} · 면제 ${EXEMPT}`);
  console.log("=".repeat(70));
  process.exit(FAIL || MISSING ? 1 : 0);
}

main();
