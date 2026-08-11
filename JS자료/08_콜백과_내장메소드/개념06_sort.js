// ============================================================
// 08단원 · 개념 06 — sort: 정렬하기
// ------------------------------------------------------------
// 실행: node 개념06_sort.js
// ============================================================
//
// 06단원에서 sort() 를 그냥 쓰면 숫자가 이상하게 정렬된다고 했습니다.
// 이제 콜백을 배웠으니 제대로 정렬할 수 있습니다.
//
//     배열.sort((a, b) => a - b)   오름차순
//     배열.sort((a, b) => b - a)   내림차순


// ── 섹션 1: 그냥 sort() 의 함정 ──

const numbers = [10, 9, 100, 1];
numbers.sort();
console.log(numbers);
// 출력: [ 1, 10, 100, 9 ]

// sort 는 기본적으로 값을 문자열로 바꿔서 사전 순으로 비교합니다.
// "10" 과 "9" 를 비교하면 첫 글자 "1" 이 "9" 보다 앞이라 10이 먼저 옵니다.

// 문자열 배열은 기본 sort() 로도 잘 됩니다.
const names = ["박지훈", "김민준", "이서연"];
names.sort();
console.log(names);
// 출력: [ '김민준', '박지훈', '이서연' ]


// ── 섹션 2: 비교 함수 — 두 개씩 견주는 규칙 ──

// sort 에 콜백을 넘기면 "이 둘 중 누가 앞이냐" 를 우리가 정할 수 있습니다.
// 콜백은 두 값 a, b 를 받아 숫자를 돌려줍니다.
//
//     음수를 돌려주면  →  a 가 앞
//     양수를 돌려주면  →  b 가 앞
//     0 을 돌려주면    →  순서 유지
//
// 그래서 오름차순은 a - b 입니다.
//     a 가 작으면 a - b 는 음수 → a 가 앞으로 (작은 게 앞)

const nums = [10, 9, 100, 1];
nums.sort((a, b) => a - b);
console.log(nums);
// 출력: [ 1, 9, 10, 100 ]

// 내림차순은 순서를 뒤집습니다.
const nums2 = [10, 9, 100, 1];
nums2.sort((a, b) => b - a);
console.log(nums2);
// 출력: [ 100, 10, 9, 1 ]

// 외우는 요령:
//     a - b  →  작은 것부터 (오름차순, ascending)
//     b - a  →  큰 것부터 (내림차순, descending)

// ✏️ 직접 해보기 1 — [5, 30, 7, 2] 를 오름차순으로 정렬해 보세요.


// ── 섹션 3: sort 는 원본을 바꾼다 ──

const original = [3, 1, 2];
const sorted = original.sort((a, b) => a - b);

console.log(sorted);
// 출력: [ 1, 2, 3 ]
console.log(original);
// 출력: [ 1, 2, 3 ]
// 원본까지 정렬되었습니다. sorted 와 original 은 같은 배열입니다.

// 원본을 지키려면 복사한 뒤 정렬합니다.
const original2 = [3, 1, 2];
const sorted2 = original2.slice().sort((a, b) => a - b);

console.log(sorted2);
// 출력: [ 1, 2, 3 ]
console.log(original2);
// 출력: [ 3, 1, 2 ]

// 09단원에서 배울 '스프레드' 로도 복사할 수 있습니다. 이런 게 있다는 것만 봐 두세요.
// 이 단원에서는 이미 배운 slice() 로 통일해서 쓰겠습니다.
const original3 = [3, 1, 2];
console.log([...original3].sort((a, b) => a - b));
// 출력: [ 1, 2, 3 ]
console.log(original3);
// 출력: [ 3, 1, 2 ]

// 최근에는 원본을 안 바꾸는 toSorted 도 생겼습니다.
const original4 = [3, 1, 2];
console.log(original4.toSorted((a, b) => a - b));
// 출력: [ 1, 2, 3 ]
console.log(original4);
// 출력: [ 3, 1, 2 ]

// ✏️ 직접 해보기 2 — 아래 배열의 원본은 그대로 두고 정렬된 복사본을 만들어 보세요.
//                    const origin = [3, 1, 2];
//                    (힌트: 06단원에서 배운 slice() 로 먼저 복사합니다)


// ── 섹션 4: 객체 배열 정렬 ──

const products = [
  { name: "케이크", price: 6000 },
  { name: "아메리카노", price: 4000 },
  { name: "쿠키", price: 3000 },
];

// 가격 낮은 순
const byPrice = products.slice().sort((a, b) => a.price - b.price);
console.log(byPrice.map((p) => p.name));
// 출력: [ '쿠키', '아메리카노', '케이크' ]

// 가격 높은 순
const byPriceDesc = products.slice().sort((a, b) => b.price - a.price);
console.log(byPriceDesc.map((p) => p.name));
// 출력: [ '케이크', '아메리카노', '쿠키' ]

// 비교할 값을 a.price, b.price 로 꺼내는 것만 다릅니다.
// 나머지는 숫자 정렬과 똑같습니다.

// ✏️ 직접 해보기 3 — products 를 이름의 가나다순으로 정렬해 보세요. (섹션 5 참고)


// ── 섹션 5: 문자열 정렬 ──

// 문자열은 빼기를 할 수 없습니다.
const words = ["banana", "apple", "cherry"];
console.log(words.slice().sort((a, b) => a - b));
// 출력: [ 'banana', 'apple', 'cherry' ]
// a - b 가 전부 NaN 이라 순서가 안 바뀌었습니다.

// 문자열은 비교 연산자로 견줍니다.
console.log(words.slice().sort((a, b) => (a > b ? 1 : -1)));
// 출력: [ 'apple', 'banana', 'cherry' ]

// 또는 localeCompare 를 씁니다. 한글·영어 모두 잘 처리합니다.
console.log(words.slice().sort((a, b) => a.localeCompare(b)));
// 출력: [ 'apple', 'banana', 'cherry' ]

const korean = ["하늘", "가방", "나무"];
console.log(korean.slice().sort((a, b) => a.localeCompare(b)));
// 출력: [ '가방', '나무', '하늘' ]

// 객체 배열의 문자열 속성으로 정렬할 때도 마찬가지입니다.
const sortedByName = products.slice().sort((a, b) => a.name.localeCompare(b.name));
console.log(sortedByName.map((p) => p.name));
// 출력: [ '아메리카노', '케이크', '쿠키' ]

// ✏️ 직접 해보기 4 — ["다", "가", "나"] 를 가나다순으로 정렬해 보세요.


// ── 섹션 6: 정렬 + 자르기 — 상위 N개 뽑기 ──

const scores = [88, 95, 62, 100, 74];

// 상위 3개
const top3 = scores.slice().sort((a, b) => b - a).slice(0, 3);
console.log(top3);
// 출력: [ 100, 95, 88 ]

// 객체 배열에서 가장 비싼 상품 2개
const top2Products = products.slice()
  .sort((a, b) => b.price - a.price)
  .slice(0, 2)
  .map((p) => p.name);
console.log(top2Products);
// 출력: [ '케이크', '아메리카노' ]

// 이렇게 메소드를 줄줄이 이어 쓰는 것을 체이닝이라고 합니다.
// 한 줄이 길어지면 위처럼 점(.) 앞에서 줄을 나누면 읽기 좋습니다.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 숫자 배열에 sort() 를 그냥 씀 (섹션 1)

// [실수 2] 비교 함수에서 true/false 를 돌려줌
const bad = [3, 1, 2];
console.log(bad.slice().sort((a, b) => a > b));
// 출력: [ 3, 1, 2 ]
// 정렬이 전혀 되지 않았습니다.
// 비교 함수는 음수 / 양수 / 0 을 돌려줘야 하는데,
// a > b 는 true 아니면 false 이고 이것은 각각 1과 0으로 바뀝니다.
// "a 가 앞" 을 뜻하는 음수가 나올 방법이 없으니 자리를 바꿀 수 없는 것입니다.
// 반드시 a - b 를 쓰세요.

// [실수 3] 원본이 안 바뀔 거라 기대 (섹션 3)
// 특히 화면에 보여 줄 목록을 정렬했다가 원본 데이터 순서를 망가뜨리는 사고가 잦습니다.

// [실수 4] 문자열에 a - b 를 씀 (섹션 5)

// [실수 5] sort 결과를 다시 담아야 한다고 생각하기
const arr = [3, 1, 2];
arr.sort((a, b) => a - b);
console.log(arr);
// 출력: [ 1, 2, 3 ]
// 원본이 바뀌므로 다시 담지 않아도 됩니다. (담아도 같은 배열입니다)


// ── 정리 ──

// 1. 숫자 정렬은 sort((a, b) => a - b). 그냥 sort() 는 사전 순이라 틀린다.
// 2. a - b 오름차순 / b - a 내림차순
// 3. 객체는 a.속성 - b.속성 으로 비교한다.
// 4. 문자열은 a.localeCompare(b) 를 쓴다.
// 5. sort 는 원본을 바꾼다. 배열.slice().sort() 또는 toSorted() 를 쓸 것.
// 6. 정렬 후 slice(0, N) 으로 상위 N개를 뽑는다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log([5, 30, 7, 2].sort((a, b) => a - b));
//    // 출력: [ 2, 5, 7, 30 ]
//
// 2) const origin = [3, 1, 2];
//    const copy = origin.slice().sort((a, b) => a - b);
//    console.log(copy);      // 출력: [ 1, 2, 3 ]
//    console.log(origin);    // 출력: [ 3, 1, 2 ]
//
// 3) console.log(products.slice().sort((a, b) => a.name.localeCompare(b.name)).map((p) => p.name));
//    // 출력: [ '아메리카노', '케이크', '쿠키' ]
//
// 4) console.log(["다", "가", "나"].sort((a, b) => a.localeCompare(b)));
//    // 출력: [ '가', '나', '다' ]
