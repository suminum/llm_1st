// 03_JS_03_함수 실습 정답코드 — [추가 실습] 콜백으로 주간 운동 기록 다루기
// 읽는 순서: 조건 → Step 1 → Step 2 → Step 3 → Step 4 → 자주 하는 실수
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 추가실습04_콜백_주간운동기록.js 로 실행하며 결과를 확인합니다.
// ※ 개념코드 섹션 9(콜백 함수) 직후에 푸는 문제입니다.

// ── [추가 실습] 콜백으로 주간 운동 기록 다루기 ──
// 조건: "며칠치를 도는가"는 함수가 맡고, "각 날에 무엇을 할지"는 넘겨받은 함수가 정하게 만들기
console.log("===== [추가 실습] 콜백으로 주간 운동 기록 =====");
{
  const minutes = [30, 0, 45, 20, 0, 60, 15]; // 월~일 운동 시간(분)
  const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

  // Step 1: 배열을 돌면서 "넘겨받은 함수"를 부르는 함수 만들기
  // 이 함수 안에는 출력 문구가 한 글자도 없습니다.
  // 도는 것은 eachDay 가 맡고, 무엇을 할지는 부르는 쪽이 정합니다.
  function eachDay(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i); // ★ 값과 순서(i) 두 개를 넣어 주면서 부릅니다
    }
  }

  // Step 2: 이름 있는 함수를 넘긴다 (괄호 없이!)
  function printDay(min, i) {
    console.log(dayNames[i] + "요일 " + min + "분");
  }
  eachDay(minutes, printDay); // ★ printDay 뒤에 괄호가 없습니다
  // 출력: 월요일 30분
  // 출력: 화요일 0분
  // 출력: 수요일 45분
  // 출력: 목요일 20분
  // 출력: 금요일 0분
  // 출력: 토요일 60분
  // 출력: 일요일 15분
  //
  // printDay 의 min·i 는 우리가 값을 넣은 적이 없습니다.
  // eachDay 안의 callback(list[i], i) 가 넣어 준 것입니다 — 주는 쪽은 eachDay 입니다.

  // Step 3: 같은 일을 화살표 함수로 (이름을 떼고 그 자리에서)
  console.log("--- 화살표 함수로 같은 일 ---");
  eachDay(minutes, (min, i) => console.log(dayNames[i] + "요일 " + min + "분"));
  // 출력: Step 2와 완전히 같은 7줄
  //
  // 받는 이름은 내가 정합니다. (min, i) 대신 (m, idx) 라고 써도 결과는 같습니다.
  // 오후에 배울 forEach 가 정확히 이 모양입니다 — 지금 이 형태에 눈을 익혀 두세요.

  // Step 4: 값을 "돌려주는" 콜백 — 판정 기준을 바꿔 끼우기
  // countDays 는 세는 일만 하고, "무엇을 셀지"는 넘겨받은 함수에게 물어봅니다.
  function countDays(list, isTarget) {
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      if (isTarget(list[i])) {
        // ★ 콜백이 돌려준 true/false 를 여기서 씁니다
        count = count + 1;
      }
    }
    return count;
  }
  console.log("--- 판정 기준만 바꿔 끼우기 ---");
  console.log(countDays(minutes, (min) => min > 0)); // 출력: 5   (운동한 날)
  console.log(countDays(minutes, (min) => min >= 30)); // 출력: 3   (30분 이상 한 날)
  console.log(countDays(minutes, (min) => min === 0)); // 출력: 2   (쉰 날)
  //
  // ★ countDays 는 한 줄도 안 고쳤습니다. 판정 함수만 바꿔 끼웠을 뿐입니다.
  //   이것이 함수를 인자로 넘기는 이유입니다.
  //   콜백 (min) => min > 0 에는 console.log 가 없습니다 — true/false 만 돌려줍니다.
  //   중괄호와 return 을 함께 생략한 축약형이라, 아래와 완전히 같습니다.
  //       (min) => { return min > 0; }
  //
  // 오후에 배울 filter 가 정확히 이 구조입니다.
  //   minutes.filter((min) => min > 0)  ← 조건에 맞는 것만 골라 새 배열로 돌려줍니다.
}

// ── 자주 하는 실수 ──────────────────────────────────────────
// 실수: eachDay(minutes, printDay());
//       → 괄호를 붙이면 printDay 가 먼저 한 번 실행되고 그 결과(undefined)가 넘어갑니다.
//         함수가 아닌 값이 넘어갔으니 callback(...) 에서
//         TypeError: callback is not a function 이 납니다.
//         콜백은 "기계를 건네주는 것"이라 괄호를 붙이지 않습니다.
//
// 실수: eachDay(minutes, (min, i) => { dayNames[i] + "요일 " + min + "분"; });
//       → 중괄호를 쓰면서 console.log 도 return 도 없습니다.
//         에러도 안 나고 아무것도 출력되지 않습니다. 가장 찾기 어려운 종류입니다.
//
// 실수: countDays(minutes, (min) => console.log(min > 0));
//       → 판정 결과를 "출력"만 하고 돌려주지 않았습니다.
//         console.log 는 undefined 를 돌려주므로 if 가 항상 거짓이 되어 결과가 0 입니다.
//         돌려줘야 하는 자리에서는 console.log 를 쓰지 않습니다.
//
// 실수: function eachDay(list, callback) { for (...) { callback(i, list[i]); } }
//       → 넣어 주는 순서를 바꾸면 받는 쪽의 (min, i) 도 뒤집힙니다.
//         "월요일 0분" 대신 "undefined요일 30분" 같은 결과가 나옵니다.
//         주는 쪽과 받는 쪽의 순서는 반드시 맞아야 합니다 (이름은 달라도 됩니다).
