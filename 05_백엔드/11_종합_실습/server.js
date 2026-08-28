// ============================================================
// server.js — 준비하고 문을 연다
// ------------------------------------------------------------
// 실행: node server.js
//       브라우저에서 http://localhost:3000 을 여세요.
// ============================================================

const fs = require("fs");
const path = require("path");

const app = require("./app");
const 설비저장소 = require("./repositories/설비저장소");
const 점검기록저장소 = require("./repositories/점검기록저장소");
const 사진저장소 = require("./repositories/사진저장소");
const { 사진폴더 } = require("./services/사진서비스");

// ★ Number 를 꼭 씌우세요. 환경변수는 글자입니다. (08단원 개념05)
const PORT = Number(process.env.PORT) || 3000;


// 수업용 초기 데이터입니다. 진짜 서버에는 이런 게 있으면 안 됩니다.
const 처음설비 = [
  { id: 1, name: "컨베이어 1호", line: "A", status: "가동" },
  { id: 2, name: "프레스 1호", line: "B", status: "정지" },
  { id: 3, name: "용접로봇 1호", line: "C", status: "가동" },
  { id: 4, name: "검사기 1호", line: "A", status: "점검중" },
  { id: 5, name: "포장기 1호", line: "C", status: "정지" },
];

const 처음기록 = [
  { id: 1, equipmentId: 1, result: "정상", 내용: "벨트 장력 확인", 담당자: "김민준" },
  { id: 2, equipmentId: 4, result: "이상", 내용: "센서 오작동", 담당자: "이서연" },
];


async function 시작하기() {
  // ① 준비
  fs.rmSync(사진폴더, { recursive: true, force: true });
  fs.mkdirSync(사진폴더, { recursive: true });

  await 설비저장소.초기화(처음설비);
  await 점검기록저장소.초기화(처음기록);
  await 사진저장소.초기화([]);

  // ② 준비가 끝난 뒤에야 문을 엽니다
  app.listen(PORT, () => {
    console.log(`설비 점검 관리 시스템이 켜졌습니다.`);
    console.log(`  화면:  http://localhost:${PORT}`);
    console.log(`  API :  http://localhost:${PORT}/api/v1/equipments`);
    console.log("");
    console.log("  증표:  Bearer key-user-1  (김민준, user)");
    console.log("        Bearer key-admin-1 (이서연, admin)");
  });
}

시작하기().catch((에러) => {
  console.error("서버를 켜지 못했습니다:", 에러);
  process.exit(1);
});


// ============================================================
// 검증 선언 — 요구사항이 정말 지켜지는지
// ------------------------------------------------------------
//   node _검증도구/서버검증.js 11_종합_실습
//   node _검증도구/화면검증.js 11_종합_실습
//
// ★ 위에서부터 순서대로 실행됩니다. 순서가 곧 시나리오입니다.
// ============================================================


// ── 조회 (로그인 없이 됩니다) ──

// 확인: GET /api/v1/equipments?limit=3&sort=id
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"},{"id":3,"name":"용접로봇 1호","line":"C","status":"가동"}],"meta":{"page":1,"limit":3,"total":5,"totalPages":2}}

// 확인: GET /api/v1/equipments?q=로봇&sort=id
// 응답: 200 {"data":[{"id":3,"name":"용접로봇 1호","line":"C","status":"가동"}],"meta":{"page":1,"limit":10,"total":1,"totalPages":1}}

// 확인: GET /api/v1/equipments/1
// 응답: 200 {"data":{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"}}

// 확인: GET /api/v1/equipments/99
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// 확인: GET /api/v1/equipments/abc
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"id","이유":"숫자여야 합니다"}]}}


// ── 중첩 자원: 설비의 점검기록 ──

// 확인: GET /api/v1/equipments/4/logs
// 응답: 200 {"data":[{"id":2,"equipmentId":4,"result":"이상","내용":"센서 오작동","담당자":"이서연"}]}

// 확인: GET /api/v1/equipments/2/logs
// 응답: 200 {"data":[]}

// 확인: GET /api/v1/equipments/99/logs
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// ★★ 위 두 줄이 06단원의 그 대비입니다.
//   설비는 있고 기록이 0건  →  200 과 빈 배열
//   설비 자체가 없음        →  404


// ── 인증과 권한 ──

// 확인: POST /api/v1/equipments {"name":"적재로봇 1호","line":"A"}
// 응답: 401 {"error":{"code":"UNAUTHENTICATED","message":"로그인이 필요합니다"}}

// 확인: POST /api/v1/equipments [Authorization: Bearer key-user-1] {"name":"적재로봇 1호","line":"A"}
// 응답: 403 {"error":{"code":"FORBIDDEN","message":"이 작업을 할 권한이 없습니다"}}

// 확인: POST /api/v1/equipments [Authorization: Bearer key-admin-1] {"name":"용","line":"Z"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"name","이유":"2글자 이상이어야 합니다"},{"키":"line","이유":"A, B, C 중 하나여야 합니다"}]}}

// 확인: POST /api/v1/equipments [Authorization: Bearer key-admin-1] {"name":"적재로봇 1호","line":"A","status":"가동"}
// 응답: 201 {"data":{"id":6,"name":"적재로봇 1호","line":"A","status":"정지"}}

// ★ status: "가동" 을 보냈는데 "정지" 로 만들어졌습니다. 규칙은 서버가 쥡니다.

// 확인: POST /api/v1/equipments [Authorization: Bearer key-admin-1] {"name":"적재로봇 1호","line":"B"}
// 응답: 409 {"error":{"code":"DUPLICATED","message":"이미 있는 설비 이름입니다"}}


// ── 점검기록을 남기면 설비 상태가 바뀝니다 ──

// 확인: POST /api/v1/equipments/1/logs {"result":"이상","내용":"베어링 소음"}
// 응답: 401 {"error":{"code":"UNAUTHENTICATED","message":"로그인이 필요합니다"}}

// 확인: POST /api/v1/equipments/1/logs [Authorization: Bearer key-user-1] {"result":"이상함","내용":"베어링 소음"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"result","이유":"정상, 이상 중 하나여야 합니다"}]}}

// 확인: GET /api/v1/equipments/1
// 응답: 200 {"data":{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"}}

// 확인: POST /api/v1/equipments/1/logs [Authorization: Bearer key-user-1] {"result":"이상","내용":"베어링 소음"}
// 응답: 201 {"data":{"id":3,"equipmentId":1,"result":"이상","내용":"베어링 소음","담당자":"김민준"}}

// 확인: GET /api/v1/equipments/1
// 응답: 200 {"data":{"id":1,"name":"컨베이어 1호","line":"A","status":"점검중"}}

// ★★★ 기록을 남겼을 뿐인데 설비가 '가동' 에서 '점검중' 으로 바뀌었습니다.
//   이 규칙은 services/점검기록서비스.js 한 곳에만 있습니다.
//   담당자도 본문이 아니라 로그인한 사람(김민준)으로 정해졌습니다.


// ── 상태 전이 규칙 ──

// 확인: PATCH /api/v1/equipments/1 [Authorization: Bearer key-user-1] {"status":"가동"}
// 응답: 409 {"error":{"code":"CONFLICT","message":"점검중인 설비는 정지를 거쳐야 가동할 수 있습니다"}}

// 확인: PATCH /api/v1/equipments/1 [Authorization: Bearer key-user-1] {"status":"정지"}
// 응답: 200 {"data":{"id":1,"name":"컨베이어 1호","line":"A","status":"정지"}}

// 확인: DELETE /api/v1/equipments/3 [Authorization: Bearer key-admin-1]
// 응답: 409 {"error":{"code":"CONFLICT","message":"가동 중인 설비는 삭제할 수 없습니다. 먼저 정지시키세요"}}

// 확인: DELETE /api/v1/equipments/1 [Authorization: Bearer key-user-1]
// 응답: 403 {"error":{"code":"FORBIDDEN","message":"이 작업을 할 권한이 없습니다"}}

// 확인: DELETE /api/v1/equipments/1 [Authorization: Bearer key-admin-1]
// 응답: 204


// ── 사진 업로드 ──

// 확인: POST /api/v1/equipments/2/photos multipart:@photo=설비사진.png:50
// 응답: 401 {"error":{"code":"UNAUTHENTICATED","message":"로그인이 필요합니다"}}

// 확인: POST /api/v1/equipments/2/photos [Authorization: Bearer key-user-1] multipart:@photo=악성.exe:20
// 응답: 400 {"error":{"code":"BAD_EXTENSION","message":".exe 은(는) 올릴 수 없습니다"}}

// 확인: POST /api/v1/equipments/2/photos [Authorization: Bearer key-user-1] multipart:@photo=큰사진.png:5000
// 응답: 400 {"error":{"code":"LIMIT_FILE_SIZE","message":"파일이 너무 큽니다 (최대 2000바이트)"}}

// 확인: POST /api/v1/equipments/99/photos [Authorization: Bearer key-user-1] multipart:@photo=설비사진.png:50
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// 확인: POST /api/v1/equipments/2/photos [Authorization: Bearer key-user-1] multipart:@photo=설비사진.png:50
// 응답: 201 {"data":{"id":1,"원래이름":"설비사진.png","크기":50}}

// 확인: GET /api/v1/equipments/2/photos
// 응답: 200 {"data":[{"id":1,"원래이름":"설비사진.png","크기":50,"보기":"/api/v1/photos/1/view","내려받기":"/api/v1/photos/1/download"}]}

// 확인: GET /api/v1/photos/orphans
// 응답: 200 {"data":{"디스크파일수":1,"기록수":1,"고아파일수":0}}

// ★★ 에러가 네 번 났는데도 쓰레기 파일이 없습니다.
//   사진서비스가 규칙에 걸릴 때마다 이미 저장된 파일을 지웠기 때문입니다. (09단원)

// 확인: GET /api/v1/photos/1/download
// 응답: 200
// 헤더: content-disposition=attachment; filename="????.png"; filename*=UTF-8''%EC%84%A4%EB%B9%84%EC%82%AC%EC%A7%84.png

// 확인: DELETE /api/v1/photos/1 [Authorization: Bearer key-user-1]
// 응답: 403 {"error":{"code":"FORBIDDEN","message":"이 작업을 할 권한이 없습니다"}}

// 확인: DELETE /api/v1/photos/1 [Authorization: Bearer key-admin-1]
// 응답: 204

// 확인: GET /api/v1/photos/orphans
// 응답: 200 {"data":{"디스크파일수":0,"기록수":0,"고아파일수":0}}


// ── 화면과 없는 주소 ──

// 확인: GET /
// 응답: 200

// 확인: GET /없는주소
// 응답: 404 {"error":{"code":"ROUTE_NOT_FOUND","message":"그런 주소가 없습니다"}}


// ============================================================
// 화면 확인
// ============================================================

// 화면: index.html
// 보임: #요약  전체 5건 중 3건
// 보임: #쪽정보  1 / 2
// 보임: #본문  컨베이어 1호

// 화면: index.html  #다음쪽
// 보임: #쪽정보  2 / 2
// 보임: #본문  포장기 1호

// 2쪽을 보다가 검색하면 1쪽으로 돌아갑니다
// 화면: index.html  #다음쪽 >> 입력(#검색=로봇) >> #라인거르기
// 보임: #쪽정보  1 / 1
// 보임: #본문  용접로봇 1호

// 결과 없음
// 화면: index.html  입력(#검색=없는것) >> #라인거르기
// 보임: #요약  조건에 맞는 설비가 없습니다

// 빈 폼으로 등록
// 화면: index.html  #보내기
// 보임: #오류-name  필수입니다
// 보임: #오류-line  필수입니다

// user 로 등록하면 403
// 화면: index.html  입력(#증표=key-user-1) >> 입력(#name=신규설비 1호) >> 입력(#line=A) >> #보내기
// 보임: #알림  권한이 없습니다

// admin 으로 등록하면 됩니다
// 화면: index.html  입력(#name=신규설비 1호) >> 입력(#line=A) >> #보내기
// 보임: #알림  등록했습니다
// 보임: #요약  전체 6건

// 상세를 열면 점검기록과 사진이 함께 나옵니다
// 화면: index.html  .보기
// 보임: #상세이름  컨베이어 1호
// 보임: #기록목록  벨트 장력 확인
// 보임: #사진목록  사진이 없습니다

// ★ 요청 세 개(설비·기록·사진)를 Promise.all 로 한꺼번에 보냈습니다.
//   차례로 보내면 세 배 느립니다.
//   그리고 '기록은 있고 사진은 없는' 상태가 각각 제대로 그려집니다.

// 가동 중인 설비는 삭제가 막힙니다
// 화면: index.html  .지우기
// 보임: #알림  가동 중인 설비는 삭제할 수 없습니다

// ★ 07단원의 업무 규칙이 화면까지 그대로 전해졌습니다.
//   화면에는 그 규칙이 한 줄도 없습니다. 서버가 준 message 를 보여 줄 뿐입니다.
