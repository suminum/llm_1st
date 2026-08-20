// ============================================================
// React 자료 01~07단원(.html) 검증기
// ------------------------------------------------------------
//   node verify_html.js <파일 또는 폴더> [--interact]
//
//  ① 실제 Chrome 에서 file:// 로 열어 페이지 에러 / React 경고를 잡는다
//  ② 인터넷을 끊고 연다 (_lib 동봉본만으로 도는지)
//  ③ 파일에 적힌 // 콘솔: 값이 실제 콘솔에 나오는지 대조한다
//  ④ 주석·문자열 안의 </script> 조기 종료를 잡는다
//  ⑤ --interact 면 버튼을 전부 한 번씩 눌러 본다
// ============================================================
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const target = process.argv[2];
const INTERACT = process.argv.includes("--interact");

// Chrome DevTools 가 보여 주는 모양에 맞춘 직렬화
function fmt(v) {
  if (typeof v === "string") return v;
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (Array.isArray(v)) return "[" + v.map(inner).join(", ") + "]";
  if (typeof v === "object") {
    const body = Object.entries(v).map(([k, x]) => `${k}: ${inner(x)}`).join(", ");
    return "{" + (body ? " " + body + " " : "") + "}";
  }
  return String(v);
}
function inner(v) {
  if (typeof v === "string") return `'${v}'`;
  if (Array.isArray(v)) return "[" + v.map(inner).join(", ") + "]";
  if (v && typeof v === "object") {
    const body = Object.entries(v).map(([k, x]) => `${k}: ${inner(x)}`).join(", ");
    return "{" + (body ? " " + body + " " : "") + "}";
  }
  return String(v);
}
const norm = (s) => String(s).replace(/\s+/g, " ").replace(/["']/g, "'").trim();

function collectFiles(t) {
  const st = fs.statSync(t);
  if (st.isFile()) return [t];
  return fs
    .readdirSync(t)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(t, f));
}

// 일부러 내는 경고/에러를 파일이 선언할 수 있다.
//   // 검증: 경고허용 Each child in a list
// 라고 적어 두면 그 문구를 담은 경고는 실패로 치지 않는다.
// (경고를 학생에게 직접 보여 주는 것이 옳은 자리가 있다 — key 누락, 소문자 컴포넌트 등)
function allowedWarnings(src) {
  return src
    .split(/\r?\n/)
    .map((l) => l.match(/\/\/ 검증: ?경고허용 ?(.+)$/))
    .filter(Boolean)
    .map((m) => m[1].trim())
    .filter(Boolean);
}

// 파일에서 실행되는 // 콘솔: 만 뽑는다 (정답 블록의 '//    // 콘솔:' 은 제외)
function annotated(src) {
  return src
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*\/\/ 콘솔: ?(.*)$/))
    .filter(Boolean)
    .map((m) => m[1])
    .filter((s) => s.trim() !== "");
}

(async () => {
  const files = collectFiles(target);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--allow-file-access-from-files", "--no-sandbox"],
  });

  let bad = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    const name = path.basename(file);
    const problems = [];

    // ④ </script> 조기 종료
    const scriptCloseCount = (src.match(/<\/script>/g) || []).length;
    const scriptOpenCount = (src.match(/<script/g) || []).length;
    if (scriptCloseCount !== scriptOpenCount) {
      problems.push(`script 태그 짝이 안 맞음 (열림 ${scriptOpenCount} / 닫힘 ${scriptCloseCount}) — 주석 안에 </script> 를 쓰지 않았는지 확인`);
    }

    const page = await browser.newPage();
    const logs = [];
    const errors = [];
    const warns = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    // 순서를 지키려고 자리를 먼저 잡아 두고 나중에 값을 채운다
    // (await 를 그대로 쓰면 문자열이 배열보다 먼저 도착해 순서가 뒤집힌다)
    const pending = [];
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
          if (!text) text = m.text();
          bucket[slot] = type === "error" ? "[console.error] " + text : text;
        })()
      );
    });

    // ② 인터넷 차단
    await page.setRequestInterception(true);
    const blocked = [];
    page.on("request", (req) => {
      if (req.url().startsWith("file://") || req.url().startsWith("data:")) req.continue();
      else {
        blocked.push(req.url());
        req.abort();
      }
    });

    const url = "file:///" + path.resolve(file).replace(/\\/g, "/");
    await page.goto(url, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1200));
    await Promise.all(pending);

    // 도구가 찍는 두 줄은 이 자료에서 항상 나오는 것이라 셈에서 뺀다
    const isNoise = (s) =>
      /Download the React DevTools/.test(s) || /in-browser Babel transformer/.test(s);
    for (const arr of [logs, warns]) {
      for (let i = arr.length - 1; i >= 0; i--) if (isNoise(arr[i])) arr.splice(i, 1);
    }

    const loadLogs = [...logs];

    // ⑤ 버튼 눌러 보기
    await Promise.all(pending);
    if (INTERACT) {
      const count = await page.$$eval("button", (els) => els.length);
      for (let i = 0; i < count; i++) {
        await page.$$eval("button", (els, k) => els[k] && els[k].click(), i).catch(() => {});
        await new Promise((r) => setTimeout(r, 120));
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    // createRoot 로 그린 자리가 '전부' 채워졌는지 본다.
    // (#root 하나만 보면, 뒤에 만든 root 가 부모 root 에 지워져도 못 잡는다 — 02단원에서 실제로 났던 사고)
    // 주석 처리된 줄은 세지 않는다 (오타 시연이 주석으로 들어 있는 경우가 많다)
    // 파일이 "// 검증: 빈root허용 id" 로 선언하면 그 자리는 비어 있어도 된다
    //   (createRoot 만 하고 render 를 안 하는 것을 일부러 보여 주는 예제)
    const allowEmptyRoots = [...src.matchAll(/\/\/ 검증: ?빈root허용 ?#?([\w-]+)/g)].map((m) => m[1]);
    const rootIds = [];
    for (const line of src.split(/\r?\n/)) {
      const re = /createRoot\(\s*document\.querySelector\(\s*["'`]#([\w-]+)["'`]/g;
      let m;
      while ((m = re.exec(line))) {
        const before = line.slice(0, m.index);
        if (/\/\//.test(before)) continue; // 그 줄에서 주석 뒤에 있으면 죽은 코드
        if (allowEmptyRoots.includes(m[1])) continue;
        rootIds.push(m[1]);
      }
    }
    const targets = rootIds.length ? [...new Set(rootIds)] : ["root"];
    const emptyRoots = await page.evaluate((ids) => {
      return ids.filter((id) => {
        const el = document.getElementById(id);
        return !el || el.innerHTML.trim().length === 0;
      });
    }, targets);
    if (emptyRoots.length) {
      problems.push(
        `React 가 그리지 못한 자리 ${emptyRoots.length}곳: ${emptyRoots.map((i) => "#" + i).join(", ")} — 뒤 root 가 앞 root 에 지워졌거나 렌더가 실패했습니다`
      );
    }

    // 스크립트 밖으로 새어 나온 주석(조기 종료 징후)
    const leaked = await page.evaluate(() => {
      const t = document.body.innerText || "";
      const hit = t.match(/\/\/ ?(콘솔|화면|섹션|✏️)/g);
      return hit ? hit.length : 0;
    });
    if (leaked > 0) problems.push(`주석이 화면으로 새어 나옴 (${leaked}건) — </script> 조기 종료 의심`);

    if (blocked.length) problems.push(`외부 요청 시도 ${blocked.length}건: ${blocked.slice(0, 3).join(", ")} — _lib 동봉본만 써야 합니다`);
    // 파일이 "// 검증: 경고허용 <문구>" 로 선언한 것은 의도된 것으로 본다
    const allow = allowedWarnings(src);
    const isAllowed = (s) => allow.some((a) => s.includes(a));

    const isNetworkNote = (e) => /Failed to load resource/.test(e);
    const notes = errors.filter(isNetworkNote);
    const intendedErr = errors.filter((e) => !isNetworkNote(e) && isAllowed(e));
    const realErrors = errors.filter((e) => !isNetworkNote(e) && !isAllowed(e));
    // 안내 줄은 모아 두었다가 파일 이름 뒤에 찍는다 (먼저 찍으면 앞 파일 밑에 붙어 보인다)
    const infos = [];
    if (notes.length) infos.push(`  · 참고: 브라우저 네트워크 메시지 ${notes.length}건`);
    if (realErrors.length) problems.push(...realErrors.map((e) => "에러: " + e));

    // React 개발 경고(key 누락 등)는 반드시 잡는다 — 선언된 것만 봐준다
    const realWarns = warns.filter((w) => !isAllowed(w));
    const intendedWarn = warns.filter(isAllowed);
    if (realWarns.length) problems.push(...realWarns.map((w) => "React 경고: " + w.slice(0, 200)));
    if (intendedErr.length + intendedWarn.length > 0) {
      infos.push(`  · 의도된 경고 ${intendedErr.length + intendedWarn.length}건 (파일이 선언함)`);
      [...intendedErr, ...intendedWarn].forEach((w) => infos.push(`     ${w.slice(0, 120)}`));
    }
    // 선언해 놓고 실제로는 안 난 것도 알려 준다 (자료가 거짓말을 하게 되므로)
    const unfired = allow.filter(
      (a) => ![...errors, ...warns].some((s) => s.includes(a))
    );
    if (unfired.length) {
      problems.push(
        `경고허용으로 선언했는데 실제로는 안 난 문구 ${unfired.length}건: ${unfired.join(" / ")} — 자료 설명과 실제가 다릅니다`
      );
    }

    // ③ // 콘솔: 대조
    await Promise.all(pending);
    const want = annotated(src);
    const haveNorm = logs.map(norm);
    const missing = want.filter((w) => !haveNorm.some((h) => h === norm(w) || h.includes(norm(w))));

    console.log(`\n=== ${name} ===`);
    infos.forEach((l) => console.log(l));
    console.log(`  적힌 // 콘솔: ${want.length}개 / 실제 콘솔 ${logs.length}줄 (로드 시 ${loadLogs.length}줄)`);
    if (missing.length) {
      console.log(`  ⚠ 실제로 안 나온 // 콘솔: ${missing.length}개`);
      missing.forEach((m) => console.log(`     적힘: ${m}`));
      console.log(`  --- 실제 콘솔 전체 ---`);
      logs.forEach((l) => console.log(`     ${l}`));
    }
    if (problems.length) {
      bad++;
      problems.forEach((p) => console.log(`  ❌ ${p}`));
    } else if (!missing.length) {
      console.log("  ✅ 이상 없음");
    }
    await page.close();
  }

  await browser.close();
  console.log(`\n검사 ${files.length}개 / 문제 있는 파일 ${bad}개`);
  process.exit(bad ? 1 : 0);
})();
