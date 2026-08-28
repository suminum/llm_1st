// ============================================================
// 02단원 연습문제 정답
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================
//
// 먼저 스스로 풀어 본 다음에 보세요. 설명을 꼭 읽으세요.

const fs = require("fs");
const path = require("path");

const 작업폴더 = path.join(__dirname, "연습_작업");
fs.rmSync(작업폴더, { recursive: true, force: true });
fs.mkdirSync(작업폴더, { recursive: true });


// ───── 문제 1 ─────
console.log(path.join("uploads", "2026", "03", "보고서.pdf"));
// 출력: uploads\2026\03\보고서.pdf
// (윈도우 기준입니다. 맥·리눅스는 uploads/2026/03/보고서.pdf 로 나옵니다)
// 조각이 몇 개든 상관없습니다. 구분자는 path 가 알아서 골라 줍니다.


// ───── 문제 2 ─────
const 파일명1 = "작업표준서.PDF";

console.log(path.extname(파일명1).toLowerCase() === ".pdf");
// 출력: true
//
// toLowerCase() 를 빼면 ".PDF" === ".pdf" 라서 false 가 나옵니다.
// 사용자가 어떤 대소문자로 올릴지 모릅니다. 항상 낮춰서 비교하세요.
// 점을 빼먹고 "pdf" 와 비교하는 것도 흔한 실수입니다.


// ───── 문제 3 ─────
const 확장자1 = path.extname(파일명1);
console.log(path.basename(파일명1, 확장자1));
// 출력: 작업표준서
//
// basename(이름, 뗄확장자) 입니다.
// 두 번째 인자를 ".pdf" 로 하면 대문자 ".PDF" 는 안 떨어집니다.
// extname 이 준 것을 그대로 넘기는 게 안전합니다.


// ───── 문제 4 ─────
const 샘플경로 = path.join(__dirname, "샘플_문서.txt");
const 내용 = fs.readFileSync(샘플경로, "utf-8");

console.log(내용.split("\n")[0]);
// 출력: 작업표준서
//
// path.join(__dirname, ...) 을 쓴 이유
//   그냥 "샘플_문서.txt" 라고 쓰면 터미널 위치에 따라 ENOENT 가 납니다.
//   __dirname 은 이 파일이 있는 폴더라서 어디서 실행하든 같습니다.


// ───── 문제 5 ─────
console.log(내용.split("\n").filter((line) => line !== "").length);
// 출력: 4
//
// 파일 끝에 \n 이 있어서 split 하면 마지막에 빈 문자열이 하나 생깁니다.
// filter 로 걸러 내야 4가 나옵니다. 안 거르면 5입니다.


// ───── 문제 6 ─────
const 메모경로 = path.join(작업폴더, "메모.txt");

fs.writeFileSync(메모경로, "첫 줄\n", "utf-8");
console.log(fs.existsSync(메모경로));
// 출력: true


// ───── 문제 7 ─────
fs.appendFileSync(메모경로, "둘째 줄\n", "utf-8");
fs.appendFileSync(메모경로, "셋째 줄\n", "utf-8");

const 메모내용 = fs.readFileSync(메모경로, "utf-8");
console.log(메모내용.trim().split("\n").length);
// 출력: 3
//
// writeFileSync 를 썼다면 앞의 내용이 사라져 1이 나옵니다.
// 이어 쓰는 것은 appendFileSync 입니다.
// trim() 은 파일 끝의 \n 때문에 생기는 빈 줄을 없애려고 붙였습니다.


// ───── 문제 8 ─────
try {
  fs.readFileSync(path.join(작업폴더, "없는파일.txt"), "utf-8");
} catch (error) {
  console.log(error.code);
  // 출력: ENOENT
}
//
// try/catch 로 감쌌기 때문에 프로그램이 안 죽고 계속 갑니다.
// 감싸지 않았다면 여기서 멈추고 아래 문제들이 실행되지 않습니다.


// ───── 문제 9 ─────
const 깊은폴더 = path.join(작업폴더, "docs", "2026", "03");

fs.mkdirSync(깊은폴더, { recursive: true });
console.log(fs.existsSync(깊은폴더));
// 출력: true
//
// recursive 없이 하면 docs 가 없어서 ENOENT 가 납니다.
// 한 단계씩 세 번 만들 필요 없습니다.


// ───── 문제 10 ─────
fs.writeFileSync(path.join(작업폴더, "a.txt"), "A", "utf-8");
fs.writeFileSync(path.join(작업폴더, "b.pdf"), "B", "utf-8");
fs.writeFileSync(path.join(작업폴더, "c.txt"), "C", "utf-8");

const txt목록 = fs
  .readdirSync(작업폴더)
  .filter((name) => path.extname(name) === ".txt")
  .sort();

console.log(txt목록);
// 출력: [ 'a.txt', 'c.txt', '메모.txt' ]
//
// 문제 6에서 만든 메모.txt 도 .txt 라서 함께 나옵니다.
// 한글이 알파벳 뒤에 오는 것은 정렬 규칙 때문입니다.
// readdirSync 는 '이름' 만 줍니다. 전체 경로가 아니라는 점에 주의하세요.


// ───── 문제 11 ─────
const 폴더만 = fs
  .readdirSync(작업폴더, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

console.log(폴더만);
// 출력: [ 'docs' ]
//
// withFileTypes: true 를 주면 이름 대신 '정보가 담긴 객체' 가 나옵니다.
// statSync 를 파일마다 부르는 것보다 훨씬 빠릅니다.


// ───── 문제 12 ─────
const 설비들 = [
  { id: 1, name: "컨베이어", line: "A" },
  { id: 2, name: "프레스", line: "B" },
];

const 설비파일 = path.join(작업폴더, "설비.json");

fs.writeFileSync(설비파일, JSON.stringify(설비들, null, 2), "utf-8");

const 읽은설비 = JSON.parse(fs.readFileSync(설비파일, "utf-8"));
console.log(읽은설비[1].name);
// 출력: 프레스
//
// stringify 를 빼먹으면 "[object Object]" 가 저장되어 내용이 사라집니다.
// parse 를 빼먹으면 문자열이라 [1] 이 두 번째 '글자' 가 됩니다.


// ───── 문제 13 ─────
function makeSavePath(원본이름, 날짜) {
  const 확장자 = path.extname(원본이름).toLowerCase();
  const 이름 = path.basename(원본이름, path.extname(원본이름));

  const 년 = 날짜.getFullYear();
  const 월 = String(날짜.getMonth() + 1).padStart(2, "0");
  const 일 = String(날짜.getDate()).padStart(2, "0");

  const 폴더 = path.join(작업폴더, String(년), 월);
  fs.mkdirSync(폴더, { recursive: true });

  return path.join(폴더, `${이름}_${년}${월}${일}${확장자}`);
}

const 저장경로 = makeSavePath("검사성적서.XLSX", new Date(2026, 2, 5));

console.log(path.relative(__dirname, 저장경로));
// 출력: 연습_작업\2026\03\검사성적서_20260305.xlsx
// (윈도우 기준입니다. 맥·리눅스는 / 로 이어집니다)
console.log(fs.existsSync(path.dirname(저장경로)));
// 출력: true
//
// 두 가지를 눈여겨보세요.
//
//   ① extname 을 두 번 부릅니다
//      basename 에 넘길 때는 '원래 대소문자' 여야 떨어집니다. (.XLSX)
//      파일명에 붙일 때는 소문자로 바꿔 씁니다. (.xlsx)
//      순서를 바꾸면 이름이 "검사성적서.XLSX" 처럼 안 떨어집니다.
//
//   ② 폴더를 먼저 만들고 경로를 돌려줍니다
//      경로만 돌려주고 폴더를 안 만들면, 나중에 쓸 때 ENOENT 가 납니다.
//      "경로를 만드는 함수" 가 폴더까지 책임지는 게 안전합니다.
//
// path.relative(기준, 경로) 는 "기준에서 본 상대 경로" 를 줍니다.
// 컴퓨터마다 다른 앞부분을 빼고 보려고 썼습니다.
//
// ★ 09단원에서 multer 로 파일 업로드를 만들 때 이 함수를 거의 그대로 씁니다.


// ───── 문제 14 ─────
// 비동기라서 async 함수로 감쌌습니다.
// 이 함수는 파일 맨 아래에서 부릅니다. 그래서 출력이 가장 마지막에 나옵니다.

async function main() {
  async function 불러오기() {
    try {
      const 글자 = await fs.promises.readFile(설비파일, "utf-8");
      return JSON.parse(글자);
    } catch (error) {
      if (error.code === "ENOENT") {
        return []; // 파일이 없으면 빈 목록
      }
      throw error; // 그 밖의 에러는 그대로 넘김
    }
  }

  async function 저장하기(목록) {
    await fs.promises.writeFile(설비파일, JSON.stringify(목록, null, 2), "utf-8");
  }

  async function 추가하기(name, line) {
    const 목록 = await 불러오기();
    const 다음id = 목록.length === 0 ? 1 : Math.max(...목록.map((s) => s.id)) + 1;
    const 새설비 = { id: 다음id, name, line };

    await 저장하기([...목록, 새설비]);
    return 새설비;
  }

  async function 삭제하기(id) {
    const 목록 = await 불러오기();
    await 저장하기(목록.filter((s) => s.id !== id));
  }

  const 추가된것 = await 추가하기("용접로봇", "C");
  console.log(추가된것.id);
  // 출력: 3

  console.log((await 불러오기()).map((s) => s.name));
  // 출력: [ '컨베이어', '프레스', '용접로봇' ]

  await 삭제하기(2);
  console.log((await 불러오기()).map((s) => s.id));
  // 출력: [ 1, 3 ]

  // 삭제해도 id 를 다시 매기지 않습니다. 1, 3 이 그대로 남습니다.
  // 번호를 재활용하면 옛날 기록과 헷갈리기 때문입니다.
  //
  // ★ 왜 전부 await 를 붙였나
  //   하나라도 빼먹으면 그 자리에 Promise 가 들어와
  //   목록.map 이 TypeError 를 냅니다.
  //   "왜 undefined 지?" / "왜 map 이 없지?" 싶으면 await 부터 확인하세요.
  //
  // ★ 왜 함수 안에 함수를 넣었나
  //   await 를 쓰려면 async 함수 안이어야 해서입니다.
  //   실무에서는 이 네 함수를 따로 파일로 빼고 module.exports 로 내보냅니다. (01단원)
}

main();


// ───── 문제 15 ─────
// const 없는폴더경로 = path.join(작업폴더, "없는폴더", "파일.txt");
// fs.writeFileSync(없는폴더경로, "내용", "utf-8");
//
// 에러: Error: ENOENT: no such file or directory
//
// 왜:
//   writeFileSync 는 '파일' 은 만들어 주지만 '폴더' 는 안 만들어 줍니다.
//   "없는폴더" 가 없어서 그 안에 파일을 쓸 수가 없습니다.
//
// 무엇을 먼저 했어야 하나:
//   fs.mkdirSync(path.dirname(없는폴더경로), { recursive: true });
//   폴더를 먼저 만들고 나서 파일을 씁니다.
//
// ★ 파일 업로드 서버에서 가장 많이 만나는 에러입니다.
//   날짜별 폴더에 저장할 때, 그 달의 첫 업로드에서 폴더가 없어 터집니다.
//   저장하기 직전에 항상 mkdirSync(폴더, { recursive: true }) 를 부르세요.
