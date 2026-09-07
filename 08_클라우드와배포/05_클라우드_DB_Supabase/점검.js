// ============================================================
// 점검.js — 준비가 됐는지 확인합니다
// ------------------------------------------------------------
//   node 점검.js
//
// 개념03 을 돌리기 전에 이걸 먼저 돌려 보세요.
// 여섯 가지를 순서대로 보고, 처음 막히는 자리에서 멈춰 무엇을 하면 되는지 알려 줍니다.
// ============================================================
//
// ★ 왜 이런 걸 두나
//
//   준비가 덜 된 채로 예제를 돌리면 증상이 다 비슷합니다.
//   빈 배열이거나 404 입니다. 오류 메시지도 안 나옵니다.
//   그러면 코드를 들여다보게 됩니다. 코드는 멀쩡한데요.
//
//   그래서 "몇 번째 단계에서 막혔는지" 를 먼저 알려 주는 편이 낫습니다.

// 이파일은Supabase가필요합니다

const fs = require("fs");
const path = require("path");

// ★ 여기서는 설정.js 를 안 씁니다.
//   설정.js 는 값이 없으면 바로 멈춥니다. (fail fast — 01단원)
//   점검은 "왜 없는지" 를 말해 줘야 하니 직접 읽습니다.
const env파일 = path.join(__dirname, ".env");
if (fs.existsSync(env파일)) process.loadEnvFile(env파일);

const 안내 = [];
let 막힘 = null;

function 확인(제목, 됐나, 어떻게하면) {
  if (막힘) return; // 이미 막혔으면 그 뒤는 볼 필요가 없습니다
  안내.push(`${됐나 ? "○" : "✗"} ${제목}`);
  if (!됐나) 막힘 = 어떻게하면;
}

(async () => {
  // ── 1. .env 파일 ──
  확인(".env 파일이 있다", fs.existsSync(env파일), [
    "이 폴더에 .env 가 없습니다.",
    "",
    "  cp .env.예시 .env",
  ]);

  // ── 2. 두 값이 채워져 있다 ──
  const 주소 = process.env.SUPABASE_URL;
  const 키 = process.env.SUPABASE_ANON_KEY;
  const 아직예시 = (값) => !값 || 값.includes("여기를_바꾸세요");

  확인("SUPABASE_URL 과 ANON_KEY 를 채웠다", !아직예시(주소) && !아직예시(키), [
    ".env 의 값이 아직 예시 그대로입니다.",
    "",
    "  대시보드 → Project Settings → API 에서 복사하세요.",
    "    Project URL     → SUPABASE_URL",
    "    anon public key → SUPABASE_ANON_KEY",
  ]);

  // ── 3. 키에 한글이 안 섞였다 ──
  //
  // ★ 헤더는 ASCII 만 받습니다. 붙여넣기가 어긋나면 여기서 걸립니다.
  //   안 잡으면 "Cannot convert argument to a ByteString" 이 뜹니다. 원인을 알기 어렵습니다.
  확인(
    "키에 이상한 글자가 없다",
    !막힘 && /^[\x20-\x7E]+$/.test(키 ?? ""),
    ["키에 ASCII 가 아닌 글자가 섞였습니다. 복사를 다시 해 보세요."]
  );

  let sb = null;
  if (!막힘) {
    const { createClient } = require("@supabase/supabase-js");
    sb = createClient(주소, 키, { auth: { persistSession: false } });
  }

  // ── 4. 서버에 닿는다 ──
  let 붙었나 = false;
  let 표오류 = null;
  if (sb) {
    const { error, status } = await sb.from("products").select("id").limit(1);
    표오류 = error;
    // status 0 은 네트워크가 안 됐다는 뜻입니다. (개념03)
    붙었나 = status !== 0;
  }
  확인("Supabase 에 닿는다", 붙었나, [
    "주소로 연결이 안 됩니다.",
    "",
    "  · 인터넷이 되는지",
    "  · SUPABASE_URL 을 잘못 붙여넣지 않았는지",
    "  · 무료 프로젝트가 7일 방치로 멈추지 않았는지 (대시보드에서 Restore)",
  ]);

  // ── 5. 준비.sql 을 돌렸다 ──
  //
  // ★ 표가 없으면 PGRST205 (또는 옛 버전에서 42P01) 가 옵니다.
  확인("준비.sql 로 표를 만들었다", !표오류, [
    "products 표가 없습니다. 준비.sql 을 아직 안 돌리셨습니다.",
    "",
    "  대시보드 → SQL Editor → 준비.sql 을 통째로 붙여 넣고 Run",
    "",
    "  ★ 방금 돌렸는데도 이게 나오면 캐시가 아직 모르는 것입니다.",
    "    잠깐 뒤에 다시 해 보세요.",
  ]);

  // ── 6. 자료가 처음 상태다 ──
  if (!막힘) {
    const [상품, 리뷰, 메모] = await Promise.all([
      sb.from("products").select("id"),
      sb.from("reviews").select("id"),
      sb.from("memos").select("id"),
    ]);

    안내.push(`○ products ${상품.data.length}줄 · reviews ${리뷰.data.length}줄`);

    if (상품.data.length !== 3 || 리뷰.data.length !== 3) {
      안내.push("");
      안내.push("★ 처음 상태가 아닙니다 (products 3줄 · reviews 3줄 이어야 합니다).");
      안내.push("  실습하다 어질러진 것입니다. 준비.sql 을 한 번 더 Run 하면 돌아옵니다.");
    }

    // ★ memos 는 0줄이 정상입니다. 비어서가 아니라 **정책이 없어서** 0줄입니다.
    //   이 차이를 개념04·05 에서 다룹니다. 여기서는 미리 한 줄만 알려 둡니다.
    // ★ 0줄이 정상입니다. 다만 이유가 두 가지입니다.
    //   개념04 를 하기 전이면 정책이 하나도 없어서,
    //   하고 난 뒤면 점검은 로그인을 안 하니까 — 어느 쪽이든 안 보입니다.
    안내.push(`○ memos ${메모.data.length}줄 — 안 보이는 게 정상입니다 (개념04 에서 다룹니다)`);
  }

  // ── 결과 ──
  console.log("");
  안내.forEach((줄) => console.log("  " + 줄));
  console.log("");

  if (막힘) {
    console.log("  ── 여기서 막혔습니다 ──");
    console.log("");
    막힘.forEach((줄) => console.log("  " + 줄));
    console.log("");
    process.exit(1);
  }

  console.log("  준비가 다 됐습니다. node 개념03_자바스크립트_클라이언트.js 로 가세요.");
  console.log("");
})();
