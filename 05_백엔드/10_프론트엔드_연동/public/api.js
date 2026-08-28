// ============================================================
// public/api.js — 서버와 이야기하는 부분을 한곳에 모은다
// ------------------------------------------------------------
// 10단원의 모든 화면이 이 파일을 씁니다.
// ============================================================
//
// 왜 따로 빼나
//   화면마다 fetch 를 직접 쓰면, 에러 처리를 화면 수만큼 반복하게 됩니다.
//   그러다 한 군데를 빠뜨리면 그 화면만 조용히 이상해집니다.
//
//   06단원에서 응답 형식을 통일해 둔 덕에, 처리도 한곳에 모을 수 있습니다.
//
//     성공  { "data": ... , "meta": {...} }
//     실패  { "error": { "code": "...", "message": "...", "details": [...] } }

// 서버가 준 에러를 그대로 담아 두는 에러입니다.
// 화면에서 code 로 판단하고 message 를 보여 줄 수 있습니다.
class API에러 extends Error {
  constructor(status, 봉투) {
    super(봉투?.message ?? "요청에 실패했습니다");

    this.name = "API에러";
    this.status = status;
    this.code = 봉투?.code ?? "UNKNOWN";
    this.details = 봉투?.details;
  }
}

// 모든 요청이 여기를 지나갑니다.
async function 호출(경로, 옵션 = {}) {
  let 응답;

  try {
    응답 = await fetch(경로, 옵션);
  } catch (에러) {
    // ★ fetch 가 던지는 경우는 '서버에 닿지도 못한' 경우입니다.
    //   서버가 꺼졌거나, 인터넷이 끊겼거나, CORS 로 막혔거나. (08단원)
    //   404·500 은 여기로 안 옵니다. 응답이 왔으니까요.
    throw new API에러(0, { code: "NETWORK", message: "서버에 연결하지 못했습니다" });
  }

  // 204 는 본문이 없습니다. json() 을 부르면 터집니다.
  if (응답.status === 204) return { data: null };

  let 몸통;

  try {
    몸통 = await 응답.json();
  } catch {
    // JSON 이 아닌 응답. HTML 에러 페이지가 온 경우가 대부분입니다.
    throw new API에러(응답.status, { code: "BAD_RESPONSE", message: "서버 응답을 읽지 못했습니다" });
  }

  // ★ res.ok 가 아니라 몸통.error 로 판단합니다.
  //   06단원에서 "성공에는 error 가 없고 실패에는 data 가 없다" 고 정했기 때문입니다.
  //   둘 다 봐도 되지만, 하나로 정하는 편이 헷갈리지 않습니다.
  if (몸통.error) {
    throw new API에러(응답.status, 몸통.error);
  }

  return 몸통;
}

const api = {
  get: (경로) => 호출(경로),

  post: (경로, 값) =>
    호출(경로, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(값),
    }),

  patch: (경로, 값) =>
    호출(경로, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(값),
    }),

  del: (경로) => 호출(경로, { method: "DELETE" }),

  // 파일 업로드는 Content-Type 을 직접 쓰면 안 됩니다. (09단원 개념01)
  올리기: (경로, 폼데이터) => 호출(경로, { method: "POST", body: 폼데이터 }),
};

// ★ delete 는 자바스크립트 예약어라 속성 이름으로는 되지만 헷갈립니다.
//   그래서 del 로 지었습니다. api.delete 로 써도 동작은 합니다.
