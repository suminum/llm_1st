// ============================================================
// 07단원 연습문제 — React 와 타입스크립트
// ------------------------------------------------------------
// 보기: npm run dev → 왼쪽 목록에서 "연습문제" 고르기
// 검사: npm run check          ← 연습문제 전용 검사입니다
// ============================================================
//
// ★ 이 단원은 브라우저라 자동 채점이 없습니다. 화면으로 판정하세요.
//   (01~06·08단원은 npm run grade 로 출력을 대조합니다)
//
//   npm run check(타입 검사)가 10문항 중 8개를 잡아 줍니다.
//   나머지 문제 5 와 10 은 검사가 못 잡습니다. '기대 화면' 을 눈으로 확인하세요.
//   ★ 문제 10 은 [도전] 인데도 검사에 안 걸립니다. check 가 조용해도 다 푼 게 아닙니다.
//   문제 2·3·9 는 만드는 쪽이 아니라 '쓰는 쪽'(아래 Page 화면)에서 걸립니다.
//   걸리는 것과 별개로 동작(기본값·children·onStep)은 화면으로 봐야 합니다.
//   (npm run typecheck 는 개념·정답 파일만 봅니다. 그쪽은 언제나 조용합니다)
//
// 푸는 방법
//   1. TODO 자리에 코드를 씁니다.
//   2. 화면이 '기대 화면' 처럼 나오는지 봅니다.
//   3. npm run check 로 타입도 봅니다.
//   4. 10분 고민해도 안 되면 연습문제_정답.tsx 를 보세요.
//
// 문제 1~6은 기본, 7~9는 응용, 10은 [도전]입니다.

import { useState } from "react";
import Summary from "../_ui/Summary.tsx";

// ───── 문제 1 ───── (개념01 섹션1)
// 아래 컴포넌트의 props 에 타입을 붙이세요.
//
// 기대 화면: 아메리카노 — 4000원
//
// TODO: type MenuItemProps 를 만들고 붙이세요
function MenuItem({ name, price }) {
  return (
    <li>
      {name} — {price}원
    </li>
  );
}

// ───── 문제 2 ───── (개념01 섹션3)
// color 를 '없어도 되는' props 로 만들고, 없으면 "#555" 가 되게 하세요.
//
// 기대 화면: 회색 배지 하나, 파란 배지 하나
//
// TODO: color 를 선택 props 로 바꾸고 기본값을 주세요
type BadgeProps = { text: string; color: string };
function Badge({ text, color }: BadgeProps) {
  return (
    <span style={{ background: color, color: "#fff", padding: "2px 8px", borderRadius: 4 }}>
      {text}
    </span>
  );
}

// ───── 문제 3 ───── (개념01 섹션4)
// 태그 사이의 내용을 받을 수 있게 children 을 추가하세요.
//
// 기대 화면: 제목이 붙은 상자 안에 글이 들어감
//
// TODO: children 을 받도록 고치세요
type BoxProps = { title: string };
function Box({ title }: BoxProps) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
    </div>
  );
}

// ───── 문제 4 ───── (개념02 섹션3)
// 아래 useState 는 never[] 로 잡혀서 담기가 안 됩니다. 고치세요.
//
// 기대 화면: 담기를 누르면 목록이 늘어남
type Menu = { id: number; name: string };

function Cart() {
  // TODO: 타입을 정해 주세요
  const [items, setItems] = useState([]);

  return (
    <div>
      <button type="button" onClick={() => setItems([...items, { id: items.length + 1, name: "라떼" }])}>
        담기 ({items.length})
      </button>
      <ul>
        {items.map((m) => (
          <li key={m.id}>{m.name}</li>
        ))}
      </ul>
    </div>
  );
}

// ───── 문제 5 ───── (개념02 섹션2)
// 고른 메뉴를 담는 상태를 만드세요. 처음에는 아무것도 안 골랐습니다.
// 안 골랐으면 "없음" 이 나와야 합니다.
//
// 기대 화면: 없음 → (버튼) → 라떼
function Selected() {
  // TODO: null 로 시작하는 상태를 만드세요
  return (
    <div>
      <button type="button">라떼 고르기</button>
      <p>고른 것: 없음</p>
    </div>
  );
}

// ───── 문제 6 ───── (개념03 섹션3)
// 입력창 핸들러를 함수 밖으로 뺐습니다. 매개변수에 타입을 붙이세요.
//
// 기대 화면: 입력할수록 글자 수가 늘어남
function TextInput() {
  const [text, setText] = useState("");

  // TODO: e 에 타입을 붙이세요
  function handleChange(e) {
    setText(e.target.value);
  }

  return (
    <div>
      <input value={text} onChange={handleChange} placeholder="메뉴 이름" />
      <p>{text.length}자</p>
    </div>
  );
}

// ───── 문제 7 ───── (응용 · 개념02 섹션4)
// status 가 정해진 세 값만 되도록 고치세요.
// (지금은 string 이라 "취소" 같은 오타가 안 걸립니다)
//
// 기대 화면: 버튼 세 개, 누르면 아래 글자가 바뀜
type Status = "대기" | "조리중" | "완료";
const STATUSES: Status[] = ["대기", "조리중", "완료"];

function statusLabel(s: Status): string {
  return s === "완료" ? "다 됐습니다" : s;
}

function StatusPicker() {
  // TODO: 타입을 정해 주세요 (지금은 아래 statusLabel(status) 가 걸립니다)
  const [status, setStatus] = useState("대기");

  return (
    <div>
      {STATUSES.map((s) => (
        <button key={s} type="button" onClick={() => setStatus(s)} style={{ marginRight: 6 }}>
          {s}
        </button>
      ))}
      <p>현재: {statusLabel(status)}</p>
    </div>
  );
}

// ───── 문제 8 ───── (응용 · 개념03 섹션4)
// 폼 핸들러에 타입을 붙이고, 새로고침이 안 되게 막으세요.
//
// 기대 화면: 입력 후 주문을 누르면 목록에 쌓임 (화면이 새로고침되면 안 됨)
function OrderForm() {
  const [menu, setMenu] = useState("");
  const [orders, setOrders] = useState<string[]>([]);

  // TODO: e 에 타입을 붙이고 기본 동작을 막으세요
  function handleSubmit(e) {
    if (menu.trim() === "") return;
    setOrders([...orders, menu]);
    setMenu("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={menu} onChange={(e) => setMenu(e.target.value)} placeholder="주문할 메뉴" />{" "}
      <button type="submit">주문</button>
      <ul>
        {orders.map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>
    </form>
  );
}

// ───── 문제 9 ───── (응용 · 개념01 섹션5)
// 버튼을 눌렀을 때 부모에게 값을 넘겨 주는 props 를 추가하세요.
//
// 기대 화면: 누르면 아래에 "마지막 값: N" 이 갱신됨
type StepperProps = { label: string };

function Stepper({ label }: StepperProps) {
  const [n, setN] = useState(0);

  function handleClick() {
    const next = n + 1;
    setN(next);
    // TODO: 부모에게 next 를 넘기세요
  }

  return (
    <button type="button" onClick={handleClick}>
      {label}: {n}
    </button>
  );
}

// ───── 문제 10 ───── ([도전] · 개념04)
// 아래 흩어진 상태를 판별 유니온 하나로 바꾸세요.
//   ① type LoadState 를 만든다 ("시작전" / "로딩중" / "성공"(data) / "실패"(message))
//   ② useState<LoadState> 하나만 쓴다
//   ③ 화면은 switch 하나로 그린다
//
// 기대 화면: 버튼을 누르면 로딩중 → 결과
function Loader() {
  // TODO: 아래 세 상태를 하나로 합치세요
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load(shouldFail: boolean) {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      if (shouldFail) setError("서버가 응답하지 않습니다");
      else setData(["아메리카노", "라떼"]);
    }, 400);
  }

  return (
    <div>
      <button type="button" onClick={() => load(false)}>
        성공
      </button>{" "}
      <button type="button" onClick={() => load(true)}>
        실패
      </button>
      {loading && <p>불러오는 중...</p>}
      {error !== null && <p style={{ color: "#c00" }}>오류: {error}</p>}
      {!loading && error === null && <p>{data.length}개</p>}
    </div>
  );
}

// ── 화면 ──

export default function Page() {
  const [last, setLast] = useState(0);

  return (
    <div>
      <h2>07단원 연습문제</h2>

      <p>문제 1</p>
      <ul>
        <MenuItem name="아메리카노" price={4000} />
      </ul>

      <p>문제 2</p>
      <Badge text="기본색" /> <Badge text="지정색" color="#2d6cdf" />

      <p>문제 3</p>
      <Box title="상자 제목">여기가 children 자리입니다.</Box>

      <p>문제 4</p>
      <Cart />

      <p>문제 5</p>
      <Selected />

      <p>문제 6</p>
      <TextInput />

      <p>문제 7</p>
      <StatusPicker />

      <p>문제 8</p>
      <OrderForm />

      <p>문제 9</p>
      <Stepper label="더하기" onStep={setLast} />
      <p>마지막 값: {last}</p>

      <p>문제 10</p>
      <Loader />

      <Summary
        items={[
          "props 에 타입을 붙이는 것이 이 단원의 절반이다.",
          "useState 는 null · 빈 배열 · 리터럴 유니온 이 셋만 적으면 된다.",
          "이벤트 타입은 외우지 말고 인라인으로 써 본 뒤 베낀다.",
          "화면 상태는 판별 유니온 하나로 묶는다.",
        ]}
      />
    </div>
  );
}
