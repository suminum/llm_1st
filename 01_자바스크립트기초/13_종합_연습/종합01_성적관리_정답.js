// ============================================================
// 13단원 · 종합 01 정답 — 성적 관리 프로그램
// ------------------------------------------------------------
// 실행: node 종합01_성적관리_정답.js
// ============================================================

const students = [
  { name: "김민준", scores: [90, 85, 70] },
  { name: "이서연", scores: [95, 88, 92] },
  { name: "박지훈", scores: [60, 45, 80] },
  { name: "최유진", scores: [75, 82, 78] },
  { name: "정하늘", scores: [50, 55, 48] },
];

const subjects = ["국어", "영어", "수학"];

console.log("===== 성적 관리 프로그램 =====");
// 출력: ===== 성적 관리 프로그램 =====


// ───── 문제 1 ─────
console.log(`전체 ${students.length}명`);
// 출력: 전체 5명


// ───── 문제 2 ─────
function getTotal(scores) {
  return scores.reduce((acc, score) => acc + score, 0);
}

console.log(`김민준 총점 ${getTotal(students[0].scores)}`);
// 출력: 김민준 총점 245
// reduce 의 시작값 0 을 빠뜨리면 빈 배열에서 에러가 납니다.


// ───── 문제 3 ─────
function getAverage(scores) {
  return getTotal(scores) / scores.length;
}

console.log(`이서연 평균 ${getAverage(students[1].scores).toFixed(1)}`);
// 출력: 이서연 평균 91.7
// 함수는 숫자를 그대로 돌려주고, 보기 좋게 다듬는 일은 출력할 때 합니다.
// getAverage 가 toFixed 결과(문자열)를 돌려주면 문제 4에서 비교를 못 합니다.


// ───── 문제 4 ─────
function getGrade(average) {
  if (average >= 90) return "A";
  if (average >= 80) return "B";
  if (average >= 70) return "C";
  if (average >= 60) return "D";
  return "F";
}

console.log(`95점 → ${getGrade(95)}`);
// 출력: 95점 → A
console.log(`72점 → ${getGrade(72)}`);
// 출력: 72점 → C
console.log(`40점 → ${getGrade(40)}`);
// 출력: 40점 → F
// 큰 수부터 검사해야 합니다. 60을 먼저 쓰면 95점도 D가 됩니다.
// 조기 반환을 쓰면 else 가 필요 없습니다.


// ───── 문제 5 ─────
students.forEach(({ name, scores }) => {
  const total = getTotal(scores);
  const average = getAverage(scores);
  const grade = getGrade(average);

  console.log(`${name} ${total}점 평균 ${average.toFixed(1)} (${grade})`);
});
// 출력: 김민준 245점 평균 81.7 (B)
// 출력: 이서연 275점 평균 91.7 (A)
// 출력: 박지훈 185점 평균 61.7 (D)
// 출력: 최유진 235점 평균 78.3 (C)
// 출력: 정하늘 153점 평균 51.0 (F)
// 콜백 매개변수에서 구조분해를 쓰면 student.name 을 매번 안 써도 됩니다.


// ───── 문제 6 ─────
const passed = students.filter(({ scores }) => getAverage(scores) >= 60).map(({ name }) => name);

console.log(passed);
// 출력: [ '김민준', '이서연', '박지훈', '최유진' ]
// filter 로 고르고 map 으로 이름만 뽑았습니다.


// ───── 문제 7 ─────
// 첫 번째 학생을 일단 1등으로 두고, 더 높은 사람이 나오면 갈아치웁니다.
let top = students[0];

students.forEach((student) => {
  if (getAverage(student.scores) > getAverage(top.scores)) {
    top = student;
  }
});

console.log(`1등: ${top.name} (${getAverage(top.scores).toFixed(1)})`);
// 출력: 1등: 이서연 (91.7)

// [다른 방법] reduce 로도 됩니다.
// const top2 = students.reduce((a, b) =>
//   getAverage(a.scores) >= getAverage(b.scores) ? a : b
// );


// ───── 문제 8 ─────
subjects.forEach((subject, index) => {
  // 모든 학생의 그 과목 점수만 모읍니다
  const scoresOfSubject = students.map((student) => student.scores[index]);
  const average = getAverage(scoresOfSubject);

  console.log(`${subject} 평균 ${average.toFixed(1)}`);
});
// 출력: 국어 평균 74.0
// 출력: 영어 평균 71.0
// 출력: 수학 평균 73.6
// map 으로 세로 방향(같은 과목)의 점수를 뽑아냈습니다.
// scores[index] 에서 index 는 과목의 순서입니다. subjects 와 scores 의 순서가
// 같다는 약속이 있어야 이 방법이 통합니다.


// ───── 문제 9 ─────
const gradeCount = students.reduce((acc, { scores }) => {
  const grade = getGrade(getAverage(scores));
  acc[grade] = (acc[grade] ?? 0) + 1;
  return acc; // 이 return 을 빠뜨리면 다음 바퀴의 acc 가 undefined 가 됩니다
}, {});

console.log(gradeCount);
// 출력: { B: 1, A: 1, D: 1, C: 1, F: 1 }
// 시작값이 빈 객체 {} 입니다.
// 순서는 학생 순서대로 처음 등장한 등급 순입니다.


// ───── 문제 10 ─────
// 원본을 지켜야 하므로 [...배열] 로 복사한 뒤 정렬합니다.
const ranked = [...students].sort((a, b) => getAverage(b.scores) - getAverage(a.scores));

ranked.forEach((student, index) => {
  console.log(`${index + 1}위 ${student.name} ${getAverage(student.scores).toFixed(1)}`);
});
// 출력: 1위 이서연 91.7
// 출력: 2위 김민준 81.7
// 출력: 3위 최유진 78.3
// 출력: 4위 박지훈 61.7
// 출력: 5위 정하늘 51.0

console.log(students[0].name);
// 출력: 김민준
// 원본은 그대로입니다. 복사 없이 sort 했다면 순서가 망가졌을 겁니다.

// 높은 순(내림차순)이므로 b - a 입니다. a - b 로 쓰면 꼴찌부터 나옵니다.


// ───── 문제 11 ─────
students.forEach(({ name, scores }) => {
  // 60점 미만인 과목만 "국어(50)" 형태로 모읍니다
  const failed = [];

  scores.forEach((score, index) => {
    if (score < 60) {
      failed.push(`${subjects[index]}(${score})`);
    }
  });

  // 하나라도 있으면 출력
  if (failed.length > 0) {
    console.log(`${name}: ${failed.join(", ")}`);
  }
});
// 출력: 박지훈: 영어(45)
// 출력: 정하늘: 국어(50), 영어(55), 수학(48)

// 박지훈의 국어는 60점입니다. 60 < 60 은 false 이므로 포함되지 않습니다.
// '미만' 과 '이하' 를 구별하세요.

// [다른 방법] filter 와 map 을 쓰면 이렇게도 됩니다.
// const failed = scores
//   .map((score, i) => ({ subject: subjects[i], score }))
//   .filter(({ score }) => score < 60)
//   .map(({ subject, score }) => `${subject}(${score})`);


// ============================================================
// 정리 — 이 파일에서 쓴 것들
// ============================================================
//
//   01단원  변수, 자료형, toFixed 는 문자열이라는 점
//   02단원  산술 연산자, 템플릿 리터럴
//   03단원  조건문, 조기 반환으로 등급 나누기
//   04단원  반복문 (중첩 반복문 — 문제 11)
//   05단원  함수로 쪼개기, 함수 안에서 다른 함수 부르기
//   06단원  배열, length, join, 원본을 지키는 slice
//   07단원  객체, 객체 배열
//   08단원  reduce(합계), filter·map(체이닝), forEach, sort(비교 함수)
//   09단원  구조분해 ({ name, scores })
//
// 이 파일에서 가장 중요한 습관 두 가지:
//   1) 계산은 함수로 만들어 이름을 붙인다. getTotal, getAverage, getGrade
//   2) 보기 좋게 다듬는 일(toFixed)은 '출력할 때' 한다. 계산 중에 하지 않는다.
