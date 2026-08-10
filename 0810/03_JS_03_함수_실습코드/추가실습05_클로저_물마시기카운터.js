// 03_JS_03_함수 실습 정답코드 — [추가 실습] 클로저로 물 마시기 카운터 만들기
// 읽는 순서: 조건 → Step 1 → Step 2 → Step 3 → Step 4 → 자주 하는 실수
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 추가실습05_클로저_물마시기카운터.js 로 실행하며 결과를 확인합니다.
// ※ 개념코드 섹션 10(클로저) 직후에 푸는 문제입니다.

// ── [추가 실습] 클로저로 물 마시기 카운터 만들기 ──
// 조건: 마신 컵 수를 함수 안에 가둬 두고, 정해진 통로(drink·left)로만 만지게 만들기
console.log("===== [추가 실습] 클로저로 물 마시기 카운터 =====");
{
  // Step 1: 먼저 "안 되는 방식"부터 확인 — 매번 새로 시작하는 함수
  function badDrink() {
    let cups = 0; // 부를 때마다 새로 만들어짐
    cups = cups + 1;
    return cups;
  }
  console.log("--- 대조군: 쌓이지 않는다 ---");
  console.log(badDrink()); // 출력: 1
  console.log(badDrink()); // 출력: 1   ← 두 번 마셨는데 계속 1
  // 함수가 끝나면 안의 변수는 사라지는 것이 정상입니다.
  // 이걸 먼저 봐야 Step 2가 왜 신기한지 알 수 있습니다.

  // Step 2: 컵 수를 기억하게 만들기 — 안에서 만든 함수를 돌려준다
  function makeWaterTracker(goal) {
    let drunk = 0; // ★ 이 변수를 밖에서 못 만지게 가둡니다

    return {
      // 통로 1 — 한 컵 마시기
      drink: function () {
        drunk = drunk + 1;
        if (drunk >= goal) {
          return drunk + "컵 - 목표 달성!";
        }
        return drunk + "컵 - " + (goal - drunk) + "컵 남음";
      },
      // 통로 2 — 남은 컵 수만 보기
      left: function () {
        return goal - drunk;
      },
    };
  }
  // return 은 한 번에 하나만 되므로, 통로가 둘이면 8일차에 배운 객체로 묶어 돌려줍니다.

  // Step 3: 써 보기
  console.log("--- 내 기록 ---");
  const me = makeWaterTracker(3);
  console.log(me.drink()); // 출력: 1컵 - 2컵 남음
  console.log(me.drink()); // 출력: 2컵 - 1컵 남음
  console.log(me.drink()); // 출력: 3컵 - 목표 달성!
  console.log(me.left()); // 출력: 0
  //
  // makeWaterTracker 는 이미 끝났는데 drunk 가 사라지지 않고 쌓였습니다.
  // 돌려받은 drink·left 두 함수가 자기가 태어난 자리의 drunk 를 기억하기 때문입니다.
  console.log(me.drunk); // 출력: undefined   ← 밖에서는 직접 못 만집니다
  // 이 undefined 가 이 실습의 결론입니다.
  // drunk 를 밖에서 바꿀 수 없으니 기록이 함부로 망가지지 않습니다.

  // Step 4: 사람마다 따로 센다 (클로저를 이해했는지 확인하는 지점)
  console.log("--- 친구 기록은 따로 ---");
  const friend = makeWaterTracker(3);
  console.log(friend.drink()); // 출력: 1컵 - 2컵 남음   ← 친구는 1컵부터
  console.log(me.left()); // 출력: 0                ← 내 기록은 그대로
  console.log(friend.left()); // 출력: 2
  //
  // drunk 는 어딘가에 하나만 있는 것이 아닙니다.
  // makeWaterTracker() 를 부를 때마다 새로 하나씩 만들어집니다.
  // me 와 friend 는 서로 완전히 남입니다.
}

// ── 자주 하는 실수 ──────────────────────────────────────────
// 실수: const me = makeWaterTracker;
//       → 괄호를 빠뜨렸습니다. me 에 makeWaterTracker 함수 자체가 담겨서
//         me.drink 가 undefined 가 되고, me.drink() 는
//         TypeError: me.drink is not a function 이 납니다.
//
// 실수: let drunk = 0; 을 makeWaterTracker 밖으로 빼기
//       → 그러면 클로저가 아니라 그냥 바깥 변수입니다.
//         누구나 drunk = 999 로 바꿀 수 있고, Step 4처럼 me 와 friend 를
//         따로 셀 수도 없습니다 (둘이 같은 변수를 나눠 쓰게 됩니다).
//         안에 두는 것이 핵심입니다.
//
// 실수: console.log(drunk);
//       → ReferenceError: drunk is not defined.
//         drunk 는 makeWaterTracker 안에 있어 밖에서는 안 보입니다.
//         에러가 나는 것이 정상이고, 그게 값이 지켜지고 있다는 증거입니다.
//
// 실수: me.drunk = 10;
//       → 에러는 안 납니다. 하지만 돌려받은 객체에 drunk 라는 새 항목이 하나 붙을 뿐,
//         안쪽의 진짜 drunk 는 그대로입니다. me.left() 를 불러 보면 안 바뀐 것이 확인됩니다.
//         밖에서 흉내는 낼 수 있어도 안쪽 값은 못 건드립니다.
//
// 실수: drink: () => { ... }  로 바꾸기
//       → 이 경우는 문제가 없습니다. 화살표 함수로 써도 똑같이 동작합니다.
//         섹션 8의 "객체 메소드는 일반 함수" 규칙은 메소드 안에서 this 를 쓸 때의 이야기이고,
//         여기 drink·left 는 this 를 쓰지 않고 바깥의 drunk 만 보기 때문입니다.
