// ============================================================
// 09단원 · 개념 04 — 스프레드: 객체 펼치기
// ------------------------------------------------------------
// 실행: node 개념04_스프레드_객체.js
// ============================================================
//
// 배열과 문법이 같습니다. 중괄호 안에서 쓴다는 것만 다릅니다.
//
//     const copy = { ...원본 };
//
// 07단원에서 "복사할 때 이걸 쓰라" 고 미리 봤던 문법입니다.


// ── 섹션 1: 객체 복사 ──

const user = { name: "김민준", age: 20 };

// [잘못된 복사] 이름표만 하나 더 붙는 것입니다
const notCopy = user;
notCopy.age = 99;
console.log(user.age);
// 출력: 99
// 원본까지 바뀌었습니다.

// [진짜 복사]
const user2 = { name: "이서연", age: 22 };
const realCopy = { ...user2 };
realCopy.age = 99;

console.log(realCopy);
// 출력: { name: '이서연', age: 99 }
console.log(user2);
// 출력: { name: '이서연', age: 22 }

// ✏️ 직접 해보기 1 — 객체를 복사한 뒤 복사본만 바꿔 보세요.


// ── 섹션 2: 속성 추가하고 수정하기 ──

// 시작하기 전에 짧은 표기법 하나만 보고 갑시다. 앞으로 자주 나옵니다.
//
// 넣을 값이 담긴 변수 이름과 속성 이름이 같으면, 한 번만 써도 됩니다.
const id = 1;
const count = 2;

console.log({ id: id, count: count });
// 출력: { id: 1, count: 2 }

console.log({ id, count });
// 출력: { id: 1, count: 2 }
// 위 두 줄은 완전히 같습니다. 아래쪽을 '속성 축약' 이라고 합니다.
// 13단원 종합 실습에서 이 모양이 계속 나오니 눈에 익혀 두세요.

const base = { name: "박지훈", age: 28 };

// 추가
console.log({ ...base, city: "대구" });
// 출력: { name: '박지훈', age: 28, city: '대구' }

// 수정 — 같은 이름을 다시 쓰면 덮어씁니다
console.log({ ...base, age: 30 });
// 출력: { name: '박지훈', age: 30 }

// 원본은 그대로입니다.
console.log(base);
// 출력: { name: '박지훈', age: 28 }

// "원본을 안 바꾸고 하나만 고친 새 객체" 를 만드는 방법입니다.
// React 에서 상태를 바꿀 때 이 형태를 계속 씁니다.

// ✏️ 직접 해보기 2 — base 에 job 속성을 더한 새 객체를 만들어 보세요.


// ── 섹션 3: 순서가 결과를 바꾼다 ──

const defaults = { theme: "light", fontSize: 14, lang: "ko" };
const userSetting = { theme: "dark" };

// 뒤에 오는 것이 이깁니다.
console.log({ ...defaults, ...userSetting });
// 출력: { theme: 'dark', fontSize: 14, lang: 'ko' }
// 사용자 설정이 기본값을 덮어썼습니다.

// 순서를 바꾸면 반대가 됩니다.
console.log({ ...userSetting, ...defaults });
// 출력: { theme: 'light', fontSize: 14, lang: 'ko' }
// 기본값이 사용자 설정을 덮어써 버렸습니다. 원하는 결과가 아닙니다.

// 규칙: "기본값을 먼저, 덮어쓸 것을 나중에"
//
// 낱개 속성도 같습니다. 나중에 쓴 것이 이깁니다.
console.log({ age: 1, ...base });
// 출력: { age: 28, name: '박지훈' }
console.log({ ...base, age: 1 });
// 출력: { name: '박지훈', age: 1 }

// ✏️ 직접 해보기 3 — defaults 를 기본으로 두고 fontSize 만 20 으로 바꾼
//                    새 객체를 만들어 보세요.


// ── 섹션 4: 객체 합치기 ──

const info = { name: "최유진", age: 25 };
const contact = { phone: "010-0000-0000", email: "test@example.com" };

console.log({ ...info, ...contact });
// 출력: {
// 출력:   name: '최유진',
// 출력:   age: 25,
// 출력:   phone: '010-0000-0000',
// 출력:   email: 'test@example.com'
// 출력: }

// 배열은 [...a, ...b], 객체는 { ...a, ...b } 입니다. 괄호만 다릅니다.

// 세 개 이상도 됩니다.
console.log({ ...info, ...contact, level: 3 });
// 출력: {
// 출력:   name: '최유진',
// 출력:   age: 25,
// 출력:   phone: '010-0000-0000',
// 출력:   email: 'test@example.com',
// 출력:   level: 3
// 출력: }


// ── 섹션 5: 구조분해와 짝지어 쓰기 ──

// "하나만 빼고 나머지" 는 구조분해로, "하나만 바꾸기" 는 스프레드로 합니다.
const account = { id: 1, password: "1234", nickname: "유진" };

// 빼기 (개념02)
const { password, ...safe } = account;
console.log(safe);
// 출력: { id: 1, nickname: '유진' }

// 바꾸기 (이 파일)
console.log({ ...account, nickname: "새닉네임" });
// 출력: { id: 1, password: '1234', nickname: '새닉네임' }

// 배열 안의 객체 하나만 바꾸기 — 실무에서 아주 많이 쓰는 조합입니다.
const todos = [
  { id: 1, text: "장보기", done: false },
  { id: 2, text: "청소", done: false },
];

const updated = todos.map((todo) => (todo.id === 2 ? { ...todo, done: true } : todo));

console.log(updated);
// 출력: [
// 출력:   { id: 1, text: '장보기', done: false },
// 출력:   { id: 2, text: '청소', done: true }
// 출력: ]

console.log(todos[1].done);
// 출력: false
// 원본은 그대로입니다.

// 읽는 법: "id 가 2면 그 객체를 복사해서 done 만 true 로, 아니면 그대로"

// ✏️ 직접 해보기 4 — todos 에서 id 가 1인 항목의 text 를 "대청소" 로 바꾼
//                    새 배열을 만들어 보세요.


// ── 섹션 6: 얕은 복사 — 여기서도 한 겹뿐 ──

const order = {
  id: 100,
  customer: { name: "정하늘", city: "서울" },
};

const orderCopy = { ...order };

// 겉의 속성은 따로입니다.
orderCopy.id = 200;
console.log(order.id);
// 출력: 100

// 하지만 안의 객체는 같은 것을 가리킵니다.
orderCopy.customer.name = "바뀐이름";
console.log(order.customer.name);
// 출력: 바뀐이름

// 안쪽까지 복사하려면 안쪽도 펼쳐야 합니다.
const order2 = {
  id: 100,
  customer: { name: "정하늘", city: "서울" },
};

const deepCopy = {
  ...order2,
  customer: { ...order2.customer },
};

deepCopy.customer.name = "바뀐이름";
console.log(order2.customer.name);
// 출력: 정하늘

// 구조가 깊으면 structuredClone 이 편합니다.
const order3 = { a: { b: { c: 1 } } };
const cloned = structuredClone(order3);
cloned.a.b.c = 99;
console.log(order3.a.b.c);
// 출력: 1


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 배열을 중괄호 안에 펼치기
console.log({ ...[1, 2, 3] });
// 출력: { '0': 1, '1': 2, '2': 3 }
// 실수: 에러는 안 나지만 인덱스가 속성 이름인 이상한 객체가 됩니다.
//       배열은 대괄호 안에 펼치세요.

// [실수 2] 순서를 반대로 써서 덮어쓰기가 반대로 됨 (섹션 3)

// [실수 3] 얕은 복사인 줄 모르고 원본을 망가뜨림 (섹션 6)

// [실수 4] 화살표 함수에서 객체를 바로 돌려줄 때 소괄호를 빼먹음
const toObject1 = (n) => {
  n;
};
console.log(toObject1(1));
// 출력: undefined
const toObject2 = (n) => ({ value: n });
console.log(toObject2(1));
// 출력: { value: 1 }
// 실수: 중괄호를 함수 몸통으로 해석합니다. 소괄호로 감싸세요. (08단원 개념03)

// [실수 5] null 이나 undefined 를 펼치기
console.log({ ...null });
// 출력: {}
// 에러가 나지 않고 빈 객체가 됩니다. 배열과 달리 조용히 넘어갑니다.


// ── 정리 ──

// 1. { ...객체 } — 객체를 복사한다.
// 2. { ...객체, 속성: 값 } — 원본을 안 바꾸고 추가·수정한 새 객체를 만든다.
// 3. 같은 이름이 겹치면 '나중에 쓴 것' 이 이긴다. 기본값을 먼저 쓸 것.
// 4. { ...a, ...b } 로 합친다. 배열은 [...a, ...b].
// 5. 얕은 복사다. 안쪽 객체까지 지키려면 안쪽도 펼치거나 structuredClone.
// 6. map 과 함께 쓰면 "배열 안의 객체 하나만 바꾸기" 가 된다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const o = { a: 1 };
//    const c = { ...o };
//    c.a = 99;
//    console.log(c.a);        // 출력: 99
//    console.log(o.a);        // 출력: 1
//
// 2) console.log({ ...base, job: "개발자" });
//    // 출력: { name: '박지훈', age: 28, job: '개발자' }
//
// 3) console.log({ ...defaults, fontSize: 20 });
//    // 출력: { theme: 'light', fontSize: 20, lang: 'ko' }
//
// 4) console.log(todos.map((t) => (t.id === 1 ? { ...t, text: "대청소" } : t)));
//    // 출력: [
//    //   { id: 1, text: '대청소', done: false },
//    //   { id: 2, text: '청소', done: false }
//    // ]
