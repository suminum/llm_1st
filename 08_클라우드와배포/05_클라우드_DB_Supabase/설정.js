// ============================================================
// 설정.js — 이 단원이 쓰는 환경변수를 읽는 곳 (01단원에서 만든 그 방식)
// ------------------------------------------------------------
//   const 설정 = require("./설정");
//   createClient(설정.SUPABASE_URL, 설정.SUPABASE_ANON_KEY);
// ============================================================

// 이파일은Supabase가필요합니다

const fs = require("fs");
const path = require("path");

const env파일 = path.join(__dirname, ".env");
if (fs.existsSync(env파일)) process.loadEnvFile(env파일);

const 모자란것 = [];

function 필수(이름) {
  const 값 = process.env[이름];

  // 빈 글자도 없는 것으로 봅니다. .env 에 `KEY=` 만 적은 경우입니다.
  if (값 === undefined || 값 === "") {
    모자란것.push(`${이름} 가 비어 있습니다`);
    return 값;
  }

  // ★ 키는 apikey·Authorization 헤더에 실려 나갑니다. 헤더는 ASCII 만 받습니다.
  //   한글이 섞이면 요청을 보내는 순간 이렇게 터집니다.
  //     TypeError: Cannot convert argument to a ByteString ...
  //   그 자리에서 보면 원인을 알기 어렵습니다. 여기서 미리 잡습니다.
  // eslint-disable-next-line no-control-regex
  if (!/^[\x20-\x7E]+$/.test(값)) {
    모자란것.push(`${이름} 에 ASCII 가 아닌 글자가 있습니다 (붙여넣기를 다시 하세요)`);
  }

  return 값;
}

const 설정 = Object.freeze({
  SUPABASE_URL: 필수("SUPABASE_URL"),
  SUPABASE_ANON_KEY: 필수("SUPABASE_ANON_KEY"),
});

// ── 모자라면 바로 멈춥니다 (01단원의 fail fast) ──
if (모자란것.length > 0) {
  console.error("");
  console.error("Supabase 설정이 모자라서 예제를 돌릴 수 없습니다.");
  console.error("");
  for (const 줄 of 모자란것) console.error(`  · ${줄}`);
  console.error("");
  console.error("  1) supabase.com 에서 프로젝트를 만드세요 (개념01 섹션 8)");
  console.error("  2) Project Settings → API 에서 URL 과 anon key 를 복사하세요");
  console.error("  3) cp .env.예시 .env  ← 그리고 두 값을 채우세요");
  console.error("  4) SQL Editor 에 준비.sql 을 붙여 넣고 Run 하세요");
  console.error("");
  console.error("  다 했는데도 안 되면 → node 점검.js  (어디서 막혔는지 알려 줍니다)");
  console.error("");
  process.exit(1);
}

module.exports = 설정;
