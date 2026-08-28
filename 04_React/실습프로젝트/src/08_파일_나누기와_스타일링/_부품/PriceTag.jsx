// ============================================================
// 부품 — 가격표 한 줄
// ------------------------------------------------------------
// 08단원 개념02에서 씁니다.
// 한 파일에서 'export default' 와 '이름 있는 export' 를 같이 쓰는 예입니다.
// ============================================================

// [이름 있는 export] 기본 문구입니다. 밖에서 이 값만 따로 가져다 쓸 수 있습니다.
export const defaultNote = "가장 많이 팔립니다";

// [export default] 이 파일의 대표입니다.
export default function PriceTag({ name, price, note = defaultNote }) {
  return (
    <div className="output">
      <strong>{name}</strong> — {price}원
      <br />
      <small>{note}</small>
    </div>
  );
}
