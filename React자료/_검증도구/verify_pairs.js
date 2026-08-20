// ============================================================
// 연습문제 ↔ 정답 대조기
// ------------------------------------------------------------
//   node verify_pairs.js            01~07단원(.html) 전부
//   node verify_pairs.js 04         04 로 시작하는 단원만
//
// 연습문제의 `기대 결과` 안에 따옴표로 적힌 실제 화면 문구를 뽑아,
// 짝이 되는 정답 파일을 실제로 돌려 나온 화면·콘솔에 그 문구가 있는지 본다.
//
// ※ 오탐이 나온다. 여러 번 눌러야 나오는 값, 타이핑해야 나오는 값은
//    버튼 한 번 클릭으로는 재현되지 않는다. 나온 것은 사람이 하나씩 판정할 것.
// ============================================================
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ROOT = "C:/Users/dongh/Desktop/React자료";
const filter = process.argv[2] || "";

// 연습문제에서 '기대 결과' 블록을 모아 따옴표 안 문구를 뽑는다
function expectedStrings(src) {
  const lines = src.split(/\r?\n/);
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/기대\s*결과/.test(lines[i])) continue;
    // 그 줄 + 이어지는 주석 줄(들여쓴 // 로 시작하고 '문제'/'TODO' 가 아닌 것)
    let block = lines[i];
    for (let j = i + 1; j < lines.length; j++) {
      const l = lines[j];
      if (!/^\s*(\/\/|\{?\s*\/\*|\s+)/.test(l)) break;
      if (/TODO|─+\s*문제|기대\s*결과/.test(l)) break;
      if (!/^\s*\/\//.test(l) && !/^\s+/.test(l)) break;
      block += "\n" + l;
      if (j - i > 6) break;
    }
    // ★ 오답 진단 줄("~이면 ~것입니다")의 따옴표는 기대값이 아니라 '틀렸을 때 나오는 것' 이다.
    //   그것까지 찾으려 하면 정답에서 안 나오는 게 당연해서 오탐만 쌓인다.
    const isDiagnosis = (l) => /것입니다|아닙니다|틀린|잘못|안 쓴|안 준|못 /.test(l);

    for (const raw of block.split("\n")) {
      if (isDiagnosis(raw)) continue;
      for (const m of raw.matchAll(/"([^"\n]{2,40})"/g)) {
        const s = m[1].trim();
        // 코드 조각·속성값은 뺀다
        if (/^[a-zA-Z0-9_\-./#]+$/.test(s)) continue;
        if (s.length < 2) continue;
        found.push({ line: i + 1, text: s });
      }
    }
  }
  return found;
}

const norm = (s) => String(s).replace(/\s+/g, " ").trim();

(async () => {
  const units = fs
    .readdirSync(ROOT)
    .filter((d) => /^\d\d_/.test(d) && fs.statSync(path.join(ROOT, d)).isDirectory())
    .filter((d) => !filter || d.includes(filter));

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--allow-file-access-from-files", "--no-sandbox"],
  });

  let totalMissing = 0;
  let totalChecked = 0;

  for (const unit of units) {
    const qPath = path.join(ROOT, unit, "연습문제.html");
    const aPath = path.join(ROOT, unit, "연습문제_정답.html");
    if (!fs.existsSync(qPath) || !fs.existsSync(aPath)) continue;

    const want = expectedStrings(fs.readFileSync(qPath, "utf8"));
    if (want.length === 0) continue;

    const page = await browser.newPage();
    const logs = [];
    page.on("console", (m) => logs.push(m.text()));
    await page.goto("file:///" + aPath.replace(/\\/g, "/"), { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1200));

    // ★ 화면을 '여러 시점' 에 걷는다.
    //   버튼을 다 눌러 버린 뒤에만 읽으면 "담은 개수: 0" 같은 처음 값을 놓친다.
    const shots = [];
    const shoot = async () => shots.push(norm(await page.evaluate(() => document.body.innerText)));

    await shoot(); // ① 아무것도 안 누른 처음 화면

    for (let round = 0; round < 3; round++) {
      const n = await page.$$eval("button", (els) => els.length);
      for (let i = 0; i < n; i++) {
        await page.$$eval("button", (els, k) => els[k] && els[k].click(), i).catch(() => {});
        await new Promise((r) => setTimeout(r, 60));
        await shoot(); // ② 버튼을 하나 누를 때마다
      }
    }
    // 입력칸에도 글자를 넣어 본다
    const inputs = await page.$$("input[type='text'], input:not([type])");
    for (const inp of inputs) {
      await inp.type("김민준").catch(() => {});
      await shoot();
    }
    await new Promise((r) => setTimeout(r, 600));
    await shoot();

    const consoleText = norm(logs.join(" | "));
    const haystack = shots.join(" ⏐ ") + " | " + consoleText;

    const missing = want.filter((w) => !haystack.includes(norm(w.text)));
    totalChecked += want.length;
    totalMissing += missing.length;

    console.log(`\n=== ${unit} ===`);
    console.log(`  기대 결과 속 문구 ${want.length}개 중 정답 화면·콘솔에서 확인 ${want.length - missing.length}개`);
    if (missing.length) {
      missing.forEach((m) => console.log(`     ❔ 줄 ${m.line}: "${m.text}"`));
    }
    await page.close();
  }

  await browser.close();
  console.log(
    `\n총 ${totalChecked}개 문구 중 ${totalChecked - totalMissing}개 확인 / 못 찾은 것 ${totalMissing}개`
  );
  console.log("못 찾은 것은 '틀렸다' 가 아니라 '자동으로 재현 못 했다' 입니다. 하나씩 판정하세요.");
})();
