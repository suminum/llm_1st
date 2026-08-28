// ============================================================
// repositories/기본저장소.js — JSON 파일 저장소를 만들어 주는 함수
// ------------------------------------------------------------
// 07단원에서 저장소 두 개가 거의 같은 코드였습니다.
// 세 번째가 생기기 전에 공통 부분을 묶었습니다.
// ============================================================
//
// ★ 07단원 연습문제 ⑤의 답입니다.
//   "같은 걸 세 번 쓰면 그때 묶는다" 가 흔한 기준입니다.
//   여기서는 설비·점검기록·사진 셋이라 묶을 때가 됐습니다.

const fs = require("fs");
const path = require("path");

function 저장소만들기(파일이름) {
  const 파일경로 = path.join(__dirname, "..", "data", 파일이름);
  fs.mkdirSync(path.dirname(파일경로), { recursive: true });

  // 쓰기를 줄 세웁니다. 동시에 쓰면 사라집니다. (07단원 개념04)
  let 대기줄 = Promise.resolve();

  function 줄서서(작업) {
    const 다음 = 대기줄.then(작업, 작업);
    대기줄 = 다음.catch(() => {});
    return 다음;
  }

  async function 읽기() {
    try {
      return JSON.parse(await fs.promises.readFile(파일경로, "utf8"));
    } catch (에러) {
      if (에러.code === "ENOENT") return [];
      throw 에러; // ★ 없는 것과 못 읽는 것은 다릅니다
    }
  }

  // 임시 파일에 쓰고 이름을 바꿉니다. 쓰다가 죽어도 안 깨집니다.
  async function 쓰기(목록) {
    const 임시 = `${파일경로}.tmp`;
    await fs.promises.writeFile(임시, JSON.stringify(목록, null, 2), "utf8");
    await fs.promises.rename(임시, 파일경로);
  }

  return {
    전부: () => 읽기(),

    찾기: async (조건) => (await 읽기()).filter(조건),

    하나: async (id) => (await 읽기()).find((항목) => 항목.id === id) ?? null,

    추가: (값) =>
      줄서서(async () => {
        const 목록 = await 읽기();
        const 다음번호 = 목록.length === 0 ? 1 : Math.max(...목록.map((항목) => 항목.id)) + 1;
        const 새것 = { id: 다음번호, ...값 };

        목록.push(새것);
        await 쓰기(목록);

        return 새것;
      }),

    수정: (id, 바꿀것) =>
      줄서서(async () => {
        const 목록 = await 읽기();
        const 자리 = 목록.findIndex((항목) => 항목.id === id);

        if (자리 === -1) return null; // ★ findIndex 는 -1 입니다

        목록[자리] = { ...목록[자리], ...바꿀것, id }; // id 는 못 바꾸게
        await 쓰기(목록);

        return 목록[자리];
      }),

    삭제: (id) =>
      줄서서(async () => {
        const 목록 = await 읽기();
        const 남길것 = 목록.filter((항목) => 항목.id !== id);

        if (남길것.length === 목록.length) return false;

        await 쓰기(남길것);
        return true;
      }),

    초기화: (목록) => 줄서서(() => 쓰기(목록)),
  };
}

module.exports = { 저장소만들기 };

// ★ 이 파일 하나만 고치면 저장 방법이 통째로 바뀝니다.
//   PART 4 에서 데이터베이스로 옮길 때, 여기만 다시 쓰면 됩니다.
//   services·controllers·routes 는 한 줄도 안 고칩니다.
