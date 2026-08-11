// 배열은 만든 뒤에도 계속 늘리고 줄일 수 있습니다.
// 앞뒤로 넣고 빼는 네가지 '메소드' 를 배웁니다.

// '메소드' 라는 말은 값 뒤에 점ㅇ르 찍고 붙여서 일을 시키는 것을 '메소드' 라고 부릅니다.

// cart.push('우유') -> '장바구니야, 우유 좀 넣어줘

// console.log()도 같은 모양입니다.
// 앞으로 '배열으 메소드', '문자열의 메소드' 라는 말을 자주 나오는데
// '그 값 뒤에 점 찍고 쓰는 것' 이라고 읽으시면 됩니다.

//            앞(0번)     뒤(마지막)
//    추가    unshift       push
//    빼기    shift         pop

// 뒤쪽(push/ pop)을 훨씬 많이 씁니다.

const cart = [];
console.log(cart);
// 출력 : []

cart.push("아메리카노");
console.log(cart);
// 출력: ['아메리카노']

cart.push("케이크");
console.log(cart);
// 출력: ['아메리카노', '케이크']

// 한 번에 여러 개를 넣을 수도 있습니다.

cart.push("쿠키", "머핀");
console.log(cart);
// 출력: ['아메리카노', '케이크', "쿠키", "머핀"]

const newLength = cart.push("샌드위치");
console.log(newLength);
// 출력: 5
console.log(cart.length);
// 출력: 5

const numbers = [];
for (let i = 1; i <= 5; i++) {
  numbers.push(i * 10);
}

console.log(numbers);
// 출력 : [ 10, 20, 30, 40, 50 ]

const stack = ["첫째", "둘째", "셋째"];

const removed = stack.pop();
console.log(removed);
// 출력: "셋째"
console.log(stack);
// 출력: ["첫째", "둘째"]

// pop은 '빼낸 값'을 돌려줍니다. push와 돌려주는 것이 다릅니다.

// push ->  넣은 뒤의 개수
// pop -> 빼낸 값

// 빈 배열에서 pop하면 undefined 입니다. 에러는 안납니다.
const emptyArr = [];

// const removed1 = emptyArr.pop();
// console.log(removed1);
console.log(emptyArr.pop());
// 출력 : undefined

// unshift / shift

const queue = ["둘째", "셋째"];
queue.unshift("첫째");
console.log(queue);
// 출력: [ '첫째', '둘째', '셋째' ]

// shift : 앞에서 빼기
const first = queue.shift();
console.log(first);
// 출력 : 첫째
console.log(queue);
// 출력 :["둘째", "셋째"]

// splice 중간에 넣기 빼기

// splice는 원하는 위치에서 원하는 개수만큼 다룹니다.

//  배열.splice(시작위치, 지울개수, 넣을값들...)

// [중간 삭제]

const menu = ["아메리카노", "라떼", "카푸치노", "케이크"];

menu.splice(1, 1); // 1번 자리에서 1개 삭제
console.log(menu);
// 출력: [ '아메리카노', '카푸치노', '케이크' ]

// [여러 개 삭제] 삭제한 값들을 배열로 돌려줍니다.
const list = ["a", "b", "c", "d", "e", "f"];
const cut = list.splice(1, 3);
console.log(cut);
// 출력 : [ 'b', 'c', 'd' ]
console.log(list);
// 출력 : [ 'a', 'e', 'f' ]
