// ============================================================
// 15단원(부록) · 연습문제 정답 (10문항)
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
// ============================================================
//
// 먼저 스스로 풀어 보고 나서 여세요.
//
// 이 파일은 npm run typecheck 를 통과합니다. 밑줄이 하나도 없습니다.
// 문제 10의 에러 코드는 **실제로 돌려서 나온 메시지를 그대로 옮긴 것**입니다.
//
// 타입은 정답이 하나가 아닐 때가 많습니다.
// 화면이 같고 밑줄이 없으면, 아래와 조금 달라도 맞은 것입니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

// ───── 문제 1 ───── (개념02)
// 가격이 문자열이라 더하기가 이어 붙이기가 되던 것을 고칩니다.

const q1Price: number = 4000; // string → number, "4000" → 4000

const q1Total = q1Price + 500;

// 화면: 4000 + 500 = 4500
//
// 고치기 전에는 4000500 이었습니다. JS자료 01단원 개념05의 "10" + 5 와 같은 일입니다.
// 타입만 number 로 바꾸고 값에 따옴표를 남기면 이 밑줄이 납니다.
//   error TS2322: Type 'string' is not assignable to type 'number'.
// 그래서 "고쳐야 할 곳이 한 군데 더 있다" 는 것을 타입이 알려 준 셈입니다.

// ───── 문제 2 ───── (개념02)
// 글자만 들어 있는 배열이라고 적고, 항목을 하나 더 넣습니다.

const q2Menu: string[] = ["아메리카노", "라떼", "케이크"];

// 화면: 아메리카노 / 라떼 / 케이크 (3개)
//
// 타입을 붙였는지 확인하려고 숫자를 하나 넣어 보면 이 밑줄이 납니다.
//   error TS2322: Type 'number' is not assignable to type 'string'.
//
// 사실 타입을 안 적어도 오른쪽 값을 보고 string[] 로 추론됩니다(개념02 섹션2).
// 그래도 적어 두면 "여기에는 글자만 넣는다" 는 약속이 눈에 보입니다.

// ───── 문제 3 ───── (개념02)
// 타입 별칭에 속성을 추가합니다. 타입과 값을 같이 고쳐야 합니다.

type Q3Menu = { name: string; price: number };

const q3Latte: Q3Menu = { name: "라떼", price: 4500 };

const q3PriceText = q3Latte.price;

// 화면: 라떼 — 4500원
//
// 타입에만 price 를 추가하면 값 쪽에 이 밑줄이 납니다.
//   error TS2741: Property 'price' is missing in type '{ name: string; }' but required in type 'Q3Menu'.
// "Q3Menu 는 price 가 있어야 하는데 그 객체에는 없다" 는 뜻입니다.

// ───── 문제 4 ───── (개념02)
// 별명을 선택 속성으로 바꾸고, 김민준에게서는 아예 지웁니다.

type Q4Person = {
  name: string;
  nickname?: string; // 있어도 되고 없어도 됩니다
};

const q4Minjun: Q4Person = { name: "김민준" }; // nickname 을 아예 안 적습니다
const q4Seoyeon: Q4Person = { name: "이서연", nickname: "서니" };

// 화면: 김민준(별명 없음) / 이서연(서니)
//
// 고치기 전에는 "김민준()" 이었습니다. nickname 이 빈 문자열이었기 때문입니다.
// ?? 는 null 이나 undefined 일 때만 오른쪽을 씁니다.
// 빈 문자열은 "있는 값" 이라 그대로 쓰이고, 화면에는 아무것도 안 보입니다.
// 03단원 개념03 섹션3에서 본 "기본값은 undefined 일 때만" 과 완전히 같은 이야기입니다.
//
// nickname?: string 은 string | undefined 라는 뜻이라, 확인 없이 쓰면 막습니다.
//   const n = q4Minjun.nickname.length;
//   error TS18048: 'q4Minjun.nickname' is possibly 'undefined'.

// ───── 문제 5 ───── (개념02)
// 정해진 셋 중 하나만 받게 합니다.

type Q5Size = "S" | "M" | "L";

const q5MySize: Q5Size = "L";

// 화면: 내 사이즈: L
//
// 타입만 바꾸고 "라지" 를 그대로 두면 이 밑줄이 납니다.
//   error TS2322: Type '"라지"' is not assignable to type 'Q5Size'.
// 소문자 "l" 도 안 됩니다. 적어 둔 셋과 글자 하나까지 같아야 합니다.
//
// string 이라고만 적었을 때와 비교해 보세요. 그때는 "라지" 도 "엘" 도 다 통과했습니다.
// 통과했지만 나중에 화면이 이상해졌을 것입니다. 유니온은 그걸 미리 막습니다.

// ───── 문제 6 ───── (개념03)
// props 타입에 가격을 추가하고, 컴포넌트와 쓰는 쪽을 함께 고칩니다.

type Q6Props = {
  name: string;
  price: number;
};

function Q6Item({ name, price }: Q6Props) {
  return (
    <p>
      {name} — {price}원
    </p>
  );
}

// 쓸 때: <Q6Item name="아메리카노" price={4000} />
//
// 화면: 아메리카노 — 4000원
//       라떼 — 4500원
//
// 타입에만 price 를 추가하면 쓰는 쪽 두 군데에 이 밑줄이 납니다.
//   error TS2741: Property 'price' is missing in type '{ name: string; }' but required in type 'Q6Props'.
// 밑줄이 두 개 생겨서 놀랐을 수 있지만, 고칠 곳을 전부 찾아 준 것입니다.
// 03단원에서는 이런 것을 눈으로 찾아야 했습니다.
//
// price 를 숫자가 아니라 문자열로 넘기면 다른 밑줄이 납니다.
//   <Q6Item name="라떼" price="4500" />
//   error TS2322: Type 'string' is not assignable to type 'number'.

// ───── 문제 7 ───── (개념03)
// children 을 타입에 적고 화면에 그립니다.

type Q7Props = {
  title: string;
  children: React.ReactNode; // 화면에 그릴 수 있는 것 아무거나
};

function Q7Box({ title, children }: Q7Props) {
  return (
    <div className="output">
      <strong>{title}</strong>
      <div>{children}</div>
    </div>
  );
}

// 쓸 때:
//   <Q7Box title="오늘의 메뉴">
//     <p>아메리카노가 제일 잘 나갑니다.</p>
//   </Q7Box>
//
// 화면: 오늘의 메뉴
//       아메리카노가 제일 잘 나갑니다.
//
// 타입에 안 적고 컴포넌트에서 꺼내 쓰면 이 밑줄이 납니다.
//   error TS2339: Property 'children' does not exist on type 'Q7Props'.
// React 가 알아서 넣어 주지 않습니다. 쓸 것이면 직접 적어야 합니다.
//
// children?: React.ReactNode 로 물음표를 붙이면 안이 비어도 됩니다.
// 붙이지 않으면 <Q7Box title="가" /> 처럼 비워 뒀을 때 이 밑줄이 납니다.
//   error TS2741: Property 'children' is missing in type '{ title: string; }' but required in type 'Q7Props'.

// ───── 문제 8 ───── [응용] (개념04)
// 이벤트 타입을 붙이고 장바구니를 완성합니다.

function Q8Cart() {
  const [q8Text, setQ8Text] = useState("");
  const [q8Items, setQ8Items] = useState<string[]>([]);

  // any 를 지우고 입력칸의 바뀜 이벤트 타입을 적었습니다
  function q8Change(e: React.ChangeEvent<HTMLInputElement>) {
    setQ8Text(e.target.value);
  }

  function q8Add() {
    if (q8Text.trim() === "") return; // 06단원 개념05의 공백 검사
    setQ8Items([...q8Items, q8Text]); // 07단원 개념01의 불변 갱신
    setQ8Text(""); // 입력칸 비우기
  }

  return (
    <div className="output">
      <input value={q8Text} onChange={q8Change} placeholder="메뉴를 적으세요" />
      <button type="button" onClick={q8Add}>
        담기
      </button>
      <ul>
        {q8Items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <p>담긴 개수: {q8Items.length}</p>
    </div>
  );
}

// 화면(적고 담기를 누르면): 목록에 한 줄이 늘고 입력칸이 비워집니다.
//
// 이벤트 타입 이름은 외워서 적은 것이 아닙니다.
// onChange={(e) => ...} 처럼 그 자리에 바로 쓴 뒤 e 에 마우스를 올리면
// React.ChangeEvent<HTMLInputElement> 가 그대로 뜹니다. 그걸 복사한 것입니다.
//
// any 인 채로 두면 아무 밑줄도 안 생깁니다.
// e.target.valu 라고 오타를 내도, e.tagret 이라고 써도 조용히 통과합니다.
// 그리고 화면에서 입력이 안 되는 것만 보게 됩니다. any 를 피해야 하는 이유입니다.
//
// 목록에 숫자를 넣으려 하면 밑줄이 납니다. q8Items 가 string[] 이기 때문입니다.
//   setQ8Items([...q8Items, 4000]);
//   error TS2322: Type 'string | number' is not assignable to type 'string'.
//     Type 'number' is not assignable to type 'string'.
//   error TS2322: Type 'number' is not assignable to type 'string'.

// ───── 문제 9 ───── [도전] (개념02 · 03 · 04)
// 고른 메뉴를 담는 state 를 만들고, null 을 확인하고 씁니다.

type Q9Menu = { name: string; price: number };

const q9Menus: Q9Menu[] = [
  { name: "아메리카노", price: 4000 },
  { name: "라떼", price: 4500 },
  { name: "케이크", price: 6000 },
];

function Q9Picker() {
  // "메뉴 하나 또는 아직 없음" — 초기값이 null 이라 꺾쇠로 알려 줘야 합니다
  const [q9Picked, setQ9Picked] = useState<Q9Menu | null>(null);

  return (
    <div className="output">
      {q9Menus.map((m) => (
        <button key={m.name} type="button" onClick={() => setQ9Picked(m)}>
          {m.name}
        </button>
      ))}

      {q9Picked === null ? (
        <p>고른 메뉴가 없습니다.</p>
      ) : (
        <p>
          {q9Picked.name} — {q9Picked.price}원
        </p>
      )}
    </div>
  );
}

// 화면: 처음에는 "고른 메뉴가 없습니다"
// 화면(라떼를 누르면): 라떼 — 4500원
//
// 세 군데가 서로 이어져 있습니다.
//   useState<Q9Menu | null>(null)  → 담을 그릇의 모양을 정하고
//   setQ9Picked(m)                 → m 이 Q9Menu 라서 그대로 들어가고
//   q9Picked === null ? ... : ...  → 확인했으니 아래에서 .name 을 쓸 수 있습니다
//
// 확인을 빼면 이 밑줄이 납니다.
//   error TS18047: 'q9Picked' is possibly 'null'.
// 09단원에서 "받아오기 전에 화면이 먼저 그려져서" 터지던 사고를 통째로 막아 주는 것입니다.
//
// useState<Q9Menu>(null) 이라고 null 을 빼먹으면 초기값 쪽에서 걸립니다.
// "아직 없음" 도 담을 수 있어야 하니 | null 을 꼭 같이 적어야 합니다.
//
// onClick={() => setQ9Picked(m)} 에서 화살표로 감싼 이유는 04단원 개념01 그대로입니다.
// onClick={setQ9Picked(m)} 라고 쓰면 그리는 도중에 실행돼 버립니다.

// ───── 문제 10 ───── 에러 확인
//
// 아래는 **실제로 npm run typecheck 를 돌려서 나온 메시지를 그대로 옮긴 것**입니다.
// 여러분이 적은 것과 비교해 보세요.
//
// ① const q10a: number = "4000";
//    error TS2322: Type 'string' is not assignable to type 'number'.
//    뜻: 글자를 숫자 자리에 넣었습니다.
//    → 가장 기본이 되는 메시지입니다. "A is not assignable to B" 는
//      "A 를 B 자리에 못 넣는다" 로 읽으면 됩니다. 앞으로 제일 자주 보게 됩니다.
//
// ② function Q10b({ name }) { ... }
//    error TS7031: Binding element 'name' implicitly has an 'any' type.
//    뜻: 구조분해로 꺼낸 name 이 무엇인지 알 수 없습니다.
//    → props 에 타입을 안 붙인 것입니다. type 을 만들어 붙이면 사라집니다.
//      implicitly 는 "내가 안 적었는데 저절로" 라는 뜻입니다.
//
// ③ const [items, setItems] = useState([]);
//    setItems(["아메리카노"]);
//    error TS2322: Type 'string' is not assignable to type 'never'.
//    뜻: 아무것도 넣을 수 없는 배열에 글자를 넣으려 했습니다.
//    → 빈 배열에는 볼 것이 없어서 never[] 가 된 것입니다(개념04 섹션2).
//      "type 'never'" 가 보이면 거의 언제나 useState([]) 입니다.
//      useState<string[]>([]) 로 고치면 사라집니다.
//
// ④ const q10dLength = q10dUser.nickname.length;
//    error TS18048: 'q10dUser.nickname' is possibly 'undefined'.
//    뜻: 그 값은 없을 수도 있는데 확인 없이 썼습니다.
//    → nickname?: string 이라 string | undefined 입니다.
//      ?? 로 기본값을 주거나 if 로 확인하고 쓰면 사라집니다.
//      이 밑줄이 막아 주는 것이
//      TypeError: Cannot read properties of undefined (reading 'length') 입니다.
//
// ⑤ e.preventDefualt();
//    error TS2551: Property 'preventDefualt' does not exist on type 'FormEvent<Element>'. Did you mean 'preventDefault'?
//    뜻: 그런 이름의 메소드가 없습니다. preventDefault 를 말한 건가요?
//    → 오타입니다. 맨 뒤에 고칠 이름까지 알려 줍니다.
//      06단원에서 이 오타를 내면 새로고침이 일어나 입력한 것이 다 날아갔고,
//      원인을 찾기가 어려웠습니다.
//
// 다섯 개의 공통점을 보세요.
//   ①③ 은 종류가 다른 것, ②④ 는 무엇인지 모르거나 없을 수 있는 것,
//   ⑤ 는 오타입니다. 타입이 잡아 주는 것이 딱 이 세 가지입니다.
//   계산이 틀린 것이나 화면이 이상한 것은 여전히 여러분이 찾아야 합니다.

// ── 화면에 그리기 ──

export default function Exercise14Answer() {
  return (
    <div>
      <h1>15단원 부록 — 연습문제 정답</h1>

      <p className="guide">
        이 파일은 <code>npm run typecheck</code> 를 통과합니다. 밑줄이 하나도 없습니다.
        <br />
        문제 10의 에러 메시지는 실제로 돌려서 나온 것을 그대로 옮긴 것입니다.
      </p>

      <div className="demo">
        <h3>문제 1 — 가격이 문자열이면</h3>
        <div className="output">4000 + 500 = {q1Total}</div>
      </div>

      <div className="demo">
        <h3>문제 2 — 배열 타입</h3>
        <div className="output">
          {q2Menu.join(" / ")} ({q2Menu.length}개)
        </div>
      </div>

      <div className="demo">
        <h3>문제 3 — type 별칭에 속성 추가</h3>
        <div className="output">
          {q3Latte.name} — {q3PriceText}원
        </div>
      </div>

      <div className="demo">
        <h3>문제 4 — 선택 속성</h3>
        <div className="output">
          {q4Minjun.name}({q4Minjun.nickname ?? "별명 없음"}) / {q4Seoyeon.name}(
          {q4Seoyeon.nickname ?? "별명 없음"})
        </div>
      </div>

      <div className="demo">
        <h3>문제 5 — 유니온</h3>
        <div className="output">내 사이즈: {q5MySize}</div>
      </div>

      <div className="demo">
        <h3>문제 6 — props 에 타입 붙이기</h3>
        <div className="output">
          <Q6Item name="아메리카노" price={4000} />
          <Q6Item name="라떼" price={4500} />
        </div>
      </div>

      <div className="demo">
        <h3>문제 7 — children</h3>
        <Q7Box title="오늘의 메뉴">
          <p>아메리카노가 제일 잘 나갑니다.</p>
        </Q7Box>
      </div>

      <div className="demo">
        <h3>문제 8 [응용] — 장바구니</h3>
        <Q8Cart />
      </div>

      <div className="demo">
        <h3>문제 9 [도전] — 메뉴 고르기</h3>
        <Q9Picker />
      </div>

      <div className="demo">
        <h3>문제 10 — 에러 확인</h3>
        <div className="output">
          이 문제의 답은 코드 위쪽 주석에 있습니다. 실제 메시지를 그대로 옮겨 뒀습니다.
        </div>
      </div>

      <Summary
        items={[
          "타입은 정답이 하나가 아닙니다. 화면이 같고 밑줄이 없으면 조금 달라도 맞은 것입니다.",
          "문제 1·3·5·6 은 '타입만 고치고 값을 안 고쳤을 때' 밑줄이 남습니다. 타입과 값은 함께 고칩니다.",
          "문제 4·9 는 없을 수 있는 값입니다. ?? 나 삼항으로 먼저 확인하고 써야 밑줄이 사라집니다.",
          "문제 8 의 any 는 검사를 아예 끕니다. 오타를 내도 조용히 통과합니다. 타입을 적어 두는 편이 낫습니다.",
          "타입이 잡아 주는 것은 종류 착각 · 모르거나 없을 수 있는 값 · 오타 세 가지입니다. 계산이 틀린 것은 못 잡습니다.",
        ]}
      />
    </div>
  );
}
