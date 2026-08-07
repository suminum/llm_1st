// 99_연습문제 심화1 정답 (JS 기초 ~ 조건문까지)
// node 99_연습문제_심화1_조건문까지_정답.js 로 실행하며 결과를 확인합니다.
// 각 문제를 중괄호 블록 { } 으로 감싸 변수 이름 충돌을 막았습니다.
// 정답 코드보다 아래의 "해설:"을 읽는 것이 중요합니다.

// ═══ 워밍업 A 정답 ═══ 조건을 변수에 담아 쓰기
console.log("===== 워밍업 A =====");
{
  const height = 152;

  const isTallEnough = height >= 140; // 비교 결과(boolean)가 그대로 담깁니다
  console.log(isTallEnough); // 출력: true

  if (isTallEnough) {
    console.log("탑승 가능"); // 출력: 탑승 가능
  } else {
    console.log("탑승 불가");
  }

  // 해설: if (height >= 140) 이라고 바로 써도 결과는 같습니다.
  // 그런데 조건이 길어지면(키 + 나이 + 보호자 동반 …) 소괄호 안이 읽기 어려워집니다.
  // 이름을 붙여 두면 if (isTallEnough) 처럼 문장으로 읽히고,
  // 조건을 고칠 때도 한 곳만 고치면 됩니다.
  // boolean 변수는 is~ / has~ 로 시작하는 것이 관례입니다.
}

// ═══ 워밍업 B 정답 ═══ 두 조건을 && 로 묶기
console.log("===== 워밍업 B =====");
{
  const isLibraryMember = true;
  const overdueCount = 2;

  if (isLibraryMember && overdueCount === 0) {
    console.log("좌석 배정 완료");
  } else {
    console.log("좌석 배정 불가"); // 출력: 좌석 배정 불가
  }

  // 해설: "연체 도서가 없다"는 overdueCount === 0 입니다.
  // 지금 값이 2이므로 이 조건이 거짓이고, && 는 하나만 거짓이어도 전체가 거짓입니다.
  // 회원 여부가 참이어도 소용이 없습니다.
  //
  // 참고: overdueCount 는 숫자라서 if (overdueCount) 라고 쓰면 "0이 아닌가"를 묻는 게 됩니다.
  // 뜻이 반대이므로 헷갈리지 않게 === 0 으로 명확히 쓰는 것이 좋습니다.
}

// ═══ 워밍업 C 정답 ═══ else if 로 구간 나누기
console.log("===== 워밍업 C =====");
{
  const dustLevel = 94;

  if (dustLevel >= 151) {
    console.log("매우 나쁨");
  } else if (dustLevel >= 81) {
    console.log("나쁨"); // 출력: 나쁨
  } else if (dustLevel >= 31) {
    console.log("보통");
  } else {
    console.log("좋음");
  }

  // 해설: 94는 >= 81 도 참이고 >= 31 도 참입니다.
  // else if 는 처음 참이 되는 하나만 실행하므로, 큰 값부터 위에 둬야 합니다.
  // 만약 >= 31 을 맨 위에 뒀다면 94도 151도 전부 "보통"이 나옵니다.
  // 마지막 else 에 조건이 없는 이유: 위 세 조건에 안 걸린 나머지 전부(31 미만)이기 때문입니다.
}

// ═══ 문제 1 정답 ═══ 조건 세 개를 묶기
console.log("===== 문제 1 =====");
{
  const isMember = false;
  const orderAmount = 52000;
  const hasCoupon = true;

  const isFreeShipping = isMember && (orderAmount >= 30000 || hasCoupon);
  console.log(isFreeShipping); // 출력: false
  console.log(isFreeShipping ? "무료배송" : "배송비 3000원"); // 출력: 배송비 3000원

  // 해설: 안쪽 괄호부터 계산합니다.
  //   (52000 >= 30000 || true) → (true || true) → true
  //   false && true → false        회원이 아니므로 나머지 조건이 아무리 좋아도 false
  //
  // ⚠️ 괄호를 빼면 결과가 달라집니다:
  //   isMember && orderAmount >= 30000 || hasCoupon
  //   → && 가 || 보다 먼저 계산되므로 (false && true) || true → false || true → true
  //   회원이 아닌데도 무료배송이 되어 버립니다.
  //   && 와 || 를 섞을 때는 의도한 묶음에 반드시 괄호를 치세요.
}

// ═══ 문제 2 정답 ═══ else if 순서가 틀린 코드 고치기
console.log("===== 문제 2 =====");
{
  const deliveryCount = 63;

  if (deliveryCount >= 50) {
    console.log("VIP 당일배송"); // 출력: VIP 당일배송
  } else if (deliveryCount >= 10) {
    console.log("우수 고객 무료배송");
  } else if (deliveryCount >= 1) {
    console.log("일반 배송");
  }

  // 해설: 원래 코드가 항상 "일반 배송"만 낸 이유 —
  // 63은 >= 1 도 참이라 맨 위에서 걸려 버리고, 아래 두 조건은 검사조차 되지 않습니다.
  // else if 는 "앞에서 안 걸렸을 때만" 검사하므로 순서가 곧 로직입니다.
  // 체를 겹칠 때 구멍이 가장 작은 체(= 가장 까다로운 조건)를 맨 위에 둬야 합니다.
  // 규칙: 등급·요금처럼 구간을 나눌 때는 "좁은 범위(큰 값)부터" 위에 씁니다.
}

// ═══ 문제 3-1 정답 ═══ 중첩 펼치기
console.log("===== 문제 3-1 =====");
{
  const cardNumber = "1234-5678";
  const balance = 12000;
  const payAmount = 45000;
  const isCardValid = true;

  if (!cardNumber) {
    console.log("카드번호를 입력해 주세요");
  } else if (balance < payAmount) {
    console.log("잔액이 부족합니다"); // 출력: 잔액이 부족합니다
  } else if (!isCardValid) {
    console.log("정지된 카드입니다");
  } else {
    console.log("결제 완료");
  }

  // 해설: 중첩 버전은 조건 하나만 어긋나도 아무것도 출력하지 않습니다.
  // 사용자는 "왜 안 되는지" 알 수 없고, 개발자도 어느 단계에서 막혔는지 모릅니다.
  //
  // 펼친 버전의 구조: 잘못된 경우를 위에서부터 하나씩 쳐내고,
  // 전부 통과한 정상 처리는 맨 아래 else 한 곳에만 둡니다.
  // 조건이 "부정형(!cardNumber, balance < payAmount)"으로 바뀐 것에 주목하세요 —
  // 중첩은 "되는 조건", 펼치기는 "안 되는 조건"을 씁니다.
  //
  // 이 형태를 내일 함수를 배우면 early return 패턴이라고 부르게 됩니다.
}

// ═══ 문제 3-2 정답 ═══ 반대로, 중첩이 정답인 경우
console.log("===== 문제 3-2 =====");
{
  const hasLibraryCard = true;
  const overdueBooks = 2;
  const borrowedBooks = 3;

  if (hasLibraryCard) {
    // ↓ 2단계 전체가 1단계 안에 들어 있습니다. 회원증이 없으면 여기는 아예 안 봅니다.
    if (overdueBooks > 0) {
      console.log(`연체 도서 ${overdueBooks}권을 먼저 반납하세요`); // 출력: 연체 도서 2권을 먼저 반납하세요
    } else if (borrowedBooks >= 5) {
      console.log("대출 한도(5권)를 모두 채웠습니다");
    } else {
      console.log(`대출 가능합니다 (현재 ${borrowedBooks}권)`);
    }
  } else {
    console.log("회원증을 먼저 발급받으세요");
  }

  // 해설 ①: 3-1과 정반대의 결론입니다. 중첩 자체가 나쁜 게 아니라, "쓸 자리"가 따로 있습니다.
  //   판단 기준은 조건의 성격이 아니라 "단계가 나뉘는가"입니다.
  //   - 조건들이 나란한 후보라면(배송비 구간, 등급 구간) → else if 로 펼칩니다.
  //   - 앞을 통과해야 뒤를 볼 의미가 생긴다면(회원증 → 연체 → 권수) → 중첩입니다.
  //   섹션05의 "체" 비유가 이것입니다. 첫 번째 체를 통과한 것만 두 번째 체로 내려갑니다.
  //
  // 해설 ②: 왜 else if 로 다 펼치면 안 되는가 —
  //   if (!hasCard) ... else if (overdueCount > 0) ... 처럼 펼쳐도 이 예제는 돌아갑니다.
  //   하지만 2단계 안내가 열 가지로 늘어나면 매 조건마다 "회원증이 있다"는 전제가 숨어 버립니다.
  //   중첩으로 두면 그 전제가 바깥 if 한 줄에 딱 한 번 적혀 있어, 나중에 읽는 사람이 헷갈리지 않습니다.
  //
  // 해설 ③: 워밍업 B와 무엇이 달라졌는가 —
  //   워밍업 B: if (isLibraryMember && overdueCount === 0) → "좌석 배정 불가" 한 줄.
  //   이용자는 회원이 아니라서 안 되는지, 연체 때문에 안 되는지 알 수 없습니다.
  //   && 는 여러 조건을 하나의 true/false 로 "뭉개기" 때문에, 뭉개진 뒤에는 원인을 되찾을 수 없습니다.
  //   ⇒ 결과만 필요하면 &&, 어디서 걸렸는지 알려야 하면 중첩.
  //     이것이 워밍업 B와 3-2를 가르는 유일한 기준입니다. 문법이 아니라 "무엇을 말해야 하는가"입니다.
  //
  // 해설 ④: 값을 바꿔 네 경우가 다 나오는지 확인해 보세요.
  //   hasLibraryCard=false                                  → 회원증을 먼저 발급받으세요
  //   hasLibraryCard=true, overdueBooks=0, borrowedBooks=5  → 대출 한도(5권)를 모두 채웠습니다
  //   hasLibraryCard=true, overdueBooks=0, borrowedBooks=3  → 대출 가능합니다 (현재 3권)
  //   조건문은 "한 경우만 맞히면 끝"이 아니라 모든 갈래를 다 밟아 봐야 검사가 끝납니다.
  //   실무 버그의 상당수가 "한 번도 실행해 보지 않은 else" 안에 있습니다.
}

// ═══ 문제 4 정답 ═══ 입력값은 문자열이다
console.log("===== 문제 4 =====");
{
  const inputAge = "22";

  console.log(typeof inputAge); // 출력: string
  console.log(inputAge >= 20); // 출력: true
  console.log(Number(inputAge) >= 20 ? "성인" : "미성년자"); // 출력: 성인

  // 해설: 두 번째 줄이 true인 이유 —
  // >= 는 "크기 비교"라는 뜻뿐이라 JS가 "22"를 숫자 22로 바꿔서 비교합니다.
  // 그래서 우연히 원하는 답이 나옵니다. 하지만 믿으면 안 됩니다:
  //   inputAge === 22  → false  (=== 는 타입을 바꾸지 않으므로)
  //   inputAge + 1     → "221"  (+ 는 문자열 이어 붙이기가 이기므로)
  //
  // 즉 비교는 어쩌다 되고 계산은 깨집니다. 이게 더 위험합니다 —
  // 테스트할 때는 통과하고 실제 계산에서 터지기 때문입니다.
  // 규칙: 입력값은 받는 즉시 Number()로 바꾸고, 그다음부터 숫자로 다룹니다.
}

// ═══ 문제 5 정답 ═══ [도전] switch 로 여러 값을 한 묶음으로
console.log("===== 문제 5 =====");
{
  const dayCode = 7;

  switch (dayCode) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      console.log("평일");
      break;
    case 6:
    case 7:
      console.log("주말"); // 출력: 주말
      break;
    default:
      console.log("잘못된 요일 코드");
      break;
  }

  // 해설: case 를 연달아 쓰고 그 사이에 break 를 넣지 않으면,
  // 어느 case 로 들어오든 아래에서 처음 만나는 블록을 함께 실행합니다.
  // dayCode가 6이면 case 6에서 들어와 아래로 흘러 "주말"을 출력하고 break 로 나갑니다.
  //
  // 지금까지 fall-through 는 "break를 빼먹은 실수"로 배웠는데,
  // 이렇게 "여러 값을 한 묶음으로 처리"할 때는 의도적으로 이용합니다.
  // 구분법: case 와 case 사이에 코드가 있으면 실수, 아무것도 없으면 의도한 묶음입니다.
  //
  // if 로 쓰면 dayCode >= 1 && dayCode <= 5 처럼 범위 비교가 되어 더 짧습니다.
  // switch 가 유리한 건 "값이 딱 정해진 목록"일 때입니다 — 요일 코드가 딱 그 경우입니다.
}

// ═══ 문제 6 정답 ═══ [도전] 결과 예측하기
console.log("===== 문제 6 =====");
{
  if ("0") console.log("A");
  else console.log("B");
  // 출력: A
  // 해설: "0"은 글자가 하나 들어 있는 문자열이라 참입니다.
  // 거짓으로 취급되는 값은 여섯 개뿐입니다: false · 0 · ""(빈 문자열) · null · undefined · NaN
  // 숫자 0은 그 명단에 있고, 문자열 "0"은 없습니다.

  if (0) console.log("C");
  else console.log("D");
  // 출력: D
  // 해설: 숫자 0은 거짓입니다. 위와 따옴표 하나 차이로 결과가 반대가 됩니다.

  if ("") console.log("E");
  else console.log("F");
  // 출력: F
  // 해설: 빈 문자열도 거짓입니다. 그래서 if (userName) 이 "이름이 비어 있지 않은가" 검사가 됩니다.

  console.log(5 > 3 > 1);
  // 출력: false
  // 해설: 왼쪽부터 계산합니다. 5 > 3 → true, 그다음 true > 1 이 됩니다.
  // 크기 비교에서 true는 1로 취급되므로 1 > 1 → false.
  // 수학처럼 "5보다 크고 3보다 크고..."로 이어 쓸 수 없습니다.
  // 범위 비교는 반드시 && 로: n > 1 && n < 5

  let n = 5;
  if ((n = 3)) console.log("G");
  console.log(n);
  // 출력: G
  // 출력: 3
  // 해설: 오늘 최대 지뢰입니다. = 하나는 비교가 아니라 할당입니다.
  // ① n에 3이 들어가고(원래 값 5가 날아감) ② 그 결과 3이 조건이 되는데 3은 참이라 G가 찍힙니다.
  // 에러가 안 나기 때문에 발견이 늦습니다.
  // (정답 코드에 괄호를 두 겹 친 것은 "일부러 할당했다"는 표시입니다.
  //  실무 도구들이 이 실수를 경고하는데, 괄호를 겹치면 경고를 끕니다)
  // 외울 문장: 값을 넣는 건 = , 값을 묻는 건 ===
}

// ═══ 문제 7 정답 ═══ [도전] 종합 — 주문 객체로 배송비 계산
console.log("===== 문제 7 =====");
{
  const order = {
    customer: "김철수",
    isRemote: true,
    items: [
      { name: "머그컵", price: 12000 },
      { name: "노트", price: 5000 },
      { name: "텀블러", price: 30000 },
    ],
  };

  const count = order.items.length;
  console.log(`주문 상품: ${count}개`); // 출력: 주문 상품: 3개

  const lastItem = order.items[count - 1];
  console.log(`마지막 담은 상품: ${lastItem.name}`); // 출력: 마지막 담은 상품: 텀블러

  const total = order.items[0].price + order.items[1].price + order.items[2].price;
  console.log(`총 주문 금액: ${total}원`); // 출력: 총 주문 금액: 47000원

  if (order.isRemote) {
    console.log("추가 배송비 3000원"); // 출력: 추가 배송비 3000원
  } else if (total >= 50000) {
    console.log("무료배송");
  } else if (total >= 30000) {
    console.log("배송비 2500원");
  } else {
    console.log("배송비 3500원");
  }

  // 해설 ①: order.items[0].price 를 읽는 순서 —
  // order에서 items 배열을 꺼내고 → 0번째 객체를 꺼내고 → 그 안의 price.
  // 왼쪽부터 한 겹씩 벗겨 내려갑니다. 중간에서 막히면 order.items 까지만 찍어 보세요.
  //
  // 해설 ②: 마지막 상품을 [2] 라고 직접 쓰면 상품이 4개가 되는 순간 틀립니다.
  // length - 1 로 쓰면 개수가 몇이든 항상 마지막을 가리킵니다.
  //
  // 해설 ③: isRemote 를 맨 위에 둔 것이 이 문제의 핵심입니다.
  // "총액에 상관없이"라는 조건은 곧 "다른 조건보다 먼저 검사한다"는 뜻입니다.
  // 만약 total >= 30000 을 위에 뒀다면 47000원이라 "배송비 2500원"이 나오고
  // 도서산간 조건은 검사조차 되지 않습니다.
  // 요구사항에 "~에 상관없이", "무조건", "우선"이라는 말이 있으면 그 조건이 맨 위입니다.
}

// ═══ 문제 8 정답 ═══ [도전] 카페 스탬프 적립
console.log("===== 문제 8 =====");
{
  let stamp = 8;
  let visitCount = 24;
  const memberPhone = null;

  // ① 오늘 주문 3잔 적립
  stamp += 3; // stamp = stamp + 3 을 줄인 것 → 11
  console.log(`현재 스탬프: ${stamp}개`); // 출력: 현재 스탬프: 11개

  // ② 방문 횟수 1 증가
  visitCount++; // visitCount += 1 과 같음 → 25
  console.log(`방문 횟수: ${visitCount}회`); // 출력: 방문 횟수: 25회

  // ③ 무료 음료 지급
  if (stamp >= 10) {
    console.log("무료 음료 1잔 지급"); // 출력: 무료 음료 1잔 지급
    stamp -= 10; // 11 - 10 → 1
  }

  // ④ 남은 스탬프
  console.log(`남은 스탬프: ${stamp}개`); // 출력: 남은 스탬프: 1개

  // ⑤ 단골 쿠폰 (5의 배수)
  if (visitCount % 5 === 0) {
    console.log("단골 쿠폰 지급"); // 출력: 단골 쿠폰 지급
  }

  // ⑥ 전화번호 등록 여부
  console.log(memberPhone === null ? "전화번호 미등록" : "SMS 발송");
  // 출력: 전화번호 미등록

  // 해설 ①: let 과 const 를 나눈 이유가 이 문제의 절반입니다.
  // stamp 와 visitCount 는 실행 도중 값이 바뀌므로 let 이어야 합니다.
  // const 로 선언했다면 stamp += 3 에서 TypeError 가 납니다.
  // memberPhone 은 이 코드 안에서 바뀌지 않으므로 const 입니다.
  //
  // 해설 ②: ++ 는 "1 증가"입니다. visitCount += 1 과 결과가 같습니다.
  // 이 줄이 없으면 24가 남아 24 % 5 는 4라서 단골 쿠폰이 안 나옵니다 —
  // ②의 결과가 ⑤의 판정에 그대로 영향을 줍니다. 순서를 바꾸면 답이 달라집니다.
  //
  // 해설 ③: 5의 배수 판별은 "5로 나눈 나머지가 0인가"입니다.
  // 25 % 5 → 0 이므로 참. 짝수 판별(% 2 === 0)과 같은 공식이고 나누는 수만 다릅니다.
  //
  // 해설 ④: null 검사에 typeof 를 쓰면 안 됩니다.
  // typeof null 은 "object" 라서 typeof memberPhone === "null" 은 절대 참이 되지 않습니다.
  // null 은 값 === null 로 직접 비교합니다.
  //
  // 해설 ⑤: 만약 전화번호를 "아직 입력받지 않은 상태"로 두고 싶다면 undefined 를 쓰지만,
  // 여기서는 "등록 안 함이 확인된 상태"라 개발자가 직접 null 을 넣었습니다.
  // undefined = JS가 자동으로 넣은 "아직" / null = 개발자가 넣은 "없음".
}
