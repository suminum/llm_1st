// ============================================================
// 06단원 · 개념 02 — 배열에 추가하고 삭제하기
// ------------------------------------------------------------
// 실행: node 개념02_추가와_삭제.js
// ============================================================
//
// 배열은 만든 뒤에도 계속 늘리고 줄일 수 있습니다.
// 앞뒤로 넣고 빼는 네 가지 '메소드' 를 배웁니다.
//
// ── '메소드' 라는 말을 여기서 처음 씁니다 ──
//
//   값 뒤에 점을 찍고 붙여서 일을 시키는 것을 '메소드' 라고 부릅니다.
//     cart.push("우유")   →  "장바구니야, 우유 좀 넣어 줘"
//
//   01단원에서 배운 그 점입니다. 왼쪽 값에게 시키는 것입니다.
//   지금까지 쓴 console.log( ) 도, Math.floor( ) 도 전부 같은 모양이었습니다.
//   앞으로 "배열의 메소드", "문자열의 메소드" 라는 말이 자주 나오는데,
//   "그 값 뒤에 점 찍고 쓰는 것" 이라고 읽으시면 됩니다.
//
//              앞(0번)              뒤(마지막)
//     넣기     unshift              push
//     빼기     shift                pop
//
// 뒤쪽(push / pop)을 훨씬 많이 씁니다. 이것부터 확실히 익히세요.


// ── 섹션 1: push — 뒤에 추가 ──

const cart = [];
console.log(cart);
// 출력: []

cart.push("아메리카노");
console.log(cart);
// 출력: [ '아메리카노' ]

cart.push("케이크");
console.log(cart);
// 출력: [ '아메리카노', '케이크' ]

// 한 번에 여러 개를 넣을 수도 있습니다.
cart.push("쿠키", "머핀");
console.log(cart);
// 출력: [ '아메리카노', '케이크', '쿠키', '머핀' ]

// push 는 '넣은 뒤의 개수'를 돌려줍니다.
const newLength = cart.push("샌드위치");
console.log(newLength);
// 출력: 5
console.log(cart.length);
// 출력: 5

// 반복문과 함께 쓰면 배열을 자동으로 채울 수 있습니다.
const numbers = [];
for (let i = 1; i <= 5; i++) {
  numbers.push(i * 10);
}
console.log(numbers);
// 출력: [ 10, 20, 30, 40, 50 ]

// ✏️ 직접 해보기 1 — 빈 배열을 만들고 push 로 과일 3개를 넣어 출력해 보세요.


// ── 섹션 2: pop — 뒤에서 빼기 ──

const stack = ["첫째", "둘째", "셋째"];

const removed = stack.pop();
console.log(removed);
// 출력: 셋째
console.log(stack);
// 출력: [ '첫째', '둘째' ]

// pop 은 '빼낸 값'을 돌려줍니다. push 와 돌려주는 것이 다릅니다.
//     push → 넣은 뒤의 개수
//     pop  → 빼낸 값

// 빈 배열에서 pop 하면 undefined 입니다. 에러는 안 납니다.
const emptyArr = [];
console.log(emptyArr.pop());
// 출력: undefined

// ✏️ 직접 해보기 2 — 과일 배열에서 마지막 과일을 빼내어 출력하고,
//                    남은 배열도 출력해 보세요.


// ── 섹션 3: unshift / shift — 앞쪽 다루기 ──

const queue = ["둘째", "셋째"];

// unshift : 앞에 추가
queue.unshift("첫째");
console.log(queue);
// 출력: [ '첫째', '둘째', '셋째' ]

// shift : 앞에서 빼기
const first = queue.shift();
console.log(first);
// 출력: 첫째
console.log(queue);
// 출력: [ '둘째', '셋째' ]

// 이름을 외우는 요령:
//     push(밀어 넣다) / pop(툭 튀어나오다)   — 둘 다 뒤쪽. 자주 씀
//     shift 는 맨 앞을 빼고 뒤를 한 칸씩 '밀어' 당기는 것,
//     unshift 는 그 반대(un-)라서 맨 앞에 넣는 것입니다. 가끔 씀
//     헷갈리면 "un 붙은 게 넣기" 하나만 기억하세요.
//
// 앞쪽 작업은 뒤의 값들을 전부 한 칸씩 밀어야 해서 느립니다.
// 데이터가 수만 개라면 차이가 납니다. 웬만하면 push / pop 을 쓰세요.

// ✏️ 직접 해보기 3 — 대기줄 배열을 만들고 맨 앞 사람을 빼내어 출력해 보세요.


// ── 섹션 4: splice — 중간에 넣고 빼기 ──

// splice 는 원하는 위치에서 원하는 개수만큼 다룹니다.
//
//     배열.splice(시작위치, 지울개수, 넣을값들...)

// [중간 삭제]
const menu = ["아메리카노", "라떼", "카푸치노", "케이크"];

menu.splice(1, 1); // 1번 자리에서 1개 삭제
console.log(menu);
// 출력: [ '아메리카노', '카푸치노', '케이크' ]

// [여러 개 삭제] 삭제한 값들을 배열로 돌려줍니다.
const list = ["a", "b", "c", "d", "e"];
const cut = list.splice(1, 3);
console.log(cut);
// 출력: [ 'b', 'c', 'd' ]
console.log(list);
// 출력: [ 'a', 'e' ]

// [중간 삽입] 지울 개수를 0으로 하면 넣기만 합니다.
const seats = ["A", "C"];
seats.splice(1, 0, "B");
console.log(seats);
// 출력: [ 'A', 'B', 'C' ]

// [교체] 지우면서 동시에 넣습니다.
const colors = ["빨강", "노랑", "파랑"];
colors.splice(1, 1, "초록");
console.log(colors);
// 출력: [ '빨강', '초록', '파랑' ]

// ✏️ 직접 해보기 4 — ["월", "수", "목"] 에서 1번 자리에 "화" 를 끼워 넣어 보세요.


// ── 섹션 5: delete 를 쓰면 안 되는 이유 ──

const wrongWay = ["a", "b", "c"];
delete wrongWay[1];

console.log(wrongWay);
// 출력: [ 'a', <1 empty item>, 'c' ]
console.log(wrongWay.length);
// 출력: 3

// 값만 사라지고 자리는 그대로 남습니다. length 도 안 줄어듭니다.
// 배열에 구멍이 뚫려서 나중에 반복할 때 문제가 생깁니다.
// 배열에서 삭제할 때는 반드시 splice(또는 pop / shift)를 쓰세요.

const rightWay = ["a", "b", "c"];
rightWay.splice(1, 1);
console.log(rightWay);
// 출력: [ 'a', 'c' ]
console.log(rightWay.length);
// 출력: 2


// ── 섹션 6: 전부 비우기 ──

const toClear = [1, 2, 3];

// [방법 1] length 를 0으로
toClear.length = 0;
console.log(toClear);
// 출력: []

// [방법 2] splice 로 전부 삭제
const toClear2 = [1, 2, 3];
toClear2.splice(0, toClear2.length);
console.log(toClear2);
// 출력: []

// [주의] 이건 비우는 게 아닙니다.
let toClear3 = [1, 2, 3];
toClear3 = [];
console.log(toClear3);
// 출력: []
// 겉보기엔 같지만 '새 빈 배열로 갈아끼운' 것입니다.
// 다른 곳에서 원래 배열을 보고 있었다면 그쪽은 그대로 [1,2,3] 입니다.
// const 로 만든 배열에는 이 방법을 쓸 수도 없습니다.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] push 의 결과를 배열이라고 생각하기
const arr1 = [1, 2];
const result1 = arr1.push(3);
console.log(result1);
// 출력: 3
// 실수: 배열이 아니라 개수입니다. 배열은 arr1 자체가 이미 바뀌었습니다.
console.log(arr1);
// 출력: [ 1, 2, 3 ]

// [실수 2] 배열을 push 하면 통째로 들어감
const arr2 = [1, 2];
arr2.push([3, 4]);
console.log(arr2);
// 출력: [ 1, 2, [ 3, 4 ] ]
// 실수: 안의 값들을 하나씩 넣으려면 다른 방법이 필요합니다. (09단원 스프레드)

// [실수 3] splice 와 slice 를 헷갈리기
// splice : 원본을 바꾼다 (자르기, 넣기)
// slice  : 원본은 그대로 두고 복사본을 돌려준다 (다음 파일 개념03)
// 이름이 한 글자 차이라 정말 자주 헷갈립니다.

// [실수 4] 없는 인덱스에 직접 값 넣기
const arr3 = ["a"];
arr3[3] = "d";
console.log(arr3);
// 출력: [ 'a', <2 empty items>, 'd' ]
// 실수: 구멍이 생깁니다. 항상 push 를 쓰세요.


// ── 정리 ──

// 1. push(값)     뒤에 추가 → 넣은 뒤의 개수를 돌려줌
// 2. pop()        뒤에서 빼기 → 빼낸 값을 돌려줌
// 3. unshift/shift 앞쪽. 느리니 꼭 필요할 때만.
// 4. splice(시작, 지울개수, 넣을값) 중간 처리. 원본을 바꾼다.
// 5. delete 로 배열 안의 값을 지우지 말 것. 구멍이 남는다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const fruits = [];
//    fruits.push("사과");
//    fruits.push("바나나", "포도");
//    console.log(fruits);
//    // 출력: [ '사과', '바나나', '포도' ]
//
// 2) const last = fruits.pop();
//    console.log(last);      // 출력: 포도
//    console.log(fruits);    // 출력: [ '사과', '바나나' ]
//
// 3) const line = ["김민준", "이서연", "박지훈"];
//    console.log(line.shift());   // 출력: 김민준
//    console.log(line);           // 출력: [ '이서연', '박지훈' ]
//
// 4) const days = ["월", "수", "목"];
//    days.splice(1, 0, "화");
//    console.log(days);
//    // 출력: [ '월', '화', '수', '목' ]
