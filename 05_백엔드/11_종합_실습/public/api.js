// ============================================================
// public/api.js — 서버와 이야기하는 부분을 한곳에 모은다
// ------------------------------------------------------------
// 10단원의 api.js 에 '증표 붙이기' 를 더했습니다.
// ============================================================
//
// 이 프로젝트는 로그인이 있습니다. (05단원의 Bearer 방식)
// 모든 요청에 Authorization 헤더를 붙여야 하는데,
// 화면마다 붙이면 한 군데를 빠뜨리고 그 요청만 401 이 납니다.
//
// 그래서 여기서 한 번만 붙입니다.

// 지금 고른 증표를 알려 주는 함수. 화면이 정해 줍니다.
let 증표가져오기 = () => null;

function 증표설정(함수) {
  증표가져오기 = 함수;
}

class API에러 extends Error {
  constructor(status, 봉투) {
    super(봉투?.message ?? "요청에 실패했습니다");

    this.name = "API에러";
    this.status = status;
    this.code = 봉투?.code ?? "UNKNOWN";
    this.details = 봉투?.details;
  }
}

async function 호출(경로, 옵션 = {}) {
  const 헤더 = { ...(옵션.headers ?? {}) };
  const 증표 = 증표가져오기();

  // ★ 증표가 있을 때만 붙입니다.
  //   빈 값으로 붙이면 "Bearer " 가 되어 형식 오류로 401 이 납니다.
  if (증표) 헤더.Authorization = `Bearer ${증표}`;

  let 응답;

  try {
    응답 = await fetch(경로, { ...옵션, headers: 헤더 });
  } catch {
    // 서버에 닿지도 못한 경우입니다. 404·500 은 여기로 안 옵니다.
    throw new API에러(0, { code: "NETWORK", message: "서버에 연결하지 못했습니다" });
  }

  if (응답.status === 204) return { data: null }; // 본문이 없습니다

  let 몸통;

  try {
    몸통 = await 응답.json();
  } catch {
    // HTML 에러 페이지가 온 경우가 대부분입니다.
    throw new API에러(응답.status, { code: "BAD_RESPONSE", message: "서버 응답을 읽지 못했습니다" });
  }

  if (몸통.error) throw new API에러(응답.status, 몸통.error);

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

  // ★ 파일 업로드에는 Content-Type 을 직접 쓰지 않습니다. (09단원 개념01)
  //   FormData 를 넣으면 브라우저가 boundary 와 함께 붙여 줍니다.
  올리기: (경로, 폼데이터) => 호출(경로, { method: "POST", body: 폼데이터 }),

  증표설정,
};
