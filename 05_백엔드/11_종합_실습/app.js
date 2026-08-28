// ============================================================
// app.js — 조립만 하는 곳
// ------------------------------------------------------------
// listen 은 여기 없습니다. server.js 가 합니다.
// ============================================================
//
// ★ app 과 server 를 나누는 이유
//   나중에 테스트를 짤 때 app 만 가져다 쓸 수 있습니다.
//   포트를 열지 않고도 요청을 흉내 낼 수 있습니다.
//   지금 당장 필요하진 않지만, 실무 프로젝트가 거의 다 이 모양입니다.

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const { 번호붙이기 } = require("./middlewares/기록");
const { 없는주소, 에러처리기 } = require("./middlewares/에러처리");

const 설비라우트 = require("./routes/설비라우트");
const 점검기록라우트 = require("./routes/점검기록라우트");
const 사진라우트 = require("./routes/사진라우트");

const app = express();


// ── ① 미들웨어 (라우트보다 위) ──

morgan.token("user", (req) => (req.user ? req.user.name : "-"));
morgan.token("reqid", (req) => (req.요청번호 ? `#${req.요청번호}` : "-"));

app.use(번호붙이기); // morgan 보다 먼저여야 :reqid 가 채워집니다
app.use(morgan(":reqid :method :url :status :response-time ms - :user"));

app.use(express.json());

// 프론트를 따로 띄울 때를 대비해 CORS 를 열어 둡니다.
// 지금은 같은 서버가 화면도 주니 필요 없지만, 껍데기를 만들어 둡니다.
const 허용출처들 = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5500"];

app.use(
  "/api",
  cors({
    origin: (출처, 알려주기) => 알려주기(null, !출처 || 허용출처들.includes(출처)),
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Request-Id"],
    maxAge: 600,
  })
);


// ── ② 라우트 ──

app.use("/api/v1/equipments", 설비라우트);
app.use("/api/v1/logs", 점검기록라우트);
app.use("/api/v1/photos", 사진라우트);


// ── ③ 화면 (API 라우트 아래에) ──
// public 안에 api 라는 폴더가 생겨도 API 가 먼저 걸리게 하려는 것입니다.

app.use(express.static(path.join(__dirname, "public")));


// ── ④ 404 → ⑤ 에러 처리기 (순서를 지켜야 합니다) ──

app.use(없는주소);
app.use(에러처리기);


module.exports = app;

// ============================================================
// 이 순서가 전부입니다
// ============================================================
//
//   ① 미들웨어      번호 → 기록 → 본문 읽기 → CORS
//   ② 라우트        API
//   ③ 정적 파일     화면
//   ④ 404
//   ⑤ 에러 처리기   인자 네 개
//
// 어기면
//   ①을 ② 아래에 두면   req.body 가 undefined
//   ③을 ② 위에 두면     public 에 api 폴더가 있을 때 API 가 안 걸림
//   ④를 ② 위에 두면     모든 요청이 404
//   ⑤를 ④ 위에 두면     라우트 에러는 여전히 ⑤가 잡습니다 (에러는 일반 미들웨어를 건너뜁니다).
//                        대신 ④가 next(에러) 로 넘긴 404 는 이미 지나온 ⑤로 되돌아가지 못해
//                        Express 기본 HTML 에러 페이지로 나갑니다. 그래서 ⑤는 맨 끝입니다.
