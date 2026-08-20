// ============================================================
// React 자료 08~14단원(실습프로젝트 .jsx) 검증기
// ------------------------------------------------------------
//   node verify_jsx.js [단원폴더이름조각] [--url http://localhost:5199/]
//   예) node verify_jsx.js 09          → 09 로 시작하는 단원만
//       node verify_jsx.js             → 전부
//
//  ① 메뉴의 예제를 하나씩 눌러 실제로 그려지는지 본다
//  ② 예제마다 콘솔 에러 / React 경고를 잡는다
//  ③ 파일에 적힌 // 콘솔: 값이 실제로 나오는지 대조한다
//  ④ 화면이 비어 있는 예제를 잡는다
//
//  ※ dev 서버가 떠 있어야 한다:  npm run dev -- --port 5199
//  ※ StrictMode 때문에 개발 중에는 같은 로그가 두 번 찍힐 수 있다(정상).
//     대조는 '들어 있는지' 로 하므로 중복은 문제되지 않는다.
// ============================================================
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const SRC = "C:/Users/dongh/Desktop/React자료/실습프로젝트/src";
const filter = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "";
const urlArg = process.argv.indexOf("--url");
const URL = urlArg > -1 ? process.argv[urlArg + 1] : "http://localhost:5199/";

function fmt(v) {
  if (typeof v === "string") return v;
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (Array.isArray(v)) return "[" + v.map(inner).join(", ") + "]";
  if (typeof v === "object") {
    const b = Object.entries(v).map(([k, x]) => `${k}: ${inner(x)}`).join(", ");
    return "{" + (b ? " " + b + " " : "") + "}";
  }
  return String(v);
}
function inner(v) {
  if (typeof v === "string") return `'${v}'`;
  if (Array.isArray(v)) return "[" + v.map(inner).join(", ") + "]";
  if (v && typeof v === "object") {
    const b = Object.entries(v).map(([k, x]) => `${k}: ${inner(x)}`).join(", ");
    return "{" + (b ? " " + b + " " : "") + "}";
  }
  return String(v);
}
const norm = (s) => String(s).replace(/\s+/g, " ").replace(/["']/g, "'").trim();

function annotated(src) {
  return src
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*\/\/ 콘솔: ?(.*)$/))
    .filter(Boolean)
    .map((m) => m[1])
    .filter((s) => s.trim() !== "");
}

// 일부러 내는 경고를 파일이 선언할 수 있다:  // 검증: 경고허용 <문구>
function allowedWarnings(src) {
  return src
    .split(/\r?\n/)
    .map((l) => l.match(/\/\/ 검증: ?경고허용 ?(.+)$/))
    .filter(Boolean)
    .map((m) => m[1].trim())
    .filter(Boolean);
}

// src 안의 단원 폴더 → 파일 목록
function listFiles() {
  if (!fs.existsSync(SRC)) return [];
  const out = [];
  for (const unit of fs.readdirSync(SRC)) {
    if (!/^\d\d_/.test(unit)) continue;
    if (filter && !unit.includes(filter)) continue;
    const dir = path.join(SRC, unit);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".jsx") && !f.endsWith(".tsx")) continue;
      out.push({
        unit,
        file: f,
        full: path.join(dir, f),
        // App.jsx 가 메뉴에 보여 주는 이름과 같은 규칙
        label: f.replace(/\.(jsx|tsx)$/, "").replace(/_/g, " "),
      });
    }
  }
  return out.sort((a, b) => (a.unit + a.file).localeCompare(b.unit + b.file, "ko"));
}

(async () => {
  const files = listFiles();
  if (files.length === 0) {
    console.log("검사할 .jsx 가 없습니다. (src 아래 NN_이름 폴더에 넣으세요)");
    process.exit(0);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  let logs = [];
  let errors = [];
  let warns = [];
  let pending = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    const type = m.type();
    const bucket = type === "error" ? errors : /^warn/.test(type) ? warns : logs;
    const slot = bucket.push("(대기)") - 1;
    pending.push(
      (async () => {
        let text;
        try {
          const vals = await Promise.all(m.args().map((a) => a.jsonValue().catch(() => "?")));
          text = vals.map(fmt).join(" ");
        } catch {
          text = "";
        }
        // 인자가 없는 브라우저 자체 메시지(404 등)는 text() 로 받아야 내용이 남는다
        if (!text) text = m.text();
        bucket[slot] = text;
      })()
    );
  });

  try {
    await page.goto(URL, { waitUntil: "networkidle0", timeout: 20000 });
  } catch {
    console.log(`❌ dev 서버에 못 붙었습니다: ${URL}`);
    console.log(`   실습프로젝트에서 먼저 실행하세요:  npm run dev -- --port 5199`);
    await browser.close();
    process.exit(2);
  }
  await new Promise((r) => setTimeout(r, 1000));

  const menu = await page.$$eval(".navBtn", (els) => els.map((e) => e.textContent.trim()));
  console.log(`메뉴에 잡힌 예제 ${menu.length}개 / 검사 대상 파일 ${files.length}개\n`);

  // 단원마다 연습문제.jsx 처럼 이름이 겹치므로 '그 단원 섹션 안에서' 찾는다.
  // (menu.indexOf 로 찾으면 늘 앞 단원의 같은 이름 파일이 잡힌다)
  async function findIndex(unitLabel, label) {
    return await page.evaluate(
      (u, l) => {
        const all = Array.from(document.querySelectorAll(".navBtn"));
        for (const s of document.querySelectorAll(".sidebar section")) {
          const h2 = s.querySelector("h2");
          if (!h2 || h2.textContent.trim() !== u) continue;
          const btn = Array.from(s.querySelectorAll(".navBtn")).find(
            (b) => b.textContent.trim() === l
          );
          if (btn) return all.indexOf(btn);
        }
        return -1;
      },
      unitLabel,
      label
    );
  }

  let bad = 0;
  for (const f of files) {
    const idx = await findIndex(f.unit.replace(/_/g, " "), f.label);
    console.log(`=== ${f.unit} / ${f.file} ===`);
    if (idx === -1) {
      console.log(`  ❌ 메뉴에 없습니다 (기대한 이름: "${f.label}") — 파일 위치나 export default 확인`);
      bad++;
      continue;
    }

    logs = [];
    errors = [];
    warns = [];
    pending = [];
    await page.$$eval(".navBtn", (els, i) => els[i].click(), idx);
    await new Promise((r) => setTimeout(r, 900));

    // 버튼을 한 번씩 눌러 본다 (메뉴 버튼은 빼고)
    const btns = await page.$$eval(".stage button", (els) => els.length);
    for (let i = 0; i < btns; i++) {
      await page.$$eval(".stage button", (els, k) => els[k] && els[k].click(), i).catch(() => {});
      await new Promise((r) => setTimeout(r, 120));
    }
    await new Promise((r) => setTimeout(r, 600));
    await Promise.all(pending);

    const problems = [];
    const stageText = await page.$eval(".stage", (el) => el.innerText.trim()).catch(() => "");
    if (!stageText) problems.push("화면이 비어 있음 — 아무것도 그리지 못했습니다");
    const crashed = await page.$(".errorBox");
    if (crashed) {
      const msg = await page.$eval(".errorBox pre", (el) => el.textContent).catch(() => "");
      problems.push("예제가 터졌습니다: " + msg);
    }
    const src = fs.readFileSync(f.full, "utf8");
    const allow = allowedWarnings(src);
    const isAllowed = (s) => allow.some((a) => s.includes(a));

    // 404 를 일부러 내는 예제(에러 처리 연습)는 브라우저가 빨간 줄을 찍는다. 이건 정상이다.
    const isNetworkNote = (e) => /Failed to load resource/.test(e);
    const notes = errors.filter(isNetworkNote);
    const realErrors = errors.filter((e) => !isNetworkNote(e) && !isAllowed(e));
    if (notes.length) console.log(`  · 참고: 브라우저 네트워크 메시지 ${notes.length}건 (404 연습이면 정상) — ${notes[0].slice(0, 80)}`);
    if (realErrors.length) problems.push(...realErrors.map((e) => "에러: " + e));

    const realWarns = warns.filter((w) => !isAllowed(w));
    const intended = [...errors, ...warns].filter(isAllowed);
    if (realWarns.length) problems.push(...realWarns.map((w) => "React 경고: " + w.slice(0, 200)));
    if (intended.length) {
      console.log(`  · 의도된 경고 ${intended.length}건 (파일이 선언함)`);
      intended.forEach((w) => console.log(`     ${w.slice(0, 120)}`));
    }
    const unfired = allow.filter((a) => ![...errors, ...warns].some((s) => s.includes(a)));
    if (unfired.length) {
      problems.push(
        `경고허용으로 선언했는데 실제로는 안 난 문구 ${unfired.length}건: ${unfired.join(" / ")} — 자료 설명과 실제가 다릅니다`
      );
    }

    const want = annotated(src);
    const haveNorm = logs.map(norm);
    const missing = want.filter((w) => !haveNorm.some((h) => h === norm(w) || h.includes(norm(w))));

    console.log(`  적힌 // 콘솔: ${want.length}개 / 실제 콘솔 ${logs.length}줄`);
    if (missing.length) {
      console.log(`  ⚠ 실제로 안 나온 // 콘솔: ${missing.length}개`);
      missing.forEach((m) => console.log(`     적힘: ${m}`));
      console.log("  --- 실제 콘솔 전체 ---");
      logs.forEach((l) => console.log(`     ${l}`));
    }
    if (problems.length) {
      bad++;
      problems.forEach((p) => console.log(`  ❌ ${p}`));
    } else if (!missing.length) {
      console.log("  ✅ 이상 없음");
    }
  }

  await browser.close();
  console.log(`\n검사 ${files.length}개 / 문제 있는 파일 ${bad}개`);
  process.exit(bad ? 1 : 0);
})();
