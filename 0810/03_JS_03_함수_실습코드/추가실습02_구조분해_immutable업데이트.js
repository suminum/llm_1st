// 03_JS_03_함수 실습 정답코드 — [추가 실습] 운동 기록 구조 분해 + immutable 업데이트 (보너스 — 빨리 끝냈다면 도전해 보세요)
// 읽는 순서: 조건 → Step 1 → Step 2 → Step 3 → 자주 하는 실수
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 추가실습02_구조분해_immutable업데이트.js 로 실행하며 결과를 확인합니다.

// ── [추가 실습] 운동 기록 구조 분해 + immutable 업데이트 (보너스 — 빨리 끝냈다면 도전해 보세요) ──
// 조건: 운동 기록 객체에서 이름·시간만 구조 분해로 꺼내 출력하고,
//       스프레드로 시간만 바꾼 새 객체를 만들어 원본이 안 바뀜을 확인
//
// 오늘 배운 것 중 실무에서 가장 자주 쓰는 두 가지입니다.
// 특히 "원본을 고치지 않고 새것을 만든다"는 발상은 2단원 React에서 매일 씁니다.
console.log("===== [추가 실습] 구조 분해와 스프레드 =====");
{
  const workout = { id: "W-01", name: "저녁 산책", min: 42, status: "진행 중" };

  // Step 1: 객체 구조 분해 - 필요한 키만 꺼내기
  // 원래대로면 이렇게 두 줄을 써야 합니다:
  //   const name = workout.name;
  //   const min = workout.min;
  // 구조 분해는 그 두 줄을 한 줄로 줄인 것입니다. 하는 일은 완전히 같습니다.
  // 왼쪽 { name, min } 은 객체를 만드는 게 아니라 "이 이름들을 꺼내겠다"는 표시입니다.
  // 그래서 이름을 마음대로 지을 수 없습니다 — 객체 안의 키 이름과 똑같이 적어야 찾아냅니다.
  const { name, min } = workout;
  console.log(name, min); // 출력: 저녁 산책 42

  // Step 2: 매개변수 구조 분해로 요약 출력 함수 만들기
  // 매개변수 자리에도 그대로 쓸 수 있습니다.
  //   ({ name, status }) 는 "객체를 하나 받되, 그중 name 과 status 만 꺼내 쓰겠다"는 뜻입니다.
  // 함수 안에서 workout.name, workout.status 라고 매번 쓰지 않아도 되고,
  // 함수 첫 줄만 봐도 이 함수가 객체의 어느 값을 쓰는지 한눈에 보입니다.
  const printWorkout = ({ name, status }) => console.log(`${name} - ${status}`);
  printWorkout(workout); // 출력: 저녁 산책 - 진행 중

  // Step 3: 스프레드로 min만 바꾼 새 객체 생성 (immutable 업데이트)
  // ...workout 은 "workout 안의 키와 값을 이 자리에 그대로 펼쳐 놓아라"는 뜻입니다.
  // 펼친 뒤에 min: 55 를 적었으므로, 같은 키가 겹치면 뒤에 쓴 것이 이깁니다.
  // 결과적으로 "나머지는 그대로, min 만 55인 새 객체"가 만들어집니다.
  // 순서가 핵심입니다 — { min: 55, ...workout } 이라고 쓰면 원본의 42가 덮어써 버립니다.
  const updated = { ...workout, min: 55 };
  console.log(updated.min); // 출력: 55
  console.log(workout.min); // 출력: 42  <- 원본은 그대로
  // 원본이 살아 있는 것이 이 방식의 목적입니다(immutable = 원본을 바꾸지 않음).
  // workout.min = 55 라고 직접 고치면 한 줄로 끝나지만, 원본이 사라져
  // "고치기 전 값"이 필요할 때 되돌릴 수가 없습니다.
}

// ── 자주 하는 실수 ──────────────────────────────────────────
// 실수: const { workoutName } = workout;
//       → 키 이름과 다른 이름을 쓰면 undefined 입니다. 객체에 workoutName 이라는 키가 없으니까요.
//         이름을 바꾸고 싶다면 const { name: workoutName } = workout; 라고 씁니다.
//
// 실수: const [name, min] = workout;
//       → 대괄호는 배열용입니다. 객체는 순서가 아니라 이름으로 꺼내므로 중괄호를 씁니다.
//         배열은 [ ] 로 순서대로, 객체는 { } 로 이름으로 — 이 짝을 헷갈리면 에러가 납니다.
//
// 실수: const updated = { min: 55, ...workout };
//       → 펼치기를 뒤에 두면 원본의 min: 42 가 55를 덮어써 updated.min 이 42가 됩니다.
//         "바꿀 값은 항상 ...뒤에" 라고 외우세요.
//
// 실수: const updated = workout;  updated.min = 55;
//       → 새 객체가 만들어진 게 아니라 같은 객체에 이름표를 하나 더 붙인 것뿐입니다.
//         updated.min 을 바꾸면 workout.min 도 함께 55가 됩니다. 복사한 게 아닙니다.
