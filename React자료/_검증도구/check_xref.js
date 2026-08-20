// ============================================================
// 교차 참조 검사기 — "JS자료 NN단원 ○○" 이 실제로 맞는지 본다
// ------------------------------------------------------------
//   node check_xref.js
//
// 자료 곳곳에서 JS자료의 단원을 인용한다. 번호를 잘못 적으면
// 학생이 엉뚱한 파일을 펴 보게 되므로 전수로 확인한다.
// (실제로 "JS자료 04단원 객체" 처럼 틀린 곳이 있었다 — 객체는 07단원)
// ============================================================
const fs = require("fs");
const path = require("path");

const ROOT = "C:/Users/dongh/Desktop/React자료";
const SRC = path.join(ROOT, "실습프로젝트/src");

// JS자료 실제 구성 (C:\Users\dongh\Desktop\JS자료)
const JS_UNITS = {
  1: { name: "변수와 자료형", keys: ["변수", "let", "const", "자료형", "형변환", "문자열", "숫자", "불리언", "undefined", "null", "typeof", "console.log", "Number("] },
  2: { name: "연산자", keys: ["연산자", "산술", "비교", "논리", "템플릿", "증감", "나머지", "Math", "toFixed", "소수"] },
  3: { name: "조건문", keys: ["조건", "if", "else", "switch", "삼항", "falsy", "truthy"] },
  4: { name: "반복문", keys: ["반복", "for", "while", "break", "continue", "중첩"] },
  5: { name: "함수", keys: ["함수", "return", "매개변수", "인자", "화살표", "스코프", "ASI"] },
  6: { name: "배열", keys: ["배열", "push", "slice", "splice", "인덱스", "join", "includes", "indexOf", "length"] },
  7: { name: "객체와 메소드", keys: ["객체", "메소드", "this", "순회", "속성", "키"] },
  8: { name: "콜백과 내장메소드", keys: ["콜백", "forEach", "map", "filter", "find", "reduce", "sort"] },
  9: { name: "구조분해와 스프레드", keys: ["구조분해", "스프레드", "나머지 매개변수", "얕은 복사", "..."] },
  10: { name: "DOM 조작", keys: ["DOM", "querySelector", "createElement", "classList", "textContent", "appendChild", "innerHTML"] },
  11: { name: "이벤트", keys: ["이벤트", "addEventListener", "click", "input", "change", "submit", "preventDefault", "위임", "dataset", "e.target"] },
  12: { name: "비동기", keys: ["비동기", "fetch", "Promise", "async", "await", "setTimeout", "에러", "try", "catch", "res.ok", "then"] },
  13: { name: "종합 연습", keys: ["종합", "할일", "장바구니", "성적", "사용자검색"] },
};

function collect() {
  const out = [];
  const push = (dir) => {
    for (const f of fs.readdirSync(dir)) {
      if (/\.(html|jsx|tsx|md)$/.test(f)) out.push(path.join(dir, f));
    }
  };
  for (const d of fs.readdirSync(ROOT)) {
    const full = path.join(ROOT, d);
    if (/^\d\d_/.test(d) && fs.statSync(full).isDirectory()) push(full);
  }
  if (fs.existsSync(SRC)) {
    for (const d of fs.readdirSync(SRC)) {
      const full = path.join(SRC, d);
      if (/^\d\d_/.test(d) && fs.statSync(full).isDirectory()) push(full);
    }
  }
  return out;
}

let hits = 0;
let checked = 0;
for (const file of collect()) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const flagged = [];
  lines.forEach((line, i) => {
    // "JS자료 07단원" 또는 "JS자료 07단원 개념03" 형태
    const re = /JS자료\s*(\d{1,2})\s*단원([^\n]{0,60})/g;
    let m;
    while ((m = re.exec(line))) {
      checked++;
      const n = Number(m[1]);
      const unit = JS_UNITS[n];
      if (!unit) {
        flagged.push(`줄 ${i + 1}: JS자료에 ${n}단원은 없습니다 — ${line.trim().slice(0, 90)}`);
        continue;
      }
      const tail = m[2];
      // 뒤에 붙은 설명이 그 단원 키워드와 하나라도 맞으면 통과
      const ok = unit.keys.some((k) => tail.includes(k));
      // 설명이 아예 없으면(개념 번호만 있거나 문장 끝) 판정 불가로 넘어간다
      const hasWord = /[가-힣A-Za-z]/.test(tail.replace(/개념\s*\d+/g, "").replace(/[^가-힣A-Za-z]/g, ""));
      if (!ok && hasWord) {
        // 다른 단원 키워드에 '더 잘' 맞을 때만 보고한다.
        // (맞는 참조인데 문장에 키워드가 없을 뿐인 경우가 훨씬 많아서, 그건 걸러야 쓸모가 있다)
        const better = Object.entries(JS_UNITS)
          .filter(([k2, u]) => Number(k2) !== n && u.keys.some((k) => tail.includes(k)))
          .map(([k2, u]) => `${k2}단원(${u.name})`);
        if (better.length === 0) continue;
        flagged.push(
          `줄 ${i + 1}: "JS자료 ${n}단원(${unit.name})" → ${better.join(", ")} 아닌가요?\n            ${line
            .trim()
            .slice(0, 110)}`
        );
      }
    }
  });
  if (flagged.length) {
    hits += flagged.length;
    console.log(`\n${path.basename(path.dirname(file))}/${path.basename(file)}`);
    flagged.forEach((f) => console.log("  ⚠ " + f));
  }
}

console.log(
  hits === 0
    ? `\n✅ 교차 참조 이상 없음 (JS자료 인용 ${checked}건 검사)`
    : `\n의심 ${hits}건 / JS자료 인용 ${checked}건 검사 — 하나씩 직접 확인하세요`
);
