// ============================================================
// 15단원 부록 · 자료가 미리 만들어 둔 파일 — 읽지 않아도 됩니다
// ------------------------------------------------------------
// 이 폴더의 예제는 정리 상자를 이렇게 가져옵니다.
//
//     import Summary from "../_ui/Summary.jsx";
//
// 그런데 Summary.jsx 는 자바스크립트 파일이라 타입이 하나도 없습니다.
// 그대로 두면 npm run typecheck 가 이렇게 말합니다.
//
//     error TS7016: Could not find a declaration file for module '../_ui/Summary.jsx'.
//     '.../src/_ui/Summary.jsx' implicitly has an 'any' type.
//
// "그 파일이 무엇인지 모르겠다" 는 뜻입니다.
// 아래 세 줄이 "그건 그냥 컴포넌트다" 라고 한 번 알려 주는 것입니다.
//
// 확장자가 .d.ts 인 파일은 '타입만 적는 파일' 입니다.
// 실행되는 코드는 한 줄도 들어가지 않고, 화면에도 나타나지 않습니다.
// 이런 파일을 직접 쓸 일은 당분간 없습니다. 있다는 것만 보고 넘어가세요.
// ============================================================

declare module "*.jsx" {
  import type { ComponentType } from "react";
  const component: ComponentType<any>;
  export default component;
}
