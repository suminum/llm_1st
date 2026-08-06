// 03_JS_01_기초 개념코드 — 섹션 10. Object 객체 (JavaScript)
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션10_Object_객체.js 로 실행하며 결과를 확인합니다.

// ── 섹션 10: Object 객체 ──────────────
console.log("===== 섹션 10: Object 객체 =====");
// 배열과의 차이: 배열은 "순서"로 꺼내고(fruits[0]), 객체는 "이름"으로 꺼냅니다(cat.name).
//   같은 종류가 여러 개  → 배열 (과일 목록, 학생 명단)
//   한 대상의 여러 정보  → 객체 (고양이 한 마리의 이름·나이·성격)
// [기본] key: value 쌍의 데이터 꾸러미 - key 이름으로 value에 접근
let cat = {
  name: "나비",     // key: value — key는 이름표, value는 실제 값
  age: 1,           // 쌍과 쌍 사이는 쉼표로 구분
  isCute: true,     // 마지막 쉼표는 있어도 되고 없어도 됩니다
};
// ⚠️ CSS를 엿새 하다 왔으니 문법이 겹쳐 보입니다. 딱 한 곳이 다릅니다:
//    CSS   →  color: red;      이름: 값  뒤에 세미콜론(;)
//    객체  →  name: "나비",    이름: 값  뒤에 쉼표(,)
//    콜론(:)은 같고 끝 기호만 다릅니다. 세미콜론을 쓰면 바로 에러가 납니다.
console.log(cat.name);    // 출력: 나비
console.log(cat.age);     // 출력: 1
console.log(cat.isCute);  // 출력: true
// [다른 방법] 대괄호 표기 - key를 문자열로 접근
console.log(cat["name"]); // 출력: 나비
// 점 표기법과 결과가 같은데 왜 두 가지일까요? 대괄호는 이런 때 필요합니다:
//   ① key에 하이픈·공백이 있을 때   → obj["font-size"]  (obj.font-size 는 빼기로 읽힘)
//   ② key를 변수에 담아 쓸 때        → const k = "name"; cat[k]
// 오늘은 점 표기법만 손에 익히면 충분하고, 대괄호는 10일차 for...in에서 다시 나옵니다.

// [기본] 값 바꾸기 · 새 key 추가 — 둘 다 같은 문법입니다
cat.age = 2;              // 이미 있는 key → 값이 바뀜
cat.color = "삼색";        // 없던 key → 새로 생김 (선언 같은 게 따로 없습니다)
console.log(cat.age, cat.color);  // 출력: 2 삼색
// 참고: 위 cat은 let으로 선언했지만, const로 선언한 객체도 이 두 줄은 그대로 됩니다.
// const가 막는 건 "다른 객체로 통째로 갈아 끼우기"(cat = { ... })이고,
// 안의 값을 고치는 건 허용되기 때문입니다 (섹션 4의 주소 쪽지 비유 그대로).
// 아래 store가 const로 선언한 객체이니, store.name = "새 이름" 도 된다는 뜻입니다.

// [기본] 없는 key를 꺼내면 에러가 아니라 undefined
console.log(cat.weight);  // 출력: undefined
// 배열에서 없는 자리를 꺼냈을 때(fruits[4])와 똑같은 동작입니다.
// 조용히 넘어가기 때문에 화면에 undefined가 뜬 뒤에야 발견됩니다.

// [다른 방법] 객체 안에 배열·객체를 넣을 수 있습니다 — 실무 데이터가 대부분 이 모양입니다
const store = {
  name: "행복 편의점",
  sales: [120, 95, 143],              // 객체 안의 배열
  owner: { name: "김사장", age: 45 }, // 객체 안의 객체
};
console.log(store.sales[0]);     // 출력: 120   store에서 sales 꺼내고 → 0번째
console.log(store.owner.name);   // 출력: 김사장 store에서 owner 꺼내고 → 그 안의 name
// 왼쪽부터 한 겹씩 벗겨 내려간다고 생각하세요. 12일차 JSON에서 이 구조를 그대로 다시 만납니다.

// 실수: cat.Name  // key는 대소문자를 구분 -> undefined
// 실수: cat."name"  // 점 표기법에는 따옴표를 쓰지 않습니다 (따옴표는 대괄호 안에서만)
