// ============================================================
// 04단원 연습문제 — state와 이벤트
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       직접 눌러 보세요. F12 → Console 도 함께.
// ============================================================

import { useState } from "react";

console.log("연습문제 파일을 열었습니다. TODO 를 채워 보세요.");
// 콘솔: 연습문제 파일을 열었습니다. TODO 를 채워 보세요.

// ───── 문제 1 ───── (개념01)
// 버튼을 누르면 콘솔에 "안녕하세요, 김민준님!" 이 찍히게 하세요.
// handleClick 함수는 이미 만들어져 있습니다. onClick 만 붙이면 됩니다.
//
// 기대 결과 (콘솔): 버튼을 누를 때마다 → 안녕하세요, 김민준님!
//                  페이지를 열자마자 한 번 찍히고 눌러도 조용하면
//                  괄호를 붙인 것입니다.

function Q1() {
  function handleClick() {
    console.log("안녕하세요, 김민준님!");
  }

  return (
    <div className="demo">
      <h3>문제 1 — 버튼에 이벤트 붙이기</h3>
      {/* TODO: 아래 button 에 onClick 을 붙이세요 */}
      <button id="q1Btn">인사하기</button>
    </div>
  );
}

// ───── 문제 2 ───── (개념01)
// 버튼 두 개가 greet 함수 하나를 같이 쓰게 하세요.
// 김민준 버튼은 "김민준" 을, 이서연 버튼은 "이서연" 을 넘깁니다.
//
// 기대 결과 (콘솔): 김민준 버튼 → 김민준님 반갑습니다
//                  이서연 버튼 → 이서연님 반갑습니다
//                  페이지를 열 때 두 줄이 이미 찍혔다면
//                  화살표 함수로 감싸지 않은 것입니다.

function Q2() {
  function greet(name) {
    console.log(`${name}님 반갑습니다`);
  }

  return (
    <div className="demo">
      <h3>문제 2 — 인자 넘기기</h3>
      {/* TODO: 두 버튼에 각각 onClick 을 붙이세요 */}
      <button id="q2BtnA">김민준</button>
      <button id="q2BtnB">이서연</button>
    </div>
  );
}

// ───── 문제 3 ───── (개념02)
// useState 로 count 를 만들고, 버튼을 누를 때마다 1씩 올려 화면에 보여 주세요.
//
// 기대 결과 (화면): 처음 "담은 개수: 0", 한 번 누르면 1, 세 번 누르면 3
//                  콘솔의 숫자만 올라가고 화면이 0 그대로면
//                  보통 변수로 만든 것입니다.

function Q3() {
  // TODO: 여기에 useState 를 쓰세요

  return (
    <div className="demo">
      <h3>문제 3 — 카운터 만들기</h3>
      <div className="output" id="q3Out">
        담은 개수: (여기에 count 를 넣으세요)
      </div>
      {/* TODO: 이 버튼에 onClick 을 붙이세요 */}
      <button id="q3Btn">+1</button>
    </div>
  );
}

// ───── 문제 4 ───── (개념02)
// 케이크가 6조각 있습니다.
// '한 조각 먹기' 는 1씩 줄이고, '새로 굽기' 는 다시 6으로 되돌리세요.
//
// 기대 결과 (화면): 처음 "남은 케이크: 6조각", 두 번 먹으면 4조각,
//                  '새로 굽기' 를 누르면 다시 6조각
//                  '새로 굽기' 가 안 먹히면 시작값을 다시 넣지 않은 것입니다.
//                  useState(6) 이 적혀 있다고 저절로 6으로 돌아가지 않습니다.

function Q4() {
  // TODO: 시작값이 6인 state 를 만드세요

  return (
    <div className="demo">
      <h3>문제 4 — 시작값과 되돌리기</h3>
      <div className="output" id="q4Out">
        남은 케이크: (여기에 개수)조각
      </div>
      {/* TODO: 두 버튼에 onClick 을 붙이세요 */}
      <button id="q4BtnEat">한 조각 먹기</button>
      <button id="q4BtnBake">새로 굽기</button>
    </div>
  );
}

// ───── 문제 5 ───── (개념03)
// 컴포넌트 함수의 맨 위(return 보다 위)에 console.log("Q5 그리는 중") 을 넣으세요.
// 그리고 버튼을 눌러 콘솔 줄이 몇 개씩 늘어나는지 확인하세요.
//
// 기대 결과 (콘솔): 페이지를 열 때 1줄, 버튼을 누를 때마다 1줄씩 늘어납니다.
//                  안 늘어나면 return 아래에 적었거나
//                  버튼이 state 를 바꾸고 있지 않은 것입니다.

function Q5() {
  const [count, setCount] = useState(0);

  // TODO: 여기에 console.log 를 한 줄 쓰세요

  return (
    <div className="demo">
      <h3>문제 5 — 다시 그려지는 횟수 세기</h3>
      <div className="output" id="q5Out">
        누른 횟수: {count}
      </div>
      <button id="q5Btn" onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}

// ───── 문제 6 ───── (개념04)
// state 를 두 개 두어 아메리카노와 라떼를 따로 세게 하세요.
//
// 기대 결과 (화면): 아메리카노만 한 번 누르면
//                  "아메리카노 1잔 / 라떼 0잔"
//                  한쪽을 누를 때 다른 쪽 숫자도 움직이면
//                  state 하나를 같이 쓰고 있는 것입니다.

function Q6() {
  // TODO: state 두 개를 만드세요

  return (
    <div className="demo">
      <h3>문제 6 — state 두 개</h3>
      <div className="output" id="q6Out">
        아메리카노 (여기)잔 / 라떼 (여기)잔
      </div>
      {/* TODO: 두 버튼에 onClick 을 붙이세요 */}
      <button id="q6BtnA">아메리카노 +1</button>
      <button id="q6BtnB">라떼 +1</button>
    </div>
  );
}

// ───── 문제 7 ───── (개념04)
// 문자열 state 를 만들어, 누른 버튼의 메뉴 이름이 화면에 나오게 하세요.
// 버튼은 세 개지만 함수는 하나만 만드세요.
//
// 기대 결과 (화면): 케이크를 누르면 "오늘의 메뉴: 케이크"
//                  버튼마다 state 를 따로 만들었다면 다시 생각해 보세요.
//                  한 번에 하나만 고르는 값입니다.

function Q7() {
  // TODO: 문자열 state 를 만드세요

  return (
    <div className="demo">
      <h3>문제 7 — 문자열 state</h3>
      <div className="output" id="q7Out">
        오늘의 메뉴: (여기)
      </div>
      {/* TODO: 세 버튼에 onClick 을 붙이세요 */}
      <button id="q7BtnA">아메리카노</button>
      <button id="q7BtnB">라떼</button>
      <button id="q7BtnC">케이크</button>
    </div>
  );
}

// ───── 문제 8 ───── (개념04)
// 참/거짓 state 로 불을 켜고 끄세요.
// 화면 글자와 버튼 글자가 함께 바뀌어야 합니다.
//
// 기대 결과 (화면): 처음 "불이 꺼져 있습니다" / 버튼은 "켜기"
//                  누르면 "불이 켜졌습니다" / 버튼은 "끄기"
//                  또 누르면 처음으로 돌아옵니다.
//                  한 번 켜지고 안 꺼지면 set 에 true 를 넣은 것입니다.

function Q8() {
  // TODO: 참/거짓 state 를 만들고, 화면에 쓸 글자도 만드세요

  return (
    <div className="demo">
      <h3>문제 8 — 켜고 끄기</h3>
      <div className="output" id="q8Out">
        (여기에 상태 글자)
      </div>
      {/* TODO: 버튼에 onClick 을 붙이고 글자도 바뀌게 하세요 */}
      <button id="q8Btn">켜기</button>
    </div>
  );
}

// ───── 문제 9 ───── (개념04)
// 아메리카노(4000원)와 케이크(6000원)를 담습니다.
// 합계 금액을 화면에 보여 주세요. 단, 합계는 state 로 만들지 마세요.
//
// 기대 결과 (화면): 아메리카노를 두 번, 케이크를 한 번 누르면
//                  "아메리카노 2개 + 케이크 1개 = 14000원"
//                  합계를 state 로 두면 언젠가 개수와 어긋납니다.

function Q9() {
  const [americano, setAmericano] = useState(0);
  const [cake, setCake] = useState(0);

  // TODO: 합계를 계산하는 보통 변수를 만드세요

  return (
    <div className="demo">
      <h3>문제 9 — 합계는 계산해서</h3>
      <div className="output" id="q9Out">
        아메리카노 {americano}개 + 케이크 {cake}개 = (여기에 합계)원
      </div>
      <button id="q9BtnA" onClick={() => setAmericano(americano + 1)}>
        아메리카노 담기
      </button>
      <button id="q9BtnC" onClick={() => setCake(cake + 1)}>
        케이크 담기
      </button>
    </div>
  );
}

// ───── 문제 10 ───── (개념05)
// 버튼을 한 번 누르면 2가 오르게 하세요.
// 단, setCount(count + 2) 는 쓰지 말고 set 함수를 두 번 부르세요.
//
// 기대 결과 (화면): 한 번 누르면 "값: 2", 두 번 누르면 "값: 4"
//                  1씩만 오르면 함수형 갱신을 쓰지 않은 것입니다.

function Q10() {
  const [count, setCount] = useState(0);

  function handleClick() {
    // TODO: set 함수를 두 번 불러 2가 오르게 하세요
  }

  return (
    <div className="demo">
      <h3>문제 10 — 한 번에 2 올리기</h3>
      <div className="output" id="q10Out">
        값: {count}
      </div>
      <button id="q10Btn" onClick={handleClick}>
        +2
      </button>
    </div>
  );
}

// ───── 문제 11 ───── (개념05)
// setCount 를 부른 바로 다음 줄에 console.log("set 직후:", count) 를 넣으세요.
// 화면의 숫자와 콘솔의 숫자를 비교해 보세요.
//
// 기대 결과 (콘솔): 처음 눌렀을 때 → set 직후: 0
// 기대 결과 (화면): 같은 순간 화면은 "값: 1"
//                  콘솔에도 1이 나왔다면 count 가 아니라
//                  count + 1 을 찍은 것입니다.

function Q11() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    // TODO: 여기에 console.log 를 한 줄 쓰세요
  }

  return (
    <div className="demo">
      <h3>문제 11 — set 직후의 값</h3>
      <div className="output" id="q11Out">
        값: {count}
      </div>
      <button id="q11Btn" onClick={handleClick}>
        +1
      </button>
    </div>
  );
}

// ───── 문제 12 ───── (개념06)
// 객체 state 의 age 만 1 올리세요. name 은 그대로 남아야 합니다.
//
// 기대 결과 (화면): 한 번 누르면 "김민준 (21세)"
//                  이름 자리가 비면 스프레드(...user)를 빠뜨린 것입니다.
//                  나이가 안 바뀌면 user.age = ... 처럼 직접 고친 것입니다.

function Q12() {
  const [user, setUser] = useState({ name: "김민준", age: 20 });

  function birthday() {
    // TODO: 새 객체를 만들어 setUser 에 넣으세요
  }

  return (
    <div className="demo">
      <h3>문제 12 — 객체 state 올바르게 고치기</h3>
      <div className="output" id="q12Out">
        {user.name} ({user.age}세)
      </div>
      <button id="q12Btn" onClick={birthday}>
        생일 축하
      </button>
    </div>
  );
}

// ───── 문제 13 ───── [응용] (개념04·05)
// 커피 주문 화면을 만드세요. state 세 개가 필요합니다.
//   ① 고른 메뉴 (문자열) — 아메리카노 4000 / 라떼 4500
//   ② 잔 수 (숫자) — '한 잔 더' 로 늘립니다
//   ③ 포장 여부 (참/거짓) — 포장이면 500원을 더합니다
// 합계는 state 로 두지 말고 계산해서 보여 주세요.
//
// 기대 결과 (화면): 라떼를 고르고 '한 잔 더' 를 한 번 누르고 포장을 켜면
//                  "라떼 · 2잔 · 포장 · 9500원"
//                  (4500 × 2 + 500)
//                  포장을 껐을 때 500원이 안 빠지면
//                  포장료를 state 에 더해 둔 것입니다.

function Q13() {
  // TODO: state 세 개를 만드세요

  // TODO: 가격과 합계를 계산하는 보통 변수를 만드세요

  return (
    <div className="demo">
      <h3>문제 13 [응용] — 커피 주문</h3>
      <div className="output" id="q13Out">
        (메뉴) · (잔 수)잔 · (포장 여부) · (합계)원
      </div>
      {/* TODO: 각 버튼에 onClick 을 붙이세요 */}
      <button id="q13BtnA">아메리카노</button>
      <button id="q13BtnL">라떼</button>
      <button id="q13BtnPlus">한 잔 더</button>
      <button id="q13BtnPack">포장 바꾸기</button>
    </div>
  );
}

// ───── 문제 14 ───── [도전] (개념05·06)
// 주문 기록을 배열 state 에 쌓으세요.
//   '한 잔 담기'  → 배열에 "아메리카노" 를 하나 추가
//   '두 잔 담기'  → 한 번 눌러서 두 개가 추가되어야 합니다
//   '비우기'      → 빈 배열로 되돌립니다
// 화면에는 join(", ") 으로 이어 붙인 목록과 개수를 보여 주세요.
//
// 힌트: 배열을 새로 만들어야 화면이 바뀝니다. (개념06)
//       한 번에 두 개를 넣으려면 함수형 갱신이 필요합니다. (개념05)
//
// 기대 결과 (화면): '한 잔 담기' 한 번 → "아메리카노 (모두 1개)"
//                  이어서 '두 잔 담기' 한 번 → 모두 3개
//                  '두 잔 담기' 에서 1개만 늘면 함수형 갱신을 안 쓴 것입니다.
//                  아무것도 안 늘면 push 로 직접 고친 것입니다.

function Q14() {
  const [orders, setOrders] = useState([]);

  function addOne() {
    // TODO: "아메리카노" 를 하나 추가하세요
  }

  function addTwo() {
    // TODO: 한 번에 두 개가 추가되게 하세요
  }

  function clear() {
    // TODO: 빈 배열로 되돌리세요
  }

  return (
    <div className="demo">
      <h3>문제 14 [도전] — 주문 기록 쌓기</h3>
      <div className="output" id="q14Out">
        {orders.join(", ")} (모두 {orders.length}개)
      </div>
      <button id="q14BtnOne" onClick={addOne}>
        한 잔 담기
      </button>
      <button id="q14BtnTwo" onClick={addTwo}>
        두 잔 담기
      </button>
      <button id="q14BtnClear" onClick={clear}>
        비우기
      </button>
    </div>
  );
}

// ───── 문제 15 ───── (에러 확인 — 맨 마지막)
// 아래 Q15 안에서 주석 처리된 button 줄의 주석만 푸세요.
// (위 버튼은 그대로 두고, 두 버튼을 눌러 비교해 보세요.)
// 그리고 콘솔을 보세요. 버튼도 눌러 보세요.
//
// 관찰할 것 두 가지:
//   ① 아직 아무것도 안 눌렀는데 콘솔에 무언가 찍혔나요?
//   ② 버튼을 눌렀을 때는 무슨 일이 일어나나요?
//
// 기대 결과 (콘솔): 이 예제를 고른 직후, 아직 안 눌렀는데 한 줄이 찍힙니다.
//                  그리고 새로 나타난 버튼(괄호를 붙인 버튼)을 눌러도 더는 아무것도 안 찍힙니다.
//                  에러도 경고도 안 납니다. 그래서 찾기 어렵습니다.
//
// 답: ______________________________________________
//     (왜 이렇게 되는지 한 문장으로 적어 보세요)

function Q15() {
  function handleClick() {
    console.log("Q15 버튼이 눌렸습니다");
  }

  return (
    <div className="demo">
      <h3>문제 15 — 에러 확인</h3>
      <button id="q15Btn" onClick={handleClick}>
        지금은 잘 됩니다
      </button>
      {/* <button onClick={handleClick()}>괄호를 붙인 버튼</button> */}
    </div>
  );
}

// ── 화면에 그리기 ──

export default function Exercises() {
  return (
    <div>
      <h1>04단원 연습문제 — state와 이벤트</h1>

      <p className="guide">
        이 파일의 <strong>TODO</strong> 자리에 코드를 쓰고 저장하면 화면이 바로 바뀝니다. 직접 눌러서 확인하세요. <strong>F12 → Console</strong> 도 함께 보세요.
        <br />
        <br />
        1~12는 기본, 13은 [응용], 14는 [도전], 15는 에러 확인입니다.
        <br />
        <br />
        화면이 통째로 비면 문법이 깨진 것입니다. 콘솔의 빨간 줄부터 읽으세요. 괄호·중괄호의 짝이 맞는지 세어 보면 대부분 찾을 수 있습니다.
      </p>

      <div>
        <Q1 />
        <Q2 />
        <Q3 />
        <Q4 />
        <Q5 />
        <Q6 />
        <Q7 />
        <Q8 />
        <Q9 />
        <Q10 />
        <Q11 />
        <Q12 />
        <Q13 />
        <Q14 />
        <Q15 />
      </div>
    </div>
  );
}
