// ============================================================
// 09단원 서버 연습문제 정답 — 설비 사진 API
// ------------------------------------------------------------
// 실행: node 연습문제_서버_정답.js
// ============================================================
//
// 06단원(중첩 자원) · 07단원(업무 규칙) · 09단원(업로드)을 합칩니다.
//
//   GET    /api/v1/equipments/:id/photos       그 설비의 사진 목록
//   POST   /api/v1/equipments/:id/photos       사진 올리기
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


// ───── 문제 1 ───── 도우미
function 이름되돌리기(이름) {
  return Buffer.from(이름, "latin1").toString("utf8");
}

function HttpError(status, code, message) {
  const 에러 = new Error(message);
  에러.status = status;
  에러.code = code;
  return 에러;
}


// ───── 준비 ─────
const 설비들 = [
  { id: 1, name: "컨베이어 1호", line: "A" },
  { id: 2, name: "프레스 1호", line: "B" },
];

let 사진들 = [];
let 다음번호 = 1;

const 설비당최대 = 3;
const 허용확장자 = [".jpg", ".jpeg", ".png", ".gif"];


// ───── 문제 2 ───── multer 설정
const 저장방식 = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 사진폴더),
  filename: (req, file, cb) => {
    const 확장자 = path.extname(이름되돌리기(file.originalname)).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${확장자}`);
  },
});

const 업로드 = multer({
  storage: 저장방식,
  limits: { fileSize: 200, files: 1 },
  fileFilter: (req, file, cb) => {
    const 확장자 = path.extname(이름되돌리기(file.originalname)).toLowerCase();

    if (!허용확장자.includes(확장자)) {
      return cb(
        HttpError(400, "BAD_EXTENSION", `${확장자 || "확장자 없는 파일"} 은(는) 올릴 수 없습니다`)
      );
    }

    cb(null, true);
  },
});


// ───── 문제 3 ───── 미들웨어
function 설비찾기(req, res, next) {
  const 번호 = Number(req.params.id);

  if (!Number.isInteger(번호)) {
    return next(HttpError(400, "VALIDATION_FAILED", "번호는 숫자여야 합니다"));
  }

  const 설비 = 설비들.find((설비) => 설비.id === 번호);

  if (!설비) {
    return next(HttpError(404, "NOT_FOUND", "설비를 찾을 수 없습니다"));
  }

  req.설비 = 설비;
  next();
}

function 사진찾기(req, res, next) {
  const 번호 = Number(req.params.photoId);
  const 사진 = 사진들.find((사진) => 사진.id === 번호);

  if (!사진) {
    return next(HttpError(404, "NOT_FOUND", "사진을 찾을 수 없습니다"));
  }

  req.사진 = 사진;
  next();
}

// ★ 파일을 지우는 도우미. 이미 없어도 에러가 아닙니다.
async function 파일지우기(저장이름) {
  try {
    await fs.promises.unlink(path.join(사진폴더, 저장이름));
  } catch (에러) {
    if (에러.code !== "ENOENT") throw 에러;
  }
}


// ───── 문제 4 ───── 목록
app.get("/api/v1/equipments/:id/photos", 설비찾기, (req, res) => {
  const 결과 = 사진들.filter((사진) => 사진.equipmentId === req.설비.id);

  res.json({
    data: 결과.map((사진) => ({
      id: 사진.id,
      원래이름: 사진.원래이름,
      크기: 사진.크기,
      보기: `/api/v1/photos/${사진.id}/view`,
    })),
    meta: { 설비: req.설비.name, 개수: 결과.length, 최대: 설비당최대 },
  });
});

// 확인: GET /api/v1/equipments/1/photos
// 응답: 200 {"data":[],"meta":{"설비":"컨베이어 1호","개수":0,"최대":3}}

// 확인: GET /api/v1/equipments/99/photos
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// ★ 06단원에서 강조한 그 구별입니다.
//   설비는 있고 사진이 0장  →  200 과 빈 배열
//   설비 자체가 없음        →  404


// ───── 문제 5 ───── 올리기
app.post(
  "/api/v1/equipments/:id/photos",
  업로드.single("photo"),
  async (req, res, next) => {
    // ★★ multer 가 먼저 돌기 때문에, 여기 왔을 때는 파일이 이미 저장돼 있습니다.
    //   그래서 에러를 내기 전에 반드시 지워야 합니다.
    const 정리하고 = async (에러) => {
      if (req.file) await 파일지우기(req.file.filename);
      next(에러);
    };

    // 설비 확인을 여기서 직접 합니다. 미들웨어로 하면 파일 정리를 못 합니다.
    const 번호 = Number(req.params.id);

    if (!Number.isInteger(번호)) {
      return 정리하고(HttpError(400, "VALIDATION_FAILED", "번호는 숫자여야 합니다"));
    }

    const 설비 = 설비들.find((설비) => 설비.id === 번호);

    if (!설비) {
      return 정리하고(HttpError(404, "NOT_FOUND", "설비를 찾을 수 없습니다"));
    }

    if (!req.file) {
      return next(HttpError(400, "NO_FILE", "사진이 없습니다"));
    }

    // 업무 규칙: 설비당 3장까지
    const 지금개수 = 사진들.filter((사진) => 사진.equipmentId === 번호).length;

    if (지금개수 >= 설비당최대) {
      return 정리하고(
        HttpError(409, "TOO_MANY_PHOTOS", `설비당 사진은 ${설비당최대}장까지입니다`)
      );
    }

    const 사진 = {
      id: 다음번호,
      equipmentId: 번호,
      저장이름: req.file.filename,
      원래이름: 이름되돌리기(req.file.originalname),
      크기: req.file.size,
    };

    다음번호 += 1;
    사진들.push(사진);

    res
      .status(201)
      .location(`/api/v1/photos/${사진.id}/view`)
      .json({ data: { id: 사진.id, 원래이름: 사진.원래이름, 크기: 사진.크기 } });
  }
);

// 확인: POST /api/v1/equipments/1/photos multipart:@photo=설비사진.png:50
// 응답: 201 {"data":{"id":1,"원래이름":"설비사진.png","크기":50}}

// 확인: POST /api/v1/equipments/1/photos multipart:@photo=악성.exe:10
// 응답: 400 {"error":{"code":"BAD_EXTENSION","message":".exe 은(는) 올릴 수 없습니다"}}

// 확인: POST /api/v1/equipments/1/photos multipart:@photo=큰사진.png:500
// 응답: 400 {"error":{"code":"LIMIT_FILE_SIZE","message":"파일이 너무 큽니다 (최대 200바이트)"}}

// 확인: POST /api/v1/equipments/99/photos multipart:@photo=설비사진.png:50
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// 확인: POST /api/v1/equipments/1/photos multipart:@photo=사진2.png:50
// 응답: 201 {"data":{"id":2,"원래이름":"사진2.png","크기":50}}

// 확인: POST /api/v1/equipments/1/photos multipart:@photo=사진3.png:50
// 응답: 201 {"data":{"id":3,"원래이름":"사진3.png","크기":50}}

// 확인: POST /api/v1/equipments/1/photos multipart:@photo=사진4.png:50
// 응답: 409 {"error":{"code":"TOO_MANY_PHOTOS","message":"설비당 사진은 3장까지입니다"}}

// ★★★ 네 번째와 마지막을 보세요.
//   404 와 409 를 낼 때 이미 올라온 파일을 지웠습니다.
//   안 지웠다면 지금쯤 고아 파일이 두 개 쌓였을 것입니다.
//   다음 문제에서 확인합니다.


// ───── 문제 6 ───── 고아 파일 확인
app.get("/api/v1/photos/orphans", (req, res) => {
  const 기록이름 = new Set(사진들.map((사진) => 사진.저장이름));
  const 디스크 = fs.readdirSync(사진폴더);

  res.json({
    data: {
      디스크파일수: 디스크.length,
      기록수: 기록이름.size,
      고아파일수: 디스크.filter((이름) => !기록이름.has(이름)).length,
    },
  });
});

// 확인: GET /api/v1/photos/orphans
// 응답: 200 {"data":{"디스크파일수":3,"기록수":3,"고아파일수":0}}

// ★★ 0 입니다.
//   에러를 낸 요청이 네 번 있었는데도 쓰레기가 안 남았습니다.
//   문제 5의 정리하고() 덕입니다.
//
//   ★ 이 라우트는 반드시 /api/v1/photos/:photoId 보다 '위' 에 있어야 합니다.
//     아래에 두면 :photoId 에 "orphans" 가 들어가 버립니다. (04단원 개념02 섹션 7)


// ───── 문제 7 ───── 보기와 내려받기
app.get("/api/v1/photos/:photoId/view", 사진찾기, (req, res) => {
  res.sendFile(path.join(사진폴더, req.사진.저장이름));
});

// 확인: GET /api/v1/photos/1/view
// 응답: 200

// 확인: GET /api/v1/photos/99/view
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"사진을 찾을 수 없습니다"}}

app.get("/api/v1/photos/:photoId/download", 사진찾기, (req, res) => {
  // ★ res.download 가 한글 이름을 알아서 인코딩해 줍니다.
  res.download(path.join(사진폴더, req.사진.저장이름), req.사진.원래이름);
});

// 확인: GET /api/v1/photos/1/download
// 응답: 200
// 헤더: content-disposition=attachment; filename="????.png"; filename*=UTF-8''%EC%84%A4%EB%B9%84%EC%82%AC%EC%A7%84.png

// ★ filename 과 filename* 두 개가 들어 있습니다.
//   헤더에 한글을 못 담기 때문에 생긴 방법입니다. (09단원 개념04 섹션 4)
//
// ★ 물음표가 네 개인 것에 주의하세요. "설비사진" 이 네 글자라서입니다.
//   한글 한 글자가 물음표 하나가 됩니다. 확장자 .png 는 영어라 그대로 남습니다.
//   요즘 브라우저는 filename* 쪽을 보고 한글 이름으로 저장합니다.


// ───── 문제 8 ───── 지우기
app.delete("/api/v1/photos/:photoId", 사진찾기, async (req, res, next) => {
  try {
    // ★ 기록을 먼저, 파일을 나중에. (개념05 섹션 3)
    사진들 = 사진들.filter((사진) => 사진.id !== req.사진.id);
    await 파일지우기(req.사진.저장이름);

    res.sendStatus(204);
  } catch (에러) {
    next(에러);
  }
});

// 확인: DELETE /api/v1/photos/3
// 응답: 204

// 확인: DELETE /api/v1/photos/3
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"사진을 찾을 수 없습니다"}}

// 확인: GET /api/v1/photos/orphans
// 응답: 200 {"data":{"디스크파일수":2,"기록수":2,"고아파일수":0}}

// 확인: GET /api/v1/equipments/1/photos
// 응답: 200 {"data":[{"id":1,"원래이름":"설비사진.png","크기":50,"보기":"/api/v1/photos/1/view"},{"id":2,"원래이름":"사진2.png","크기":50,"보기":"/api/v1/photos/2/view"}],"meta":{"설비":"컨베이어 1호","개수":2,"최대":3}}

// ★ 한 장을 지웠으니 다시 올릴 수 있습니다.

// 확인: POST /api/v1/equipments/1/photos multipart:@photo=새사진.png:50
// 응답: 201 {"data":{"id":4,"원래이름":"새사진.png","크기":50}}


// ───── 문제 9 ───── 404 와 에러 처리기
app.use((req, res) => {
  res.status(404).json({ error: { code: "ROUTE_NOT_FOUND", message: "그런 주소가 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.name}: ${err.message}`);

  if (err.name === "MulterError") {
    const 안내 = {
      LIMIT_FILE_SIZE: "파일이 너무 큽니다 (최대 200바이트)",
      LIMIT_FILE_COUNT: "사진은 한 번에 한 장만 올릴 수 있습니다",
      LIMIT_UNEXPECTED_FILE: "필드 이름이 photo 가 맞나요? (한글로 쓰면 안 됩니다)",
    };

    return res.status(400).json({
      error: { code: err.code, message: 안내[err.code] ?? err.message },
    });
  }

  if (err.status) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/api/v1/equipments/1/photos`);
});


// ============================================================
// 이 파일에서 확인할 것
// ============================================================
//
// ① 에러를 낼 때마다 파일을 지웠습니다
//    404 도, 409 도 마찬가지입니다. 안 그러면 고아가 쌓입니다.
//    /api/v1/photos/orphans 가 계속 0 인 것이 그 증거입니다.
//
// ② 설비 확인을 미들웨어로 안 했습니다
//    설비찾기 를 미들웨어로 붙이면 파일 정리를 할 수가 없습니다.
//    미들웨어에서 next(에러) 를 부르면 라우트 함수가 실행되지 않으니까요.
//    그래서 업로드 라우트에서만 직접 확인했습니다.
//
// ③ /orphans 를 /:photoId 보다 위에 두었습니다
//    아래에 두면 :photoId 에 "orphans" 가 들어갑니다.
//
// ④ 지울 때 기록을 먼저 지웠습니다
//    보이지 않는 쓰레기가, 보이는 고장보다 낫습니다.
//
// ⑤ 업무 규칙(3장 제한)이 409 입니다
//    400 이 아닙니다. 값이 잘못된 게 아니라 '지금 상태와 안 맞는' 것입니다.


// ============================================================
// Postman 시나리오
// ============================================================
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
//  10  GET    /api/v1/photos/1/download               한글 이름으로 저장됨
//  11  DELETE /api/v1/photos/1                        204
//  12  GET    /api/v1/photos/orphans                  여전히 0
//
// ★ 7·9·12 가 이 문제의 핵심입니다.
//   에러가 여러 번 났는데도 쓰레기가 안 쌓였는지 확인하는 것입니다.
//
// ★ Postman 에서 파일 올리기
//   Body → form-data → Key 에 photo, 오른쪽 드롭다운에서 File 선택
//   한글 이름 파일로도 꼭 해 보세요.
