// ============================================================
// 실습 프로젝트 시작점 — 모든 단원이 함께 쓰는 파일입니다
// ------------------------------------------------------------
// 이 파일은 자료가 미리 만들어 둔 '틀'입니다. 고치지 않아도 됩니다.
// 여기서 무슨 일이 일어나는지는 01단원 개념02에서 설명합니다.
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.querySelector("#root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
