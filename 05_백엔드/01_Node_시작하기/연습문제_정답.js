// ============================================================
// 01단원 연습문제 정답
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================
//
// 먼저 스스로 풀어 본 다음에 보세요.
// 답보다 '왜 그런지' 설명을 꼭 읽으세요.


// ───── 문제 1 ─────
console.log(typeof window, typeof document, typeof alert);
// 출력: undefined undefined undefined
// 셋 다 브라우저가 주던 것입니다. Node 에는 화면이 없어서 없습니다.


// ───── 문제 2 ─────
const prices = [1500, 4000, 2500, 6000];

console.log(prices.filter((price) => price >= 3000));
// 출력: [ 4000, 6000 ]
// filter 는 브라우저에서 쓰던 것 그대로입니다.
// Node 로 왔다고 새 문법을 배우는 게 아닙니다.


// ───── 문제 3 ─────
console.log(typeof process.platform === "string");
// 출력: true
// 윈도우면 "win32", 맥이면 "darwin", 리눅스면 "linux" 입니다.
// 나중에 EC2 에 올리면 "linux" 가 나옵니다.


// ───── 문제 4 ─────
const args = process.argv.slice(2);
console.log(args);
// 출력: []
// slice(2) 로 앞의 두 개(Node 위치, 파일 위치)를 잘라냈습니다.
//
// node 연습문제_정답.js 커피 3 으로 실행하면 [ '커피', '3' ] 이 나옵니다.
// 숫자 3을 넘겼는데 '3' 이라는 문자열입니다.
// 터미널에서 넘어오는 값은 언제나 문자열입니다.


// ───── 문제 5 ─────
const calc = require("./계산기");
console.log(calc.TAX_RATE);
// 출력: 0.1
// ./ 가 있으면 "내가 만든 파일" 입니다. .js 는 생략해도 됩니다.


// ───── 문제 6 ─────
const { add, addTax } = require("./계산기");

console.log(add(100, 200));
// 출력: 300
console.log(addTax(20000));
// 출력: 22000
// 실무에서 가장 많이 보는 형태입니다.
// const express = require("express") 처럼 통째로 받기도 하고,
// const { Router } = require("express") 처럼 필요한 것만 꺼내기도 합니다.


// ───── 문제 7 ─────
const { SECRET_KEY } = require("./계산기");
console.log(SECRET_KEY);
// 출력: undefined
//
// 에러가 아닙니다. 조용히 undefined 입니다. 그래서 더 헷갈립니다.
// 계산기.js 의 module.exports 에 SECRET_KEY 가 없기 때문입니다.
//
// "분명 만들었는데 undefined 가 나온다" 면
// 그 파일의 module.exports 를 먼저 확인하세요.


// ───── 문제 8 ─────
const path = require("path");
console.log(path.join("uploads", "2026", "report.pdf"));
// 출력: uploads\2026\report.pdf
//
// ./ 없이 이름만 썼습니다. 내 파일이 아니라 Node 내장 모듈이니까요.
//
// 왜 직접 "uploads/2026/report.pdf" 라고 안 쓰나
//   윈도우는 \ 를, 리눅스는 / 를 씁니다.
//   내 컴퓨터(윈도우)에서 되던 코드가 EC2(리눅스)에서 깨질 수 있습니다.
//   path.join 은 그 차이를 알아서 맞춰 줍니다.
//   경로를 다룰 때는 항상 path 를 쓰세요.


// ───── 문제 9 ─────
const pkg = require("./package.json");
console.log(pkg.name, pkg.version);
// 출력: 01-node-start 1.0.0
// CommonJS 에서는 JSON 파일도 require 로 읽을 수 있습니다.
// 읽으면 그냥 객체가 됩니다.


// ───── 문제 10 ─────
console.log(Object.keys(pkg.scripts));
// 출력: [ 'start', 'hello' ]
// 여기에 적힌 이름으로 npm run 이름 을 실행할 수 있습니다.
// 팀원이 "어떻게 실행해요?" 라고 물으면 여기를 보라고 하면 됩니다.


// ───── 문제 11 ─────
const dayjs = require("dayjs");
console.log(dayjs("2026-03-05").format("YYYY년 M월 D일"));
// 출력: 2026년 3월 5일
//
// npm i dayjs 로 설치했기 때문에 ./ 없이 이름만 써도 찾아냅니다.
// node_modules 안을 뒤져 줍니다.
//
// MM 과 M 의 차이
//   MM → 03 (두 자리로 맞춤)    M → 3
//   상황에 맞게 고르면 됩니다.


// ───── 문제 12 ─────
try {
  console.log(없는변수);
} catch (error) {
  console.log(error.name);
  // 출력: ReferenceError
}
// error.name 은 종류, error.message 는 설명입니다.
// 터미널에 빨갛게 뜨는 것은 이 둘을 합친 모양입니다.


// ───── 문제 13 ─────
const order1 = { id: 1, customer: { city: "부산" } };
const order2 = { id: 2 };

console.log(order1.customer?.city || "정보 없음");
// 출력: 부산
console.log(order2.customer?.city || "정보 없음");
// 출력: 정보 없음

// ?. 가 없으면 어떻게 되나
//   order2.customer 는 undefined 입니다.
//   undefined.city 를 읽으려다 TypeError 로 프로그램이 죽습니다.
//
//   ?. 는 "왼쪽이 없으면 더 들어가지 말고 undefined 를 내놔라" 입니다.
//   || 는 그 undefined 를 "정보 없음" 으로 바꿔 줍니다.
//   역할이 달라서 둘 다 필요합니다.
//
// ★ 백엔드에서 이 패턴을 매일 씁니다.
//   요청으로 들어온 데이터, 데이터베이스에서 꺼낸 데이터에는
//   비어 있는 자리가 항상 있습니다.


// ───── 문제 14 ─────
function safeFixed(value) {
  try {
    return value.toFixed(2);
  } catch (error) {
    console.log("실패 이유:", error.message);
    return "계산 불가";
  }
}

console.log(safeFixed(3.14159));
// 출력: 3.14
console.log(safeFixed("문자열"));
// 출력: 실패 이유: value.toFixed is not a function
// 출력: 계산 불가
console.log(safeFixed(null));
// 출력: 실패 이유: Cannot read properties of null (reading 'toFixed')
// 출력: 계산 불가

// 출력 순서에 주의하세요
//   console.log(safeFixed("문자열")) 은 안쪽 함수가 먼저 실행됩니다.
//   그래서 함수 안의 "실패 이유:" 가 먼저 찍히고,
//   돌려준 "계산 불가" 가 나중에 찍힙니다.
//
// 에러 종류가 두 개인 것에 주목하세요
//   "문자열" → TypeError: value.toFixed is not a function  (그런 메소드가 없다)
//   null     → TypeError: Cannot read properties of null    (아예 값이 없다)
//   원인은 다르지만 처리 방식은 같습니다.
//
// catch 를 비워 두면 안 되는 이유
//   catch (error) {} 라고만 하면 에러가 조용히 사라집니다.
//   나중에 "왜 계산 불가가 나오지?" 를 절대 못 찾습니다.
//   최소한 message 는 남기세요.


// ───── 문제 15 ─────
// const wrong = require("계산기");
//
// 에러: Error: Cannot find module '계산기'
//
// 왜:
//   ./ 를 빼먹었습니다.
//   ./ 가 없으면 Node 는 "내가 만든 파일" 이 아니라
//   "npm 으로 설치한 패키지" 를 node_modules 에서 찾습니다.
//   거기에 '계산기' 라는 패키지는 없으니 못 찾습니다.
//
// 고치는 방법:
//   const right = require("./계산기");
//
// 이 에러를 보면 확인할 것 두 가지
//   ① ./ 로 시작하나?        → 내 파일인데 빠뜨린 것
//   ② npm install 을 했나?   → 패키지인데 설치를 안 한 것
