// ============================================================
// 02단원 · 개념 03 — 동기와 비동기 (Sync 를 붙일 것인가)
// ------------------------------------------------------------
// 실행: node 개념03_동기와_비동기.js
// ============================================================
//
// 앞 파일에서 쓴 것들을 다시 보세요.
//
//     fs.readFileSync
//     fs.writeFileSync
//     fs.existsSync
//              ────
//              전부 Sync 로 끝납니다
//
// Sync 가 없는 것도 있습니다. fs.readFile, fs.writeFile ...
// 이름만 다른 게 아니라 동작이 완전히 다릅니다.
//
//   Sync 붙음   → 다 끝날 때까지 '기다린다'
//   Sync 없음   → 시켜 놓고 '먼저 다음 줄로 간다'
//
// 이 차이가 서버에서는 아주 중요합니다. 이 파일에서 그 이유를 봅니다.
//
// ★ 결론부터 — 서버 코드에서는 Sync 를 쓰지 않습니다.
//   왜 그런지 눈으로 확인하는 것이 이 파일의 목적입니다.

const fs = require("fs");
const path = require("path");

const 샘플경로 = path.join(__dirname, "샘플_문서.txt");


// ── 섹션 1: Sync — 다 읽을 때까지 멈춘다 ──

console.log("A. 읽기 전");

const 내용 = fs.readFileSync(샘플경로, "utf-8");

console.log("B. 읽기 끝. 여기 오려면 파일을 다 읽어야 했습니다");
console.log(내용.split("\n")[0]);
// 출력: A. 읽기 전
// 출력: B. 읽기 끝. 여기 오려면 파일을 다 읽어야 했습니다
// 출력: 작업표준서

// 순서가 A → B 입니다. 당연해 보이죠?
// 그런데 이 '당연함' 이 서버에서는 문제가 됩니다. 섹션 3에서 봅니다.

// ✏️ 직접 해보기 1 — A 와 B 사이에 console.log("중간") 을 넣어 보세요.
//                    어디에 찍히나요?


// ── 섹션 2: 비동기 — 시켜 놓고 먼저 간다 ──

// 아래 코드는 전부 async 함수 안에 있습니다.
// CommonJS 에서는 파일 맨 바깥에서 await 를 쓸 수 없기 때문입니다.
// (JS자료 12단원에서 배운 규칙 — await 는 async 함수 안에서만)

async function main() {
  console.log("C. 비동기 읽기 시작");

  // await 를 안 붙이면 '시키기만' 합니다. 결과를 기다리지 않습니다.
  const 약속 = fs.promises.readFile(샘플경로, "utf-8");

  console.log("D. 아직 안 기다렸습니다. 파일은 지금 읽히는 중입니다");

  console.log(약속.constructor.name);
  // 출력: C. 비동기 읽기 시작
  // 출력: D. 아직 안 기다렸습니다. 파일은 지금 읽히는 중입니다
  // 출력: Promise

  // JS자료 12단원의 그 Promise 입니다. "나중에 값을 주겠다" 는 약속이죠.
  // 진동벨을 받은 상태입니다. 커피는 아직 안 나왔습니다.

  // ★★ 여기가 이 파일에서 가장 중요한 지점입니다 ★★
  //
  //   바로 아래 줄에서 await 를 만나면 main 이 '잠시 비켜섭니다'.
  //   그 틈에 파일 맨 아래에 있는 console.log("G. ...") 가 먼저 실행됩니다.
  //   그래서 실제 출력 순서에서 G 가 바로 여기에 끼어듭니다.
  //
  //   파일에 쓰인 순서와 실행되는 순서가 다릅니다.
  //   처음 보면 반드시 헷갈립니다. 실행해서 눈으로 확인하세요.
  //
  // 출력: G. main 을 시켜 놓고 바로 여기로 왔습니다

  const 값 = await 약속;
  console.log("E. 이제 받았습니다");
  console.log(값.split("\n")[0]);
  // 출력: E. 이제 받았습니다
  // 출력: 작업표준서

  // 보통은 한 줄로 씁니다. 약속을 따로 담아 둘 일이 별로 없어서요.
  const 값2 = await fs.promises.readFile(샘플경로, "utf-8");
  console.log(값2.split("\n")[1]);
  // 출력: 공정명: 조립 1라인

  // ── 섹션 3: 그래서 서버에서 왜 중요한가 ──

  // 서버는 여러 사람의 요청을 동시에 받습니다.
  // 그런데 Node 는 요청을 처리하는 일꾼이 '한 명' 입니다.
  //
  //   [Sync 로 파일을 읽으면]
  //     김민준의 요청 → 파일 읽는 3초 동안 일꾼이 붙잡힘
  //     그동안 이서연·박지훈의 요청은 줄 서서 대기
  //     → 30명이 동시에 오면 마지막 사람은 90초를 기다립니다
  //
  //   [비동기로 읽으면]
  //     김민준의 요청 → "파일 읽어 줘" 시켜 놓고 일꾼은 바로 다음 일로
  //     이서연·박지훈 요청도 즉시 접수
  //     파일이 다 읽히면 그때 이어서 처리
  //     → 30명이 와도 거의 동시에 처리됩니다
  //
  // 식당으로 비유하면 이렇습니다.
  //   Sync   주문받은 요리가 나올 때까지 종업원이 주방 앞에 서 있는 것
  //   비동기 주문만 넣고 다음 손님 주문을 받으러 가는 것
  //
  // 종업원이 한 명이라면 어느 쪽이 나을지는 분명합니다.
  //
  // Node 가 서버에 잘 맞는다는 말이 이 뜻입니다.
  // 일꾼은 한 명이지만, 기다리는 일을 남에게 맡기고 계속 움직입니다.

  // ── 섹션 4: 여러 개를 한꺼번에 ──

  // 비동기의 진짜 장점은 여러 일을 겹쳐서 할 수 있다는 것입니다.

  const 파일들 = [샘플경로, 샘플경로, 샘플경로];

  // [하나씩 기다리기] — 세 번을 차례로 기다립니다
  const 순서대로 = [];
  for (const p of 파일들) {
    const t = await fs.promises.readFile(p, "utf-8");
    순서대로.push(t.length);
  }
  console.log(순서대로.length);
  // 출력: 3

  // [한꺼번에] — 셋을 동시에 시켜 놓고 다 올 때까지만 기다립니다
  const 동시에 = await Promise.all(파일들.map((p) => fs.promises.readFile(p, "utf-8")));
  console.log(동시에.length);
  // 출력: 3

  console.log(순서대로[0] === 동시에[0].length);
  // 출력: true
  // 결과는 같습니다. 걸린 시간만 다릅니다.
  //
  // 파일이 작아서 지금은 차이가 안 느껴집니다.
  // 하지만 파일이 100개거나, 데이터베이스·AI 서버를 부르는 것이라면
  // 순서대로는 100배, 한꺼번에는 1배입니다. (JS자료 12단원 심화에서 재 봤죠)
  //
  // ★ 서로 상관없는 일이면 Promise.all 을 쓰세요.
  //   앞의 결과가 있어야 다음을 할 수 있으면 하나씩 await 해야 합니다.

  // ── 섹션 5: 쓰기도 비동기로 ──

  const 출력경로 = path.join(__dirname, "결과_비동기.txt");

  await fs.promises.writeFile(출력경로, "비동기로 썼습니다\n", "utf-8");
  const 확인 = await fs.promises.readFile(출력경로, "utf-8");
  console.log(확인.trim());
  // 출력: 비동기로 썼습니다

  await fs.promises.unlink(출력경로);
  console.log(fs.existsSync(출력경로));
  // 출력: false

  // fs.promises 아래에 있는 것들은 이름이 같습니다. Sync 만 뗀 모양입니다.
  //
  //   fs.readFileSync   →  fs.promises.readFile
  //   fs.writeFileSync  →  fs.promises.writeFile
  //   fs.unlinkSync     →  fs.promises.unlink
  //   fs.mkdirSync      →  fs.promises.mkdir
  //
  // 맨 위에서 이렇게 꺼내 쓰면 더 짧습니다.
  //   const fsp = require("fs").promises;
  //   await fsp.readFile(...)

  // ── 섹션 6: 에러 처리 ──

  // 비동기에서도 try/catch 가 그대로 동작합니다. await 를 감싸면 됩니다.
  try {
    await fs.promises.readFile(path.join(__dirname, "없는파일.txt"), "utf-8");
  } catch (error) {
    console.log(error.code);
    // 출력: ENOENT
  }

  // ★ await 를 빼먹으면 try/catch 가 못 잡습니다.
  //   에러가 나중에 터지는데 try 블록은 이미 끝나 있기 때문입니다.
  //   비동기 함수를 부를 때는 await 를 붙였는지 항상 확인하세요.

  console.log("F. 전부 끝");
  // 출력: F. 전부 끝
}

main();

// ★ main() 을 부르면 어떻게 될까요?
//   main 은 async 함수라서, 안에서 첫 await 를 만날 때까지만 쭉 실행되고
//   거기서 잠시 비켜섭니다. 그 순간 아래 줄이 실행됩니다.
//   main 이 다 끝나기를 기다리지 않습니다.

console.log("G. main 을 시켜 놓고 바로 여기로 왔습니다");
// (이 줄의 출력은 위 main 안, await 직전에 미리 적어 두었습니다.
//  실제로 찍히는 자리가 거기이기 때문입니다)

// 실제 출력 순서
//
//   A. 읽기 전                    ← 동기
//   B. 읽기 끝                    ← 동기
//   작업표준서                     ← 동기
//   C. 비동기 읽기 시작            ← main 시작
//   D. 아직 안 기다렸습니다         ← 아직 await 전
//   Promise                       ← 아직 await 전
//   G. main 을 시켜 놓고...        ← ★ 첫 await 를 만나 비켜선 순간
//   E. 이제 받았습니다             ← 파일이 다 읽혀 돌아옴
//   ... 나머지
//   F. 전부 끝
//
// "쓰인 순서" 와 "실행 순서" 가 다릅니다.
// 이걸 이해하면 비동기의 절반은 끝난 것입니다.


// ── 섹션 7: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.

// [실수 1] await 를 빼먹음
//   const t = fs.promises.readFile(경로, "utf-8");
//   console.log(t.length);
//   실수: t 는 문자열이 아니라 Promise 입니다. length 는 undefined 입니다.
//         "왜 undefined 지?" 싶으면 await 를 빼먹었는지 보세요.

// [실수 2] async 없이 await 를 씀 → SyntaxError
//   function load() {
//     const t = await fs.promises.readFile(경로);
//   }
//   실수: await 는 async 함수 안에서만 쓸 수 있습니다.

// [실수 3] 파일 맨 바깥에서 await 를 씀 → SyntaxError
//   const t = await fs.promises.readFile(경로);
//   실수: CommonJS 에서는 안 됩니다. async function main() 으로 감싸세요.

// [실수 4] Sync 와 비동기를 섞어 씀
//   const a = fs.readFileSync(경로1, "utf-8");
//   const b = await fs.promises.readFile(경로2, "utf-8");
//   실수: 에러는 안 나지만 첫 줄에서 서버가 멈춥니다.
//         한 파일 안에서는 한쪽으로 통일하세요.

// [실수 5] forEach 안에서 await
//   파일들.forEach(async (p) => { await fs.promises.readFile(p); });
//   실수: forEach 는 기다려 주지 않습니다. 전부 끝나기 전에 다음 줄로 갑니다.
//         for...of 를 쓰거나 Promise.all 을 쓰세요. (JS자료 12단원에서 배운 그 실수입니다)


// ── 정리 ──

// 1. Sync 가 붙으면 다 끝날 때까지 기다린다. 안 붙으면 시켜 놓고 먼저 간다.
// 2. 서버에서는 Sync 를 쓰지 않는다. 일꾼이 한 명인데 붙잡히기 때문이다.
// 3. fs.promises.readFile 처럼 쓰고 await 를 붙인다.
// 4. await 는 async 함수 안에서만. CommonJS 는 맨 바깥에서 못 쓴다.
// 5. 서로 상관없는 일은 Promise.all 로 한꺼번에.
// 6. try/catch 로 감싸되, await 를 빼먹으면 못 잡는다.
// 7. 예외 — 서버가 처음 켜질 때 설정 파일을 읽는 것은 Sync 를 써도 된다.
//    아직 요청을 받기 전이라 붙잡힐 사람이 없기 때문이다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log("중간") 을 A 와 B 사이에 넣으면
//    A → 중간 → B 순서로 찍힙니다.
//    readFileSync 가 그 자리에서 멈춰 있다가 다 읽고 나서야 다음 줄로 갑니다.
//    이게 '동기' 입니다.
//
// 2) (섹션 4 참고) 파일 세 개를 각각 다른 파일로 바꿔서
//    Promise.all 과 for...of 의 결과가 같은지 확인해 보세요.
//    결과는 같고 걸리는 시간만 다릅니다.
//
// [더 해보기] 아래를 파일 맨 아래에 넣고 실행해 보세요.
//
//   async function 순서확인() {
//     console.log("1");
//     await fs.promises.readFile(샘플경로, "utf-8");
//     console.log("3");
//   }
//   순서확인();
//   console.log("2");
//
//   출력 순서: 1 → 2 → 3
//   await 를 만나는 순간 함수가 잠시 비켜서고, 바깥의 "2" 가 먼저 실행됩니다.
//   파일을 다 읽으면 멈췄던 자리로 돌아와 "3" 을 찍습니다.
//   JS자료 12단원에서 배운 "await 는 이 함수 하나만 비켜서게 한다" 가 이것입니다.
