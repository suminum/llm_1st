// ============================================================
// 부품 — 메뉴판 전체
// ------------------------------------------------------------
// 08단원 개념04에서 씁니다.
//
// ★ 이 파일이 보여 주는 것: 부품도 다른 부품을 import 할 수 있습니다.
//   MenuBoard 는 MenuRow 를 쓰고, 개념04 파일은 MenuBoard 를 씁니다.
//   개념04 파일은 MenuRow 를 몰라도 됩니다.
//
// ★ 경로가 "./MenuRow.jsx" 입니다. ./ 는 '나와 같은 폴더' 라는 뜻이고,
//   MenuBoard.jsx 와 MenuRow.jsx 는 둘 다 _부품 폴더 안에 있습니다.
//   개념04 파일에서 부를 때의 경로("./_부품/MenuRow.jsx")와 다릅니다.
//   경로는 늘 '그 줄이 적힌 파일' 을 기준으로 읽습니다.
// ============================================================

import MenuRow from "./MenuRow.jsx";

export default function MenuBoard() {
  return (
    <div className="output">
      <h4>동네 카페 메뉴판</h4>
      <MenuRow name="아메리카노" price={4000} />
      <MenuRow name="라떼" price={4500} />
      <MenuRow name="케이크" price={6000} />
      <MenuRow name="삼각김밥" price={1200} />
    </div>
  );
}
