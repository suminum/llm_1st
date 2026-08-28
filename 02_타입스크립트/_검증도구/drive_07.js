// ============================================================
// drive_07.js — 07단원을 진짜 크롬으로 열어 보는 검사기
// ------------------------------------------------------------
// 사용법:
//   1) 터미널 A: cd 07_React와_타입스크립트/실습프로젝트 && npm run dev
//   2) 터미널 B: node _검증도구/drive_07.js
//
// tsc 는 '타입' 만 봅니다. 화면이 실제로 그려지는지는 안 봅니다.
// JS자료·React자료에서 겪은 대로, 실행해 봐야만 잡히는 것이 따로 있습니다.
// 이 도구는 왼쪽 목록의 예제를 하나씩 눌러 보며 아래를 확인합니다.
//
//   · 콘솔 에러 · 페이지 에러
//   · ErrorBox 가 떴는지(예제가 터졌다는 뜻)
//   · 화면이 비어 있지 않은지
//   · 조작(버튼·입력·폼)이 실제로 동작하는지
// ============================================================

import puppeteer from "puppeteer-core";

const URL = process.env.URL ?? "http://localhost:5173/";
const CHROME =
  process.env.CHROME ??
  (process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "C:/Program Files/Google/Chrome/Application/chrome.exe");

let FAIL = 0;
const problems = [];
const fail = (where, msg) => { FAIL++; problems.push(`[${where}] ${msg}`); };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + String(e)));

  try {
    await page.goto(URL, { waitUntil: "networkidle0", timeout: 20000 });
  } catch {
    console.log(`개발 서버에 못 붙었습니다: ${URL}`);
    console.log("먼저 다른 터미널에서 npm run dev 를 켜 두세요.");
    await browser.close();
    process.exit(1);
  }

  const titles = await page.$$eval(".navBtn", (els) => els.map((e) => e.textContent ?? ""));
  console.log("=".repeat(64));
  console.log(`07단원 실제 브라우저 검사 — 예제 ${titles.length}개`);
  console.log("=".repeat(64));

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const failBefore = FAIL;
    consoleErrors.length = 0;

    const buttons = await page.$$(".navBtn");
    await buttons[i].click();
    await sleep(300);

    // 예제가 터지면 ErrorBox 가 뜬다
    const broke = await page.$(".errorBox");
    if (broke) {
      const text = await page.$eval(".errorBox pre", (e) => e.textContent ?? "");
      fail(title, `ErrorBox 가 떴습니다 — ${text.trim().split("\n")[0]}`);
    }

    // 화면이 비어 있지 않은지
    const stageText = await page.$eval(".stage", (e) => (e.textContent ?? "").trim());
    if (stageText.length < 10) fail(title, `화면이 거의 비어 있습니다 (${stageText.length}자)`);

    // 조작해 보기 — 무대 안의 버튼을 순서대로 누르고, 입력창에 글자를 넣는다
    const clicked = await page.$$eval(".stage button", (els) => els.length);
    for (let b = 0; b < Math.min(clicked, 8); b++) {
      const btns = await page.$$(".stage button");
      if (!btns[b]) break;
      await btns[b].click();
      await sleep(80);
    }
    const inputs = await page.$$(".stage input");
    for (const input of inputs) {
      await input.click({ clickCount: 3 });
      await input.type("라떼");
      await sleep(80);
    }
    // 폼이 있으면 제출까지
    const submit = await page.$('.stage button[type="submit"]');
    if (submit) { await submit.click(); await sleep(200); }

    await sleep(600); // setTimeout 을 쓰는 예제(개념04)를 기다린다

    const afterBroke = await page.$(".errorBox");
    if (afterBroke && !broke) {
      const text = await page.$eval(".errorBox pre", (e) => e.textContent ?? "");
      fail(title, `조작하니 터졌습니다 — ${text.trim().split("\n")[0]}`);
    }

    // 새로고침 경고: preventDefault 를 빠뜨리면 페이지가 이동한다
    const stillThere = await page.$(".sidebar");
    if (!stillThere) fail(title, "폼 제출로 페이지가 새로고침된 것 같습니다(preventDefault 확인)");

    if (consoleErrors.length) {
      fail(title, `콘솔 에러 ${consoleErrors.length}건 — ${consoleErrors[0].slice(0, 120)}`);
    }

    console.log(`  ${FAIL === failBefore ? "OK  " : "실패"} ${title}`);
  }

  await browser.close();

  console.log("\n" + "=".repeat(64));
  if (problems.length) { for (const p of problems) console.log(p); console.log(); }
  console.log(`예제 ${titles.length}개 · 문제 ${FAIL}건`);
  console.log("=".repeat(64));
  process.exit(FAIL ? 1 : 0);
}

main();
