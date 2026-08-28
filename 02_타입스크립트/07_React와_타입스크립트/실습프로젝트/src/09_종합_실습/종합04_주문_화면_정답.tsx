// ============================================================
// 09단원 · 종합 04 정답 — 주문 화면
// ------------------------------------------------------------
// 보기: npm run dev → 왼쪽 목록에서 고르기
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

import { useState } from "react";
import type { ReactNode } from "react";
import Summary from "../_ui/Summary.tsx";

// ───── 문제 1 ───── props 에 타입 (07단원 개념01)
type Menu = { id: number; name: string; price: number };

type MenuItemProps = {
  menu: Menu;
  onAdd: (menu: Menu) => void;
};

function MenuItem({ menu, onAdd }: MenuItemProps) {
  return (
    <li>
      {menu.name} — {menu.price}원{" "}
      <button type="button" onClick={() => onAdd(menu)}>
        담기
      </button>
    </li>
  );
}
// 해설 ① props 는 객체 하나이므로 04단원의 객체 타입을 그대로 씁니다.
// 해설 ② 함수 props 는 (인자) => 반환값 입니다. 돌려줄 게 없으면 => void.
// 해설 ③ 안 적으면 TS7031(Binding element ... implicitly has an 'any' type)입니다.

// ───── 문제 2 ───── children 받는 상자 (07단원 개념01 섹션4)
type PanelProps = { title: string; children: ReactNode };

function Panel({ title, children }: PanelProps) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
      {children}
    </div>
  );
}
// 해설 ① children 은 자동으로 안 생깁니다. 직접 적어야 합니다.
// 해설 ② ReactNode 는 "화면에 그릴 수 있는 것 전부" 입니다.
// 해설 ③ import type 을 쓰면 "타입만 가져온다" 가 분명해집니다.

// ───── 문제 3 ───── 화면 상태 (판별 유니온)
type CartItem = { menu: Menu; count: number };

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

type OrderState =
  | { status: "시작전" }
  | { status: "보내는중" }
  | { status: "성공"; total: number }
  | { status: "실패"; message: string };

const MENUS: Menu[] = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "카페라떼", price: 4500 },
  { id: 3, name: "케이크", price: 6000 },
];

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

function OrderView({ state }: { state: OrderState }) {
  switch (state.status) {
    case "시작전":
      return <p>담고 주문 버튼을 눌러 보세요.</p>;
    case "보내는중":
      return <p>보내는 중...</p>;
    case "성공":
      return <p style={{ color: "#2d6cdf" }}>주문 완료 — {state.total}원</p>;
    case "실패":
      return <p style={{ color: "#c00" }}>오류: {state.message}</p>;
  }
}

// 해설 ① "성공" 에만 total 이, "실패" 에만 message 가 있습니다.
//        성공인데 오류 메시지가 있는 상태를 아예 못 만듭니다.
// 해설 ② case 안에서 state.total 을 확인 없이 씁니다. 타입에 적혀 있으니까요.
// 해설 ③ 상태를 하나 늘리면 이 switch 가 TS2366 으로 걸려서 고칠 곳을 알려 줍니다.

// ───── 문제 4 ───── useState 세 가지 (07단원 개념02)
export default function Page() {
  const [cart, setCart] = useState<CartItem[]>([]); //  빈 배열로 시작
  const [selected, setSelected] = useState<Menu | null>(null); //  null 로 시작
  const [status, setStatus] = useState<Status>("대기"); //  리터럴 유니온
  const [order, setOrder] = useState<OrderState>({ status: "시작전" });
  const [memo, setMemo] = useState("");

  const total = cart.reduce((sum, item) => sum + item.menu.price * item.count, 0);

  // ───── 문제 5 ───── 장바구니 담기 (불변 갱신)
  function addToCart(menu: Menu) {
    setSelected(menu);
    const found = cart.find((c) => c.menu.id === menu.id);
    if (found === undefined) {
      setCart([...cart, { menu, count: 1 }]);
      return;
    }
    setCart(cart.map((c) => (c.menu.id === menu.id ? { ...c, count: c.count + 1 } : c)));
  }

  // ───── 문제 6 ───── 폼과 입력 (07단원 개념03)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cart.length === 0) {
      setOrder({ status: "실패", message: "장바구니가 비었습니다" });
      return;
    }

    setOrder({ status: "보내는중" });
    const text = await 주문전송(total);

    // 여기서부터는 종합03 문제2와 똑같습니다. 받은 것은 그냥 문자열입니다.
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      setOrder({ status: "실패", message: "서버 응답을 알아볼 수 없습니다" });
      return;
    }

    if (typeof data === "object" && data !== null && "ok" in data && data.ok === true) {
      setOrder({ status: "성공", total });
    } else {
      setOrder({ status: "실패", message: "주문이 접수되지 않았습니다" });
    }
  }

  function handleMemo(e: React.ChangeEvent<HTMLInputElement>) {
    setMemo(e.target.value);
  }

  return (
    <div>
      <h2>종합 04 정답 — 주문 화면</h2>

      <Panel title="메뉴">
        <ul>
          {MENUS.map((m) => (
            <MenuItem key={m.id} menu={m} onAdd={addToCart} />
          ))}
        </ul>
        <p>마지막으로 고른 것: {selected?.name ?? "없음"}</p>
      </Panel>

      <Panel title="장바구니">
        {cart.length === 0 ? (
          <p>비어 있습니다.</p>
        ) : (
          <ul>
            {cart.map((c) => (
              <li key={c.menu.id}>
                {c.menu.name} x{c.count} = {c.menu.price * c.count}원
              </li>
            ))}
          </ul>
        )}
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
        <OrderView state={order} />
      </Panel>

      <Panel title="상태">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            style={{ marginRight: 6 }}
          >
            {s}
          </button>
        ))}
        <p>{statusText(status)}</p>
      </Panel>

      <Summary
        items={[
          "props 는 객체 타입 그대로. 함수 props 는 (인자) => void.",
          "children 은 직접 적는다 — children: ReactNode.",
          "useState 에 타입을 적어야 하는 세 경우가 이 화면에 다 나온다.",
          "  빈 배열 useState<CartItem[]>([]) · null useState<Menu | null>(null)",
          "  리터럴 유니온 useState<Status>(\"대기\")",
          "이벤트는 인라인이면 안 적고, 따로 빼면 적는다.",
          "화면 상태는 판별 유니온 하나로 묶고 switch 로 그린다.",
          "any · ! · as 를 한 번도 안 썼다.",
        ]}
      />
    </div>
  );
}
// 해설 ① useState 에 타입을 적어야 하는 세 경우가 이 화면에 전부 나옵니다.
//        useState([]) 로 두면 never[] 가 되어 setCart 가 통째로 막힙니다.
//        useState(null) 로 두면 null 전용 상자가 되어 setSelected(menu) 가 걸립니다.
//        useState("대기") 로 두면 string 이 되어 statusText(status) 가 TS2345 로 걸립니다.
// 해설 ② e.preventDefault() 를 빠뜨리면 화면이 새로고침되면서 장바구니가 사라집니다.
//        타입은 이걸 안 막아 줍니다. 01단원의 "타입이 못 잡는 것" 입니다.
// 해설 ③ OrderView 의 switch 는 네 상태를 다 덮습니다.
//        상태를 하나 늘리면 그 자리에서 걸려서, 고칠 곳을 타입이 찾아 줍니다.
//        반면 statusText 는 Status 를 늘릴 때 걸립니다. 서로 독립적입니다.
