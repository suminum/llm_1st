// ============================================================
// 부품 — 08단원 연습문제 12번 [도전] 의 정답 파일
// ------------------------------------------------------------
// ★ 여러분이 만들 파일은 _부품/연습_주문표.jsx 입니다.
//   이 파일은 정답 파일이 쓰려고 이름만 다르게 미리 만들어 둔 것입니다.
//   (같은 이름으로 두면 여러분이 만든 파일과 부딪히기 때문입니다)
//   내용은 여러분이 만들 것과 똑같습니다.
//
// 문제에서 시킨 것:
//   - CoffeeCard 를 가져와 쓴다
//   - items 배열을 props 로 받아 map 으로 그린다
//   - 합계를 아래에 보여 준다
// ============================================================

import CoffeeCard from "./연습_카드.jsx";
import { formatPrice } from "./연습_가격.js";

export default function OrderTable({ items }) {
  // 05단원 개념04에서 배운 reduce 대신, 07단원까지 쓴 방법으로도 됩니다.
  // 여기서는 JS자료 08단원의 reduce 를 씁니다.
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      {items.map((item) => (
        <CoffeeCard key={item.id} name={item.name} price={item.price} note={item.note} />
      ))}
      <p className="output">
        <strong>합계 {formatPrice(total)}</strong>
      </p>
    </div>
  );
}
