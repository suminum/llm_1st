// ============================================================
// middlewares/검증.js — 들어온 값의 모양을 확인한다
// ------------------------------------------------------------
// 개념04 에서 만든 것을 파일로 옮겼습니다.
// ============================================================

const { HttpError } = require("../utils/HttpError");

// 필수 값이 있는지만 본다
function 필수값(...키들) {
  return (req, res, next) => {
    const 본문 = req.body || {};
    const 빠진것 = 키들.filter((키) => 본문[키] === undefined || 본문[키] === "");

    if (빠진것.length > 0) {
      return next(HttpError(400, `${빠진것.join(", ")} 을(를) 넣어 주세요`));
    }

    next();
  };
}

// 규칙 하나를 값 하나에 대고 확인한다. 문제가 없으면 null.
function 한줄검사(규칙, 값) {
  if (값 === undefined || 값 === "") {
    return 규칙.필수 ? "필수입니다" : null;
  }

  if (규칙.타입 && typeof 값 !== 규칙.타입) {
    return `${규칙.타입} 이어야 합니다 (지금은 ${typeof 값})`;
  }

  if (규칙.허용 && !규칙.허용.includes(값)) {
    return `${규칙.허용.join(", ")} 중 하나여야 합니다`;
  }

  if (규칙.최소길이 !== undefined && 값.length < 규칙.최소길이) {
    return `${규칙.최소길이}글자 이상이어야 합니다`;
  }

  if (규칙.최대길이 !== undefined && 값.length > 규칙.최대길이) {
    return `${규칙.최대길이}글자 이하여야 합니다`;
  }

  if (규칙.최소 !== undefined && 값 < 규칙.최소) {
    return `${규칙.최소} 이상이어야 합니다`;
  }

  if (규칙.최대 !== undefined && 값 > 규칙.최대) {
    return `${규칙.최대} 이하여야 합니다`;
  }

  return null;
}

// 규칙 표를 받아 미들웨어를 만든다
function 검증(규칙들) {
  return (req, res, next) => {
    const 본문 = req.body || {};
    const 항목 = [];

    for (const 규칙 of 규칙들) {
      const 이유 = 한줄검사(규칙, 본문[규칙.키]);

      if (이유) {
        항목.push({ 키: 규칙.키, 이유 });
      }
    }

    if (항목.length > 0) {
      return res.status(400).json({ error: "입력값이 올바르지 않습니다", 항목 });
    }

    next();
  };
}

module.exports = { 필수값, 검증, 한줄검사 };

// ★ 한줄검사 도 내보낸 이유
//   나중에 이 함수만 따로 시험해 보고 싶을 때가 옵니다.
//   서버를 안 켜고 node 로 부를 수 있습니다.
//     const { 한줄검사 } = require("./middlewares/검증");
//     console.log(한줄검사({ 필수: true }, undefined));   →  필수입니다
