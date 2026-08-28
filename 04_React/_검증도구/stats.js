// ============================================================
// 분량 통계 — README 와 수업_진행_가이드 의 숫자를 실제로 센다
// ------------------------------------------------------------
//   node stats.js            표로 출력
//   node stats.js --json     JSON 으로 출력
//
// 시간 산정 기준은 JS자료 수업_진행_가이드와 같게 맞춘다.
//   개념 섹션 4분 / ✏️ 3분 / 기본 5분 / [응용] 8분 / [도전] 12분 / 에러 확인 3분 / 종합 1단계 12분
// ============================================================
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "실습프로젝트/src");

const MIN = { section: 4, practice: 3, basic: 5, applied: 8, challenge: 12, errorCheck: 3, step: 12 };

function unitDirs() {
  const out = [];
  for (const d of fs.readdirSync(ROOT)) {
    const full = path.join(ROOT, d);
    if (/^\d\d_/.test(d) && fs.statSync(full).isDirectory()) out.push({ unit: d, dir: full });
  }
  if (fs.existsSync(SRC)) {
    for (const d of fs.readdirSync(SRC)) {
      const full = path.join(SRC, d);
      if (!/^\d\d_/.test(d) || !fs.statSync(full).isDirectory()) continue;
      const found = out.find((u) => u.unit === d);
      if (found) found.dir2 = full;
      else out.push({ unit: d, dir: full });
    }
  }
  return out.sort((a, b) => a.unit.localeCompare(b.unit, "ko"));
}

function filesOf(u) {
  const list = [];
  for (const dir of [u.dir, u.dir2].filter(Boolean)) {
    for (const f of fs.readdirSync(dir)) {
      if (/\.(html|jsx|tsx|md)$/.test(f)) list.push(path.join(dir, f));
    }
  }
  return list;
}

const rows = [];
let grand = { files: 0, lines: 0, nonEmpty: 0, sections: 0, practices: 0, questions: 0, steps: 0, korean: 0 };

for (const u of unitDirs()) {
  const files = filesOf(u);
  const r = {
    unit: u.unit,
    files: files.length,
    lines: 0,
    nonEmpty: 0,
    sections: 0,
    practices: 0,
    basic: 0,
    applied: 0,
    challenge: 0,
    errorCheck: 0,
    steps: 0,
    korean: 0,
  };

  for (const full of files) {
    const src = fs.readFileSync(full, "utf8");
    const lines = src.split(/\r?\n/);
    // macOS 는 한글 파일명을 자모 분해형(NFD)으로 돌려줍니다.
    // 아래 /^개념/ 같은 완성형 정규식과 맞추려면 NFC 로 되돌려야 합니다.
    const base = path.basename(full).normalize("NFC");
    r.lines += lines.length;
    r.nonEmpty += lines.filter((l) => l.trim() !== "").length;
    r.korean += (src.match(/[가-힣]/g) || []).length;

    if (/^개념/.test(base)) {
      r.sections += (src.match(/──\s*섹션\s*\d+\s*:/g) || []).length;
      if (/\.md$/.test(base)) r.sections += (src.match(/^##\s+/gm) || []).length;
      r.practices += (src.match(/✏️\s*직접\s*해보기\s*\d+/g) || []).length;
    }
    if (/^연습문제\./.test(base)) {
      const qs = [...src.matchAll(/─+\s*문제\s*(\d+)\s*─+(.*)$/gm)];
      for (const q of qs) {
        const line = q[0];
        const idx = src.indexOf(line);
        const body = src.slice(idx, idx + 900);
        if (/에러\s*확인/.test(line + body.slice(0, 200))) r.errorCheck++;
        else if (/\[도전\]/.test(line)) r.challenge++;
        else if (/\[응용\]/.test(line)) r.applied++;
        else r.basic++;
      }
    }
    if (/^종합\d+_.*(?<!정답)\.(jsx|tsx|html|js)$/.test(base)) {
      r.steps += (src.match(/─+\s*(문제|단계)\s*\d+\s*─+/g) || []).length;
    }
  }

  r.questions = r.basic + r.applied + r.challenge + r.errorCheck;
  r.conceptMin = r.sections * MIN.section + r.practices * MIN.practice;
  r.practiceMin =
    r.basic * MIN.basic +
    r.applied * MIN.applied +
    r.challenge * MIN.challenge +
    r.errorCheck * MIN.errorCheck +
    r.steps * MIN.step;
  r.totalMin = r.conceptMin + r.practiceMin;

  rows.push(r);
  for (const k of ["files", "lines", "nonEmpty", "sections", "practices", "questions", "steps", "korean"])
    grand[k] += r[k];
}

grand.conceptMin = rows.reduce((a, r) => a + r.conceptMin, 0);
grand.practiceMin = rows.reduce((a, r) => a + r.practiceMin, 0);
grand.totalMin = grand.conceptMin + grand.practiceMin;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ rows, grand }, null, 2));
} else {
  const h = (n, w) => String(n).padStart(w);
  console.log("| 단원 | 파일 | 줄 | 섹션 | ✏️ | 문제 | 개념(분) | 연습(분) | 합계 |");
  console.log("|---|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const r of rows) {
    console.log(
      `| ${r.unit} | ${h(r.files, 2)} | ${h(r.lines, 6)} | ${h(r.sections, 3)} | ${h(r.practices, 3)} | ${h(
        r.questions + r.steps,
        3
      )} | ${h(r.conceptMin, 4)} | ${h(r.practiceMin, 4)} | **${r.totalMin}분 (${(r.totalMin / 60).toFixed(1)}h)** |`
    );
  }
  console.log(
    `| **합계** | **${grand.files}** | **${grand.lines}** | **${grand.sections}** | **${grand.practices}** | **${
      grand.questions + grand.steps
    }** | **${grand.conceptMin}** | **${grand.practiceMin}** | **${grand.totalMin}분 (${(
      grand.totalMin / 60
    ).toFixed(1)}h)** |`
  );
  console.log(
    `\n빈 줄 제외 ${grand.nonEmpty}줄 / 한글 설명 ${grand.korean.toLocaleString()}자 / 개념 ${(
      (grand.conceptMin / grand.totalMin) *
      100
    ).toFixed(0)}% : 연습 ${((grand.practiceMin / grand.totalMin) * 100).toFixed(0)}%`
  );
}
