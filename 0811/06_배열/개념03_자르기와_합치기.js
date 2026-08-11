// ============================================================
// 06단원 · 개념 03 — 자르기, 합치기, 순서 바꾸기
// ------------------------------------------------------------
// 실행: node 개념03_자르기와_합치기.js
// ============================================================
//
// 이번 파일의 메소드들은 두 부류로 나뉩니다. 이 구분이 제일 중요합니다.
//
//     원본을 바꾸지 않는다 (새 값을 돌려줌) : slice, concat, join
//         └ slice·concat 은 새 '배열' 을, join 은 '문자열' 을 돌려줍니다
//     원본을 바꾼다                       : reverse, sort, splice


// ── 섹션 1: slice — 잘라서 복사하기 ──

// 배열.slice(시작인덱스, 끝인덱스)
// 끝 인덱스는 포함되지 않습니다. "시작 이상, 끝 미만"입니다.

const week = ["월", "화", "수", "목", "금"];

console.log(week.slice(1, 3));
// 출력: [ '화', '수' ]
// 인덱스 1, 2 만 가져옵니다. 3은 포함되지 않습니다.

// 끝을 생략하면 마지막까지입니다.
console.log(week.slice(2));
// 출력: [ '수', '목', '금' ]

// 둘 다 생략하면 통째로 복사합니다.
console.log(week.slice());
// 출력: [ '월', '화', '수', '목', '금' ]

// 음수를 쓰면 뒤에서부터 셉니다.
console.log(week.slice(-2));
// 출력: [ '목', '금' ]

// 가장 중요한 점 — 원본은 그대로입니다.
console.log(week);
// 출력: [ '월', '화', '수', '목', '금' ]

// slice 와 splice 를 헷갈리지 마세요.
//     slice  자른 '복사본'을 돌려준다. 원본 그대로.
//     splice 원본을 '직접' 자른다.

// ✏️ 직접 해보기 1 — week 에서 앞 3개만 잘라 출력해 보세요.


// ── 섹션 2: concat — 배열 합치기 ──

const group1 = ["김민준", "이서연"];
const group2 = ["박지훈", "최유진"];

const allMembers = group1.concat(group2);
console.log(allMembers);
// 출력: [ '김민준', '이서연', '박지훈', '최유진' ]

// 원본은 둘 다 그대로입니다.
console.log(group1);
// 출력: [ '김민준', '이서연' ]

// 값을 바로 붙일 수도 있습니다.
console.log(group1.concat("정하늘"));
// 출력: [ '김민준', '이서연', '정하늘' ]

// 여러 개를 한 번에 합칠 수도 있습니다.
console.log(group1.concat(group2, ["정하늘"]));
// 출력: [ '김민준', '이서연', '박지훈', '최유진', '정하늘' ]

// + 로는 합칠 수 없습니다. 이상한 결과가 나옵니다.
console.log(group1 + group2);
// 출력: 김민준,이서연박지훈,최유진
// 배열이 문자열로 바뀌어 이어붙어 버립니다. 반드시 concat 을 쓰세요.
// (09단원에서 배울 스프레드를 쓰면 더 짧게 합칠 수 있습니다)

// ✏️ 직접 해보기 2 — 배열 두 개를 만들어 concat 으로 합쳐 보세요.


// ── 섹션 3: join — 배열을 문자열로 ──

const fruits = ["사과", "바나나", "포도"];

// 구분자를 넣으면 그것으로 이어 붙입니다.
console.log(fruits.join(", "));
// 출력: 사과, 바나나, 포도

console.log(fruits.join(" / "));
// 출력: 사과 / 바나나 / 포도

console.log(fruits.join(""));
// 출력: 사과바나나포도

// 아무것도 안 넣으면 쉼표로 이어집니다.
console.log(fruits.join());
// 출력: 사과,바나나,포도

// 결과는 문자열입니다.
console.log(typeof fruits.join(", "));
// 출력: string

// 화면에 목록을 보여 줄 때 아주 많이 씁니다.
console.log(`오늘의 과일: ${fruits.join(", ")}`);
// 출력: 오늘의 과일: 사과, 바나나, 포도

// ✏️ 직접 해보기 3 — 과일 배열을 " - " 로 이어 붙여 출력해 보세요.


// ── 섹션 4: split — 문자열을 배열로 (join 의 반대) ──

// split 은 문자열의 메소드입니다. 배열이 아니라 문자열에 붙입니다.
const csv = "김민준,이서연,박지훈";
const nameList = csv.split(",");

console.log(nameList);
// 출력: [ '김민준', '이서연', '박지훈' ]
console.log(nameList.length);
// 출력: 3

// 공백으로 나누기
const sentence = "오늘 날씨 좋다";
console.log(sentence.split(" "));
// 출력: [ '오늘', '날씨', '좋다' ]

// 빈 문자열로 나누면 한 글자씩 쪼개집니다.
console.log("안녕".split(""));
// 출력: [ '안', '녕' ]

// 입력창에 "사과,바나나" 처럼 받은 값을 배열로 만들 때 씁니다.

// ✏️ 직접 해보기 4 — "월-화-수" 를 "-" 로 나눠 배열로 만들어 출력해 보세요.


// ── 섹션 5: reverse — 순서 뒤집기 (원본이 바뀝니다) ──

const numbers = [1, 2, 3, 4, 5];
numbers.reverse();

console.log(numbers);
// 출력: [ 5, 4, 3, 2, 1 ]
// 원본이 바뀌었습니다. 돌려받을 필요도 없이 numbers 자체가 뒤집혔습니다.

// 원본을 지키고 싶으면 slice 로 복사한 뒤 뒤집습니다.
const original = ["a", "b", "c"];
const reversed = original.slice().reverse();

console.log(reversed);
// 출력: [ 'c', 'b', 'a' ]
console.log(original);
// 출력: [ 'a', 'b', 'c' ]

// ✏️ 직접 해보기 5 — 배열을 원본 그대로 두고 뒤집은 복사본을 만들어 보세요.


// ── 섹션 6: sort — 정렬 (원본이 바뀝니다, 그리고 함정이 있습니다) ──

// 문자열 정렬은 기대대로 동작합니다.
const names = ["박지훈", "김민준", "이서연"];
names.sort();
console.log(names);
// 출력: [ '김민준', '박지훈', '이서연' ]

const alphabet = ["banana", "apple", "cherry"];
alphabet.sort();
console.log(alphabet);
// 출력: [ 'apple', 'banana', 'cherry' ]

// [함정] 숫자를 정렬하면 이상해집니다.
const scores = [10, 9, 100, 1];
scores.sort();
console.log(scores);
// 출력: [ 1, 10, 100, 9 ]

// 왜 이럴까요?
//   sort 는 기본적으로 값을 '문자열로 바꿔서' 사전 순으로 비교합니다.
//   "10" 과 "9" 를 비교하면 첫 글자 "1" 이 "9" 보다 앞이라 10이 먼저 옵니다.
//   (02단원에서 본 "10" < "9" 가 true 였던 것과 같은 이유입니다)

// 제대로 정렬하려면 '비교하는 방법'을 함수로 넘겨야 합니다.
// 함수를 넘기는 방식(콜백)은 08단원에서 배웁니다. 미리 보기만 하면 이렇습니다.
const scores2 = [10, 9, 100, 1];
scores2.sort((a, b) => a - b);
console.log(scores2);
// 출력: [ 1, 9, 10, 100 ]

// 지금은 "숫자 배열에 sort() 를 그냥 쓰면 안 된다" 만 기억하세요.

// ✏️ 직접 해보기 6 — [5, 30, 7] 을 sort() 로 정렬해 보고
//                    결과가 왜 그런지 생각해 보세요.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] slice 와 splice 헷갈리기
const arr1 = [1, 2, 3, 4];
console.log(arr1.slice(1, 3));
// 출력: [ 2, 3 ]
console.log(arr1);
// 출력: [ 1, 2, 3, 4 ]
// slice 는 원본이 그대로입니다.

const arr2 = [1, 2, 3, 4];
console.log(arr2.splice(1, 3));
// 출력: [ 2, 3, 4 ]
console.log(arr2);
// 출력: [ 1 ]
// splice 는 원본이 잘려 나갔습니다. 두 번째 인자의 뜻도 다릅니다.
//   slice(시작, 끝)      — 끝 '인덱스'
//   splice(시작, 개수)   — 지울 '개수'

// [실수 2] reverse 의 결과를 새 배열이라고 생각하기
const arr3 = [1, 2, 3];
const arr4 = arr3.reverse();
arr4.push(0);
console.log(arr3);
// 출력: [ 3, 2, 1, 0 ]
// 실수: arr3 과 arr4 는 같은 배열입니다. 하나를 고치면 둘 다 바뀝니다.

// [실수 3] join 의 결과에 배열 메소드 쓰기 → TypeError
// console.log(fruits.join(",").push("귤"));
// 실수: join 의 결과는 문자열입니다. push 는 배열에만 있습니다.

// [실수 4] split 을 배열에 쓰기 → TypeError
// console.log(fruits.split(","));
// 실수: split 은 문자열의 메소드입니다. 배열에는 join 을 씁니다.
//       외우는 요령: 배열 --join--> 문자열 --split--> 배열


// ── 정리 ──

// 1. slice(시작, 끝)  잘라낸 복사본. 원본 그대로. 끝은 포함 안 됨.
// 2. concat(배열)     합친 새 배열. + 로 합치면 안 된다.
// 3. join(구분자)     배열 → 문자열 / split(구분자) 문자열 → 배열
// 4. reverse(), sort() 는 원본을 바꾼다. 지키려면 slice() 로 복사 후 사용.
// 5. 숫자 배열에 sort() 를 그냥 쓰면 사전 순으로 정렬되어 틀린다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log(week.slice(0, 3));
//    // 출력: [ '월', '화', '수' ]
//
// 2) const a = [1, 2];
//    const b = [3, 4];
//    console.log(a.concat(b));       // 출력: [ 1, 2, 3, 4 ]
//
// 3) console.log(fruits.join(" - "));
//    // 출력: 사과 - 바나나 - 포도
//
// 4) console.log("월-화-수".split("-"));
//    // 출력: [ '월', '화', '수' ]
//
// 5) const origin = [1, 2, 3];
//    const copy = origin.slice().reverse();
//    console.log(copy);              // 출력: [ 3, 2, 1 ]
//    console.log(origin);            // 출력: [ 1, 2, 3 ]
//
// 6) const nums = [5, 30, 7];
//    nums.sort();
//    console.log(nums);              // 출력: [ 30, 5, 7 ]
//    // 문자열로 바꿔 비교하기 때문에 "30" 의 첫 글자 "3" 이 "5" 보다 앞섭니다.
