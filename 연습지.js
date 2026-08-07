// while문
// for와 나눠 쓰는 기준
// 반복 횟수를 미리 알 때 -> for
// 조건이 만족될 때까지 -> while
// for는 초기화 조건 증감이 한줄에 모여 있지만, while문은 흩어져 이어 빠드리기 쉽습니다.

// 조건이 참인 동안 반복 - 증감식이 기본포함되어 있지 않아 직접 챙겨야 함

let greet = 3;
while (true) {
  console.log(greet);
  greet++;

  if (greet == 10) {
    break;
  }
}

for (let i = 0; i < 10; i++) {
  if (i === 3 || i === 7) {
    continue;
  }
  console.log("i", i);
}
