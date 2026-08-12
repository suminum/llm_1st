const sumin = {
  name: "수민",
  age: 23,
  city: "도시 부산!",
};
console.log(sumin.age);
console.log(sumin.city);

//객체 앞에 ? 은 뒤에 요소가 없으면 undifined 내보내기
//??은 undifined 대신에 내보낼 거 지정
console.log(sumin?.country ?? "나리미정");

const tags = ["a", "b"];
const tags2 = null;
console.log(tags[5] ?? "미정");
console.log(tags?.includes("d") ?? "미정");
console.log(tags2?.includes("d") ?? "미정");
//false는 ??가 바꾸지 않아.
//??는 오직 null과 undefined만 검사하기 때문이야.
//?은 객체 뿐만이 아니라 배열 변수에도 사용가능한데 null 아닌 이상
//undifined 나오게끔하기 힘드네

console.log(delete sumin.country);
delete sumin?.country;
