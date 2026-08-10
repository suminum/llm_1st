// 03_JS_03_함수 개념코드 — 섹션 10. 클로저
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션10_클로저.js 로 실행하며 결과를 확인합니다.

// ── 섹션 10: 클로저 ──────────────
console.log("===== 섹션 10: 클로저 =====");
{
  // ★ 왜 배우나: 2단원 React 의 useState 가 정확히 이 구조입니다.
  //   값을 안쪽에 가둬 두고, 정해진 통로(함수)로만 바꾸게 하는 방식.
  //   오늘은 "이런 게 있다"까지만 가면 충분하고 2단원에서 다시 만납니다.
  //   한 번에 이해되는 개념이 아니니, 지금 흐릿해도 정상입니다.

  // ── 1. 먼저 스코프 ──────────────
  // 스코프 = 변수가 살아 있는 범위. 규칙은 한 방향입니다.
  //   안에서 밖은 보인다 / 밖에서 안은 안 보인다.
  // 비유: 함수는 뚜껑 닫힌 상자. 상자 안에서 방을 둘러볼 수는 있지만,
  //       방에서는 상자 안이 안 보입니다.
  const outside = "밖에 있는 값";
  function peek() {
    const inside = "안에 있는 값";
    console.log(outside); // 출력: 밖에 있는 값   ← 안에서 밖은 보입니다
    console.log(inside); // 출력: 안에 있는 값
  }
  peek();
  // 실수: console.log(inside);  // ReferenceError: inside is not defined
  //   밖에서 안은 안 보입니다. 에러가 나는 게 정상이고, 스코프가 지켜 주고 있다는 증거입니다.
  //   불편한 제약 같지만 장점입니다 — 다른 함수에서 같은 이름을 써도 부딪히지 않습니다.

  // ── 2. 대조군: 보통은 "사라집니다" ──────────────
  // 함수가 끝나면 그 안에서 만든 변수는 사라집니다. 다시 부르면 처음부터 새로 시작합니다.
  function normalCount() {
    let n = 0; // 부를 때마다 새로 만들어짐
    n = n + 1;
    return n;
  }
  console.log(normalCount()); // 출력: 1
  console.log(normalCount()); // 출력: 1   ← 두 번째도 1. 쌓이지 않습니다.
  // 이게 정상입니다. 이 두 줄을 눈으로 확인하고 3번으로 넘어가세요.
  // 3번이 왜 놀라운지는 이걸 봐야만 알 수 있습니다.

  // ── 3. 그런데 이건 쌓입니다 ──────────────
  // 2번과 딱 하나 다릅니다: 안에서 만든 함수를 "돌려줍니다".
  function makeCounter() {
    let count = 0; // 여기까지는 normalCount 와 같습니다
    function increase() {
      // 함수 안에서 함수를 만들고
      count = count + 1;
      return count;
    }
    return increase; // ★ 그 함수를 돌려줍니다 (괄호 없이!)
  }
  const counter = makeCounter(); // counter 에 increase 함수가 담겼습니다
  console.log(counter()); // 출력: 1
  console.log(counter()); // 출력: 2   ← 쌓입니다!
  console.log(counter()); // 출력: 3
  //
  // ★ 여기가 놀라운 지점입니다.
  //   makeCounter() 는 이미 끝났습니다. 그러면 count 도 사라졌어야 합니다 (2번처럼).
  //   그런데 사라지지 않고 값을 기억하고 있습니다.
  //   돌려받은 increase 함수가 "자기가 태어난 자리"의 count 를 붙들고 있기 때문입니다.
  //   이렇게 함수가 만들어진 자리의 변수를 계속 기억하는 것을 클로저라고 부릅니다.

  // ── 4. 그럼 count 는 어딘가에 하나만 있는 걸까요? 아닙니다 ──────────────
  const a = makeCounter();
  const b = makeCounter();
  console.log(a()); // 출력: 1
  console.log(a()); // 출력: 2
  console.log(b()); // 출력: 1   ← b 는 자기 count 를 따로 갖습니다
  console.log(a()); // 출력: 3   ← a 는 계속 자기 것을 셉니다
  // makeCounter() 를 부를 때마다 count 가 새로 하나씩 만들어집니다.
  // a 와 b 는 완전히 남입니다. 이걸 확인해야 클로저를 이해한 것입니다.

  // ── 5. 통로가 두 개 필요하면 객체에 담아 돌려줍니다 ──────────────
  // 3번은 "1 올리기" 하나만 돌려줬습니다. "지금 값 보기"도 필요하면 둘을 함께 돌려줘야 합니다.
  // return 은 한 번에 하나만 되므로, 8일차에 배운 객체로 묶어서 돌려줍니다.
  function makeStepCounter(start) {
    let steps = start;
    return {
      add: function (n) {
        steps = steps + n;
        return steps;
      },
      get: function () {
        return steps;
      },
    };
  }
  const today = makeStepCounter(1000);
  console.log(today.add(500)); // 출력: 1500
  console.log(today.add(300)); // 출력: 1800
  console.log(today.get()); // 출력: 1800
  console.log(today.steps); // 출력: undefined   ← 밖에서는 못 만집니다
  //
  // ★ 왜 이렇게 감싸나: today.steps = 999999 로 바꿔 버릴 수 없게 하려고.
  //   steps 는 상자 안에 있고, 밖에서 쓸 수 있는 건 add·get 두 통로뿐입니다.
  //   비유: 금고와 열쇠. 금고 안의 돈은 직접 못 만지고 정해진 열쇠로만 넣고 뺍니다.
  //   값이 아무 데서나 바뀌면 버그가 났을 때 범인을 찾을 수 없기 때문에 이렇게 막습니다.

  // ── 참고: PPT 23쪽은 같은 코드를 화살표 함수로 짧게 씁니다 ──────────────
  //     const createCounter = (n = 0) => {
  //       let count = n;
  //       return { inc: () => ++count, get: () => count };
  //     };
  //   하는 일은 위 5번과 같고, 섹션 7의 화살표 축약으로 줄인 것뿐입니다.
  //   ++count 는 8일차 섹션 14에서 배운 전위 증가입니다 (1 올리고 그 값을 돌려줌).
  //
  // ⚠️ 섹션 8에서 "객체 메소드는 일반 함수, 콜백은 화살표"라고 배웠는데
  //    여기서는 객체 안이 화살표 함수라 모순처럼 보입니다. 이유가 있습니다.
  //    섹션 8의 규칙은 "메소드 안에서 this 를 쓸 때"의 이야기였습니다.
  //    여기 inc·get 은 this 를 한 번도 쓰지 않고 바깥의 count 만 봅니다.
  //    this 를 안 쓰면 화살표를 써도 아무 문제가 없습니다.
  //    → 규칙을 정확히 다시 쓰면: "메소드 안에서 this 가 필요하면 일반 함수."

  // ── 실수 모음 ──────────────
  // 실수: const counter = makeCounter;
  //   괄호를 빠뜨렸습니다. counter 에 makeCounter 자체가 담겨서
  //   counter() 는 숫자가 아니라 increase 함수를 돌려줍니다 ([Function: increase]).
  //
  // 실수: const counter = makeCounter()();
  //   괄호를 두 번 붙이면 그 자리에서 1이 나오고 끝입니다.
  //   담아 두고 여러 번 불러야 값이 쌓입니다.
  //
  // 실수: console.log(count);
  //   ReferenceError. count 는 makeCounter 안에 있어 밖에서 안 보입니다 (1번 스코프).
  //
  // 실수: let count = 0; 을 makeCounter 밖으로 빼기
  //   그러면 클로저가 아니라 그냥 바깥 변수입니다. 누구나 count = 999 로 바꿀 수 있고,
  //   4번처럼 a·b 를 따로 셀 수도 없습니다. 안에 두는 것이 핵심입니다.
}
