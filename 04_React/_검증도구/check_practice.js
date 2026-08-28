// ============================================================
// ✏️ 직접 해보기 정답 점검기
// ------------------------------------------------------------
//   node check_practice.js
//
// 정답은 주석 안에 있어서 실행이 안 된다. 그래서 지금까지 기계가 못 봤다.
// 여기서 전수로 보는 것:
//   ① ✏️ 번호마다 정답 항목이 실제로 있는가
//   ② 정답 항목에 '코드' 가 들어 있는가 (설명만 있고 답이 없는 것 잡기)
//   ③ 정답 안에 적어 둔 // 출력: / // 콘솔: 값이 몇 개인가 (미검증 표면적 파악)
//   ④ 정답 코드가 문법적으로 말이 되는가 (Babel 로 파싱)
// ============================================================
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "실습프로젝트/src");

function files() {
  const out = [];
  const push = (dir) => {
    for (const f of fs.readdirSync(dir)) {
      // macOS 는 한글 파일명을 NFD 로 돌려줍니다. NFC 로 되돌려야 /^개념/ 이 맞습니다.
      if (/^개념.*\.(html|jsx|tsx)$/.test(f.normalize("NFC"))) out.push(path.join(dir, f));
    }
  };
  for (const d of fs.readdirSync(ROOT)) {
    const full = path.join(ROOT, d);
    if (/^\d\d_/.test(d) && fs.statSync(full).isDirectory()) push(full);
  }
  if (fs.existsSync(SRC))
    for (const d of fs.readdirSync(SRC)) {
      const full = path.join(SRC, d);
      if (/^\d\d_/.test(d) && fs.statSync(full).isDirectory()) push(full);
    }
  return out.sort();
}

// 정답 블록에서 "N)" 항목별로 본문을 모은다
function answerItems(src) {
  const lines = src.split(/\r?\n/);
  const start = lines.findIndex((l) => /직접\s*해보기\s*정답/.test(l));
  if (start === -1) return null;
  const items = new Map();
  let cur = null;
  for (let i = start + 1; i < lines.length; i++) {
    const raw = lines[i];
    const m = raw.match(/^\s*\/\/\s*(\d+)\)\s?(.*)$/);
    if (m) {
      cur = Number(m[1]);
      items.set(cur, [m[2]]);
      continue;
    }
    if (cur === null) continue;
    const c = raw.match(/^\s*\/\/\s?(.*)$/);
    if (!c) {
      if (/^\s*<\/script>|^\s*\)\;?\s*$|^\s*\}\s*$/.test(raw)) break;
      continue;
    }
    items.get(cur).push(c[1]);
  }
  return items;
}

// 정답 항목은 '코드 → 설명' 순서로 쓰여 있다.
// 그래서 첫 설명 줄이 나오면 거기서 끊는다. 계속 훑으면 설명이 코드에 섞인다.
function codeLines(body) {
  const out = [];
  for (const l of body) {
    const s = l.trim();
    if (!s) {
      if (out.length) break; // 코드를 모으다 빈 줄이 나오면 끝
      continue;
    }
    if (/^(→|★|힌트|참고)/.test(s)) break; // 설명 시작
    if (/^(\/\/\s*)?(출력|콘솔|화면)\s*:/.test(s)) continue; // 결과 주석은 건너뜀
    if (/^\/\//.test(s)) continue; // 안쪽 주석
    // 한글로 시작하고 코드 기호가 없으면 설명문 → 거기서 끊는다
    const startsHangul = /^[가-힣"']/.test(s);
    const hasCode = /[=(){}<>;[\]]|=>|\.\w/.test(s);
    if (startsHangul && !hasCode) break;
    out.push(l);
  }
  return out;
}

const results = [];
let totalPractice = 0;
let totalAnswers = 0;
let totalOutputs = 0;
let noCode = 0;
let parseFail = 0;

for (const file of files()) {
  const src = fs.readFileSync(file, "utf8");
  const nums = [...src.matchAll(/✏️\s*직접\s*해보기\s*(\d+)/g)].map((m) => Number(m[1]));
  if (!nums.length) continue;
  const items = answerItems(src);
  const rel = path.relative(ROOT, file);
  totalPractice += nums.length;

  if (!items) {
    results.push(`${rel} — 정답 블록 자체가 없음`);
    continue;
  }
  for (const n of nums) {
    const body = items.get(n);
    if (!body) {
      results.push(`${rel} — ✏️${n} 정답 항목 없음`);
      continue;
    }
    totalAnswers++;
    const code = codeLines(body);
    totalOutputs += body.filter((l) => /^\s*(\/\/\s*)?(출력|콘솔|화면)\s*:/.test(l)).length;
    if (code.length === 0) {
      noCode++;
      results.push(`${rel} — ✏️${n} 정답에 코드가 없음 (설명만): ${body.join(" ").slice(0, 70)}`);
      continue;
    }
    // 문법 검사 — 조각이어도 통과하도록 함수 몸통 안에 넣어서 파싱
    const snippet = code.join("\n");
    const wrapped = `function __t(){\n${snippet}\n}`;
    let ok = false;
    for (const cand of [snippet, wrapped, `<>${snippet}</>`, `const __x = ${snippet}`]) {
      try {
        babel.transformSync(cand, {
          presets: [[require("@babel/preset-react"), { runtime: "classic" }]],
          filename: "t.jsx",
          configFile: false,
          babelrc: false,
        });
        ok = true;
        break;
      } catch {}
    }
    if (!ok) {
      parseFail++;
      results.push(`${rel} — ✏️${n} 정답 코드가 파싱 안 됨:\n        ${code.join("\n        ").slice(0, 220)}`);
    }
  }
}

console.log(`✏️ 총 ${totalPractice}개 / 정답 항목 ${totalAnswers}개`);
console.log(`정답 안에 적어 둔 출력값 주석 ${totalOutputs}개`);
console.log(`코드가 없는 정답 ${noCode}개 / 문법이 안 맞는 정답 ${parseFail}개`);
if (results.length) {
  console.log(`\n──── 확인이 필요한 것 ${results.length}건 ────`);
  results.slice(0, 40).forEach((r) => console.log("  ⚠ " + r));
  if (results.length > 40) console.log(`  … 그 밖 ${results.length - 40}건`);
} else {
  console.log("\n✅ 빠진 정답 없음 · 코드 없는 정답 없음 · 문법 오류 없음");
}
