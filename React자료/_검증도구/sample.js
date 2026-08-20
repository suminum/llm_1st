// ✏️ 문제 + 정답을 짝지어 뽑는다 (사람이 읽고 판정하기 위한 것)
//   node sample.js <시작번호> <개수>
const fs = require("fs");
const path = require("path");

const ROOT = "C:/Users/dongh/Desktop/React자료";
const SRC = path.join(ROOT, "실습프로젝트/src");
const from = Number(process.argv[2] || 0);
const take = Number(process.argv[3] || 20);

function conceptFiles() {
  const out = [];
  const push = (dir) => {
    for (const f of fs.readdirSync(dir))
      if (/^개념.*\.(html|jsx|tsx)$/.test(f)) out.push(path.join(dir, f));
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

// ✏️ 문제 본문: ✏️ 줄 + 이어지는 들여쓴 주석 줄
function question(lines, i) {
  const out = [lines[i].replace(/^\s*(\/\/|\{?\/\*)?\s*/, "").trim()];
  for (let j = i + 1; j < lines.length && j - i < 5; j++) {
    const l = lines[j];
    if (!/^\s*\/\/\s{6,}\S/.test(l)) break;
    out.push(l.replace(/^\s*\/\/\s*/, "").trim());
  }
  return out.join(" ");
}

// 정답 블록의 N) 항목
function answer(lines, n) {
  const s = lines.findIndex((l) => /직접\s*해보기\s*정답/.test(l));
  if (s === -1) return "(정답 블록 없음)";
  const out = [];
  let on = false;
  for (let i = s + 1; i < lines.length; i++) {
    const m = lines[i].match(/^\s*\/\/\s*(\d+)\)/);
    if (m) {
      if (Number(m[1]) === n) {
        on = true;
        out.push(lines[i].replace(/^\s*\/\/\s?/, ""));
        continue;
      }
      if (on) break;
      continue;
    }
    if (!on) continue;
    if (!/^\s*\/\//.test(lines[i])) break;
    out.push(lines[i].replace(/^\s*\/\/\s?/, ""));
    if (out.length > 16) break;
  }
  return out.join("\n").replace(/\s+$/, "");
}

const all = [];
for (const file of conceptFiles()) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((l, i) => {
    const m = l.match(/✏️\s*직접\s*해보기\s*(\d+)/);
    if (m) all.push({ file, n: Number(m[1]), i, lines });
  });
}

// 전 단원에 고르게 퍼지도록 일정 간격으로 고른다
const total = from + take;
const step = Math.max(1, Math.floor(all.length / total));
const picked = [];
for (let k = 0; k < all.length && picked.length < total; k += step) picked.push(all[k]);

console.log(`전체 ✏️ ${all.length}개 중 ${from + 1}~${Math.min(from + take, picked.length)}번째 표본\n`);
picked.slice(from, from + take).forEach((p, idx) => {
  console.log(`\n━━━━━ [${from + idx + 1}] ${path.relative(ROOT, p.file)}  ✏️${p.n}`);
  console.log("문제: " + question(p.lines, p.i).slice(0, 200));
  console.log("정답:\n" + answer(p.lines, p.n));
});
