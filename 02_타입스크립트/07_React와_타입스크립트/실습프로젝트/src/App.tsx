// ============================================================
// 예제 고르기 화면 — 07단원의 예제를 왼쪽 목록에서 골라 봅니다
// ------------------------------------------------------------
// 이 파일도 자료가 미리 만들어 둔 '틀'입니다. 고치지 않아도 됩니다.
//
// 단원 폴더에 .tsx 파일을 새로 만들면 왼쪽 목록에 저절로 나타납니다.
// (React자료 실습프로젝트와 같은 구조입니다. 타입만 붙었습니다)
// ============================================================

import { Suspense, lazy, useState, useMemo } from "react";
import type { ComponentType } from "react";
import ErrorBox from "./_ui/ErrorBox.tsx";

// 단원 폴더 안의 모든 예제 파일을 자동으로 찾아 옵니다.
const modules = import.meta.glob<{ default: ComponentType }>(
  "./[0-9][0-9]_*/*.tsx",
);

type Item = {
  path: string;
  unit: string;
  unitLabel: string;
  title: string;
};

// "./07_React와_타입스크립트/개념01_props에_타입_붙이기.tsx"
//   → { unit: "07_React와_타입스크립트", title: "개념01 props에 타입 붙이기" }
function parse(path: string): Item {
  const parts = path.split("/");
  const unit = parts[1] ?? "";
  const file = parts[2] ?? "";
  return {
    path,
    unit,
    unitLabel: unit.replace(/_/g, " "),
    title: file.replace(/\.tsx$/, "").replace(/_/g, " "),
  };
}

const items: Item[] = Object.keys(modules)
  .map(parse)
  .sort((a, b) => a.path.localeCompare(b.path, "ko"));

type Unit = { unit: string; label: string; items: Item[] };

const units: Unit[] = [];
for (const item of items) {
  const found = units.find((u) => u.unit === item.unit);
  if (found) found.items.push(item);
  else units.push({ unit: item.unit, label: item.unitLabel, items: [item] });
}

export default function App() {
  const [current, setCurrent] = useState<string | null>(items[0]?.path ?? null);

  // 고른 예제만 그때그때 불러옵니다. 한 파일이 망가져도 나머지는 볼 수 있습니다.
  const Current = useMemo(() => {
    if (current === null) return null;
    const loader = modules[current];
    if (loader === undefined) return null;
    return lazy(loader);
  }, [current]);

  return (
    <div className="layout">
      <nav className="sidebar">
        <h1>TS자료 07단원</h1>
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
        {Current !== null && (
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
