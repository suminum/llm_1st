// ============================================================
// 06단원 연습문제 정답 (서버 없이 푸는 것)
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================


// ───── 문제 1 ─────
function 받침있나(글자) {
  const 코드 = 글자.charCodeAt(0);

  // 완성형 한글은 가(44032)부터 힣(55203)까지입니다.
  if (코드 < 44032 || 코드 > 55203) {
    return null; // 한글이 아님
  }

  // 한글은 (초성 × 21 + 중성) × 28 + 종성 으로 만들어집니다.
  // 그래서 28 로 나눈 나머지가 종성(받침) 번호입니다. 0이면 받침이 없습니다.
  return (코드 - 44032) % 28 !== 0;
}

function 조사붙이기(단어, 받침있을때, 받침없을때) {
  const 마지막 = 단어[단어.length - 1];
  const 있나 = 받침있나(마지막);

  if (있나 === null) {
    return `${단어}(${받침있을때}/${받침없을때})`; // 한글이 아니면 둘 다 보여 줍니다
  }

  return 단어 + (있나 ? 받침있을때 : 받침없을때);
}

console.log(조사붙이기("설비", "을", "를"));
// 출력: 설비를
console.log(조사붙이기("점검기록", "을", "를"));
// 출력: 점검기록을
console.log(조사붙이기("작업지시", "이", "가"));
// 출력: 작업지시가
console.log(조사붙이기("사용자", "은", "는"));
// 출력: 사용자는
console.log(조사붙이기("로봇", "은", "는"));
// 출력: 로봇은
console.log(조사붙이기("API", "을", "를"));
// 출력: API(을/를)
//
// ★ 28 로 나누는 이유
//   한글 한 글자의 번호는 이렇게 정해져 있습니다.
//     44032 + (초성번호 × 21 × 28) + (중성번호 × 28) + 종성번호
//   앞의 두 덩어리는 28 의 배수라 나머지가 0 입니다.
//   그래서 나머지가 곧 종성(받침) 번호입니다. 0 이면 받침이 없습니다.
//
//   '비' 는 나머지가 0 → 받침 없음 → 설비'를'
//   '록' 은 나머지가 1 → 받침 있음 → 점검기록'을'
//
// ★ 영어·숫자가 오면
//   'API' 의 마지막 'I' 는 한글 범위 밖이라 null 입니다.
//   무엇을 붙일지 정할 수 없으니 '(을/를)' 로 둡니다.
//   실무에서도 이렇게 처리하는 곳이 많습니다.
//
// ★ 왜 이런 걸 배우나
//   에러 메시지가 "설비을(를) 찾을 수 없습니다" 로 나가면 어색합니다.
//   사용자에게 보이는 글은 이런 것 하나로 인상이 달라집니다.


// ───── 문제 2 ─────
function 쪽정보(query, 기본 = 10, 최대 = 100) {
  let page = Number(query.page);
  let limit = Number(query.limit);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 기본;
  if (limit > 최대) limit = 최대;

  return { page, limit };
}

function 쪽메타(total, page, limit) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

console.log(쪽정보({}));
// 출력: { page: 1, limit: 10 }
console.log(쪽정보({ page: "3", limit: "5" }));
// 출력: { page: 3, limit: 5 }
console.log(쪽정보({ page: "abc" }));
// 출력: { page: 1, limit: 10 }
console.log(쪽정보({ limit: "999" }));
// 출력: { page: 1, limit: 100 }
console.log(쪽정보({ page: "0", limit: "-5" }));
// 출력: { page: 1, limit: 10 }
console.log(쪽메타(12, 1, 5));
// 출력: { page: 1, limit: 5, total: 12, totalPages: 3 }
console.log(쪽메타(0, 1, 10));
// 출력: { page: 1, limit: 10, total: 0, totalPages: 0 }
//
// ★ 마지막 줄을 보세요. 0건이면 totalPages 도 0 입니다.
//   Math.ceil(0 / 10) 이 0 이기 때문입니다.
//   화면에 "1 / 0 쪽" 이라고 나오면 어색하니, 프론트에서 따로 처리하거나
//   여기서 Math.max(1, ...) 로 최소 1을 보장하기도 합니다. 정하기 나름입니다.
//
// ★ Number("3") 은 3 이지만 Number("abc") 는 NaN 입니다.
//   그런데 Number(undefined) 도 NaN 이고, Number(null) 은 0 입니다.
//   Number.isInteger 하나로 NaN 과 소수를 함께 걸러 냅니다.
//   0 은 정수라서 통과하니, page < 1 이 반드시 필요합니다.


// ───── 문제 3 ─────
function 정렬조건(sort) {
  if (!sort) return [];

  return sort
    .split(",")
    .map((조각) => 조각.trim())
    .filter(Boolean)
    .map((조각) =>
      조각.startsWith("-")
        ? { 키: 조각.slice(1), 방향: -1 }
        : { 키: 조각, 방향: 1 }
    );
}

function 조건찍기(sort) {
  const 조건들 = 정렬조건(sort);

  if (조건들.length === 0) {
    console.log(`${sort === undefined ? "(없음)" : `"${sort}"`} → 정렬 안 함`);
    return;
  }

  const 글 = 조건들.map((c) => `${c.키} ${c.방향 === 1 ? "오름" : "내림"}`).join(", ");
  console.log(`"${sort}" → ${글}`);
}

조건찍기(undefined);
// 출력: (없음) → 정렬 안 함
조건찍기("name");
// 출력: "name" → name 오름
조건찍기("-id");
// 출력: "-id" → id 내림
조건찍기("line,-id");
// 출력: "line,-id" → line 오름, id 내림
조건찍기("line, -id ");
// 출력: "line, -id " → line 오름, id 내림
조건찍기("");
// 출력: "" → 정렬 안 함
//
// ★ 다섯 번째를 보세요. 공백이 섞여도 됩니다.
//   trim() 을 안 하면 " -id" 가 되어 startsWith("-") 가 false 가 됩니다.
//   그러면 키가 " -id" 라는 이상한 이름이 되어 정렬이 조용히 안 됩니다.
//
// ★ filter(Boolean) 이 필요한 이유
//   "line,,id" 처럼 쉼표가 겹치면 빈 조각이 생깁니다.
//   그대로 두면 키가 "" 인 조건이 만들어집니다.


// ───── 문제 4 ─────
function 필드고르기(항목, fields) {
  if (!fields) return 항목;

  const 결과 = {};

  for (const 키 of fields.split(",").map((조각) => 조각.trim())) {
    if (키 in 항목) {
      결과[키] = 항목[키];
    }
  }

  return 결과;
}

const 설비 = { id: 1, name: "컨베이어 1호", line: "A", status: "가동" };

console.log(필드고르기(설비, "id,name"));
// 출력: { id: 1, name: '컨베이어 1호' }
console.log(필드고르기(설비, undefined));
// 출력: { id: 1, name: '컨베이어 1호', line: 'A', status: '가동' }
console.log(필드고르기(설비, "id, 없는것"));
// 출력: { id: 1 }
console.log(필드고르기(설비, ""));
// 출력: { id: 1, name: '컨베이어 1호', line: 'A', status: '가동' }
//
// ★ 세 번째 — 없는 이름은 그냥 무시했습니다.
//   400 을 내는 것도 방법이지만, "달라고 한 것 중 있는 것만" 이 다루기 쉽습니다.
//
// ★ 네 번째 — ?fields= 로 빈 값이 오면 전부 줍니다.
//   !fields 가 빈 글자도 걸러 내기 때문입니다.
//   빈 객체를 돌려주는 것보다 이쪽이 자연스럽습니다.
//
// ★ 키 in 항목
//   그 속성이 있는지 확인합니다. 항목[키] !== undefined 로 해도 되지만,
//   값이 진짜 undefined 인 경우와 구별이 안 됩니다. in 이 정확합니다.


// ───── 문제 5 ─────
const 고친주소 = [
  "GET /api/v1/equipments",
  "GET /api/v1/equipments/3",
  "POST /api/v1/equipments",
  "PATCH /api/v1/equipments/3",
  "DELETE /api/v1/equipments/3",
  "GET /api/v1/equipments?line=A&status=가동",
  "GET /api/v1/equipments/3/logs",
  "POST /api/v1/equipments/3/logs",
];

고친주소.forEach((줄) => console.log(줄));
// 출력: GET /api/v1/equipments
// 출력: GET /api/v1/equipments/3
// 출력: POST /api/v1/equipments
// 출력: PATCH /api/v1/equipments/3
// 출력: DELETE /api/v1/equipments/3
// 출력: GET /api/v1/equipments?line=A&status=가동
// 출력: GET /api/v1/equipments/3/logs
// 출력: POST /api/v1/equipments/3/logs
//
// 원래 주소가 무엇이 틀렸는지
//
//   /getEquipmentList        동사. GET 이 이미 '가져온다' 입니다
//   /equipment/3             단수형. 컬렉션에서 하나를 고르는 것이니 복수형
//   /addEquipment            동사 + 어떤 메서드인지 안 보임
//   /modifyEquipment?id=3    동사 + 하나를 가리키는 건 경로로
//   /removeEquipment?id=3    ★ GET 으로 지우면 안 됩니다
//   /searchEquipment?...     조건마다 주소를 만들면 끝이 없습니다
//   /getLogsOfEquipment?..   포함 관계는 중첩 주소로
//   /addLog                  어느 설비의 기록인지 주소에 안 보입니다


// ───── 문제 6 ─────
const 변경들 = {
  "설비 응답에 마지막점검일을 추가": "안 올려도 됨",
  "line 을 글자에서 객체로 바꿈": "올려야 함",
  "?sort= 를 새로 지원": "안 올려도 됨",
  "설비 등록에 담당자를 필수로 추가": "올려야 함",
  "404 메시지 글자를 다듬음": "안 올려도 됨",
  "404 코드를 NOT_FOUND 에서 EQUIPMENT_NOT_FOUND 로 바꿈": "올려야 함",
  "응답을 배열에서 { data } 로 감쌈": "올려야 함",
  "새 주소 /api/v1/lines 를 만듦": "안 올려도 됨",
};

for (const 변경 of Object.keys(변경들)) {
  console.log(`${변경} → ${변경들[변경]}`);
}
// 출력: 설비 응답에 마지막점검일을 추가 → 안 올려도 됨
// 출력: line 을 글자에서 객체로 바꿈 → 올려야 함
// 출력: ?sort= 를 새로 지원 → 안 올려도 됨
// 출력: 설비 등록에 담당자를 필수로 추가 → 올려야 함
// 출력: 404 메시지 글자를 다듬음 → 안 올려도 됨
// 출력: 404 코드를 NOT_FOUND 에서 EQUIPMENT_NOT_FOUND 로 바꿈 → 올려야 함
// 출력: 응답을 배열에서 { data } 로 감쌈 → 올려야 함
// 출력: 새 주소 /api/v1/lines 를 만듦 → 안 올려도 됨
//
// 판단 기준 한 줄: "지금 쓰고 있는 프론트 코드가 깨지나?"
//
//   추가는 안전합니다. 프론트는 모르는 필드를 무시합니다.
//   빼기·이름 바꾸기·타입 바꾸기는 깨집니다.
//   필수 입력값 추가도 깨집니다. 기존 요청이 400 을 받게 됩니다.
//
// ★ 메시지는 안 깨지고 코드는 깨지는 이유
//   프론트가 코드로 판단하기 때문입니다. 개념04 에서 코드를 따로 둔 이유입니다.
//   반대로 메시지로 판단하는 프론트라면 메시지를 고쳐도 깨집니다.
//   그래서 "메시지로 판단하지 마세요" 를 문서에 적어 둡니다.


// ───── 문제 7 ─────
function 성공(data, meta) {
  const 몸통 = { data };

  if (meta) {
    몸통.meta = meta;
  }

  return 몸통;
}

function 실패(code, message, details) {
  const 에러 = { code, message };

  if (details !== undefined) {
    에러.details = details;
  }

  return { error: 에러 };
}

console.log(JSON.stringify(성공([1, 2])));
// 출력: {"data":[1,2]}
console.log(JSON.stringify(성공([1, 2], { total: 2 })));
// 출력: {"data":[1,2],"meta":{"total":2}}
console.log(JSON.stringify(성공({ id: 1 })));
// 출력: {"data":{"id":1}}
console.log(JSON.stringify(실패("NOT_FOUND", "설비를 찾을 수 없습니다")));
// 출력: {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}
console.log(JSON.stringify(실패("VALIDATION_FAILED", "입력값이 올바르지 않습니다", [{ 키: "name", 이유: "필수입니다" }])));
// 출력: {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"name","이유":"필수입니다"}]}}
//
// ★ meta 와 details 가 없을 때는 아예 안 넣었습니다.
//   { data: [...], meta: null } 보다 깔끔하고, 프론트도 확인이 간단합니다.
//
// ★ 성공 응답에는 error 가 없고, 실패 응답에는 data 가 없습니다.
//   이 규칙 하나로 프론트가 이렇게만 쓰면 됩니다.
//     if (답.error) { ... return; }
//     그리기(답.data);
//
// ★ JSON.stringify 로 찍은 이유
//   console.log 로 객체를 그냥 찍으면 한글 키에 따옴표가 붙고,
//   실제로 나가는 모양과 달라 보입니다.
//   "네트워크로 나가는 진짜 모양" 을 보려면 stringify 가 맞습니다.


// ───── 문제 8 ─────
// total 을 자르기 '전' 에 세야 하는 이유
//
// 무엇이 잘못되나:
//   slice 한 뒤에 length 를 세면 항상 limit 이하가 나옵니다.
//   전체 12건인데 limit 이 3이면 total 이 3으로 나갑니다.
//
// 화면에서 어떻게 보이나:
//   "전체 12건" 이어야 할 자리에 "전체 3건" 이 나옵니다.
//   totalPages 도 1이 되어 쪽 번호 버튼이 한 개만 그려집니다.
//   2쪽으로 갈 방법이 없어집니다.
//
// 왜 못 알아채나:
//   1쪽만 보면 아무 문제가 없어 보입니다. 데이터도 정상입니다.
//   "쪽 번호가 왜 하나뿐이지?" 를 이상하게 여겨야 발견됩니다.
//
// 올바른 순서:
//   ① 걸러 내기 (검색·필터)
//   ② 정렬
//   ③ total 세기          ← 여기
//   ④ slice 로 자르기
//   ⑤ 필요한 속성만 고르기
//
// 정렬을 자르기 전에 하는 이유도 같습니다:
//   자른 뒤 정렬하면 그 쪽 안에서만 정렬됩니다.
//   1쪽이 3,1,2 / 2쪽이 6,4,5 처럼 되어 전체 순서가 뒤죽박죽이 됩니다.
