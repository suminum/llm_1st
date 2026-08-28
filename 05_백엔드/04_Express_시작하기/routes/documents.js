// ============================================================
// routes/documents.js — 문서 관련 라우트만 모아 둔 파일
// ------------------------------------------------------------
// 이 파일은 직접 실행하지 않습니다.
// 개념05_nodemon과_파일_나누기.js 가 불러다 씁니다.
// ============================================================

const express = require("express");

// ★ express() 가 아니라 express.Router() 입니다.
//   Router 는 '작은 app' 이라고 생각하면 됩니다.
//   app 처럼 get / post / use 를 다 쓸 수 있지만, 혼자서는 서버가 못 됩니다.
//   누군가(app)가 데려다 붙여 줘야 동작합니다.
const router = express.Router();


// 데이터는 일단 여기 둡니다. PART 4 에서 데이터베이스로 옮깁니다.
let 문서들 = [
  { id: 1, title: "작업표준서" },
  { id: 2, title: "검사성적서" },
];

let 다음번호 = 3;


// ★★ 주소를 쓸 때 "/documents" 를 적지 않습니다.
//   여기서는 '/' 하나만 적습니다.
//   앞에 붙일 "/documents" 는 데려가는 쪽(app)이 정합니다.
//
//     app.use("/documents", router)  +  router.get("/")     →  GET /documents
//     app.use("/documents", router)  +  router.get("/:id")  →  GET /documents/:id
//
//   이렇게 하면 나중에 주소를 /api/documents 로 바꿀 때
//   이 파일은 하나도 안 고쳐도 됩니다. 부르는 쪽 한 줄만 고치면 끝입니다.

router.get("/", (req, res) => {
  res.json(문서들);
});

router.get("/:id", (req, res) => {
  const 번호 = Number(req.params.id);
  const 문서 = 문서들.find((문서) => 문서.id === 번호);

  if (!문서) {
    return res.status(404).json({ error: `${번호}번 문서가 없습니다` });
  }

  res.json(문서);
});

router.post("/", (req, res) => {
  const { title } = req.body || {};

  if (!title) {
    return res.status(400).json({ error: "title 을 넣어 주세요" });
  }

  const 새문서 = { id: 다음번호, title };
  다음번호 += 1;
  문서들.push(새문서);

  res.status(201).json(새문서);
});

router.delete("/:id", (req, res) => {
  const 번호 = Number(req.params.id);
  const 있나 = 문서들.some((문서) => 문서.id === 번호);

  if (!있나) {
    return res.status(404).json({ error: `${번호}번 문서가 없습니다` });
  }

  문서들 = 문서들.filter((문서) => 문서.id !== 번호);
  res.sendStatus(204);
});


// ★ 만든 라우터를 내보냅니다. 01단원에서 배운 module.exports 그대로입니다.
module.exports = router;

// 내보내는 것을 잊으면 부르는 쪽에서 이렇게 됩니다.
//   TypeError: Router.use() requires a middleware function but got a Object
// "라우터를 달라고 했는데 빈 객체가 왔다" 는 뜻입니다.
