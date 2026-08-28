// ============================================================
// 08단원 · 개념 03 — tsconfig 읽기 · 그리고 다음 단계
// ------------------------------------------------------------
// 실행: node 개념03_tsconfig와_다음_단계.ts
// 검사: npm run typecheck
// ============================================================
//
// 01단원에서 "tsconfig.json 은 고치지 마세요" 라고 했습니다.
// 이제 마지막 단원이니 그 안에 뭐가 있는지 봅니다.
//
// 그리고 이 자료가 끝난 뒤 무엇을 더 보면 되는지로 마무리합니다.


// ── 섹션 1: 이 자료의 tsconfig ──

// TS자료 폴더의 tsconfig.json 을 열어 보세요. 이렇게 되어 있습니다.
//
//     "target": "ES2022"          어느 시대의 자바스크립트로 볼 것인가
//     "lib": ["ES2022"]           쓸 수 있는 내장 기능 목록
//     "module": "NodeNext"        import/export 를 어떤 방식으로 볼 것인가
//     "types": ["node"]           console 같은 Node 기능을 알게 해 줌
//     "strict": true              ★ 이것이 핵심입니다
//     "noEmit": true              파일은 만들지 말고 검사만
//     "erasableSyntaxOnly": true  node 가 지우지 못하는 문법을 미리 막음
//
// 07단원의 실습프로젝트는 이 둘이 핵심적으로 다릅니다.
//
//     "jsx": "react-jsx"          .tsx 안의 태그를 이해하게 함
//     "lib": [..., "DOM"]         브라우저라서 document·window 를 앎
//
// 나머지 차이는 '무엇으로 돌리느냐' 때문에 따라오는 것들입니다.
// node 로 돌리는 쪽은 module/types 가 node 쪽이고,
// Vite(번들러)로 돌리는 쪽은 bundler 쪽입니다. 세어 보면 열 곳쯤 됩니다.
//
//     node 쪽                     Vite 쪽
//     module: NodeNext            module: ESNext
//     moduleResolution: nodenext  moduleResolution: bundler
//     types: ["node"]             types: ["vite/client"]
//     erasableSyntaxOnly: true    (없음 — 번들러가 처리하므로 필요 없음)
//
// 중요한 것은 strict · noEmit · target 이 양쪽 다 같다는 점입니다.
// 그 셋이 '타입을 어떻게 볼 것인가' 를 정하고, 나머지는 '어디서 돌리는가' 일 뿐입니다.

const 핵심설정 = ["strict", "noEmit", "target", "lib"];
console.log(핵심설정.length + "개만 알면 됩니다");
// 출력: 4개만 알면 됩니다

// ✏️ 직접 해보기 1 — TS자료의 tsconfig.json 을 열어
//    07단원 실습프로젝트의 것과 나란히 놓고 비교해 보세요.


// ── 섹션 2: strict 가 켜는 것 ──

// strict: true 는 스위치 여러 개를 한 번에 켜는 묶음입니다.
// 그중 이 자료에서 실제로 겪은 것이 둘입니다.
//
// [noImplicitAny] 매개변수에 타입을 안 적으면 걸린다
//
//     function f(x) { }   →  TS7006 Parameter 'x' implicitly has an 'any' type.
//
//   03단원부터 계속 만난 그 에러입니다.
//   이걸 끄면 x 가 조용히 any 가 됩니다. 02단원에서 본 그 위험 그대로입니다.
//
// [strictNullChecks] null 과 undefined 를 다른 값으로 본다
//
//     const s: string = null;   →  TS2322
//     v.length (v 가 없을 수 있음)  →  TS18047 / TS18048
//
//   05단원 전체가 이 설정 덕분에 의미가 있습니다.
//   이걸 끄면 모든 타입에 null 이 몰래 들어갈 수 있게 되어,
//   "Cannot read properties of null" 을 타입스크립트가 못 막습니다.
//
// 그래서 규칙은 하나입니다.
//
//     ★ strict 는 끄지 않는다.
//
// 인터넷에 "에러가 많이 나면 strict 를 끄세요" 라는 글이 있습니다.
// 그건 타입스크립트를 쓰는 이유를 없애는 것입니다.
// 에러가 많으면 08단원 개념02처럼 한 파일씩 옮기세요.

// ✏️ 직접 해보기 2 — const s: string = null; 을 써 보세요.
//    무슨 에러가 나나요? 이 에러가 안 난다면 strict 가 꺼진 것입니다.


// ── 섹션 3: 더 켤 만한 것 하나 ──

// strict 에 안 들어 있지만 실무에서 자주 켜는 것이 있습니다.
//
//     "noUncheckedIndexedAccess": true
//
// 배열에서 꺼낸 값에 undefined 를 붙여 줍니다.
const menus = ["아메리카노", "라떼"];
const tenth = menus[10];

// 지금 설정에서는 tenth 가 string 입니다. 실제로는 undefined 인데도요.
console.log(tenth === undefined ? "없음" : tenth);
// 출력: 없음

// 이 설정을 켜면 tenth 가 string | undefined 가 되어,
// 확인 없이 tenth.length 를 쓰면 TS18048 로 막힙니다.
//
// 직접 확인해 보려면 이렇게 쳐 보세요.
//
//     npx tsc --noEmit --strict --noUncheckedIndexedAccess ^
//       --target ES2022 --lib ES2022 --module nodenext --moduleResolution nodenext ^
//       --types node --ignoreConfig 08_기존_프로젝트에_타입_입히기/개념03_tsconfig와_다음_단계.ts
//
// 이 자료는 이 설정을 끈 채로 두었습니다.
// 초보자에게는 배열을 쓸 때마다 확인이 붙어서 부담이 크기 때문입니다.
// 다만 06단원 개념03 ✏️와 08단원 개념02에서 ?. 를 붙여 둔 이유가 이것입니다.
// 습관을 들여 두면 나중에 이 설정을 켤 때 고칠 것이 적습니다.

// ✏️ 직접 해보기 3 — menus[10].length 를 지금 설정에서 써 보세요. 걸리나요?
//    실행하면 어떻게 되나요?


// ── 섹션 4: 실무에서 같이 쓰는 것 ──

// [zod] 밖에서 온 값을 진짜로 확인해 주는 도구
//
//   04단원 개념04에서 "타입은 약속이지 검사가 아니다" 라고 했습니다.
//   그래서 손으로 확인하는 코드를 썼는데, 길었습니다.
//   zod 는 그 일을 대신해 줍니다. 모양을 한 번 적으면
//   '검사' 와 '타입' 을 둘 다 만들어 줍니다.
//
//     const Menu = z.object({ name: z.string(), price: z.number() });
//     const menu = Menu.parse(await res.json());   // 틀리면 여기서 에러를 던짐
//
//   서버 데이터를 다루기 시작하면 반드시 만나게 됩니다.
//
// [ESLint] 규칙을 자동으로 지켜 주는 도구
//
//   "any 를 쓰지 마세요" 같은 이 자료의 규칙을 기계가 검사하게 할 수 있습니다.
//   사람이 리뷰에서 매번 지적하지 않아도 됩니다.
//
// [유틸리티 타입] Partial · Pick · Omit · Record
//
//   이미 있는 타입을 조금 바꿔서 새 타입을 만드는 도구입니다.
//
//     Partial<Menu>       모든 속성을 선택으로
//     Pick<Menu, "name">  name 만 뽑아서
//     Omit<Menu, "price"> price 만 빼고
//
//   이 자료에서 일부러 뺐습니다. 지금 외워도 쓸 자리가 없어서 잊어버립니다.
//   "같은 타입을 조금씩 바꿔 여러 개 만들고 있다" 는 생각이 들 때 찾아보세요.

const 다음에볼것 = ["zod", "ESLint", "유틸리티 타입"];
console.log(다음에볼것.join(", "));
// 출력: zod, ESLint, 유틸리티 타입

// ✏️ 직접 해보기 4 — 04단원 개념04 섹션4의 readMenu 를 다시 보세요.
//    zod 가 대신해 주는 일이 무엇인지 말해 보세요.


// ── 섹션 5: 이 자료에서 일부러 안 다룬 것 ──

// 다음 것들은 이 자료에 없습니다. 없다는 것을 아는 것도 중요합니다.
//
//     · 조건부 타입 (T extends U ? A : B)
//     · 매핑된 타입 ({ [K in keyof T]: ... })
//     · 데코레이터
//     · enum  (node 가 못 지우는 문법이라 이 자료에서는 아예 막아 두었습니다)
//     · 네임스페이스 (옛날 방식입니다. 쓸 일 없습니다)
//
// 앞의 둘은 '타입 체조' 라고 부르는 영역입니다.
// 라이브러리를 만드는 사람에게는 필요하지만, 화면과 기능을 만드는 일에는 거의 안 씁니다.
// 필요해지는 날이 오면 그때 배워도 늦지 않습니다.

// enum 대신 무엇을 쓰냐면, 이미 배운 것을 씁니다.
type Status = "대기" | "조리중" | "완료";
const statuses: Status[] = ["대기", "조리중", "완료"];
console.log(statuses[0]);
// 출력: 대기

// 05단원의 리터럴 유니온이 enum 이 하려던 일을 거의 다 합니다.
// 게다가 실행할 때 아무것도 안 남기고 사라집니다. enum 은 코드를 남깁니다.

// ✏️ 직접 해보기 5 — enum Color { Red } 를 써 보세요.
//    무슨 에러가 나나요? (힌트: erasableSyntaxOnly)


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] 에러가 많다고 strict 를 끄기
//   타입스크립트를 쓰는 이유를 없애는 것입니다.
//   개념02처럼 한 파일씩 옮기세요.

// [실수 2] tsconfig 를 인터넷에서 통째로 복사해 오기
//   무슨 설정인지 모르는 줄이 스무 개쯤 붙어 옵니다.
//   섹션 1의 일곱 줄에서 시작해서 필요할 때 하나씩 더하세요.

// [실수 3] 배열에서 꺼낸 값을 확인 없이 쓰기
//   기본 설정에서는 안 걸립니다. 그래서 더 위험합니다.
//   빈 배열일 수 있는 자리에는 ?. 를 붙이는 습관을 들이세요.

// [실수 4] 유틸리티 타입이나 타입 체조를 먼저 공부하기
//   쓸 자리가 생기기 전에 외우면 그냥 잊어버립니다.
//   필요해지는 순간이 오면 그때 찾아보세요.


// ── 섹션 7: 정리하며 ──
// (✏️ 없음: 자료 전체를 마무리하는 섹션입니다)
// 이 자료가 정한 규칙 셋을 다시 확인하고 끝냅니다.
//
//     any 를 쓰지 않는다    (02단원 개념03)
//     ! 를 쓰지 않는다      (05단원 개념03)
//     as 를 쓰지 않는다     (08단원 개념01)
//
// 셋 다 "검사를 끄는 도구" 입니다.
// 셋 다 "검사는 통과하는데 돌리면 터진다" 를 만듭니다.
//
// 타입 에러가 났을 때 이 셋 중 하나가 떠오르면,
// 그건 대개 아직 안 배운 것이 있다는 신호였습니다. 이제는 다 배웠습니다.
//
//     모양을 못 적겠다   →  04단원
//     확인을 못 하겠다   →  05단원
//     타입마다 함수를 또 만들고 있다  →  06단원

const 규칙 = ["any 금지", "! 금지", "as 금지"];
console.log("규칙 " + 규칙.length + "개: " + 규칙.join(" / "));
// 출력: 규칙 3개: any 금지 / ! 금지 / as 금지


// ── 정리 ──

// 1. tsconfig 에서 실제로 중요한 것은 strict 하나다.
// 2. strict 는 noImplicitAny 와 strictNullChecks 를 켠다.
//    이 둘이 이 자료의 03단원과 05단원을 의미 있게 만든다.
// 3. 에러가 많다고 strict 를 끄지 않는다. 한 파일씩 옮긴다.
// 4. noUncheckedIndexedAccess 는 배열 꺼내기까지 확인하게 한다.
//    이 자료는 껐지만, ?. 를 붙이는 습관을 들여 두면 나중에 편하다.
// 5. 다음에 볼 것 — zod(밖에서 온 값 확인) · ESLint(규칙 자동 검사) · 유틸리티 타입.
// 6. 타입 체조와 enum 은 안 배워도 된다. 리터럴 유니온이 enum 을 대신한다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 핵심적으로 다른 것은 jsx 와 lib 둘입니다. 그 밖에 module·moduleResolution·
//    types·erasableSyntaxOnly 등이 다르고, 다 세면 열 곳쯤 됩니다.
//    다만 그 열 곳은 전부 '무엇으로 돌리는가'(node vs Vite) 때문에 따라오는 것입니다.
//
//    ★ 중요한 것은 strict · noEmit · target 이 양쪽 다 같다는 점입니다.
//    '타입을 어떻게 볼 것인가' 는 안 바뀝니다.
//    "React 를 하면 타입 설정이 복잡해진다" 는 오해를 깨는 것이 이 실습의 목적입니다.
//
// 2) error TS2322: Type 'null' is not assignable to type 'string'.
//    strictNullChecks 가 켜져 있어서 납니다.
//    재현:
//    const s: string = null;
//    이게 안 난다면 strict 가 꺼진 것이고, 그러면 05단원 내용이 통째로 무의미해집니다.
//
// 3) 걸리지 않습니다. 검사는 조용합니다.
//    실행하면 터집니다.
//    TypeError: Cannot read properties of undefined (reading 'length')
//    → 이 자료가 못 잡는 몇 안 되는 자리입니다.
//      noUncheckedIndexedAccess 를 켜면 잡힙니다.
//
// 4) readMenu 가 손으로 하던 일 — typeof 로 하나씩 확인하고,
//    맞으면 그 모양의 값을 돌려주고, 아니면 null 을 돌려주는 것.
//    zod 는 모양을 한 번만 적으면 그 확인 코드를 대신 만들어 줍니다.
//    게다가 그 모양에서 타입까지 뽑아 줘서 type 을 따로 안 적어도 됩니다.
//
// 5) error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
//    node 가 .ts 를 실행할 때 enum 은 '지우기' 만으로 처리가 안 됩니다.
//    재현:
//    enum Color { Red }
//    void Color;
//    그대로 두면 실행할 때 ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX 로 터지므로,
//    검사 단계에서 미리 막아 두었습니다.
