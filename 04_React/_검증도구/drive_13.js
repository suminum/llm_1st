// 13단원 종합01·02·03 정답 — 실제로 눌러 보고 값이 맞는지 확인
// (초기 데이터가 있는 것은 의도된 설계: FIRST_TODOS / FIRST_ITEMS)
const puppeteer = require("puppeteer-core");
// 크롬 경로 — OS 를 보고 고릅니다. 설치 위치가 다르면 CHROME_PATH 환경변수로 넘기세요.
//   예)  CHROME_PATH="/경로/chrome" node verify_jsx.js
const CHROME =
  process.env.CHROME_PATH ||
  (process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : process.platform === "linux"
      ? "/usr/bin/google-chrome"
      : "C:/Program Files/Google/Chrome/Application/chrome.exe");
const URL = "http://localhost:5199/";

const out = [];
const check = (name, actual, expected) => {
  const ok = String(actual) === String(expected);
  out.push({ name, ok });
  console.log(`${ok ? "✅" : "❌"} ${name}  |  실제: ${actual}  |  기대: ${expected}`);
};

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const stage = () => page.$eval(".stage", (el) => el.innerText.replace(/\s+/g, " ").trim());

  async function pick(label) {
    const got = await page.$$eval(".navBtn", (els, l) => {
      const el = els.find((e) => e.textContent.trim() === l);
      if (el) el.click();
      return el ? el.textContent.trim() : null;
    }, label);
    if (got !== label) throw new Error(`메뉴에서 못 찾음: ${label}`);
    await wait(2200);
  }
  async function clickBtn(text, scope = ".stage") {
    const ok = await page.$$eval(`${scope} button`, (els, t) => {
      const el = els.find((e) => e.textContent.trim() === t);
      if (el) el.click();
      return !!el;
    }, text);
    if (!ok) throw new Error(`버튼 없음: ${text}`);
    await wait(400);
  }
  // 정리 상자(.summary)를 뺀 '진짜 목록' 만 센다
  const listItems = (ulIndex = 0) =>
    page.evaluate((i) => {
      const uls = [...document.querySelectorAll(".stage ul")].filter(
        (ul) => !ul.closest(".summary")
      );
      const ul = uls[i];
      return ul ? [...ul.querySelectorAll("li")].map((li) => li.innerText.replace(/\s+/g, " ").trim()) : [];
    }, ulIndex);

  await page.goto(URL, { waitUntil: "networkidle0" });
  await wait(1200);

  // ─────────── 종합01 할 일 목록 ───────────
  console.log("\n──────── 종합01 할일목록 정답 ────────");
  await pick("종합01 할일목록 정답");
  const t0 = await listItems(0);
  check("01-① 초기 항목 2개(장보기·설거지)", t0.length, 2);
  check("01-①-2 개수 문구", /할 일 2개 \(완료 1개, 남은 일 1개\)/.test(await stage()), "true");

  await page.click(".stage input[type='text']");
  await page.type(".stage input[type='text']", "우유 사기");
  await clickBtn("추가");
  const t1 = await listItems(0);
  check("01-② 추가하면 3개", t1.length, 3);
  check("01-②-2 새 항목이 보인다", t1.some((x) => x.includes("우유 사기")), "true");
  check("01-②-3 개수 문구도 따라 바뀐다", /할 일 3개 \(완료 1개, 남은 일 2개\)/.test(await stage()), "true");

  await clickBtn("미완료");
  const t2 = await listItems(0);
  check("01-③ 미완료 필터 → 2개", t2.length, 2);
  check("01-③-2 완료된 '설거지' 가 빠진다", !t2.some((x) => x.includes("설거지")), "true");

  await clickBtn("전체");
  await clickBtn("완료 항목 삭제");
  const t3 = await listItems(0);
  check("01-④ 완료한 것만 지워진다", t3.length, 2);
  check("01-④-2 '설거지' 가 사라졌다", !t3.some((x) => x.includes("설거지")), "true");

  // ─────────── 종합02 장바구니 ───────────
  console.log("\n──────── 종합02 장바구니 정답 ────────");
  await pick("종합02 장바구니 정답");
  const c0 = await stage();
  check("02-① 초기 아메리카노 2잔 8000원", /아메리카노 × 2 = 8000원/.test(c0), "true");
  check("02-①-2 합계 8000원", /합계[^0-9]*8,?000\s*원/.test(c0), "true");

  // 메뉴판(첫 ul)의 두 번째 항목 = 라떼 담기
  await page.evaluate(() => {
    const uls = [...document.querySelectorAll(".stage ul")].filter((ul) => !ul.closest(".summary"));
    uls[0].querySelectorAll("li")[1].querySelector("button").click();
  });
  await wait(400);
  const c1 = await stage();
  check("02-② 라떼가 담긴다", /라떼 × 1/.test(c1), "true");
  check("02-②-2 합계 12500원", /합계[^0-9]*12,?500\s*원/.test(c1), "true");

  await clickBtn("전부 비우기");
  const c2 = await stage();
  check("02-③ 비우면 빈 상태 안내", /장바구니가 비었습니다/.test(c2), "true");

  // ─────────── 종합03 사용자 검색 ───────────
  console.log("\n──────── 종합03 사용자검색 정답 ────────");
  await pick("종합03 사용자검색 정답");
  await wait(2500);
  const s0 = await stage();
  check("03-① 서버에서 목록을 받아왔다", /Leanne|Graham/.test(s0), "true");

  await page.click(".stage input[type='text']");
  await page.type(".stage input[type='text']", "gwen");
  await wait(700);
  const s1 = await stage();
  check("03-② 검색이 걸러낸다(Leanne 남음)", /Leanne/.test(s1), "true");
  check("03-②-2 다른 사람은 빠진다", !/Ervin/.test(s1), "true");

  await page.$eval(".stage input[type='text']", (el) => (el.value = ""));
  await page.click(".stage input[type='text']");
  await page.type(".stage input[type='text']", "zzz");
  await wait(700);
  check("03-③ 결과 없음 안내", /검색 결과가 없/.test(await stage()), "true");

  console.log("\n페이지 에러:", errors.length ? errors : "없음");
  const failed = out.filter((r) => !r.ok);
  console.log(
    `\n${failed.length === 0 && errors.length === 0 ? "✅ 전부 통과" : `❌ 실패 ${failed.length}건: ${failed.map((f) => f.name).join(", ")}`}`
  );
  await browser.close();
  process.exit(failed.length === 0 && errors.length === 0 ? 0 : 1);
})();
