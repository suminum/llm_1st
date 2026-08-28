// ============================================================
// 08~15단원 연습문제 ↔ 정답 대조기 (실습프로젝트용)
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

// 크롬 경로 — OS 를 보고 고릅니다. 설치 위치가 다르면 CHROME_PATH 환경변수로 넘기세요.
//   예)  CHROME_PATH="/경로/chrome" node verify_jsx.js
const CHROME =
  process.env.CHROME_PATH ||
  (process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : process.platform === "linux"
      ? "/usr/bin/google-chrome"
      : "C:/Program Files/Google/Chrome/Application/chrome.exe");
const SRC = path.resolve(__dirname, "../실습프로젝트/src");
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
    const rows = block.split("\n");
    for (let k = 0; k < rows.length; k++) {
      const raw = rows[k];
      if (isDiagnosis(raw)) continue;
      // ★ "다음 줄이 진단문이면 이 줄도 거른다" 류의 두줄 필터를 넣지 말 것.
      //   이 자료는 기대값 문장 뒤에 진단 문장이 따라오는 배치가 흔해서,
      //   8-24 실측으로 넓은 판은 진짜 기대값 53개, 좁힌 판도 27개를 조용히 빼먹었다.
      //   두 줄에 걸친 진단 문구는 그냥 ❔ 로 보이게 두고 눈으로 판정한다.
      for (const m of raw.matchAll(/"([^"\n]{2,40})"/g)) {
        const s = m[1].trim();
        if (/^[a-zA-Z0-9_\-./#]+$/.test(s)) continue;
        // "…" 는 자리표시 표기라 화면에 그대로 나오는 문자열이 아니다.
        // (" / "=줄바꿈 표기는 진짜 슬래시일 수도 있어 거르지 않는다 — 안 맞으면 ❔ 로 보인다)
        if (/…/.test(s)) continue;
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
        // macOS 는 한글 파일명을 NFD 로 돌려줍니다. 메뉴 글자와 맞추려면 NFC 로 되돌립니다.
        aLabel: ans.replace(/\.(jsx|tsx)$/, "").replace(/_/g, " ").normalize("NFC"),
        unitLabel: unit.replace(/_/g, " ").normalize("NFC"),
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
          if (!h2 || h2.textContent.trim().normalize("NFC") !== u) continue;
          const btn = [...s.querySelectorAll(".navBtn")].find(
            (b) => b.textContent.trim().normalize("NFC") === l
          );
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
      if (still && still.normalize("NFC") === p.aLabel) return;
      await page.goto(URL, { waitUntil: "networkidle0" }).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));
      await page.evaluate(
        (u, l) => {
          for (const s of document.querySelectorAll(".sidebar section")) {
            const h2 = s.querySelector("h2");
            if (!h2 || h2.textContent.trim().normalize("NFC") !== u) continue;
            const btn = [...s.querySelectorAll(".navBtn")].find(
              (b) => b.textContent.trim().normalize("NFC") === l
            );
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
