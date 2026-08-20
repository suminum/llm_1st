// ============================================================
// 부품 — 08단원 연습문제 4번이 쓰는 파일
// ------------------------------------------------------------
// 이 파일은 이미 다 되어 있습니다. 고치지 마세요.
//
// export default 와 이름 있는 export 가 한 파일에 같이 있습니다.
// 가져올 때는 한 줄에 이렇게 씁니다.
//
//     import Badge, { hotLabel } from "./_부품/연습_뱃지.jsx";
// ============================================================

// [이름 있는 export]
export const hotLabel = "인기";

// [export default] 이 파일의 대표
export default function Badge({ text }) {
  return <span className="on">{text}</span>;
}
