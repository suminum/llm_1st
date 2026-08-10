const fruits = ["사과", "당근"];

// 복사가 아닙니다.
// 같은 배열에 읾표를 하나 더 붙인 것이라 한쪽을 고치면 양쪽이 다 바뀝니다.
// 비유 같은 집에 문패를 두개 단것. 스프레드는 짐을 새 집으로 옮겨 담는 것입니다.
const copy2 = fruits;

console.log(copy2[1]);

fruits[1] = "수박";

console.log(copy2);

// ...은 "껍데기를 벗겨 알맹이를 펼친다"는 뜻입니다.
//  fruits -> ["사과" ,"당근"]  (배열 한 덩어리)
// ...fruits => "사과", "당근" (알맹이 두 개로 펼쳐짐)
// 그래서 [...fruits] 는 펼친 알맹이를 새 대괄호에 다시 담는 것 = 복사본이 됩니다.
// 배열 복사 결합
const copy = [...fruits];

console.log(copy);

fruits[1] = "당근";

console.log("copy", copy);
console.log("fruits", fruits);

const nums = [1, 2, 3, 4, 5];

// const copy3 = nums;

// nums[2] = 6;

// console.log(copy3);

const copy4 = [...nums];

nums[2] = 6;

console.log(copy4);
console.log(nums);

const a1 = { name: "에단", age: 10 };

const b1 = { ...a1 };
a1.age = 20;
console.log(b1.age);

const nums1 = [1, 2, 3, 41, 25, 36, 75, 8];
console.log(Math.max(...nums1));

for (const n of nums1) {
  console.log(n);
}
