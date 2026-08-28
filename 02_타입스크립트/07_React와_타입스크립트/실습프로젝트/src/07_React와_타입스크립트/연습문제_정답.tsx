// ============================================================
// 07단원 연습문제 정답 — React 와 타입스크립트
// ------------------------------------------------------------
// 보기: npm run dev → 왼쪽 목록에서 "연습문제 정답" 고르기
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

import { useState } from "react";
import type { ReactNode } from "react";
import Summary from "../_ui/Summary.tsx";

// ───── 문제 1 ─────
type MenuItemProps = { name: string; price: number };

function MenuItem({ name, price }: MenuItemProps) {
  return (
    <li>
      {name} — {price}원
    </li>
  );
}
// 해설 ① 안 붙이면 TS7031 Binding element 'name' implicitly has an 'any' type.
//        03단원의 TS7006 과 형제입니다. 구조분해한 자리라 이름만 다릅니다.
// 해설 ② props 는 객체 하나이므로 04단원의 객체 타입을 그대로 씁니다.
// 해설 ③ 이제 <MenuItem name="라떼" /> 처럼 빠뜨리면 그 자리에서 걸립니다.
//        JS 였다면 화면에 "undefined원" 이 찍히고 나서야 알았습니다.

// ───── 문제 2 ─────
type BadgeProps = { text: string; color?: string };

function Badge({ text, color = "#555" }: BadgeProps) {
  return (
    <span style={{ background: color, color: "#fff", padding: "2px 8px", borderRadius: 4 }}>
      {text}
    </span>
  );
}
// 해설 ① ? 를 붙이면 안 넘겨도 됩니다. 04단원 개념03 섹션1 그대로입니다.
// 해설 ② 기본값(= "#555")을 주면 함수 안에서 color 가 string 입니다.
//        undefined 가 안 섞이니 style 에 바로 넣을 수 있습니다.
//        ? 만 붙이고 기본값을 안 주면 string | undefined 라 배경색이 사라집니다.
// 해설 ③ 03단원 개념02의 "쓸 만한 기본값이 있으면 ? 보다 기본값" 이 여기서도 통합니다.

// ───── 문제 3 ─────
type BoxProps = { title: string; children: ReactNode };

function Box({ title, children }: BoxProps) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
      {children}
    </div>
  );
}
// 해설 ① children 은 자동으로 생기지 않습니다. props 에 직접 적어야 합니다.
//        (예전 React.FC 를 쓰던 시절에는 자동이었지만 지금은 아닙니다)
// 해설 ② ReactNode 는 "화면에 그릴 수 있는 것 전부" 입니다.
//        글자 · 숫자 · 태그 · 배열 · null 이 다 들어갑니다.
// 해설 ③ import type { ReactNode } 처럼 type 을 붙이면
//        "이건 타입만 가져오는 것" 이 분명해집니다.

// ───── 문제 4 ─────
type Menu = { id: number; name: string };

function Cart() {
  const [items, setItems] = useState<Menu[]>([]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setItems([...items, { id: items.length + 1, name: "라떼" }])}
      >
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
// 해설 ① useState([]) 는 never[] 로 잡힙니다.
//        never 는 "값이 있을 수 없는 타입" 이라 아무것도 못 담습니다.
// 해설 ② 에러가 두 군데에서 납니다 — 담을 때(TS2322 ... not assignable to type 'never')와
//        꺼낼 때(TS2339 Property 'id' does not exist on type 'never').
//        원인은 하나인데 증상이 여러 개인 전형적인 경우입니다.
//        01단원 개념03 섹션3의 "맨 위부터 하나씩" 이 여기서 통합니다.
// 해설 ③ 에러에 never 가 보이면 useState([]) 를 의심하세요. 이게 07단원 최다 질문입니다.

// ───── 문제 5 ─────
function Selected() {
  const [selected, setSelected] = useState<Menu | null>(null);

  return (
    <div>
      <button type="button" onClick={() => setSelected({ id: 1, name: "라떼" })}>
        라떼 고르기
      </button>
      <p>고른 것: {selected?.name ?? "없음"}</p>
    </div>
  );
}
// 해설 ① useState(null) 만 쓰면 "null 만 담는 상자" 로 정해집니다.
//        나중에 값을 넣으려 하면 걸립니다.
// 해설 ② <Menu | null> 을 적으면 둘 다 담깁니다.
//        대신 selected 를 쓸 때 확인이 필요합니다. 05단원 개념03 그대로입니다.
// 해설 ③ selected?.name ?? "없음" 이 그 확인입니다.
//        selected!.name 으로 넘어가면 안 됩니다. 아직 아무것도 안 골랐을 때 터집니다.

// ───── 문제 6 ─────
function TextInput() {
  const [text, setText] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  return (
    <div>
      <input value={text} onChange={handleChange} placeholder="메뉴 이름" />
      <p>{text.length}자</p>
    </div>
  );
}
// 해설 ① 함수를 밖으로 빼면 문맥이 없어서 TS7006 이 납니다.
//        태그 안에 인라인으로 썼다면 안 적어도 됐습니다.
// 해설 ② <HTMLInputElement> 를 꼭 적어야 e.target.value 가 통과합니다.
//        어느 태그에서 난 이벤트인지 알려 줘야 target 에 무엇이 있는지도 압니다.
// 해설 ③ 타입 이름을 외우지 마세요.
//        onChange={(e) => ...} 로 인라인으로 써 보고 e 에 마우스를 올리면
//        이름이 그대로 뜹니다. 그걸 베끼면 됩니다.

// ───── 문제 7 ─────
type Status = "대기" | "조리중" | "완료";
const STATUSES: Status[] = ["대기", "조리중", "완료"];

function statusLabel(s: Status): string {
  return s === "완료" ? "다 됐습니다" : s;
}

function StatusPicker() {
  const [status, setStatus] = useState<Status>("대기");

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
// 해설 ① useState("대기") 는 string 으로 넓혀 잡습니다.
//        02단원 개념02 섹션3에서 let 이 그랬던 것과 같은 이유입니다.
//        상태는 바뀌는 값이니 넉넉하게 잡는 것입니다.
// 해설 ② 그러면 statusLabel(status) 가 TS2345 로 걸립니다.
//        string 에는 "취소" 같은 것도 들어갈 수 있으니까요.
// 해설 ③ <Status> 를 적어 두면 setStatus("취소") 같은 오타도 그 자리에서 막힙니다.
//        useState 에 타입을 적어야 하는 세 경우 중 하나입니다.

// ───── 문제 8 ─────
function OrderForm() {
  const [menu, setMenu] = useState("");
  const [orders, setOrders] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
// 해설 ① 폼은 React.FormEvent<HTMLFormElement> 입니다.
// 해설 ② e.preventDefault() 를 빠뜨리면 화면이 새로고침되면서
//        지금까지 쌓은 목록이 전부 사라집니다. React자료 06단원에서 겪은 그것입니다.
//        타입은 이건 안 막아 줍니다. 01단원의 "타입이 못 잡는 것" 그대로입니다.
// 해설 ③ onChange 쪽의 (e) 는 인라인이라 안 적었습니다.
//        같은 파일 안에서도 적는 곳과 안 적는 곳이 갈립니다. 기준은 '문맥이 있느냐' 입니다.

// ───── 문제 9 ─────
type StepperProps = {
  label: string;
  onStep: (next: number) => void;
};

function Stepper({ label, onStep }: StepperProps) {
  const [n, setN] = useState(0);

  function handleClick() {
    const next = n + 1;
    setN(next);
    onStep(next);
  }

  return (
    <button type="button" onClick={handleClick}>
      {label}: {n}
    </button>
  );
}
// 해설 ① 함수 props 는 03단원의 함수 타입 그대로입니다. (인자) => 반환값.
// 해설 ② 돌려줄 것이 없으면 => void 입니다.
// 해설 ③ 부모가 onStep={setLast} 를 넘깁니다.
//        setLast 의 타입은 Dispatch<SetStateAction<number>> 인데
//        (next: number) => void 자리에 들어갑니다.
//        받는 쪽이 넉넉하면 통과하는 것 — 04단원 개념02의 "개수가 모자란 것은 봐준다" 와
//        같은 원리(구조적 타이핑)입니다.

// ───── 문제 10 ─────
type LoadState =
  | { status: "시작전" }
  | { status: "로딩중" }
  | { status: "성공"; data: string[] }
  | { status: "실패"; message: string };

function Loader() {
  const [state, setState] = useState<LoadState>({ status: "시작전" });

  function load(shouldFail: boolean) {
    setState({ status: "로딩중" });
    setTimeout(() => {
      if (shouldFail) setState({ status: "실패", message: "서버가 응답하지 않습니다" });
      else setState({ status: "성공", data: ["아메리카노", "라떼"] });
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
      <LoaderView state={state} />
    </div>
  );
}

function LoaderView({ state }: { state: LoadState }) {
  switch (state.status) {
    case "시작전":
      return <p>버튼을 눌러 보세요.</p>;
    case "로딩중":
      return <p>불러오는 중...</p>;
    case "실패":
      return <p style={{ color: "#c00" }}>오류: {state.message}</p>;
    case "성공":
      return <p>{state.data.length}개: {state.data.join(", ")}</p>;
  }
}
// 해설 ① 상태 세 개가 하나로 줄었습니다.
//        setError(null) 을 빠뜨려서 옛 오류가 남는 사고가 구조적으로 안 생깁니다.
// 해설 ② 화면 조건이 !loading && error === null 같은 '아닌 것' 의 나열에서
//        switch 하나로 바뀌었습니다. 읽기도 쉽고 빠뜨릴 자리도 없습니다.
// 해설 ③ 여기에 { status: "빈결과" } 를 추가해 보세요.
//        LoaderView 의 switch 가 TS2366 으로 걸립니다.
//        "고쳐야 할 곳을 타입이 전부 찾아 준다" — 이게 이 패턴을 쓰는 진짜 이유입니다.

// ── 화면 ──

export default function Page() {
  const [last, setLast] = useState(0);

  return (
    <div>
      <h2>07단원 연습문제 정답</h2>

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
          "props 타입을 안 붙이면 TS7031(Binding element). TS7006 과 형제다.",
          "children 은 자동으로 안 생긴다. children: ReactNode 를 직접 적는다.",
          "useState([]) 는 never[] 가 된다. 에러에 never 가 보이면 여기를 의심한다.",
          "useState(null) 은 null 전용 상자가 된다. <T | null> 을 적는다.",
          "useState(\"대기\") 는 string 이 된다. 리터럴 유니온은 <Status> 를 적는다.",
          "이벤트 타입은 인라인으로 써 보고 마우스를 올려 베낀다.",
          "화면 상태는 판별 유니온 하나로 묶는다. switch 하나로 그려진다.",
        ]}
      />
    </div>
  );
}
