// ============================================================
// 09단원 · 종합 04 — 주문 화면
// ------------------------------------------------------------
// 보기: npm run dev → 왼쪽 목록에서 고르기
// 검사: npm run check
// ------------------------------------------------------------
// 사용 단원: 07단원 전체 (props · useState · 이벤트 · 판별 유니온)
// ============================================================
//
// 앞의 종합01~03에서 만든 것을 화면에 올립니다.
//
// ★ 규칙 — any · ! · as 를 쓰지 않습니다.
//
// 이 단원은 자동 채점이 없습니다. 두 가지로 확인하세요.
//   ① npm run check 가 조용해지는가
//   ② '기대 화면' 대로 나오는가 (npm run dev 로 직접 눌러 보기)
//
// ★ check 가 잡아 주는 것은 문제 1·2·6 뿐입니다.
//   문제 3·4·5 는 안 풀어도 조용합니다. 반드시 화면으로 판정하세요.
//   (문제 4 는 문제 5 에서 setCart 를 부르기 시작하면 그때 걸립니다)
//
// 막히면 종합04_주문_화면_정답.tsx 를 보세요.

import { useState } from "react";
import Summary from "../_ui/Summary.tsx";

type Menu = { id: number; name: string; price: number };

const MENUS: Menu[] = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "카페라떼", price: 4500 },
  { id: 3, name: "케이크", price: 6000 },
];


// 서버라고 치는 함수입니다. 400ms 뒤에 JSON 문자열을 돌려줍니다.
// 총액이 20000원 이상이면 서버가 이상한 것을 보내는 상황을 흉내 냅니다.
// (new Promise 는 안 배웠습니다. 그냥 쓰세요 — await 하면 문자열이 나옵니다)
function 주문전송(총액: number): Promise<string> {
  const 응답 =
    총액 >= 20000
      ? "<html>502 Bad Gateway</html>"
      : `{"ok":true,"orderId":${1000 + (총액 % 1000)}}`;
  return new Promise((resolve) => setTimeout(() => resolve(응답), 400));
}

type Status = "대기" | "조리중" | "완료";
const STATUSES: Status[] = ["대기", "조리중", "완료"];

function statusText(s: Status): string {
  switch (s) {
    case "대기":
      return "곧 시작합니다";
    case "조리중":
      return "만들고 있어요";
    case "완료":
      return "나왔습니다";
  }
}

// ───── 문제 1 ───── props 에 타입 붙이기 (개념01)
// MenuItem 은 메뉴 하나와 '담기 버튼을 눌렀을 때 부를 함수' 를 받습니다.
// type MenuItemProps 를 만들어 붙이세요.
//
// 기대 화면: 메뉴 세 줄에 [담기] 버튼
//
// TODO: type MenuItemProps 를 만들고 붙이세요
function MenuItem({ menu, onAdd }) {
  return (
    <li>
      {menu.name} — {menu.price}원{" "}
      <button type="button" onClick={() => onAdd(menu)}>
        담기
      </button>
    </li>
  );
}

// ───── 문제 2 ───── children 받기 (개념01 섹션4)
// Panel 은 제목과 '태그 사이의 내용' 을 받습니다.
// children 을 받도록 고치세요.
//
// 기대 화면: 제목이 붙은 상자 안에 내용이 들어감
//
// TODO: children 을 받도록 고치세요
type PanelProps = { title: string };
function Panel({ title }: PanelProps) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
    </div>
  );
}

// ───── 문제 3 ───── 화면 상태 (개념04)
// 주문 상태를 판별 유니온으로 만들고, switch 로 그리는 OrderView 를 만드세요.
//
//   "시작전"   → 담고 주문 버튼을 눌러 보세요.
//   "보내는중" → 보내는 중...
//   "성공"     → 주문 완료 — N원   (total 을 가집니다)
//   "실패"     → 오류: 메시지      (message 를 가집니다)
//
// 기대 화면: 주문 버튼을 누르면 "보내는 중..." 이 잠깐 뜨고 "주문 완료 — N원"
//
// TODO: type OrderState 와 OrderView 를 만드세요


export default function Page() {
  // ───── 문제 4 ───── useState 세 가지 (개념02)
  // 아래 셋에 타입을 정해 주세요. 07단원에서 배운 '적어야 하는 세 경우' 가 전부 나옵니다.
  //   cart     : 빈 배열로 시작        → 지금은 never[] 라 담기가 안 됩니다
  //   selected : null 로 시작          → 지금은 null 전용 상자입니다
  //   status   : "대기" 로 시작        → 지금은 string 이라 오타가 안 걸립니다
  //
  // 기대 화면: 담기를 누르면 목록이 늘고, "마지막으로 고른 것" 이 바뀜
  //
  // TODO: 세 줄에 타입을 정해 주세요
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("대기");

  const [memo, setMemo] = useState("");

  const total = 0; // ← 문제 5에서 고칩니다

  // ───── 문제 5 ───── 장바구니 담기 (개념02 · React자료 07단원 불변 갱신)
  // ① addToCart 를 완성하세요.
  //      · 이미 담긴 메뉴면 count 를 1 늘립니다
  //      · 아니면 { menu, count: 1 } 을 새로 담습니다
  //      · 담을 때 selected 도 갱신합니다
  // ② 위 total 을 '장바구니 합계' 로 고치세요 (reduce 를 쓰면 짧습니다)
  //
  // ★ cart.push(...) 는 화면을 안 바꿉니다. 새 배열을 만들어 setCart 하세요.
  //
  // 기대 화면: 아메리카노를 두 번 담으면 '담긴 종류' 는 1가지 그대로인데
  //           합계만 8000원으로 늡니다. (2가지가 되면 새로 담은 것이라 틀린 것입니다)
  //
  // TODO: addToCart 를 완성하고 total 을 고치세요
  function addToCart(menu: Menu) {
    console.log(menu.name);
  }

  // ───── 문제 6 ───── 진짜 서버처럼 (개념03 · 06단원 async · 종합03 확인)
  // 이 실습의 마지막이자, 09단원 전체가 만나는 자리입니다.
  //
  // ① handleSubmit 의 매개변수에 타입을 붙이고, 새로고침을 막으세요.
  // ② 장바구니가 비었으면 실패 상태로 두고 끝냅니다.
  // ③ 아니면 "보내는중" 으로 바꾼 뒤 await 주문전송(total) 로 응답을 받습니다.
  //    (handleSubmit 앞에 async 를 붙여야 await 를 쓸 수 있습니다 — 06단원 개념03)
  // ④ ★ 받은 것은 그냥 문자열입니다. 종합03에서 한 대로 확인하고 쓰세요.
  //      · JSON.parse 를 try / catch 로 감쌉니다. 실패하면 실패 상태로.
  //      · unknown 으로 받아 ok 가 true 인지 확인합니다. 아니면 실패 상태로.
  //      · 통과하면 { status: "성공", total } 입니다.
  // ⑤ handleMemo 의 매개변수에도 타입을 붙이세요.
  //
  // ★ 총액 20000원이 넘으면 서버가 JSON 이 아닌 것을 보냅니다(위 주문전송 참고).
  //   try 를 빠뜨리면 그 순간 화면이 통째로 멈춥니다. 직접 빼 보고 확인하세요.
  //
  // 기대 화면: 주문하면 "보내는 중..." 이 잠깐 뜨고 "주문 완료 — N원".
  //           빈 장바구니면 오류 문구. 20000원 넘게 담고 주문하면
  //           화면이 안 터지고 "오류: 서버 응답을 알아볼 수 없습니다" 가 뜸.
  //
  // TODO: 두 핸들러에 타입을 붙이고 내용을 채우세요
  function handleSubmit(e) {
    console.log(e);
  }

  function handleMemo(e) {
    setMemo(e.target.value);
  }

  return (
    <div>
      <h2>종합 04 — 주문 화면</h2>

      <Panel title="메뉴">
        <ul>
          {MENUS.map((m) => (
            <MenuItem key={m.id} menu={m} onAdd={addToCart} />
          ))}
        </ul>
        <p>마지막으로 고른 것: {selected?.name ?? "없음"}</p>
      </Panel>

      <Panel title="장바구니">
        <p>담긴 종류: {cart.length}가지</p>
        <p>합계: {total}원</p>
        <button type="button" onClick={() => setCart([])}>
          비우기
        </button>
      </Panel>

      <Panel title="주문">
        <form onSubmit={handleSubmit}>
          <input value={memo} onChange={handleMemo} placeholder="메모 (선택)" />{" "}
          <button type="submit">주문하기</button>
        </form>
        <p>메모: {memo.trim() === "" ? "(없음)" : memo}</p>
        {/* TODO: 문제 3에서 만든 OrderView 를 여기에 넣으세요 */}
      </Panel>

      <Panel title="상태">
        {STATUSES.map((s) => (
          <button key={s} type="button" onClick={() => setStatus(s)} style={{ marginRight: 6 }}>
            {s}
          </button>
        ))}
        <p>{statusText(status)}</p>
      </Panel>

      <Summary
        items={[
          "props 에 타입을 붙이는 것이 이 단원의 절반이다.",
          "useState 는 null · 빈 배열 · 리터럴 유니온 이 셋만 적으면 된다.",
          "이벤트 타입은 인라인으로 써 본 뒤 마우스를 올려 베낀다.",
          "화면 상태는 판별 유니온 하나로 묶는다.",
          "any · ! · as 를 쓰지 않는다.",
        ]}
      />
    </div>
  );
}
