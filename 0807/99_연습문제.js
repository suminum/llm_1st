// 99_연습문제 (09일차 - JS 조건문 · 반복문)
// 오늘 배운 것만으로 푸는 연습문제 — 마지막 교시 또는 다음 날 아침 복습용
// node 99_연습문제.js 로 실행하며 확인합니다.
// - 각 문제의 "// TODO: 여기에 작성" 부분을 채우면 (2) 기대 출력과 같은 결과가 나옵니다.
// - 막히면 (3) 힌트에 적힌 03_JS_02_조건문_반복문_개념코드 폴더의 섹션 파일을 다시 열어 보세요.
// - 사용 범위: 8일차 내용 + if/else, else if, switch, 삼항 연산자, for, while, break, continue
//   (함수 정의는 아직 배우지 않았으므로 사용하지 않습니다!)

// ═══ 문제 1 ═══ if / else [기본]
// (1) 요구사항: 수학 점수가 80을 초과하면 "우수 학생 명단에 올랐습니다",
//     아니면 "다음 시험에서 더 힘내 봅시다" 를 출력하세요.
// (2) 기대 출력:
//     우수 학생 명단에 올랐습니다
// (3) 힌트: 개념코드 폴더의 섹션01 파일(if 문), 섹션02 파일(if / else)
console.log("===== 문제 1 =====");
const mathScore = 85;
// TODO: 여기에 작성
console.log(
  mathScore > 80
    ? "우수 학생 명단에 올랐습니다"
    : "다음 시험에서 더 힘내 봅시다",
);

// ═══ 문제 2 ═══ else if 다중 조건 [기본]
// (1) 요구사항: 시험 점수에 따라 등급을 하나만 출력하세요.
//     - 95 이상: "A등급 - 최우수"
//     - 85 이상: "B등급 - 우수"
//     - 70 이상: "C등급 - 보통"
//     - 그 외:   "D등급 - 노력 필요"
// (2) 기대 출력:
//     B등급 - 우수
// (3) 힌트: 개념코드 폴더의 섹션04 파일(else if - 좁은 범위(높은 점수)부터 검사해야 함!)
console.log("===== 문제 2 =====");
const examScore = 88;
// TODO: 여기에 작성

if (95 <= examScore) {
  console.log("A등급 - 최우수");
} else if (85 <= examScore) {
  console.log("B등급 - 우수");
} else if (70 <= examScore) {
  console.log("C등급 - 보통");
}

// ═══ 문제 3 ═══ switch [기본]
// (1) 요구사항: 시간표의 과목 코드를 switch 문으로 판별해 출력하세요.
//     - 1: "국어 시간" / 2: "수학 시간" / 3: "체육 시간 - 체육복 준비" / 그 외: "알 수 없는 코드"
//     - 각 case 끝에 break 를 잊지 마세요. (빼먹으면 아래 case까지 줄줄이 실행!)
// (2) 기대 출력:
//     체육 시간 - 체육복 준비
// (3) 힌트: 개념코드 폴더의 섹션07 파일(switch - case / break / default)
console.log("===== 문제 3 =====");
const subjectCode = 0;
// TODO: 여기에 작성
switch (subjectCode) {
  case 1:
    console.log("국어시간");
    break;
  case 2:
    console.log("수학시간");
    break;
  case 3:
    console.log("체육시간");
    break;
  default:
    console.log("알 수 없는 코드");
}
// ═══ 문제 4 ═══ 삼항 연산자 [기본]
// (1) 요구사항: if/else 대신 삼항 연산자로 결과값을 변수에 담아 출력하세요.
//     - 오답 개수가 0이면 "통과", 아니면 "재시험" 을 testResult 변수에 담기
//     - 현재 시각이 18 이상이면 "야간 자습", 아니면 "정규 수업" 을 periodName 변수에 담기
//     - 템플릿 리터럴로 두 줄 출력
// (2) 기대 출력:
//     채점 결과: 재시험
//     현재 일과: 야간 자습
// (3) 힌트: 개념코드 폴더의 섹션08 파일(삼항 연산자 - 결과값을 변수에 담을 때 특히 유용)
console.log("===== 문제 4 =====");
const wrongCount = 3;
const currentHour = 22;
// TODO: 여기에 작성
let testResult = wrongCount > 0 ? "재시험" : "통과";
let perioName = currentHour >= 18 ? "야간자습" : "정규수업";
console.log(`채점결과 ${wrongCount}
현재일과 ${perioName}`);

// ═══ 문제 5 ═══ for 문 누적 합 [응용]
// (1) 요구사항: 월~금 급식 인원 배열을 for 문으로 순회하며 합계를 구하세요.
//     - 합계 변수 weekTotal 을 반복문 "밖"에 let 으로 선언하고 0으로 시작
//     - for 문에서 인덱스로 배열 요소에 접근해 누적 (+=)
//     - 총합과 평균(총합 / 배열 길이)을 출력
// (2) 기대 출력:
//     주간 총 급식 인원: 640명
//     하루 평균 급식 인원: 128명
// (3) 힌트: 개념코드 폴더의 섹션10 파일(누적 합 - 합계 변수는 반복문 밖에!), 8일차 개념코드 폴더의 섹션09 파일(배열 인덱스, length)
console.log("===== 문제 5 =====");
const mealCounts = [120, 135, 110, 150, 125]; // 월, 화, 수, 목, 금
// TODO: 여기에 작성
let mealtotal = 0;
for (let i = 0; i < mealCounts.length; i++) {
  mealtotal += mealCounts[i];
}
console.log(`주간 총 급식 인원: ${mealtotal}
하루평균 급식 인원: ${mealtotal / mealCounts.length}`);
// ═══ 문제 6 ═══ while + break [응용]
// (1) 요구사항: 학급 칭찬 점수를 한 번에 40점씩 적립합니다.
//     - while (true) 로 반복하며 매 회 classPoints 에 40을 더하고 addCount 를 1 증가
//     - classPoints 가 200 이상이 되면 break 로 종료
//     - 반복이 끝난 뒤 적립 횟수와 최종 점수를 출력
// (2) 기대 출력:
//     적립 횟수: 5회
//     최종 점수: 200점
// (3) 힌트: 개념코드 폴더의 섹션12 파일(while), 섹션13 파일(while (true) + break 패턴)
console.log("===== 문제 6 =====");
let classPoints = 0; // 현재 점수
let addCount = 0; // 적립 횟수
// TODO: 여기에 작성
while (true) {
  classPoints += 40;
  addCount++;
  if (classPoints < 200) {
    continue;
  }
  break;
}

console.log(classPoints, addCount);
//만약 조건문에 값이 경계치에 걸리지 않는다면  증가량이 목표값을 정확히 나누지 않을 때 200초과면 종료하면 조건문이랑 값갱신 순서가 중요하지 않나?
classPoints = 0;
addCount = 0;

while (true) {
  classPoints += 30;
  addCount++;
  if (classPoints > 200) {
    break;
  }
  classPoints += 30;
}
console.log(classPoints, addCount);

classPoints = 0;
addCount = 0;

while (true) {
  if (classPoints > 200) {
    break;
  }
  classPoints += 30;
  addCount++;
}
console.log(classPoints, addCount);
let Money1 = 10000;

while (true) {
  Money1 -= 3000;
  console.log(Money1);

  if (Money1 < 3000) {
    break;
  }
}

Money1 = 10000;

while (true) {
  console.log(Money1);
  if (Money1 < 3000) {
    break;
  }
  Money1 -= 3000;
}

// ═══ 문제 7 ═══ [도전] 시험 점수 분석 (for + continue + if)
// (1) 요구사항: 시험 점수 배열을 for 문 "하나"로 분석해 세 줄을 출력하세요.
//     - 값이 -1 이면 결시(시험을 안 봄)이므로 continue 로 건너뛰기
//     - 응시한 학생 수를 validCount 에 세기
//     - 80점 초과인 우수 학생 수를 highCount 에 세기
//     - 최고 점수를 maxScore 에 기록 (0에서 시작, 현재 값이 더 크면 교체)
// (2) 기대 출력:
//     응시 인원: 5명
//     80점 초과: 3명
//     최고 점수: 85점
// (3) 힌트: 개념코드 폴더의 섹션14 파일(continue), 섹션10 파일(누적), 최고값 갱신은 if (값 > maxScore) 로!
console.log("===== 문제 7 =====");
const scores = [72, 81, -1, 85, 77, -1, 83]; // -1 은 결시
let validCount = 0;
let highCount = 0;
let maxScore = 0;
// TODO: 여기에 작성
for (let i = 0; i < scores.length; i++) {
  if (scores[i] == -1) {
    continue;
  }
  validCount++;
  if (scores[i] > 80) {
    highCount++;
  }
  if (maxScore < scores[i]) {
    maxScore = scores[i];
  }
}
console.log(validCount, highCount, mathScore);
// 다 풀었다면 99_연습문제_정답.js 와 비교해 보세요. 수고했습;니다!
