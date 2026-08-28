// 이 파일도 서버가 준 것입니다. 그래서 같은 출처라 CORS 문제가 없습니다.
document.querySelector("#불러오기").addEventListener("click", async () => {
  const 목록 = document.querySelector("#목록");
  목록.textContent = "불러오는 중...";

  try {
    // 주소를 "/api/..." 로만 씁니다. 지금 페이지와 같은 곳으로 갑니다.
    const 응답 = await fetch("/api/v1/equipments");
    const 답 = await 응답.json();

    목록.innerHTML = "";
    for (const 설비 of 답.data) {
      const li = document.createElement("li");
      li.textContent = `${설비.id}. ${설비.name} (${설비.line}라인 · ${설비.status})`;
      목록.appendChild(li);
    }
  } catch (에러) {
    목록.textContent = "불러오지 못했습니다: " + 에러.message;
  }
});
