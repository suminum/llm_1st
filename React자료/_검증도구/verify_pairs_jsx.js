// ============================================================
// 08~14단원 연습문제 ↔ 정답 대조기 (실습프로젝트용)
// ------------------------------------------------------------
//   node verify_pairs_jsx.js
//
// 연습문제의 `기대 결과` 에 따옴표로 적힌 문구를, 짝이 되는 정답 예제를
// dev 서버에서 실제로 열고 눌러 본 화면·콘솔에서 찾는다.
// 오답 진단 줄("~이면 ~것입니다")은 기대값이 아니므로 뺀다.
// ============================================================
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const SRC = "C:/Users/dongh/Desktop/React자료/실습프로젝트/src";
const URL = "http://localhost:5199/";

function expectedStrings(src) {
  const lines = src.split(/\r?\n/);
  const found = [];
  const isDiagnosis = (l) =>
    /것입니다|아닙니다|틀린|잘못|안 쓴|안 준|못 |확인하세요|바꾸면|바꿔|예상해/.test(l);
  for (let i = 0; i < lines.length; i++) {
    if (!/기대\s*결과/.test(lines[i])) continue;
    let block = lines[i];
    for (let j = i + 1; j < lines.length && j - i <= 6; j++) {
      const l = lines[j];
      if (/TODO|─+\s*문제|기대\s*결과/.test(l)) break;
      if (!/^\s*(\/\/|\s+)/.test(l)) break;
      block += "\n" + l;
    }
    for (const raw of block.split("\n")) {
      if (isDiagnosis(raw)) continue;
      for (const m of raw.matchAll(/"([^"\n]{2,40})"/g)) {
        const s = m[1].trim();
        if (/^[a-zA-Z0-9_\-./#]+$/.test(s)) continue;
        found.push({ line: i + 1, text: s });
      }
    }
  }
  return found;
}
const norm = (s) => String(s).replace(/\s+/g, " ").trim();

(async () => {
  // 연습문제 / 정답 짝, 그리고 종합 문제 / 정답 짝을 모은다
  const pairs = [];
  for (const unit of fs.readdirSync(SRC)) {
    const dir = path.join(SRC, unit);
    if (!/^\d\d_/.test(unit) || !fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/\.(jsx|tsx)$/.test(f) || /_정답\./.test(f)) continue;
      const ans = f.replace(/\.(jsx|tsx)$/, "_정답.$1");
      if (!fs.existsSync(path.join(dir, ans))) continue;
      pairs.push({
        unit,
        qFile: path.join(dir, f),
        aLabel: ans.replace(/\.(jsx|tsx)$/, "").replace(/_/g, " "),
        unitLabel: unit.replace(/_/g, " "),
      });
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  let logs = [];
  page.on("console", (m) => logs.push(m.text()));
  try {
    await page.goto(URL, { waitUntil: "networkidle0", timeout: 20000 });
  } catch {
    console.log("❌ dev 서버(5199)에 못 붙었습니다.");
    await browser.close();
    process.exit(2);
  }
  await new Promise((r) => setTimeout(r, 1000));

  let checked = 0;
  let missing = 0;
  for (const p of pairs) {
    const want = expectedStrings(fs.readFileSync(p.qFile, "utf8"));
    if (!want.length) continue;

    logs = [];
    // 단원 섹션 안에서 정확히 같은 이름을 고른다
    const ok = await page.evaluate(
      (u, l) => {
        for (const s of document.querySelectorAll(".sidebar section")) {
          const h2 = s.querySelector("h2");
          if (!h2 || h2.textContent.trim() !== u) continue;
          const btn = [...s.querySelectorAll(".navBtn")].find((b) => b.textContent.trim() === l);
          if (btn) {
            btn.click();
            return true;
          }
        }
        return false;
      },
      p.unitLabel,
      p.aLabel
    );
    if (!ok) {
      console.log(`\n=== ${p.unit} / ${path.basename(p.qFile)} ===\n  ❌ 정답 예제를 메뉴에서 못 찾음: ${p.aLabel}`);
      continue;
    }
    await new Promise((r) => setTimeout(r, 2600));

    const shots = [];
    const shoot = async () =>
      shots.push(norm(await page.$eval(".stage", (el) => el.innerText).catch(() => "")));

    // 예제가 메뉴 밖으로 튕겨 나가면(전체 새로고침 등) 다시 고른다
    const reselect = async () => {
      const still = await page
        .$eval(".navBtn.on", (el) => el.textContent.trim())
        .catch(() => null);
      if (still === p.aLabel) return;
      await page.goto(URL, { waitUntil: "networkidle0" }).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));
      await page.evaluate(
        (u, l) => {
          for (const s of document.querySelectorAll(".sidebar section")) {
            const h2 = s.querySelector("h2");
            if (!h2 || h2.textContent.trim() !== u) continue;
            const btn = [...s.querySelectorAll(".navBtn")].find((b) => b.textContent.trim() === l);
            if (btn) btn.click();
          }
        },
        p.unitLabel,
        p.aLabel
      );
      await new Promise((r) => setTimeout(r, 2000));
    };

    await shoot();
    for (let round = 0; round < 2; round++) {
      // ★ 링크도 눌러야 라우터 예제(11단원·종합04)의 화면에 들어갈 수 있다
      const links = await page.$$eval(".stage a", (els) => els.length);
      for (let i = 0; i < links; i++) {
        await page.$$eval(".stage a", (els, k) => els[k] && els[k].click(), i).catch(() => {});
        await new Promise((r) => setTimeout(r, 250));
        await reselect();
        await shoot();
        // 링크로 들어간 화면 안의 버튼·링크도 한 번씩
        const inner = await page.$$eval(".stage button", (els) => els.length);
        for (let j = 0; j < inner; j++) {
          await page.$$eval(".stage button", (els, k) => els[k] && els[k].click(), j).catch(() => {});
          await new Promise((r) => setTimeout(r, 90));
          await shoot();
        }
        const inner2 = await page.$$eval(".stage a", (els) => els.length);
        for (let j = 0; j < inner2; j++) {
          await page.$$eval(".stage a", (els, k) => els[k] && els[k].click(), j).catch(() => {});
          await new Promise((r) => setTimeout(r, 200));
          await reselect();
          await shoot();
        }
      }
      const n = await page.$$eval(".stage button", (els) => els.length);
      for (let i = 0; i < n; i++) {
        await page.$$eval(".stage button", (els, k) => els[k] && els[k].click(), i).catch(() => {});
        await new Promise((r) => setTimeout(r, 90));
        await shoot();
      }
    }
    const inputs = await page.$$(".stage input[type='text'], .stage input:not([type]), .stage textarea");
    for (const inp of inputs) {
      await inp.type("라떼").catch(() => {});
      await shoot();
    }
    await new Promise((r) => setTimeout(r, 700));
    await shoot();

    const hay = shots.join(" ⏐ ") + " | " + norm(logs.join(" | "));
    const miss = want.filter((w) => !hay.includes(norm(w.text)));
    checked += want.length;
    missing += miss.length;

    console.log(`\n=== ${p.unit} / ${path.basename(p.qFile)} ===`);
    console.log(`  문구 ${want.length}개 중 확인 ${want.length - miss.length}개`);
    miss.forEach((m) => console.log(`     ❔ 줄 ${m.line}: "${m.text}"`));
  }

  await browser.close();
  console.log(`\n총 ${checked}개 중 ${checked - missing}개 확인 / 못 찾은 것 ${missing}개`);
})();
