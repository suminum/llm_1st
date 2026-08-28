// ============================================================
// 구조 감사기 — 실행하지 않고 파일 구조만 본다
// ------------------------------------------------------------
//   node audit.js [단원폴더이름조각]
//
//  ① ✏️ 번호가 1부터 빠짐없이 이어지는가
//  ② ✏️ 마다 '직접 해보기 정답' 블록에 항목이 있는가
//  ③ '자주 하는 실수' 를 뺀 모든 섹션에 ✏️ 가 하나 이상 있는가
//  ④ 정리가 화면에 렌더링되는가 (summary / <Summary)
//  ⑤ 연습문제의 모든 문항에 '기대 결과' 가 있는가
//  ⑥ SyntaxError 실수 항목이 있으면 머리에 경고 문구가 있는가
//  ⑦ 주석·문자열 안의 </script>
// ============================================================
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "실습프로젝트/src");
const filter = process.argv[2] || "";

function collect() {
  const out = [];
  const push = (dir, d) => {
    for (const f of fs.readdirSync(dir)) {
      if (!/\.(html|jsx|tsx)$/.test(f)) continue;
      // macOS 는 한글 파일명을 자모 분해형(NFD)으로 돌려줍니다.
      // 아래 /^개념/ 같은 완성형 정규식과 맞추려면 NFC 로 되돌려야 합니다.
      // full 은 파일을 실제로 읽는 경로라 원본 그대로 둡니다.
      out.push({ unit: d.normalize("NFC"), file: f.normalize("NFC"), full: path.join(dir, f) });
    }
  };
  for (const d of fs.readdirSync(ROOT)) {
    const full = path.join(ROOT, d);
    if (!/^\d\d_/.test(d) || !fs.statSync(full).isDirectory()) continue;
    if (filter && !d.includes(filter)) continue;
    push(full, d);
  }
  if (fs.existsSync(SRC)) {
    for (const d of fs.readdirSync(SRC)) {
      const full = path.join(SRC, d);
      if (!/^\d\d_/.test(d) || !fs.statSync(full).isDirectory()) continue;
      if (filter && !d.includes(filter)) continue;
      push(full, d);
    }
  }
  return out.sort((a, b) => (a.unit + a.file).localeCompare(b.unit + b.file, "ko"));
}

let totalProblems = 0;
const files = collect();
let curUnit = "";

for (const f of files) {
  const src = fs.readFileSync(f.full, "utf8");
  const lines = src.split(/\r?\n/);
  const problems = [];
  const isExercise = /연습문제/.test(f.file);
  const isAnswer = /정답/.test(f.file);
  const isConcept = /^개념/.test(f.file);
  const isSummaryDoc = /\.md$/.test(f.file);

  // ⑦ </script> 짝
  if (/\.html$/.test(f.file)) {
    const open = (src.match(/<script/g) || []).length;
    const close = (src.match(/<\/script>/g) || []).length;
    if (open !== close) problems.push(`script 태그 짝 불일치 (열림 ${open} / 닫힘 ${close})`);
  }

  if (isConcept && !isSummaryDoc) {
    // ① ✏️ 번호
    const nums = [];
    lines.forEach((l) => {
      const m = l.match(/✏️\s*직접\s*해보기\s*(\d+)/);
      if (m) nums.push(Number(m[1]));
    });
    if (nums.length === 0) problems.push("✏️ 직접 해보기가 하나도 없음");
    else {
      const expected = Array.from({ length: nums.length }, (_, i) => i + 1);
      if (JSON.stringify(nums) !== JSON.stringify(expected))
        problems.push(`✏️ 번호가 어긋남: [${nums.join(", ")}] (기대: 1~${nums.length})`);
    }

    // ② 정답 블록
    const ansStart = lines.findIndex((l) => /직접\s*해보기\s*정답/.test(l));
    if (ansStart === -1) {
      if (nums.length) problems.push("'직접 해보기 정답' 블록이 없음");
    } else {
      const tail = lines.slice(ansStart).join("\n");
      const answered = new Set();
      for (const m of tail.matchAll(/^\s*\/\/\s*(\d+)\)/gm)) answered.add(Number(m[1]));
      const missing = nums.filter((n) => !answered.has(n));
      if (missing.length) problems.push(`정답이 없는 ✏️: ${missing.join(", ")}`);
    }

    // ③ 섹션 커버리지
    const sections = [];
    lines.forEach((l, i) => {
      const m = l.match(/──\s*섹션\s*(\d+)\s*:\s*(.+?)\s*──/);
      if (m) sections.push({ n: Number(m[1]), title: m[2], line: i });
    });
    if (sections.length === 0) problems.push("'── 섹션 N: 제목 ──' 이 하나도 없음");
    sections.forEach((s, i) => {
      if (/자주\s*하는\s*(실수|오해)/.test(s.title)) return;
      const end = i + 1 < sections.length ? sections[i + 1].line : lines.length;
      const body = lines.slice(s.line, end).join("\n");
      if (!/✏️/.test(body)) problems.push(`섹션 ${s.n}(${s.title})에 ✏️ 가 없음`);
    });
    // 섹션 번호 연속성
    const sn = sections.map((s) => s.n);
    const expectedSn = Array.from({ length: sn.length }, (_, i) => i + 1);
    if (JSON.stringify(sn) !== JSON.stringify(expectedSn))
      problems.push(`섹션 번호가 어긋남: [${sn.join(", ")}]`);

    // ④ 정리가 화면에 렌더링되는가
    const rendered = /class="summary"|className="summary"|<Summary\b/.test(src);
    if (!rendered) problems.push("정리가 화면에 렌더링되지 않음 (summary 상자 없음)");
    // 정리를 주석으로 중복해 쓰지 않았는지
    if (/^\s*\/\/\s*──\s*정리\s*──/m.test(src))
      problems.push("정리를 주석으로도 씀 (화면 렌더링과 중복 — 한쪽만 두세요)");

    // ⑥ SyntaxError 경고 문구
    // "이 섹션에는 SyntaxError 항목이 없습니다" 같은 문장은 해당 없음
    const hasSyntaxItem = lines.some(
      (l) => /SyntaxError/.test(l) && !/없습니다|없음|해당\s*없/.test(l)
    );
    if (hasSyntaxItem && !/눈으로만/.test(src))
      problems.push("SyntaxError 실수 항목이 있는데 '눈으로만 보세요' 안내가 없음");
  }

  if (isExercise && !isAnswer) {
    // ⑤ 문항마다 기대 결과
    const qs = [];
    lines.forEach((l, i) => {
      const m = l.match(/─+\s*문제\s*(\d+)\s*─+/);
      if (m) qs.push({ n: Number(m[1]), line: i });
    });
    if (qs.length === 0) problems.push("'───── 문제 N ─────' 이 하나도 없음");
    qs.forEach((q, i) => {
      const end = i + 1 < qs.length ? qs[i + 1].line : lines.length;
      const body = lines.slice(q.line, end).join("\n");
      // 에러 확인 문항과 '먼저 예상해 보세요' 문항은 기대 결과를 일부러 비워 둔다
      if (/에러\s*확인|예상해\s*보|빈칸|______/.test(body)) return;
      if (!/기대\s*(출력|결과)/.test(body)) problems.push(`문제 ${q.n}에 '기대 결과' 가 없음`);
    });
    const qn = qs.map((q) => q.n);
    const expectedQn = Array.from({ length: qn.length }, (_, i) => i + 1);
    if (JSON.stringify(qn) !== JSON.stringify(expectedQn))
      problems.push(`문제 번호가 어긋남: [${qn.join(", ")}]`);
    // 난이도 표기
    if (!/\[응용\]/.test(src)) problems.push("[응용] 문항이 없음");
    if (!/\[도전\]/.test(src)) problems.push("[도전] 문항이 없음");
  }

  if (problems.length) {
    if (curUnit !== f.unit) {
      console.log(`\n[${f.unit}]`);
      curUnit = f.unit;
    }
    console.log(`  ${f.file}`);
    problems.forEach((p) => console.log(`    ⚠ ${p}`));
    totalProblems += problems.length;
  }
}

console.log(
  totalProblems === 0
    ? `\n✅ 구조 문제 없음 (검사 ${files.length}개 파일)`
    : `\n총 ${totalProblems}건 (검사 ${files.length}개 파일)`
);
