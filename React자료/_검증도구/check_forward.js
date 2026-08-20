// ============================================================
// 선행 개념 위반 검사기
// ------------------------------------------------------------
//   node check_forward.js
//
// "아직 안 가르친 문법을 맨 채로 쓴 곳" 을 찾는다.
// JS자료에서 08단원이 09단원 문법을 15회 쓴 사고가 있었다. 그걸 막는 검사기다.
//
// 규칙: 어떤 문법이 NN단원에서 처음 나오면, NN단원보다 앞 단원에서 쓰면 위반이다.
//   단, 그 줄이나 앞뒤 2줄에 "NN단원" / "배웁니다" / "아직" 같은 예고 문구가 있으면 봐준다.
// ============================================================
const fs = require("fs");
const path = require("path");

const ROOT = "C:/Users/dongh/Desktop/React자료";
const SRC = path.join(ROOT, "실습프로젝트/src");

// [정규식, 처음 가르치는 단원, 이름]
const RULES = [
  [/\buseState\b/, 4, "useState"],
  [/\bonClick\s*=/, 4, "onClick"],
  [/\bonChange\s*=/, 6, "onChange"],
  [/\bonSubmit\s*=/, 6, "onSubmit"],
  [/\bpreventDefault\b/, 6, "preventDefault"],
  [/\buseEffect\b/, 9, "useEffect"],
  [/\buseRef\b/, 10, "useRef"],
  [/\buseMemo\b/, 10, "useMemo"],
  [/\buseCallback\b/, 10, "useCallback"],
  [/\bmemo\s*\(/, 10, "memo()"],
  [/react-router|BrowserRouter|useNavigate|useParams|<Link\b/, 11, "React Router"],
  [/\bcreateContext\b|\buseContext\b/, 12, "Context"],
  [/\buseReducer\b/, 12, "useReducer"],
  [/\bclassName\s*=/, 2, "className"],
  [/<>\s*$|<\/>\s*$/, 2, "Fragment <>"],
  [/\bprops\b/, 3, "props"],
  [/\bchildren\b/, 3, "children"],
  // 01~07단원은 import 를 쓰면 안 된다 (08단원에서 처음 가르친다)
  [/^\s*import\s.+from\s/, 8, "import"],
  [/^\s*export\s+(default|const|function)/, 8, "export"],
];

// 예고 문구가 있으면 봐준다
// "06단원 폼에서 씁니다" 처럼 조사가 붙어도 잡히게 '숫자+단원' 을 통째로 본다
const EXCUSE = /(\d\s*단원|배웁니다|배웠|아직|나중에|맛보기|설명합니다|여기서는|이름만|지금은)/;

function unitNumberOf(p) {
  const m = p.match(/[\\/](\d\d)_/);
  return m ? Number(m[1]) : null;
}

function collect() {
  const out = [];
  for (const d of fs.readdirSync(ROOT)) {
    const full = path.join(ROOT, d);
    if (!/^\d\d_/.test(d) || !fs.statSync(full).isDirectory()) continue;
    for (const f of fs.readdirSync(full)) {
      if (/\.(html|jsx|tsx|md)$/.test(f)) out.push(path.join(full, f));
    }
  }
  if (fs.existsSync(SRC)) {
    for (const d of fs.readdirSync(SRC)) {
      const full = path.join(SRC, d);
      if (!/^\d\d_/.test(d) || !fs.statSync(full).isDirectory()) continue;
      for (const f of fs.readdirSync(full)) {
        if (/\.(jsx|tsx|md)$/.test(f)) out.push(path.join(full, f));
      }
    }
  }
  return out;
}

const files = collect();
let total = 0;
const byUnit = {};

for (const file of files) {
  const unit = unitNumberOf(file);
  if (unit === null) continue;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  for (const [re, taughtAt, name] of RULES) {
    if (unit >= taughtAt) continue; // 배운 뒤면 자유롭게 써도 된다
    const hits = [];
    lines.forEach((line, i) => {
      if (!re.test(line)) return;
      const around = lines.slice(Math.max(0, i - 2), i + 3).join(" ");
      if (EXCUSE.test(around)) return; // 예고했으면 봐준다
      hits.push(i + 1);
    });
    if (hits.length) {
      total += hits.length;
      const key = `${String(unit).padStart(2, "0")}단원`;
      byUnit[key] = byUnit[key] || [];
      byUnit[key].push(
        `${path.basename(file)} — ${name} (${taughtAt}단원에서 배움) ${hits.length}곳: 줄 ${hits.slice(0, 6).join(", ")}${hits.length > 6 ? " …" : ""}`
      );
    }
  }
}

const keys = Object.keys(byUnit).sort();
if (keys.length === 0) {
  console.log(`✅ 선행 개념 위반 없음 (검사 ${files.length}개 파일)`);
} else {
  console.log(`⚠ 선행 개념 위반 후보 ${total}곳 (검사 ${files.length}개 파일)\n`);
  for (const k of keys) {
    console.log(`[${k}]`);
    byUnit[k].forEach((l) => console.log("  " + l));
    console.log("");
  }
  console.log("※ 예고 문구(\"NN단원에서 배웁니다\")가 앞뒤 2줄 안에 있으면 걸러집니다.");
  console.log("  걸린 곳은 ① 예고를 넣거나 ② 그 문법을 빼야 합니다.");
}
