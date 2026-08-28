// 종합04 메모장 정답 — 실제 조작 검증
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

const results = [];
function check(name, actual, expected) {
  const ok = String(actual) === String(expected);
  results.push({ name, actual, expected, ok });
  console.log(`${ok ? "✅" : "❌"} ${name}\n     실제: ${actual}\n     기대: ${expected}`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const logs = [];
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text());
    else logs.push(m.text());
  });

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const stage = () => page.$eval(".stage", (el) => el.innerText.replace(/\s+/g, " ").trim());
  async function clickText(sel, text) {
    const ok = await page.$$eval(
      sel,
      (els, t) => {
        const el = els.find((e) => e.textContent.trim().includes(t));
        if (el) el.click();
        return !!el;
      },
      text
    );
    if (!ok) throw new Error(`못 찾음: ${sel} "${text}"`);
    await wait(500);
  }

  await page.goto(URL, { waitUntil: "networkidle0" });
  await wait(1000);

  // 메뉴에서 종합04 정답 고르기
  await clickText(".navBtn", "종합04 메모장 정답");
  await wait(2500);

  // 1) 처음에는 StartHere 안내
  check("① 처음 안내", (await stage()).includes("눌러 시작하세요"), "true");

  // 2) 메모 목록
  await clickText(".stage a", "메모 목록");
  await wait(600);
  const listText = await stage();
  check("② 목록 개수", /메모 5개/.test(listText), "true");

  // 3) 첫 메모 상세로
  const firstTitle = await page.$$eval(".stage ul li a", (els) => els[0].textContent.trim());
  await page.$$eval(".stage ul li a", (els) => els[0].click());
  await wait(700);
  const inputVal = await page.$eval(".stage input", (el) => el.value);
  check("③ 상세 입력칸에 제목이 채워짐", inputVal === firstTitle, "true");
  const idLog = logs.filter((l) => l.includes("주소에서 받은 id")).pop();
  check("③-2 useParams 는 문자열", /string/.test(idLog || ""), "true");

  // 4) 제목을 고치고 저장 → 목록으로 돌아오고 제목이 바뀌어 있어야 한다
  await page.$eval(".stage input", (el) => {
    el.value = "";
  });
  await page.click(".stage input");
  await page.type(".stage input", "아메리카노 사기");
  await clickText(".stage button", "저장");
  await wait(700);
  const afterEdit = await stage();
  check("④ 저장 후 목록으로 이동", /메모 5개/.test(afterEdit), "true");
  check("④-2 고친 제목이 목록에 보임", afterEdit.includes("아메리카노 사기"), "true");

  // 5) 그 메모를 열어 삭제
  await clickText(".stage ul li a", "아메리카노 사기");
  await wait(600);
  await clickText(".stage button", "삭제");
  await wait(700);
  const afterDelete = await stage();
  check("⑤ 삭제 후 4개", /메모 4개/.test(afterDelete), "true");
  check("⑤-2 지운 제목이 사라짐", !afterDelete.includes("아메리카노 사기"), "true");

  // 6) 새 메모 — 빈 제목이면 막힌다
  await clickText(".stage a", "새 메모");
  await wait(500);
  await clickText(".stage button", "저장");
  await wait(500);
  check("⑥ 빈 제목 차단", (await stage()).includes("제목을 입력해 주세요"), "true");

  // 7) 제대로 입력하면 맨 앞에 추가된다
  await page.click(".stage input");
  await page.type(".stage input", "케이크 사기");
  await page.click(".stage textarea");
  await page.type(".stage textarea", "이서연 생일");
  await clickText(".stage button", "저장");
  await wait(700);
  const afterAdd = await stage();
  check("⑦ 추가 후 5개", /메모 5개/.test(afterAdd), "true");
  const firstNow = await page.$$eval(".stage ul li a", (els) => els[0].textContent.trim());
  check("⑦-2 새 메모가 맨 위", firstNow, "케이크 사기");

  // 8) 없는 번호
  await page.goto(URL + "m/9999", { waitUntil: "networkidle0" });
  await wait(800);
  await clickText(".navBtn", "종합04 메모장 정답");
  await wait(2500);
  const notFound = await stage();
  check("⑧ 없는 번호 안내", /9999번 메모는 없습니다/.test(notFound), "true");

  console.log("\n페이지 에러:", errors.length ? errors : "없음");
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${failed === 0 && errors.length === 0 ? "✅ 전부 통과" : `❌ 실패 ${failed}건`}`);
  await browser.close();
  process.exit(failed === 0 && errors.length === 0 ? 0 : 1);
})();
