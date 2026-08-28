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

const ROOT = path.resolve(__dirname, "..");
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
  // import / export 는 00단원부터 씁니다.
  //   Vite 프로젝트에서는 파일마다 반드시 쓰게 되므로 피할 방법이 없습니다.
  //   00단원 개념01에서 "다른 파일에서 가져온다" 수준으로 먼저 소개하고,
  //   08단원 개념02에서 규칙을 제대로 배웁니다.
  [/^\s*import\s.+from\s/, 0, "import"],
  [/^\s*export\s+(default|const|function)/, 0, "export"],
];

// 예고 문구가 있으면 봐준다
// "06단원 폼에서 씁니다" 처럼 조사가 붙어도 잡히게 '숫자+단원' 을 통째로 본다
const EXCUSE = /(\d\s*단원|배웁니다|배웠|아직|나중에|맛보기|설명합니다|여기서는|이름만|지금은)/;

// 학생이 읽지 않는 구역은 통째로 봐준다.
//
//   // 검증: 선행문법허용 시작 <이유>
//   ...
//   // 검증: 선행문법허용 끝
//
// 01~07단원 파일 맨 위의 [화면 틀] 블록이 이것이다.
// 제목·안내문·상자를 그리는 컴포넌트라 children·className 을 안 쓸 수가 없다.
// 파일 안내문에서 "읽지 않아도 됩니다" 라고 명시한 구역이라 예외로 둔다.
const 구역시작 = /\/\/ 검증: ?선행문법허용 ?시작/;
const 구역끝 = /\/\/ 검증: ?선행문법허용 ?끝/;

function 봐줄줄들(lines, file) {
  const 봐줌 = new Set();
  let 열린곳 = null;
  lines.forEach((line, i) => {
    if (구역시작.test(line)) {
      if (열린곳 !== null) {
        console.log(`  ⚠ ${path.basename(file)} 줄 ${i + 1}: 선행문법허용 구역이 안 닫힌 채로 또 열렸습니다`);
      }
      열린곳 = i;
      return;
    }
    if (구역끝.test(line)) {
      if (열린곳 === null) {
        console.log(`  ⚠ ${path.basename(file)} 줄 ${i + 1}: 열지도 않은 선행문법허용 구역을 닫았습니다`);
        return;
      }
      for (let k = 열린곳; k <= i; k++) 봐줌.add(k);
      열린곳 = null;
      return;
    }
  });
  if (열린곳 !== null) {
    console.log(`  ⚠ ${path.basename(file)} 줄 ${열린곳 + 1}: 선행문법허용 구역을 안 닫았습니다`);
  }
  return 봐줌;
}

function unitNumberOf(p) {
  // ★ 절대 경로를 그대로 보면 안 된다.
  //   ".../03_React/04_state와_이벤트/..." 에서 앞의 "03_" 이 먼저 걸려
  //   모든 파일이 3단원으로 판정됐다. 그래서 04단원이 onClick 을 쓰는 것까지
  //   선행 위반으로 잡히고, 반대로 className·props 위반은 하나도 안 잡혔다.
  //   ROOT 기준 상대 경로에서 봐야 한다.
  const m = path.relative(ROOT, p).match(/(?:^|[\\/])(\d\d)_/);
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

// ── 단원 안 '정의+예고 덩어리' 찾기 ──
// 02단원 개념01처럼 용어를 0부터 정의하고 "03단원에서 제대로 배웁니다" 라고
// 예고한 단원은, 그 파일과 단원 내 뒤 파일들의 같은 용어 사용을 봐준다.
// ±2줄 창만 보면 이런 단원이 통째로 후보에 뜬다 (8-24 실측: 후보 83곳 전부 02단원,
// 개념01 줄 69~72 에 정의·예고가 이미 있었다). 봐준 곳은 아래 ℹ 로 세어 보인다.
// 덩어리 판정: 용어가 나온 줄 앞뒤 3줄 안에 예고 문구(EXCUSE)가 있는 곳.
const unitDecl = {};
files.forEach((file, idx) => {
  const unit = unitNumberOf(file);
  if (unit === null) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const [re, taughtAt, name] of RULES) {
    if (unit >= taughtAt) continue;
    if (unitDecl[unit] && unitDecl[unit][name]) continue;
    for (let i = 0; i < lines.length; i++) {
      if (!re.test(lines[i])) continue;
      const near = lines.slice(Math.max(0, i - 3), i + 4).join(" ");
      if (!EXCUSE.test(near)) continue;
      unitDecl[unit] = unitDecl[unit] || {};
      unitDecl[unit][name] = { idx, file, line: i + 1 };
      break;
    }
  }
});
const 예고봐줌 = {};

files.forEach((file, fileIdx) => {
  const unit = unitNumberOf(file);
  if (unit === null) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  const 봐줌 = 봐줄줄들(lines, file);

  // .md 의 ``` 코드블록은 한 덩어리로 본다.
  //   package.json 을 그대로 옮겨 적은 블록 안의 한 줄만 떼어 보면,
  //   블록 바로 앞에 적어 둔 "11단원에서 배웁니다" 안내를 못 읽는다.
  const 블록머리 = new Array(lines.length).fill(-1);
  if (file.endsWith(".md")) {
    let 연곳 = -1;
    lines.forEach((line, i) => {
      if (!line.trimStart().startsWith("```")) return;
      if (연곳 === -1) 연곳 = i;
      else {
        for (let k = 연곳; k <= i; k++) 블록머리[k] = 연곳;
        연곳 = -1;
      }
    });
  }

  for (const [re, taughtAt, name] of RULES) {
    if (unit >= taughtAt) continue; // 배운 뒤면 자유롭게 써도 된다
    const hits = [];
    lines.forEach((line, i) => {
      if (!re.test(line)) return;
      if (봐줌.has(i)) return; // 학생이 읽지 않는 구역
      // DOM 의 .children 은 React 의 children 과 다른 것이다.
      //   자리.children.length 같은 줄까지 잡으면 헛 지적이 된다.
      if (name === "children" && /[.]children/.test(line) && !/props[.]children/.test(line))
        return;
      const 기준 = 블록머리[i] === -1 ? i : 블록머리[i];
      const around = lines.slice(Math.max(0, 기준 - 2), i + 3).join(" ");
      if (EXCUSE.test(around)) return; // 예고했으면 봐준다
      const decl = unitDecl[unit] && unitDecl[unit][name];
      if (decl && (decl.file === file || decl.idx < fileIdx)) {
        const k = `${String(unit).padStart(2, "0")}단원 ${name}`;
        예고봐줌[k] = 예고봐줌[k] || { n: 0, decl };
        예고봐줌[k].n++;
        return; // 단원 안에서 이미 정의+예고했다
      }
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
});

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
for (const [k, v] of Object.entries(예고봐줌)) {
  console.log(
    `ℹ ${k} ${v.n}곳 — 단원 내 정의·예고(${path.basename(path.dirname(v.decl.file))}/${path.basename(v.decl.file)} 줄 ${v.decl.line})로 봐줌`
  );
}
