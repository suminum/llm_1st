// ============================================================
// 15단원(부록) · 연습문제 (10문항)
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 푸는 법
//   1) 아래로 내려가며 // TODO 를 찾아 코드를 고칩니다.
//   2) 저장하면 화면이 저절로 바뀝니다(Vite). F5 를 누르지 않아도 됩니다.
//   3) 각 문제의 '기대 결과' 와 화면을 비교합니다.
//   4) 막히면 개념01~04 파일의 해당 섹션을 다시 보세요.
//
// 순서는 기본 7문제 → [응용] → [도전] → 에러 확인 입니다. 뒤로 갈수록 어렵습니다.
// 정답은 연습문제_정답.tsx 에 있습니다. 먼저 스스로 해 보세요.
//
// ★ 이 단원만의 두 가지를 꼭 기억하세요.
//
//   1. 타입 에러는 화면에 안 나옵니다. 화면이 멀쩡해도 틀렸을 수 있습니다.
//      VS Code 의 빨간 물결 밑줄과 아래 명령으로만 보입니다.
//
//          npm run typecheck
//
//      이 파일은 **고치기 전 지금 상태에서 이미 통과**합니다.
//      고치다가 밑줄이 생기면 그게 힌트입니다. 메시지를 읽고 고치세요.
//
//   2. 문제를 다 풀고 나면 반드시 npm run typecheck 를 한 번 더 돌리세요.
//      아무것도 안 나오면 통과입니다.
//
// ★ 고치기 전 지금 화면에는 "(아직 안 고쳤습니다)" 같은 글자가 보입니다. 정상입니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

// ───── 문제 1 ───── (개념02)
// 가격이 문자열이라 더하기가 이어 붙이기가 되고 있습니다. JS자료 01단원의 그 사고입니다.
// q1Price 의 타입을 number 로 바꾸고 값도 숫자로 고치세요.
//
// 기대 결과 (화면): 4000 + 500 = 4500
//                  4000500 이 그대로면 아직 문자열입니다.
//                  타입만 number 로 바꾸고 값에 따옴표를 남겨 두면 밑줄이 생깁니다.
//                  error TS2322: Type 'string' is not assignable to type 'number'.

// TODO: 아래 두 곳(타입과 값)을 고치세요
const q1Price: string = "4000";

const q1Total = q1Price + 500;

// ───── 문제 2 ───── (개념02)
// q2Menu 에 "글자가 들어 있는 배열" 이라는 타입을 붙이고, "케이크" 를 하나 더 넣으세요.
//
// 기대 결과 (화면): 아메리카노 / 라떼 / 케이크   (3개)
//                  2개로 나오면 아직 "케이크" 를 안 넣은 것입니다.
//                  타입을 제대로 붙였는지 확인하려면 배열에 숫자 4000 을 잠깐 넣어 보세요.
//                  밑줄이 생기면 잘 붙인 것입니다. 확인했으면 다시 지우세요.
//                  error TS2322: Type 'number' is not assignable to type 'string'.

// TODO: 타입을 붙이고 "케이크" 를 추가하세요
const q2Menu = ["아메리카노", "라떼"];

// ───── 문제 3 ───── (개념02)
// 타입 별칭 Q3Menu 에 가격을 추가하세요.
// 가격은 숫자이고 반드시 있어야 합니다.
//
// 기대 결과 (화면): 라떼 — 4500원
//                  "라떼 — 0원" 이 그대로면 아직 안 고친 것입니다.
//                  타입에만 추가하고 q3Latte 에 값을 안 넣으면 밑줄이 생깁니다.
//                  error TS2741: Property 'price' is missing in type '{ name: string; }' but required in type 'Q3Menu'.

// TODO: 타입에 price 를 추가하고, q3Latte 에도 4500 을 넣고,
//       아래 q3PriceText 를 q3Latte 의 가격으로 바꾸세요
type Q3Menu = { name: string };

const q3Latte: Q3Menu = { name: "라떼" };

const q3PriceText = 0;

// ───── 문제 4 ───── (개념02)
// 별명은 있어도 되고 없어도 되는 값입니다. 지금은 반드시 있어야 하게 돼 있어서
// 김민준에게 억지로 빈 문자열을 넣어 뒀습니다.
// nickname 을 선택 속성으로 바꾸고, 김민준에게서는 nickname 을 아예 지우세요.
//
// 기대 결과 (화면): 김민준(별명 없음) / 이서연(서니)
//                  "김민준()" 처럼 괄호 안이 비면 아직 빈 문자열이 들어 있는 것입니다.
//                  ?? 는 값이 null 이나 undefined 일 때만 오른쪽을 씁니다.
//                  빈 문자열은 "있는 값" 이라 그대로 쓰입니다. (03단원 개념03 섹션3과 같은 함정)

// TODO: nickname 을 선택 속성으로 바꾸고 q4Minjun 에서 nickname 을 지우세요
type Q4Person = { name: string; nickname: string };

const q4Minjun: Q4Person = { name: "김민준", nickname: "" };
const q4Seoyeon: Q4Person = { name: "이서연", nickname: "서니" };

// ───── 문제 5 ───── (개념02)
// 사이즈는 S · M · L 셋 중 하나여야 합니다.
// 지금은 string 이라 아무 글자나 들어갑니다. 유니온으로 바꾸세요.
// 그리고 q5MySize 를 "L" 로 고치세요.
//
// 기대 결과 (화면): 내 사이즈: L
//                  타입만 바꾸고 "라지" 를 그대로 두면 밑줄이 생깁니다.
//                  error TS2322: Type '"라지"' is not assignable to type 'Q5Size'.

// TODO: Q5Size 를 "S" | "M" | "L" 로 바꾸고 q5MySize 도 고치세요
type Q5Size = string;

const q5MySize: Q5Size = "라지";

// ───── 문제 6 ───── (개념03)
// Q6Item 이 가격도 받아서 보여 주게 하세요.
// 고칠 곳은 세 군데입니다. 타입 · 컴포넌트 · 쓰는 쪽입니다.
//
// 기대 결과 (화면): 아메리카노 — 4000원
//                  라떼 — 4500원
//                  타입에만 price 를 추가하면 쓰는 쪽 두 군데에 밑줄이 생깁니다.
//                  error TS2741: Property 'price' is missing in type '{ name: string; }' but required in type 'Q6Props'.

// TODO: Q6Props 에 price: number 를 추가하고 화면에도 보이게 하세요
type Q6Props = { name: string };

function Q6Item({ name }: Q6Props) {
  return (
    <p>
      {name} — (아직 안 고쳤습니다)
    </p>
  );
}

// ───── 문제 7 ───── (개념03)
// Q7Box 가 태그 사이에 넣은 내용을 보여 주게 하세요.
// children 의 타입 이름은 개념03 섹션5에 있습니다.
//
// 기대 결과 (화면): 오늘의 메뉴
//                  아메리카노가 제일 잘 나갑니다.
//                  타입에 children 을 안 적고 컴포넌트에서 꺼내 쓰면 밑줄이 생깁니다.
//                  error TS2339: Property 'children' does not exist on type 'Q7Props'.

// TODO: Q7Props 에 children 을 추가하고, 제목 아래에 children 을 그리세요.
//       그리고 아래 화면 그리는 곳의 <Q7Box ... /> 안에 내용을 넣으세요.
type Q7Props = { title: string };

function Q7Box({ title }: Q7Props) {
  return (
    <div className="output">
      <strong>{title}</strong>
      <p>(아직 안 고쳤습니다)</p>
    </div>
  );
}

// ───── 문제 8 ───── [응용] (개념04)
// 장바구니를 완성하세요. 두 군데를 고칩니다.
//
//   (1) q8Change 의 매개변수 e 가 지금 any 로 돼 있습니다.
//       any 는 "아무거나" 라서 검사를 아예 안 합니다.
//       입력칸의 바뀜 이벤트 타입으로 바꾸세요. (개념04 섹션4)
//   (2) q8Add 가 아무 일도 안 합니다.
//       q8Text 가 비어 있지 않으면 목록에 넣고 입력칸을 비우세요.
//
// 기대 결과 (화면): 입력칸에 "아메리카노" 를 적고 담기를 누르면
//                  아래 목록에 "아메리카노" 한 줄이 늘어나고 입력칸이 비워집니다.
//                  목록이 안 늘면 setQ8Items 를 안 부른 것입니다.
//                  입력칸이 안 비면 setQ8Text("") 를 빠뜨린 것입니다.
//                  (1)을 고쳤는지 확인하려면 e.target.valu 처럼 오타를 내 보세요.
//                  any 인 채로는 아무 밑줄도 안 생깁니다. 그게 any 의 무서운 점입니다.

function Q8Cart() {
  const [q8Text, setQ8Text] = useState("");
  const [q8Items, setQ8Items] = useState<string[]>([]);

  // TODO (1): any 를 제대로 된 이벤트 타입으로 바꾸세요
  function q8Change(e: any) {
    setQ8Text(e.target.value);
  }

  // TODO (2): 목록에 넣고 입력칸을 비우세요
  function q8Add() {
    console.log("담기 — 아직 안 고쳤습니다");
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

// ───── 문제 9 ───── [도전] (개념02 · 03 · 04)
// 메뉴를 고르면 아래에 이름과 가격이 나오게 하세요. 세 군데를 고칩니다.
//
//   (1) 고른 메뉴를 담을 state 를 만드세요.
//       아직 안 골랐을 때는 null 입니다. 초기값이 null 이면 타입을 알아내지 못하니
//       꺾쇠로 알려 줘야 합니다. (개념04 섹션3)
//   (2) 버튼을 누르면 그 메뉴가 state 에 담기게 하세요.
//   (3) 골랐으면 "라떼 — 4500원", 아직이면 "고른 메뉴가 없습니다" 가 보이게 하세요.
//
// 기대 결과 (화면): 처음에는 "고른 메뉴가 없습니다"
//                  라떼를 누르면 "라떼 — 4500원"
//                  케이크를 누르면 "케이크 — 6000원"
//                  확인 없이 q9Picked.name 이라고 쓰면 밑줄이 생깁니다.
//                  error TS18047: 'q9Picked' is possibly 'null'.
//                  삼항이나 if 로 먼저 null 인지 확인하면 사라집니다.

type Q9Menu = { name: string; price: number };

const q9Menus: Q9Menu[] = [
  { name: "아메리카노", price: 4000 },
  { name: "라떼", price: 4500 },
  { name: "케이크", price: 6000 },
];

function Q9Picker() {
  // TODO (1): 아래 줄을 state 로 바꾸세요
  const q9Picked: Q9Menu | null = null;

  return (
    <div className="output">
      {q9Menus.map((m) => (
        <button
          key={m.name}
          type="button"
          // TODO (2): 누르면 이 메뉴가 담기게 하세요
          onClick={() => console.log("고르기 — 아직 안 고쳤습니다:", m.name)}
        >
          {m.name}
        </button>
      ))}

      {/* TODO (3): 골랐으면 이름과 가격을, 아니면 안내 문구를 보여 주세요.
          지금은 q9Picked 를 쓰지 않고 고정된 글자만 그리고 있습니다. */}
      <p>(아직 안 고쳤습니다) — 담긴 값: {String(q9Picked)}</p>
    </div>
  );
}

// ───── 문제 10 ───── 에러 확인
// 아래 다섯 개는 전부 타입 에러가 나는 코드입니다.
// **한 번에 하나씩만** 주석을 풀고, 터미널에서 npm run typecheck 를 돌리세요.
//
//   1) 에러 번호(TS로 시작하는 숫자)와 첫 줄을 적어 보세요.
//   2) 무슨 뜻인지 한국어로 한 줄 적어 보세요.
//   3) 확인이 끝나면 반드시 다시 주석을 붙이세요.
//
// 화면은 다섯 개 다 풀어도 멀쩡합니다. 그것이 이 단원의 핵심입니다.
// 실제 메시지는 연습문제_정답.tsx 에 그대로 적어 뒀습니다.

// ① 값의 종류가 다를 때
// const q10a: number = "4000";

// ② props 에 타입을 안 붙였을 때
// function Q10b({ name }) {
//   return <p>{name}</p>;
// }

// ③ 빈 배열로 state 를 시작했을 때
// function Q10c() {
//   const [items, setItems] = useState([]);
//   setItems(["아메리카노"]);
//   return <p>{items.length}</p>;
// }

// ④ 없어도 되는 값을 확인 없이 썼을 때
// type Q10dUser = { name: string; nickname?: string };
// const q10dUser: Q10dUser = { name: "박지훈" };
// const q10dLength = q10dUser.nickname.length;

// ⑤ 이벤트 메소드 이름을 틀렸을 때
// function q10eSubmit(e: React.FormEvent) {
//   e.preventDefualt();
// }

// ── 화면에 그리기 ──

export default function Exercise14() {
  return (
    <div>
      <h1>15단원 부록 — 연습문제</h1>

      <p className="guide">
        고치기 전에는 "(아직 안 고쳤습니다)" 가 보입니다. 정상입니다.
        <br />
        <strong>이 단원은 화면만 보고 판단하면 안 됩니다.</strong> 타입 에러는 화면에 안
        나옵니다. VS Code 의 빨간 밑줄과 <code>npm run typecheck</code> 를 함께 보세요.
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
          <Q6Item name="아메리카노" />
          <Q6Item name="라떼" />
        </div>
      </div>

      <div className="demo">
        <h3>문제 7 — children</h3>
        {/* TODO(문제 7): 아래 태그 사이에 내용을 넣으세요 */}
        <Q7Box title="오늘의 메뉴" />
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
          이 문제는 화면이 아니라 <code>npm run typecheck</code> 로 확인합니다. 코드 아래쪽의
          주석 다섯 개를 하나씩 풀어 보세요.
        </div>
      </div>

      <Summary
        items={[
          "이 연습문제는 화면과 타입 검사를 함께 봐야 합니다. 화면이 맞아도 밑줄이 남아 있을 수 있습니다.",
          "다 풀고 나면 실습프로젝트 폴더에서 npm run typecheck 를 돌리세요. 아무것도 안 나오면 통과입니다.",
          "막히면 개념02(값의 타입) · 개념03(props) · 개념04(state 와 이벤트)의 해당 섹션을 다시 보세요.",
          "문제 10의 주석은 하나씩만 풀고, 확인이 끝나면 반드시 다시 붙이세요.",
        ]}
      />
    </div>
  );
}
