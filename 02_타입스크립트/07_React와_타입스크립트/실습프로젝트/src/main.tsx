// ============================================================
// 실습 프로젝트 시작점
// ------------------------------------------------------------
// 이 파일은 자료가 미리 만들어 둔 '틀'입니다. 고치지 않아도 됩니다.
//
// React자료의 main.jsx 와 딱 두 가지가 다릅니다.
//   ① 확장자가 .tsx
//   ② querySelector 결과가 null 일 수 있어서 확인이 필요함 (아래 참고)
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// document.querySelector 의 반환 타입은 Element | null 입니다.
// index.html 에 #root 가 분명히 있지만, 타입스크립트는 HTML 을 안 읽습니다.
// 그래서 "없을 수도 있다" 고 보고 확인을 요구합니다.
//
// React자료에서는 이 줄을 그냥 썼습니다. JS 였으니까요.
//   createRoot(document.querySelector("#root")).render(...)
//
// 여기서는 ! 를 쓰지 않고 이렇게 처리합니다(05단원 개념03 섹션5).
const root = document.querySelector("#root");

if (root === null) {
  throw new Error("index.html 에 <div id=\"root\"> 가 없습니다.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
