// ============================================================
// 01단원 · 개념 03 — npm 과 package.json
// ------------------------------------------------------------
// 실행: node 개념03_npm과_package.json.js
// ============================================================
//
// 서버를 만들 때 모든 것을 직접 짜지 않습니다.
// 남이 잘 만들어 둔 것을 가져다 씁니다. 그걸 '패키지' 라고 합니다.
//
//   파일 업로드 처리    →  multer
//   서버 만들기         →  express
//   날짜 다루기         →  dayjs
//   AWS 연동            →  aws-sdk
//
// 이 과정에서 쓸 것이 전부 패키지입니다. 직접 만들지 않습니다.
//
// ── npm 이 무엇인가 ──
//
// npm 은 두 가지를 뜻합니다.
//
//   ① 패키지가 모여 있는 창고     (인터넷에 있습니다. 300만 개가 넘습니다)
//   ② 그 창고에서 가져오는 도구   (내 컴퓨터에 있습니다. Node 설치할 때 같이 깔립니다)
//
// 터미널에 npm -v 를 쳐 보세요. 버전이 나오면 이미 있는 것입니다.


// ── 섹션 1: package.json — 프로젝트의 명세서 ──

// 프로젝트 폴더마다 package.json 이라는 파일을 하나 둡니다.
// "이 프로젝트가 무엇이고, 무엇을 가져다 쓰는가" 를 적어 둔 파일입니다.
//
// 이 폴더에도 하나 있습니다. 열어 보세요.
//
// CommonJS 에서는 JSON 파일도 require 로 읽을 수 있습니다.
// 읽으면 그냥 객체가 됩니다.

const pkg = require("./package.json");

console.log(typeof pkg);
// 출력: object

console.log(pkg.name);
// 출력: 01-node-start
// 프로젝트 이름입니다. 소문자와 하이픈만 쓸 수 있습니다. 한글·대문자·공백은 안 됩니다.

console.log(pkg.version);
// 출력: 1.0.0
// 버전입니다. 큰변화.기능추가.버그수정 순서로 올립니다.

console.log(pkg.description);
// 출력: 01단원 실습용 프로젝트

console.log(pkg.main);
// 출력: 개념01_Node란_무엇인가.js
// "이 프로젝트의 시작 파일" 입니다. 나중에 서버 파일 이름을 여기 적습니다.

// ✏️ 직접 해보기 1 — pkg.license 와 pkg.author 를 찍어 보세요.


// ── 섹션 2: 새 프로젝트 시작하기 ──

// 새 폴더에서 아래 명령을 치면 package.json 이 만들어집니다.
//
//     npm init          질문에 하나씩 답하기 (이름? 버전? 설명? ...)
//     npm init -y       전부 기본값으로 한 번에 (-y = yes)
//
// 실무에서는 npm init -y 로 만들고 필요한 곳만 고칩니다.
//
// [중요] 반드시 '프로젝트 폴더 안에서' 실행하세요.
//        엉뚱한 곳에서 치면 그 폴더에 package.json 이 생겨 버립니다.
//        터미널이 지금 어디에 있는지는 이렇게 확인합니다.

console.log(typeof process.cwd());
// 출력: string
// 직접 찍어 보면 지금 터미널이 있는 폴더 경로가 나옵니다.
// 이 파일을 실행한 곳이 01_Node_시작하기 폴더가 맞는지 확인해 보세요.

// ✏️ 직접 해보기 2 — 바탕화면에 연습용 폴더를 하나 만들고,
//                    터미널로 그 폴더에 들어가 npm init -y 를 실행해 보세요.
//                    package.json 이 생겼는지 확인하세요.


// ── 섹션 3: 패키지 설치하기 ──

// 창고에서 가져오는 명령은 하나입니다.
//
//     npm install 패키지이름
//     npm i 패키지이름            (i 는 install 의 줄임)
//
// 이 폴더에는 dayjs 라는 날짜 패키지를 이미 설치해 두었습니다.
// 설치하면 package.json 의 dependencies 에 자동으로 적힙니다.

console.log(Object.keys(pkg.dependencies));
// 출력: [ 'dayjs' ]

console.log(pkg.dependencies.dayjs.startsWith("^"));
// 출력: true
// 버전 앞에 ^ 가 붙어 있습니다. "이 버전 이상, 큰 변화 전까지는 괜찮다" 는 뜻입니다.
//   ^1.11.21  →  1.11.21 이상 2.0.0 미만이면 OK
// 버그가 고쳐진 새 버전을 자동으로 받으라는 의미입니다.

// 설치할 때 붙이는 옵션이 하나 더 있습니다.
//
//     npm install nodemon --save-dev      또는  npm i -D nodemon
//
// --save-dev 를 붙이면 dependencies 가 아니라 devDependencies 에 들어갑니다.
//
//   dependencies      실제로 서버가 돌아갈 때 필요한 것   (express, multer ...)
//   devDependencies   개발할 때만 필요한 것              (nodemon, 테스트 도구 ...)
//
// 나중에 서버에 올릴 때 devDependencies 는 빼고 설치할 수 있어 가볍습니다.

// ✏️ 직접 해보기 3 — 위에서 만든 연습 폴더에서 npm i dayjs 를 실행하고,
//                    package.json 이 어떻게 바뀌었는지 열어서 확인하세요.


// ── 섹션 4: 생기는 것들 — node_modules 와 package-lock.json ──

// 설치하면 폴더에 두 가지가 새로 생깁니다.
//
//   node_modules/         실제 코드가 들어 있는 폴더. 아주 큽니다.
//   package-lock.json     "정확히 이 버전을 설치했다" 는 기록

// node_modules 안에 정말 들어 있는지 확인해 봅시다.
const dayjs = require("dayjs");

console.log(typeof dayjs);
// 출력: function
// require("dayjs") 에 ./ 가 없습니다. 내 파일이 아니라 설치한 패키지니까요. (개념02)

console.log(dayjs("2026-08-13").format("YYYY년 M월 D일"));
// 출력: 2026년 8월 13일

// [아주 중요] node_modules 는 Git 에 올리지 않습니다.
//
//   왜냐하면
//     · 파일이 수만 개라 엄청나게 무겁습니다
//     · package.json 만 있으면 npm install 로 언제든 다시 만들 수 있습니다
//
//   그래서 .gitignore 에 node_modules 를 적어 둡니다. (Git 단원에서 배웁니다)
//   대신 package.json 과 package-lock.json 은 반드시 올립니다.
//
//   팀원이 프로젝트를 받으면 이렇게 시작합니다.
//     git clone ...      코드 받기 (node_modules 는 없음)
//     npm install        package.json 을 보고 알아서 설치
//
// package-lock.json 이 왜 필요한가
//   ^1.11.21 은 "1.11.21 이상" 이라 사람마다 다른 버전이 깔릴 수 있습니다.
//   lock 파일은 "정확히 1.11.21" 을 못 박아 둡니다.
//   그래야 "내 컴퓨터에선 되는데요" 가 안 생깁니다.

// ✏️ 직접 해보기 4 — 이 폴더의 node_modules 폴더를 열어 보세요.
//                    dayjs 폴더가 있는지 확인하세요.


// ── 섹션 5: npm scripts — 긴 명령을 짧게 ──

// package.json 의 scripts 에 이름을 붙여 두면 짧게 실행할 수 있습니다.

console.log(Object.keys(pkg.scripts));
// 출력: [ 'start', 'hello' ]

console.log(pkg.scripts.start);
// 출력: node 개념01_Node란_무엇인가.js

// 이렇게 적어 두면 터미널에서 이렇게 실행합니다.
//
//     npm start          → node 개념01_Node란_무엇인가.js 가 실행됩니다
//     npm run hello      → hello 에 적힌 명령이 실행됩니다
//
// start 만 특별해서 run 을 생략할 수 있습니다. 나머지는 npm run 이름 입니다.
//
// 왜 쓰나
//   서버 실행 명령이 길어지기 때문입니다. 나중에 이렇게 됩니다.
//     "dev": "nodemon --watch src server.js"
//   이걸 매번 치는 대신 npm run dev 로 끝냅니다.
//
//   그리고 팀원이 "어떻게 실행해요?" 라고 물어볼 필요가 없어집니다.
//   package.json 의 scripts 만 보면 됩니다.

// ✏️ 직접 해보기 5 — 터미널에서 npm run hello 를 실행해 보세요.


// ── 섹션 6: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   SyntaxError 는 파일을 아예 못 읽게 만들어 출력이 한 줄도 안 나옵니다.

// [실수 1] 엉뚱한 폴더에서 npm install
//   바탕화면에서 npm i express 를 치면 바탕화면에 node_modules 가 생깁니다.
//   반드시 프로젝트 폴더로 cd 한 다음에 설치하세요.
//   VS Code 에서 폴더를 우클릭 → "통합 터미널에서 열기" 가 가장 안전합니다.

// [실수 2] package.json 없이 설치
//   package.json 이 없는 폴더에서 설치하면 설치는 되지만 기록이 안 남습니다.
//   나중에 팀원이 npm install 을 해도 그 패키지가 안 깔립니다.
//   먼저 npm init -y 로 만들고 설치하세요.

// [실수 3] node_modules 를 Git 에 올림
//   파일이 수만 개라 push 가 몇 분씩 걸리고, 팀원과 충돌이 납니다.
//   .gitignore 에 node_modules 를 꼭 넣으세요.

// [실수 4] package.json 을 손으로 고치고 설치를 안 함
//   dependencies 에 직접 이름을 적어 넣어도 설치는 안 됩니다.
//   적는 것과 받는 것은 별개입니다. npm install 을 실행해야 실제로 받아집니다.

// [실수 5] JSON 파일에 주석을 씀 → 에러
//   package.json 은 JSON 이라 // 주석을 쓸 수 없습니다.
//   주석을 넣으면 npm 이 파일을 못 읽어 모든 명령이 실패합니다.

// [실수 6] 이름에 한글이나 대문자를 씀
//   npm init 에서 이름을 "내프로젝트" 나 "MyApp" 으로 하면 거부당합니다.
//   소문자, 숫자, 하이픈(-)만 쓰세요.  my-app  같은 형태입니다.


// ── 정리 ──

// 1. npm = 패키지 창고 + 가져오는 도구. Node 설치할 때 같이 깔린다.
// 2. package.json 은 프로젝트 명세서. npm init -y 로 만든다.
// 3. npm i 이름 으로 설치하면 dependencies 에 자동으로 적힌다.
// 4. 개발할 때만 쓰는 것은 npm i -D 이름 (devDependencies).
// 5. node_modules 는 Git 에 올리지 않는다. package.json 만 있으면 다시 만들 수 있다.
// 6. package-lock.json 은 정확한 버전을 못 박아 "내 컴퓨터에선 되는데" 를 막는다.
// 7. scripts 에 이름을 붙여 두면 npm run 이름 으로 짧게 실행한다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log(pkg.license);   // 출력: MIT
//    console.log(pkg.author);    // 출력: 우리학원
//    → license 는 "이 코드를 남이 어떻게 써도 되는가" 입니다.
//      MIT 는 "마음대로 쓰세요" 에 가깝습니다. 수업용이라 신경 안 써도 됩니다.
//
// 2) mkdir npm연습        (또는 탐색기에서 폴더 만들기)
//    cd npm연습
//    npm init -y
//    → package.json 이 생기고, name 은 폴더 이름이 됩니다.
//
// 3) npm i dayjs
//    → package.json 에 dependencies 항목이 새로 생기고 그 안에 dayjs 가 들어갑니다.
//      node_modules 폴더와 package-lock.json 도 함께 생깁니다.
//
// 4) node_modules 안에 dayjs 폴더가 있고, 그 안에 실제 코드 파일들이 있습니다.
//    폴더가 몇 개인지도 세어 보세요. dayjs 는 혼자라 몇 개 없지만,
//    express 를 설치하면 수십 개가 딸려 옵니다.
//    패키지가 또 다른 패키지를 쓰기 때문입니다.
//
// 5) npm run hello
//    → 스크립트로 실행됐습니다
//      package.json 의 scripts.hello 에 적힌 명령이 실행된 것입니다.
