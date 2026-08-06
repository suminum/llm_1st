// 99_연습문제_정답 (08일차 - JS 기초)
// 연습문제 정답
// node 99_연습문제_정답.js 로 실행하며 결과를 확인합니다.
// 각 문제를 중괄호 블록 { } 으로 감싸 변수 이름 충돌을 막았습니다.
// (블록 안에서 선언한 let/const 는 블록 밖에서 보이지 않습니다. 지금은 "변수 울타리" 정도로만 이해하면 충분합니다.)

// ═══ 문제 1 정답 ═══ 변수 선언과 출력
console.log("===== 문제 1 =====");
{
  const storeName = "행복 편의점"; // 바뀔 일이 없는 값 -> const
  let riceBallCount = 68; // 팔릴 때마다 바뀌는 값 -> let
  console.log(storeName, riceBallCount); // 출력: 행복 편의점 68
  // 해설: console.log 에 쉼표로 여러 값을 넘기면 공백으로 구분되어 한 줄에 출력됩니다.
  // 선택 원칙: 기본은 const, 값이 반드시 바뀌면 let, var 는 사용하지 않습니다.
}

// ═══ 문제 2 정답 ═══ 템플릿 리터럴
console.log("===== 문제 2 =====");
{
  const drinkName = "바나나 우유";
  const todayCount = 42;
  console.log(`${drinkName} 오늘 판매량: ${todayCount}개`); // 출력: 바나나 우유 오늘 판매량: 42개
  console.log(`내일 목표 판매량: ${todayCount + 8}개`); // 출력: 내일 목표 판매량: 50개
  // 해설: 백틱(`) 안에서 ${변수}, ${계산식} 을 바로 끼워 넣을 수 있습니다.
  // 일반 따옴표("") 안에서는 ${} 가 글자 그대로 출력되니 주의!
}

// ═══ 문제 3 정답 ═══ 산술 연산자
console.log("===== 문제 3 =====");
{
  const morning = 120;
  const afternoon = 135;
  const dayTotal = morning + afternoon;
  console.log(`하루 총 손님 수: ${dayTotal}명`); // 출력: 하루 총 손님 수: 255명
  console.log(`오전 대비 오후 증가량: ${afternoon - morning}명`); // 출력: 오전 대비 오후 증가량: 15명
  console.log(`총 손님 수 짝수 여부: ${dayTotal % 2 === 0}`); // 출력: 총 손님 수 짝수 여부: false
  // 해설: "숫자 % 2 === 0" 은 짝수 판별 공식입니다. 255 % 2 는 1 이므로 false.
}

// ═══ 문제 4 정답 ═══ 형 변환과 typeof
console.log("===== 문제 4 =====");
{
  const stockInput1 = "80";
  const stockInput2 = "50";
  console.log(`잘못된 합계: ${stockInput1 + stockInput2}`); // 출력: 잘못된 합계: 8050
  console.log(`자료형: ${typeof stockInput1}`); // 출력: 자료형: string
  const avgStock = (Number(stockInput1) + Number(stockInput2)) / 2;
  console.log(`두 매장 평균 재고: ${avgStock}개`); // 출력: 두 매장 평균 재고: 65개
  // 해설: 문자열끼리 + 하면 이어 붙습니다("80" + "50" = "8050").
  // 계산이 목적이라면 반드시 Number() 로 먼저 변환해야 합니다.
}

// ═══ 문제 5 정답 ═══ 복합 대입 · 증감 연산자
console.log("===== 문제 5 =====");
{
  let stock = 100;
  stock += 25; // 입고 25개 (stock = stock + 25 의 축약)
  console.log(`입고 후 재고: ${stock}`); // 출력: 입고 후 재고: 125
  stock -= 40; // 판매 40개
  console.log(`판매 후 재고: ${stock}`); // 출력: 판매 후 재고: 85
  stock++; // 반품 입고 1개 (1 증가는 증감 연산자가 제일 간단)
  console.log(`반품 후 재고: ${stock}`); // 출력: 반품 후 재고: 86
  // 해설: 재고처럼 "계속 바뀌는 값" 이므로 let 으로 주어졌습니다. const 였다면 += 에서 TypeError!
}

// ═══ 문제 6 정답 ═══ 비교 · 논리 연산자
console.log("===== 문제 6 =====");
{
  const drinkCount = 78;
  const fridgeTemp = 4.2;
  const isPowerOn = true;
  const isSpaceOk = drinkCount < 80; // 비교 결과(true/false)를 변수에 저장
  const isTempOk = fridgeTemp >= 3 && fridgeTemp <= 5; // 두 조건 모두 참이어야 true
  const canFill = isPowerOn && isSpaceOk && isTempOk;
  console.log(`공간 여유: ${isSpaceOk}`); // 출력: 공간 여유: true
  console.log(`온도 적정: ${isTempOk}`); // 출력: 온도 적정: true
  console.log(`채우기 가능: ${canFill}`); // 출력: 채우기 가능: true
  // 해설: 조건을 의미 있는 이름(isSpaceOk 등)에 담아 두면 마지막 종합 판정이 읽기 쉬워집니다.
  // 비교는 항상 === 를 사용합니다. (= 는 할당, == 는 타입을 바꿔 비교해서 위험)
}

// ═══ 문제 7 정답 ═══ [도전] 객체와 배열 접근 종합
console.log("===== 문제 7 =====");
{
  const store = {
    name: "행복 편의점",
    manager: "김철수",
    sales: [70, 74, 72],
  };
  console.log(`판매 기록 일수: ${store.sales.length}일`); // 출력: 판매 기록 일수: 3일
  console.log(`마지막 날 판매량: ${store.sales[store.sales.length - 1]}개`); // 출력: 마지막 날 판매량: 72개
  const avgSales = (store.sales[0] + store.sales[1] + store.sales[2]) / 3;
  console.log(`${store.name} (점장 ${store.manager}) 평균 판매량: ${avgSales}개`); // 출력: 행복 편의점 (점장 김철수) 평균 판매량: 72개
  // 해설: 객체 안의 배열은 store.sales 로 꺼낸 뒤 [인덱스] 로 접근합니다.
  // 인덱스는 0부터 시작하므로 마지막 요소는 항상 [길이 - 1] 입니다. (3개짜리 배열 -> 인덱스 2)
  // (70 + 74 + 72) / 3 = 216 / 3 = 72
}
