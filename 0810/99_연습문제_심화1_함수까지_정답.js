// 99_연습문제 심화1 정답 (JS 기초 ~ 함수까지)
// node 99_연습문제_심화1_함수까지_정답.js 로 실행하며 결과를 확인합니다.
// 각 문제를 중괄호 블록 { } 으로 감싸 이름 충돌을 막았습니다.
// 정답 코드보다 아래의 "해설:"을 읽는 것이 중요합니다.

// ═══ 워밍업 A 정답 ═══ 함수로 묶고 return 으로 돌려주기
console.log("===== 워밍업 A =====");
{
  function getCircleArea(radius) {
    return radius * radius * 3.14; // 계산 결과를 밖으로 내보냄
  }
  console.log(getCircleArea(5)); // 출력: 78.5
  console.log(getCircleArea(10)); // 출력: 314

  // 해설: 함수 안에서 console.log 를 하면 화면에 찍고 끝입니다.
  // return 을 하면 그 값을 변수에 담거나 다른 계산에 쓸 수 있습니다.
  //   const a = getCircleArea(5) + getCircleArea(10);   ← return 이라서 가능
  // "계산은 함수 안에서, 출력은 밖에서"가 오늘의 기본 자세입니다.
}

// ═══ 워밍업 B 정답 ═══ 매개변수 두 개 + 기본값
console.log("===== 워밍업 B =====");
{
  function getShippingFee(amount, extra = 0) {
    const base = amount >= 30000 ? 0 : 3000;
    return base + extra;
  }
  console.log(getShippingFee(50000)); // 출력: 0
  console.log(getShippingFee(20000)); // 출력: 3000
  console.log(getShippingFee(20000, 3000)); // 출력: 6000

  // 해설 ①: extra = 0 이 기본값입니다. 두 번째 인자를 안 주면 0이 쓰입니다.
  //   기본값이 없으면 extra 가 undefined 가 되어 3000 + undefined → NaN 이 됩니다.
  //
  // 해설 ②: 기본값 매개변수는 반드시 뒤쪽에 둡니다.
  //   (extra = 0, amount) 순서였다면 getShippingFee(50000) 이 extra 에 들어가 버립니다.
  //   인자는 이름이 아니라 "순서"로 짝지어지기 때문입니다.
}

// ═══ 워밍업 C 정답 ═══ 세 가지 표기법
console.log("===== 워밍업 C =====");
{
  function double1(n) {
    return n * 2;
  }
  const double2 = function (n) {
    return n * 2;
  }; // ★ 할당문이라 끝에 세미콜론
  const double3 = (n) => n * 2; // ★ 중괄호와 return 을 함께 생략

  console.log(double1(7)); // 출력: 14
  console.log(double2(7)); // 출력: 14
  console.log(double3(7)); // 출력: 14

  // 해설: 셋은 하는 일이 완전히 같습니다. 표기만 다릅니다.
  // 축약 3단계를 다시 확인하세요:
  //   1단계  function (n) { return n * 2; }
  //   2단계  (n) => { return n * 2; }        function 을 지우고 => 붙이기
  //   3단계  (n) => n * 2                    중괄호와 return 을 "함께" 지우기
  // 둘 중 하나만 지우면 undefined 가 나옵니다 (문제 6의 (나)가 그 경우입니다).
}

// ═══ 문제 1 정답 ═══ early return 으로 펼치기
console.log("===== 문제 1 =====");
{
  function checkSignup(id, pw, age) {
    if (!id) return "아이디를 입력하세요";
    if (pw.length < 8) return "비밀번호는 8자 이상";
    if (age < 14) return "만 14세 이상만 가입 가능";
    return "가입 완료";
  }

  console.log(checkSignup("hong", "1234", 20)); // 출력: 비밀번호는 8자 이상
  console.log(checkSignup("hong", "12345678", 12)); // 출력: 만 14세 이상만 가입 가능
  console.log(checkSignup("hong", "12345678", 25)); // 출력: 가입 완료

  // 해설 ①: else 가 하나도 없는데 갈래가 나뉩니다.
  //   return 이 값을 돌려주면서 함수를 "끝내기" 때문에, 아래 줄로 내려가지 않습니다.
  //   즉 두 번째 if 에 도달했다는 것은 첫 번째 if 가 거짓이었다는 뜻입니다.
  //
  // 해설 ②: 9일차의 중첩 펼치기와 같은 구조인데 더 짧습니다.
  //   중첩 → else if 펼치기 → 함수의 early return 순으로 계단을 밟아 왔습니다.
  //   조건이 5개, 10개로 늘어도 들여쓰기가 깊어지지 않는 것이 이 형태의 장점입니다.
  //
  // 해설 ③: !id 는 "아이디가 비어 있으면"입니다.
  //   빈 문자열 "" 은 거짓이므로 !"" 는 참이 됩니다 (8일차 truthy/falsy).
}

// ═══ 문제 2 정답 ═══ 함수를 인자로 넘기기 — 콜백
console.log("===== 문제 2 =====");
{
  const fruits = ["사과", "바나나", "참외"];

  function runEach(arr, callback) {
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i], i); // 무엇을 할지는 넘겨받은 함수가 정함
    }
  }

  runEach(fruits, (name, i) => console.log(`${i + 1}번: ${name}`));
  // 출력: 1번: 사과 / 2번: 바나나 / 3번: 참외

  runEach(fruits, (name) => {
    if (name.length >= 3) console.log(`긴 이름: ${name}`);
  });
  // 출력: 긴 이름: 바나나

  // 해설 ①: runEach 안에는 출력 문구가 한 글자도 없습니다.
  //   "몇 번 도는가"는 runEach 가 알고, "무엇을 하는가"는 부르는 쪽이 정합니다.
  //   이 분업 덕분에 runEach 를 고치지 않고 전혀 다른 두 가지 일을 시켰습니다.
  //
  // 해설 ②: 콜백에 (요소, 인덱스) 두 개를 넘겼지만 두 번째 호출은 (name) 하나만 받았습니다.
  //   인자를 덜 받는 것은 에러가 아닙니다 — 안 쓰면 그만입니다.
  //
  // 해설 ③: 이 구조가 오후에 배울 forEach 와 똑같습니다.
  //   fruits.forEach((name, i) => ...) — 우리가 만든 runEach 를 JS가 미리 만들어 둔 것입니다.
}

// ═══ 문제 3 정답 ═══ 구조 분해로 짧게 쓰기
console.log("===== 문제 3 =====");
{
  const coords = [37.5665, 126.978, 38];
  const book = { title: "어린 왕자", author: "생텍쥐페리", year: 1943 };
  const scores = [90, 85, 77, 92];

  const [lat, lng] = coords; // 고도는 안 꺼내면 그만
  console.log(`위도 ${lat} / 경도 ${lng}`); // 출력: 위도 37.5665 / 경도 126.978

  function printBook({ title, author }) {
    console.log(`${title} - ${author}`);
  }
  printBook(book); // 출력: 어린 왕자 - 생텍쥐페리

  const [first, ...rest] = scores;
  console.log(`첫 점수: ${first} / 나머지:`, rest); // 출력: 첫 점수: 90 / 나머지: [ 85, 77, 92 ]

  // 해설 ①: 배열은 "순서", 객체는 "이름"으로 짝을 맞춥니다.
  //   [lat, lng] 는 이름을 내가 자유롭게 지어도 되지만 위치가 곧 의미입니다.
  //   { title, author } 는 키 이름과 똑같이 써야 하고 순서는 상관없습니다.
  //
  // 해설 ②: printBook 은 객체를 통째로 받아 매개변수 자리에서 바로 풀었습니다.
  //   함수 선언만 봐도 "이 함수는 title 과 author 를 쓴다"가 드러납니다.
  //   book.year 는 넘어왔지만 쓰지 않으므로 무시됩니다.
  //
  // 해설 ③: 마지막 줄은 템플릿 리터럴 안에 배열을 넣지 않고 쉼표로 따로 넘겼습니다.
  //   `${rest}` 라고 쓰면 배열이 글자로 바뀌어 85,77,92 처럼 대괄호 없이 나옵니다.
  //   배열 모양 그대로 보고 싶으면 console.log 의 인자로 따로 넘기세요.
}

// ═══ 문제 4 정답 ═══ [도전] 나머지 매개변수
console.log("===== 문제 4 =====");
{
  function splitBill(total, ...names) {
    const count = names.length; // 낱개로 온 이름들이 배열 하나에 모임
    const each = Math.floor(total / count);
    return `${count}명이 각 ${each}원씩`;
  }

  console.log(splitBill(76000, "김", "이", "박")); // 출력: 3명이 각 25333원씩
  console.log(splitBill(50000, "최", "정")); // 출력: 2명이 각 25000원씩

  // 해설 ①: ...names 는 "남은 인자를 전부 배열로 모아라"입니다.
  //   splitBill(76000, "김", "이", "박") 에서 total 은 76000, names 는 ["김","이","박"].
  //   인원이 2명이든 10명이든 함수를 고칠 필요가 없습니다.
  //
  // 해설 ①-1: Math.floor 를 빼면 76000 / 3 = 25333.333333333332 가 그대로 나옵니다.
  //   돈은 원 단위 아래가 없으므로 버림 처리해야 합니다.
  //   (3명 × 25333 = 75999원이라 1원이 비는데, 실무에서는 이 1원을 누가 낼지도 정해야 합니다.)
  //
  // 해설 ②: 나머지 매개변수는 반드시 "맨 뒤"에 하나만 올 수 있습니다.
  //   (...names, total) 은 문법 오류입니다 — 어디까지가 names 인지 알 수 없기 때문입니다.
  //
  // 해설 ③: 점 세 개가 반대로 쓰이는 경우도 기억하세요.
  //   만들 때 → 낱개를 배열로 모음 (지금 이것)
  //   부를 때 → 배열을 낱개로 펼침 (Math.max(...scores))
}

// ═══ 문제 5 정답 ═══ [도전] 클로저로 값 지키기
console.log("===== 문제 5 =====");
{
  function createLoanCounter(max) {
    let remain = max; // ★ 밖에서 직접 못 만지는 변수

    return {
      borrow: () => {
        if (remain === 0) return "대출 한도 초과";
        remain--;
        return `대출 완료 (남은 ${remain}권)`;
      },
      giveBack: () => {
        remain++;
        return `반납 완료 (남은 ${remain}권)`;
      },
      left: () => remain,
    };
  }

  const counter = createLoanCounter(2);
  console.log(counter.borrow()); // 출력: 대출 완료 (남은 1권)
  console.log(counter.borrow()); // 출력: 대출 완료 (남은 0권)
  console.log(counter.borrow()); // 출력: 대출 한도 초과
  console.log(counter.giveBack()); // 출력: 반납 완료 (남은 1권)
  console.log(counter.left()); // 출력: 1

  // 해설 ①: createLoanCounter 는 이미 끝났는데 remain 이 사라지지 않았습니다.
  //   돌려준 세 함수가 그 변수를 계속 기억하고 있기 때문입니다 — 이것이 클로저입니다.
  //
  // 해설 ②: 세 함수가 "같은" remain 을 공유합니다.
  //   borrow 가 줄인 값을 giveBack 과 left 가 그대로 봅니다.
  //   counter.remain 처럼 밖에서 접근하면 undefined 입니다 — 금고 안에 있으니까요.
  //
  // 해설 ③: 이렇게 감싸는 이유는 값을 지키기 위해서입니다.
  //   remain 이 그냥 바깥 변수였다면 누군가 remain = 999 로 바꿔 한도를 무시할 수 있습니다.
  //   정해진 통로(borrow·giveBack)로만 바뀌게 하면 규칙이 깨지지 않습니다.
}

// ═══ 문제 6 정답 ═══ [도전] 결과 예측하기
console.log("===== 문제 6 =====");
{
  // (가) return 을 빠뜨린 함수
  function add(a, b) {
    a + b; // 계산만 하고 돌려주지 않음
  }
  console.log(add(2, 3)); // 출력: undefined
  // 해설: 계산은 했지만 결과가 함수 밖으로 나오지 않았습니다.
  //   믹서기가 돌긴 돌았는데 주스를 안 따라 준 것입니다. 계산했다 ≠ 돌려줬다.

  // (나) 화살표 함수에서 중괄호는 남기고 return 만 뺀 경우
  const twice = (n) => {
    n * 2;
  };
  console.log(twice(5)); // 출력: undefined
  // 해설: 중괄호를 쓰면 return 을 직접 써야 합니다.
  //   축약형은 (n) => n * 2 처럼 중괄호와 return 을 "함께" 지운 형태입니다.
  //   (가)와 같은 실수가 표기만 바뀌어 다시 나온 것입니다.

  // (다) 인자를 덜 준 경우
  function greet(name) {
    return "안녕 " + name;
  }
  console.log(greet()); // 출력: 안녕 undefined
  // 해설: name 에 아무것도 안 들어와 undefined 가 되고,
  //   문자열 + undefined 는 "안녕 undefined" 라는 글자가 됩니다. 에러가 안 납니다.
  //   기본 매개변수(name = "손님")를 두면 막을 수 있습니다.

  // (라) 괄호가 있고 없고의 차이
  console.log(typeof greet, typeof greet()); // 출력: function string
  // 해설: greet 은 함수 그 자체라 "function",
  //   greet() 는 실행 결과인 문자열이라 "string" 입니다.
  //   괄호가 버튼이라는 것이 typeof 로도 확인됩니다.

  // (마) 인자를 더 준 경우
  function sum3(a, b) {
    return a + b;
  }
  console.log(sum3(1, 2, 3)); // 출력: 3
  // 해설: 남는 인자 3 은 조용히 무시됩니다. 에러가 아닙니다.
  //   (가)~(마) 다섯 개의 공통점: 전부 에러 없이 이상한 값이 나옵니다.
  //   그래서 결과가 undefined 나 NaN 이면 함수부터 의심해야 합니다.
}

// ═══ 문제 7 정답 ═══ [도전] 종합 — 성적 처리기
console.log("===== 문제 7 =====");
{
  const students = [
    { name: "김철수", scores: [80, 85, 90] },
    { name: "이영희", scores: [95, 88, 93] },
    { name: "박민수", scores: [70, 65, 66] },
  ];

  function getTotal(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum; // 계산만 하고 돌려줌 (출력 없음)
  }

  function getGrade(avg) {
    if (avg >= 90) return "A";
    if (avg >= 80) return "B";
    if (avg >= 70) return "C";
    return "F";
  }

  function printReport(student) {
    const total = getTotal(student.scores);
    const avg = total / student.scores.length;
    console.log(`${student.name} | 합계 ${total} | 평균 ${avg} | ${getGrade(avg)}`);
  }

  for (let i = 0; i < students.length; i++) {
    printReport(students[i]);
  }
  // 출력: 김철수 | 합계 255 | 평균 85 | B
  // 출력: 이영희 | 합계 276 | 평균 92 | A
  // 출력: 박민수 | 합계 201 | 평균 67 | F

  // 해설 ①: 함수 세 개의 역할이 뚜렷하게 나뉘어 있습니다.
  //   getTotal·getGrade 는 계산만 하고 return 합니다 (순수 함수).
  //   출력은 printReport 한 곳에서만 합니다.
  //   이렇게 나누면 getGrade 를 화면 출력에도, 파일 저장에도, 통계에도 재사용할 수 있습니다.
  //
  // 해설 ②: getGrade 도 early return 형태입니다 (else 없음).
  //   9일차의 "좁은 범위부터 위에" 규칙이 그대로 적용됩니다 —
  //   90 이상을 맨 위에 두지 않으면 95점도 C가 나옵니다.
  //
  // 해설 ③: 함수 안에서 다른 함수를 부를 수 있습니다.
  //   printReport 가 getTotal 과 getGrade 를 부르고 있습니다.
  //   큰 일을 작은 함수로 쪼개고 조립하는 것이 프로그램을 만드는 기본 방식입니다.
}
