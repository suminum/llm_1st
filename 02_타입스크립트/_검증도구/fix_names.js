// ============================================================
// 한글 파일명을 NFC(완성형)로 되돌린다.
// ------------------------------------------------------------
//     npm run fix:names
//
// 왜 필요한가 —
//   macOS 는 한글 파일명을 NFD(자모 분리)로 저장합니다.
//   글자로는 똑같이 보이지만 바이트가 다릅니다.
//   이 자료의 검증도구들(verify · grade · xref …)과 tsconfig 는
//   파일명을 NFC 로 적어 두고 비교하므로, NFD 상태에서는
//   "파일을 못 찾겠다" 며 조용히 어긋납니다.
//
//   압축을 풀거나 tar · Finder 로 옮기기만 해도 NFD 로 바뀝니다.
//   검증도구가 갑자기 파일을 못 찾으면 이것부터 돌리세요.
// ============================================================

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
let changed = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  // 하위부터 바꿔야 경로가 안 깨진다
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    if (e.isDirectory()) walk(path.join(dir, e.name));
  }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const nfc = e.name.normalize("NFC");
    if (nfc !== e.name) {
      fs.renameSync(path.join(dir, e.name), path.join(dir, nfc));
      console.log("  " + path.relative(ROOT, path.join(dir, nfc)));
      changed++;
    }
  }
}

console.log("한글 파일명 NFC 정규화");
console.log("=".repeat(60));
walk(ROOT);
console.log("=".repeat(60));
console.log(changed === 0 ? "전부 NFC 입니다. 고칠 것 없음." : `${changed}개를 NFC 로 되돌렸습니다.`);
