// ============================================================
// 09단원 서버 연습문제 — 설비 사진 API
// ------------------------------------------------------------
// 실행: npx nodemon 연습문제_서버.js
// ============================================================
//
// ★ 이 문제의 목적
//   업로드에서 '쓰레기 파일이 안 생기게' 만드는 것입니다.
//
//   에러를 낼 때마다 이미 저장된 파일을 지워야 합니다.
//   빠뜨리기 아주 쉽고, 티도 안 나며, 디스크가 조용히 찹니다.
//
//   다 만든 뒤 /api/v1/photos/orphans 가 계속 0 이면 성공입니다.
//
// 만들 주소
//   GET    /api/v1/equipments/:id/photos       그 설비의 사진 목록
//   POST   /api/v1/equipments/:id/photos       사진 올리기
//   GET    /api/v1/photos/orphans              고아 파일 확인 (시험용)
//   GET    /api/v1/photos/:photoId/view        보기
//   GET    /api/v1/photos/:photoId/download    내려받기
//   DELETE /api/v1/photos/:photoId             지우기

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const 사진폴더 = path.join(__dirname, "uploads", "사진");
fs.rmSync(사진폴더, { recursive: true, force: true });
fs.mkdirSync(사진폴더, { recursive: true });


// ───── 준비 (여기는 그대로 두세요) ─────

const 설비들 = [
  { id: 1, name: "컨베이어 1호", line: "A" },
  { id: 2, name: "프레스 1호", line: "B" },
];

let 사진들 = [];
let 다음번호 = 1;

const 설비당최대 = 3;
const 허용확장자 = [".jpg", ".jpeg", ".png", ".gif"];


// ───── 문제 1 ───── 도우미
// 연습문제.js 의 이름되돌리기 를 가져오세요.
// 그리고 상태코드가 붙은 에러를 만드는 HttpError(status, code, message) 도 만드세요.
//
// 파일을 지우는 도우미도 만드세요.
//
//   async function 파일지우기(저장이름) { ... }
//
// ★ ENOENT 는 에러가 아닙니다.
//   이미 없는 파일을 지우려 한 것은 '목표가 이미 이뤄진 것' 입니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 2 ───── multer 설정
// diskStorage 로 아래를 정하세요.
//
//   destination  사진폴더
//   filename     "시각-무작위.확장자"  (연습문제.js 문제 2)
//
// limits
//   fileSize  200 (시험용. 실제로는 5 * 1024 * 1024)
//   files     1
//
// fileFilter
//   허용확장자 가 아니면 HttpError(400, "BAD_EXTENSION", ...) 을 cb 로 넘기세요.
//
// ★ filename 과 fileFilter 안에서도 이름되돌리기 를 먼저 하세요.
//   안 하면 한글 이름 파일이 전부 거절됩니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 3 ───── 미들웨어
// 설비찾기(req, res, next)   :id 로 설비를 찾아 req.설비 에 담기 (없으면 404, 숫자 아니면 400)
// 사진찾기(req, res, next)   :photoId 로 사진을 찾아 req.사진 에 담기 (없으면 404)

// TODO: 여기에 코드를 쓰세요


// ───── 문제 4 ───── 사진 목록
// GET /api/v1/equipments/:id/photos
//
// 기대 결과:
//   /1/photos   →  200  {"data":[],"meta":{"설비":"컨베이어 1호","개수":0,"최대":3}}
//   /99/photos  →  404
//
// ★ 06단원에서 강조한 구별입니다.
//   설비는 있고 사진이 0장 → 200 과 빈 배열
//   설비 자체가 없음       → 404

// TODO: 여기에 코드를 쓰세요


// ───── 문제 5 ───── 사진 올리기  ★★ 이 문제가 핵심입니다
// POST /api/v1/equipments/:id/photos
//
// 규칙
//   · 설비가 없으면            404
//   · 파일이 없으면            400
//   · 설비당 3장을 넘으면      409 TOO_MANY_PHOTOS
//   · 잘 왔으면                201 + Location
//
// ★★★ 여기가 함정입니다.
//
//   multer 는 라우트보다 '먼저' 돕니다.
//   그래서 이 함수가 실행될 때는 파일이 이미 저장돼 있습니다.
//
//   404 나 409 를 그냥 내면, 그 파일은 아무도 모르는 고아가 됩니다.
//   에러를 내기 전에 반드시 req.file 을 지우세요.
//
//     const 정리하고 = async (에러) => {
//       if (req.file) await 파일지우기(req.file.filename);
//       next(에러);
//     };
//
// ★★ 그리고 설비찾기 를 미들웨어로 붙이면 안 됩니다. 왜일까요?
//   미들웨어에서 next(에러) 를 부르면 라우트 함수가 실행되지 않습니다.
//   그러면 파일을 지울 기회가 없습니다.
//   이 라우트에서는 설비 확인을 '직접' 하세요.
//
// 기대 결과:
//   /1/photos   설비사진.png (50바이트)   →  201, id 1
//   /1/photos   악성.exe                  →  400 BAD_EXTENSION
//   /1/photos   500바이트 파일             →  400 LIMIT_FILE_SIZE
//   /99/photos  설비사진.png              →  404
//   세 장을 채운 뒤 한 장 더               →  409 TOO_MANY_PHOTOS
//
// ★ 409 인 이유를 설명할 수 있어야 합니다. 왜 400 이 아닌가요?

// TODO: 여기에 코드를 쓰세요


// ───── 문제 6 ───── 고아 파일 확인
// GET /api/v1/photos/orphans
//
// 디스크 파일 수, 기록 수, 고아 파일 수를 돌려주세요.
//
// ★★ 이 라우트를 /api/v1/photos/:photoId 보다 '위' 에 두세요.
//   아래에 두면 :photoId 에 "orphans" 가 들어갑니다. (04단원 개념02 섹션 7)
//
// 기대 결과 (사진 세 장을 올리고 에러를 여러 번 낸 뒤):
//   {"data":{"디스크파일수":3,"기록수":3,"고아파일수":0}}
//
// ★★ 고아파일수가 0 이 아니면 문제 5의 정리하고() 를 빠뜨린 것입니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 7 ───── 보기와 내려받기
// GET /api/v1/photos/:photoId/view       res.sendFile
// GET /api/v1/photos/:photoId/download   res.download (원래 이름으로)
//
// ★ res.download 의 두 번째 인자에 원래 이름을 주면
//   Express 가 한글을 알아서 인코딩해 줍니다.
//   직접 Content-Disposition 을 쓰면 한글에서 500 이 납니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 8 ───── 지우기
// DELETE /api/v1/photos/:photoId  →  204
//
// ★ 기록을 먼저 지우고 파일을 나중에 지우세요. 왜인지 설명할 수 있어야 합니다.
//
// 기대 결과:
//   /3  →  204
//   /3  →  404 (이미 지웠으니)
//   그 뒤 /orphans  →  고아 0

// TODO: 여기에 코드를 쓰세요


// ───── 문제 9 ───── 404 와 에러 처리기
// MulterError 는 400 으로, 우리가 만든 에러는 err.status 로,
// 그 밖은 500 으로 내보내세요.
//
// MulterError 안내 문구는 연습문제.js 문제 6 을 참고하세요.

// TODO: 여기에 코드를 쓰세요


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/api/v1/equipments/1/photos`);
});


// ============================================================
// Postman 시나리오
// ============================================================
//
// Body → form-data → Key 에 photo, 오른쪽 드롭다운에서 File 선택
//
//   1  GET    /api/v1/equipments/1/photos             0장
//   2  GET    /api/v1/equipments/99/photos            404
//   3  POST   /api/v1/equipments/1/photos  (사진.png)  201
//   4  POST   /api/v1/equipments/1/photos  (악성.exe)  400
//   5  POST   /api/v1/equipments/1/photos  (큰 파일)   400
//   6  POST   /api/v1/equipments/99/photos (사진.png)  404
//   7  GET    /api/v1/photos/orphans                  고아 0  ★
//   8  세 장을 채운 뒤 한 장 더                        409
//   9  GET    /api/v1/photos/orphans                  여전히 0  ★
//  10  GET    /api/v1/photos/1/download               한글 이름으로 저장되나?
//  11  DELETE /api/v1/photos/1                        204
//  12  GET    /api/v1/photos/orphans                  여전히 0
//
// ★ 7·9·12 가 이 문제의 채점 기준입니다.
//   에러가 여섯 번 났는데도 쓰레기가 안 쌓였는지 봅니다.
//
// ★ 한글 이름 파일로 꼭 해 보세요. 영어 파일로만 하면 함정을 못 만납니다.


// ============================================================
// 다 만든 뒤 답해 보세요
// ============================================================
//
// ① 문제 5에서 설비찾기 를 미들웨어로 붙이면 무엇이 문제인가요?
//    실제로 붙여 보고 /99/photos 로 파일을 올린 뒤 /orphans 를 보세요.
//    __________________________________________
//
// ② 409 와 400 의 차이를 이 상황에 맞춰 설명해 보세요.
//    __________________________________________
//
// ③ /orphans 를 /:photoId 아래에 두면 무슨 일이 생기나요?
//    실제로 옮겨서 확인해 보세요.
//    __________________________________________
//
// ④ fileFilter 에서 이름되돌리기 를 빼면 어떤 파일이 거절되나요?
//    __________________________________________
//
// ⑤ 문제 8에서 파일을 먼저 지우고 기록을 나중에 지우면
//    중간에 실패했을 때 사용자 눈에 무엇이 보이나요?
//    __________________________________________
//
// ⑥ 이 서버에 05단원의 인증을 붙인다면 어디에 붙이나요?
//    /view 와 /download 에도 붙여야 하나요?
//    __________________________________________


// ============================================================
// 잘 안 될 때 보는 곳
// ============================================================
//
// MulterError: Unexpected field
//   → 필드 이름이 photo 가 맞나요? 한글로 쓰지 않았나요?
//
// 한글 파일만 거절됨
//   → fileFilter 에서 이름되돌리기 를 안 했습니다.
//
// 파일 이름이 깨져서 저장됨
//   → filename 에서 이름되돌리기 를 안 했습니다.
//
// req.file 이 undefined
//   → 파일을 안 보냈거나, 필드 이름이 다릅니다.
//   → Postman 에서 File 이 아니라 Text 로 골랐을 수도 있습니다.
//
// 고아파일수가 계속 늘어남
//   → 에러를 내기 전에 req.file 을 안 지웁니다. 문제 5를 다시 보세요.
//
// /api/v1/photos/orphans 가 404
//   → :photoId 라우트가 먼저 걸렸습니다. 위로 올리세요.
//
// 내려받기에서 500
//   → Content-Disposition 에 한글을 직접 썼습니다. res.download 를 쓰세요.
//
// 500 인데 400 이어야 함
//   → 에러 처리기에서 MulterError 를 안 다뤘습니다.
