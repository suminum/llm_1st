// ============================================================
// 예제 고르기 화면 — 모든 단원의 예제를 왼쪽 목록에서 골라 봅니다
// ------------------------------------------------------------
// 이 파일도 자료가 미리 만들어 둔 '틀'입니다. 고치지 않아도 됩니다.
//
// 여러분이 할 일은 단원 폴더(src/01_... 같은)의 파일을 열어서 읽고 고치는 것입니다.
// 그 폴더에 .jsx 파일을 새로 만들면 왼쪽 목록에 저절로 나타납니다.
// ============================================================

import { Suspense, lazy, useState, useMemo } from "react";
import ErrorBox from "./_ui/ErrorBox.jsx";

// 단원 폴더 안의 모든 예제 파일을 자동으로 찾아 옵니다.
// (15단원 부록은 .tsx 라서 둘 다 봅니다)
const modules = import.meta.glob("./[0-9][0-9]_*/*.{jsx,tsx}");

// "./01_React_시작하기/개념01_왜_React를_쓰나.jsx"
//   → { unit: "01_React_시작하기", title: "개념01 왜 React를 쓰나" }
function parse(path) {
  const [, unit, file] = path.split("/");
  return {
    path,
    unit,
    unitLabel: unit.replace(/_/g, " "),
    title: file.replace(/\.(jsx|tsx)$/, "").replace(/_/g, " "),
  };
}

const items = Object.keys(modules).map(parse).sort((a, b) => a.path.localeCompare(b.path, "ko"));

const units = [];
for (const item of items) {
  const found = units.find((u) => u.unit === item.unit);
  if (found) found.items.push(item);
  else units.push({ unit: item.unit, label: item.unitLabel, items: [item] });
}

export default function App() {
  const [current, setCurrent] = useState(items[0] ? items[0].path : null);

  // 고른 예제만 그때그때 불러옵니다. 한 파일이 망가져도 나머지는 볼 수 있습니다.
  const Current = useMemo(
    () => (current ? lazy(modules[current]) : null),
    [current]
  );

  return (
    <div className="layout">
      <nav className="sidebar">
        <h1>React 자료</h1>
        {units.length === 0 && (
          <p className="empty">
            아직 예제가 없습니다.
            <br />
            src 안에 단원 폴더를 만들어 보세요.
          </p>
        )}
        {units.map((unit) => (
          <section key={unit.unit}>
            <h2>{unit.label}</h2>
            <ul>
              {unit.items.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    className={item.path === current ? "navBtn on" : "navBtn"}
                    onClick={() => setCurrent(item.path)}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <main className="stage">
        {Current && (
          <ErrorBox key={current}>
            <Suspense fallback={<p>불러오는 중…</p>}>
              <Current />
            </Suspense>
          </ErrorBox>
        )}
      </main>
    </div>
  );
}
