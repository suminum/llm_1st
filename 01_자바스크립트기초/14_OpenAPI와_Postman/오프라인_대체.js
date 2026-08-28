// ============================================================
// 오프라인 대체본 — 인터넷이 막혀 있을 때만 켭니다
// ------------------------------------------------------------
// 14단원은 Open-Meteo (api.open-meteo.com) 에서 날씨를 받아 옵니다.
// 학교나 회사 네트워크가 이 주소를 막아 두면 자료가 멈춥니다.
// 그럴 때 이 파일을 켜면 인터넷 없이도 똑같이 동작합니다.
//
//   켜는 법 : HTML 파일 위쪽에서 아래 줄을 찾아 <!-- 와 --> 만 지웁니다.
//
//               <!-- <script src="오프라인_대체.js"></script> -->
//               ^^^^                                          ^^^
//               이것을 지우고                            이것도 지웁니다
//
//   끄는 법 : <!-- 와 --> 를 다시 붙입니다.
//
// 켜져 있으면 콘솔(F12) 맨 위에 안내가 한 줄 찍힙니다.
// ------------------------------------------------------------
// ★ 여기 든 값은 **진짜 서버에서 받아 그대로 저장한 것**입니다.
//   지어낸 값이 아닙니다. 그래서 자료의 설명이 그대로 맞습니다.
//
//   특히 개념01 섹션5 의 "보낸 값과 받은 값이 다르다" 가 살아 있습니다.
//   37.5665 를 보내면 37.55 가 돌아옵니다. 규칙을 흉내 낸 게 아니라
//   진짜로 그렇게 받았기 때문입니다.
//
//   ★★ 처음에는 "0.05도 격자" 라고 계산해서 만들려고 했습니다.
//     그런데 도시를 바꿔 재 보니 안 맞았습니다. (개념01 섹션5)
//     그래서 계산을 버리고 **받은 것을 그대로 저장**했습니다.
//
// ★ 날씨 값(온도·습도)은 저장한 그 순간의 값입니다. 안 바뀝니다.
//   진짜로 켰을 때와 달리 눌러도 같은 값이 나옵니다. 그건 정상입니다.
//
// 이 파일의 내용은 지금 이해하지 않아도 됩니다.
// ============================================================

(function () {
  const 기다림 = 400; // 진짜 서버처럼 조금 기다렸다가 답합니다
  const 대상호스트 = "api.open-meteo.com";

  // 좌표 → 그때 진짜로 받은 응답
  const 녹음 = {
        "37.5665,126.978": {
            "latitude": 37.55,
            "longitude": 127,
            "generationtime_ms": 0.02777576446533203,
            "utc_offset_seconds": 32400,
            "timezone": "Asia/Seoul",
            "timezone_abbreviation": "GMT+9",
            "elevation": 34,
            "current_units": {
                "time": "iso8601",
                "interval": "seconds",
                "temperature_2m": "°C",
                "relative_humidity_2m": "%"
            },
            "current": {
                "time": "2026-08-19T13:00",
                "interval": 900,
                "temperature_2m": 29.7,
                "relative_humidity_2m": 69
            }
        },
        "37,127": {
            "latitude": 37,
            "longitude": 127,
            "generationtime_ms": 0.016450881958007812,
            "utc_offset_seconds": 0,
            "timezone": "GMT",
            "timezone_abbreviation": "GMT",
            "elevation": 5,
            "current_units": {
                "time": "iso8601",
                "interval": "seconds",
                "temperature_2m": "°C"
            },
            "current": {
                "time": "2026-08-19T04:00",
                "interval": 900,
                "temperature_2m": 31.3
            }
        },
        "35.1796,129.0756": {
            "latitude": 35.2,
            "longitude": 129.0625,
            "generationtime_ms": 0.02753734588623047,
            "utc_offset_seconds": 32400,
            "timezone": "Asia/Seoul",
            "timezone_abbreviation": "GMT+9",
            "elevation": 26,
            "current_units": {
                "time": "iso8601",
                "interval": "seconds",
                "temperature_2m": "°C",
                "relative_humidity_2m": "%"
            },
            "current": {
                "time": "2026-08-19T13:00",
                "interval": 900,
                "temperature_2m": 29.9,
                "relative_humidity_2m": 74
            }
        },
        "33.4996,126.5312": {
            "latitude": 33.5,
            "longitude": 126.5,
            "generationtime_ms": 0.038743019104003906,
            "utc_offset_seconds": 32400,
            "timezone": "Asia/Seoul",
            "timezone_abbreviation": "GMT+9",
            "elevation": 63,
            "current_units": {
                "time": "iso8601",
                "interval": "seconds",
                "temperature_2m": "°C",
                "relative_humidity_2m": "%"
            },
            "current": {
                "time": "2026-08-19T13:00",
                "interval": 900,
                "temperature_2m": 28.7,
                "relative_humidity_2m": 81
            }
        }
    };

  // 원래 fetch 는 남겨 둡니다.
  // Open-Meteo 가 아닌 주소는 진짜로 요청합니다.
  // (개념05 의 CORS 실습은 진짜로 막혀야 하니까요)
  const 진짜fetch = window.fetch ? window.fetch.bind(window) : null;

  // ★ 시간 제한(signal)을 지켜야 합니다.
  //   안 지키면 개념05 의 타임아웃 실습과 연습문제 7번이 죽습니다.
  //   처음에 이걸 빠뜨려서 "1밀리초 만에 성공" 하는 일이 있었습니다.
  function 쉬기(밀리초, 신호) {
    return new Promise((풀기, 튕기기) => {
      const 그만 = () =>
        튕기기(신호.reason ?? new DOMException("The operation was aborted.", "AbortError"));

      if (신호 && 신호.aborted) return 그만();

      const 표 = setTimeout(풀기, 밀리초);

      if (신호) {
        신호.addEventListener(
          "abort",
          () => {
            clearTimeout(표);
            그만();
          },
          { once: true },
        );
      }
    });
  }

  function 응답만들기(주소, 상태, 자료) {
    return {
      ok: 상태 >= 200 && 상태 < 300,
      status: 상태,
      statusText: 상태 === 200 ? "OK" : "Bad Request",
      url: 주소,
      redirected: false,
      type: "basic",
      headers: {
        get(이름) {
          const 소문자 = String(이름).toLowerCase();
          if (소문자 === "content-type") return "application/json; charset=utf-8";
          if (소문자 === "access-control-allow-origin") return "*";
          return null;
        },
      },
      async json() {
        return JSON.parse(JSON.stringify(자료));
      },
      async text() {
        return JSON.stringify(자료);
      },
    };
  }

  window.fetch = async function (들어온것, 옵션) {
    const 주소글 = 들어온것 instanceof Request ? 들어온것.url : String(들어온것);

    let 주소;
    try {
      주소 = new URL(주소글, window.location.href);
    } catch (오류) {
      return 진짜fetch ? 진짜fetch(들어온것, 옵션) : Promise.reject(오류);
    }

    // 우리 대상이 아니면 진짜로 보냅니다
    if (주소.hostname !== 대상호스트) {
      if (!진짜fetch) return Promise.reject(new TypeError("Failed to fetch"));
      return 진짜fetch(들어온것, 옵션);
    }

    // ★ 옵션의 signal 을 그대로 지킵니다. Request 로 넘어온 경우도 봅니다.
    const 신호 = (옵션 && 옵션.signal) || (들어온것 instanceof Request ? 들어온것.signal : null);
    await 쉬기(기다림, 신호);

    const 위도 = 주소.searchParams.get("latitude");
    const 경도 = 주소.searchParams.get("longitude");

    // ★ 위도·경도가 없으면 진짜 서버도 400 을 냅니다. 그대로 흉내 냅니다.
    if (위도 === null || 경도 === null) {
      return 응답만들기(주소글, 400, {
        error: true,
        reason: "Cannot initialize WeatherVariable from invalid String value",
      });
    }

    const 열쇠 = `${Number(위도)},${Number(경도)}`;
    const 찾은것 = 녹음[열쇠];

    if (!찾은것) {
      // 저장해 둔 좌표가 아닙니다. 있는 것을 알려 줍니다.
      console.warn(
        `[오프라인 대체본] ${열쇠} 는 저장해 두지 않은 좌표입니다.\n` +
          `저장된 좌표: ${Object.keys(녹음).join(" / ")}`,
      );
      return 응답만들기(주소글, 400, {
        error: true,
        reason: "오프라인 대체본에 저장되지 않은 좌표입니다",
      });
    }

    return 응답만들기(주소글, 200, 찾은것);
  };

  console.log(
    "%c[오프라인 대체본이 켜져 있습니다] api.open-meteo.com 요청은 저장된 값으로 답합니다. " +
      "인터넷이 되면 이 파일을 다시 주석 처리하세요.",
    "background:#fff8dc; color:#8a6d00; padding:2px 6px;",
  );
})();
