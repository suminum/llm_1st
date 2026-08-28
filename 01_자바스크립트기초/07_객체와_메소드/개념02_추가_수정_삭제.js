// ============================================================
// 07단원 · 개념 02 — 객체 추가·수정·삭제
// ------------------------------------------------------------
// 실행: node 개념02_추가_수정_삭제.js
// ============================================================
//
// 객체는 만든 뒤에도 속성을 넣고 빼고 고칠 수 있습니다.
// 배열의 push / splice 같은 메소드가 따로 없고, 그냥 = 로 합니다.


// ── 섹션 1: 추가하기 ──

const user = {
  name: "김민준",
};

console.log(user);
// 출력: { name: '김민준' }

// 없는 이름에 값을 넣으면 새 속성이 생깁니다.
user.age = 20;
console.log(user);
// 출력: { name: '김민준', age: 20 }

user.city = "부산";
console.log(user);
// 출력: { name: '김민준', age: 20, city: '부산' }

// 대괄호로도 됩니다. 이름이 변수에 들어 있을 때 씁니다.
const newKey = "email";
user[newKey] = "test@example.com";
console.log(user);
// 출력: { name: '김민준', age: 20, city: '부산', email: 'test@example.com' }

// ✏️ 직접 해보기 1 — 빈 객체를 만들고 title 과 price 속성을 넣어 출력해 보세요.


// ── 섹션 2: 수정하기 ──

// 이미 있는 이름에 값을 넣으면 덮어쓰기가 됩니다.
user.age = 21;
console.log(user.age);
// 출력: 21

// 추가와 수정의 문법이 똑같습니다.
//   없는 이름이면 → 추가
//   있는 이름이면 → 수정
// 그래서 이름을 오타 내면 "수정한 줄 알았는데 새 속성이 생기는" 사고가 납니다.

user.agee = 99; // 오타
console.log(user.age);
// 출력: 21
console.log(user.agee);
// 출력: 99
// age 는 그대로고 agee 라는 이상한 속성이 생겼습니다.

// 값을 계산해서 넣을 수도 있습니다.
const product = { price: 10000, count: 3 };
product.total = product.price * product.count;
console.log(product);
// 출력: { price: 10000, count: 3, total: 30000 }

// ✏️ 직접 해보기 2 — product 의 price 를 20000 으로 바꾸고 출력해 보세요.


// ── 섹션 3: 삭제하기 ──

const item = { name: "이어폰", price: 89000, oldPrice: 120000 };

delete item.oldPrice;
console.log(item);
// 출력: { name: '이어폰', price: 89000 }

// 배열에서는 delete 를 쓰면 안 됐지만(구멍이 생겨서),
// 객체는 순서가 아니라 이름으로 찾으므로 delete 를 써도 됩니다.

// 없는 속성을 지워도 에러가 안 납니다.
delete item.nothing;
console.log(item);
// 출력: { name: '이어폰', price: 89000 }

// 실무에서는 지우기보다 null 을 넣는 경우가 더 많습니다.
// "속성 자체가 없다" 와 "속성은 있는데 값이 비었다" 는 다른 뜻이니까요.
item.price = null;
console.log(item);
// 출력: { name: '이어폰', price: null }

// ✏️ 직접 해보기 3 — 객체를 만들고 속성 하나를 delete 로 지워 보세요.


// ── 섹션 4: 속성이 있는지 확인하기 ──

const config = { theme: "dark", fontSize: 14 };

// [방법 1] undefined 인지 확인
console.log(config.theme !== undefined);
// 출력: true
console.log(config.language !== undefined);
// 출력: false

// [방법 2] in 연산자 — 더 분명합니다
console.log("theme" in config);
// 출력: true
console.log("language" in config);
// 출력: false

// 속성 이름을 따옴표로 감싼다는 점에 주의하세요.

// 두 방법의 차이는 "값이 undefined 인 속성"에서 드러납니다.
const tricky = { value: undefined };
console.log(tricky.value !== undefined);
// 출력: false
console.log("value" in tricky);
// 출력: true
// 속성은 분명히 있습니다. 값이 undefined 일 뿐입니다.
// 그래서 존재 확인은 in 이 정확합니다.

// 조건문에서 이렇게 씁니다.
if ("theme" in config) {
  console.log(`테마: ${config.theme}`);
}
// 출력: 테마: dark

// ✏️ 직접 해보기 4 — config 에 "fontSize" 속성이 있는지 in 으로 확인해 보세요.


// ── 섹션 5: const 인데 왜 바뀌나 ──

// 배열과 같은 이유입니다.
const settings = { volume: 50 };

settings.volume = 80; // 속성 바꾸기 — 가능
console.log(settings);
// 출력: { volume: 80 }

// settings = { volume: 80 };
// 실수: TypeError: Assignment to constant variable.

// const 는 "settings 라는 이름이 다른 객체를 가리키지 못하게" 막는 것입니다.
// 객체 '안의 내용'은 막지 않습니다.
// 그래서 객체도 배열처럼 대부분 const 로 만듭니다.


// ── 섹션 6: 객체를 복사할 때 조심할 것 ──

// 이건 초보자가 반드시 한 번은 당하는 함정입니다.

const original = { name: "김민준", age: 20 };
const copy = original; // 복사한 것처럼 보이지만...

copy.age = 99;

console.log(copy.age);
// 출력: 99
console.log(original.age);
// 출력: 99
// 원본까지 바뀌었습니다!

// 왜 그럴까요?
//   객체를 변수에 담을 때 담기는 것은 '내용'이 아니라 '어디에 있는지'입니다.
//   copy = original 은 같은 객체를 가리키는 이름표를 하나 더 붙인 것뿐입니다.
//   집 주소를 적어 준 것이지 집을 새로 지어 준 게 아닙니다.

// [복사하기] 스프레드 문법을 쓰면 됩니다. (09단원에서 자세히 배웁니다)
const original2 = { name: "이서연", age: 22 };
const realCopy = { ...original2 };

realCopy.age = 99;

console.log(realCopy.age);
// 출력: 99
console.log(original2.age);
// 출력: 22
// 이번엔 원본이 지켜졌습니다.
//
// [주의] 이 방법은 '한 겹' 만 복사합니다.
// 속성 값이 숫자·문자열이면 지금처럼 잘 됩니다.
// 하지만 속성 안에 객체가 또 들어 있으면 그 안쪽은 원본과 그대로 이어져 있습니다.
// 이 이야기는 개념05 섹션7과 09단원 개념04에서 다시 합니다.

// 숫자·문자열은 이런 일이 없습니다. 값이 그대로 복사됩니다.
let a = 10;
let b = a;
b = 99;
console.log(a);
// 출력: 10

// 정리:
//   숫자, 문자열, 불리언  → 값이 복사된다 (원본 안전)
//   객체, 배열            → 위치가 복사된다 (원본 위험)

// ✏️ 직접 해보기 5 — 객체를 { ... } 로 복사한 뒤 복사본만 바꿔 보고
//                    원본이 그대로인지 확인해 보세요.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 속성 이름 오타로 새 속성이 생김 (섹션 2에서 봤습니다)
// 값이 안 바뀌면 이름 오타부터 확인하세요.

// [실수 2] 배열 delete 습관을 객체에 그대로 적용하고 반대로도 함
// 객체 → delete 써도 됨
// 배열 → delete 쓰면 안 됨 (splice 사용)

// [실수 3] in 에 따옴표를 빼먹기
// console.log(theme in config);
// 실수: theme 이라는 변수를 찾습니다. ReferenceError.
//       "theme" 처럼 문자열로 써야 합니다.

// [실수 4] 복사한 줄 알고 원본을 망가뜨림 (섹션 6)
// 이 실수는 에러도 안 나고 한참 뒤에 이상한 값으로 발견됩니다.
// 객체를 넘길 때는 항상 "원본이 바뀌어도 되는가" 를 먼저 생각하세요.


// ── 정리 ──

// 1. 객체.이름 = 값  — 없으면 추가, 있으면 수정. 문법이 같다.
// 2. delete 객체.이름 으로 삭제. 객체에는 써도 된다.
// 3. "이름" in 객체 로 존재를 확인한다. 따옴표 필수.
// 4. const 객체도 속성은 바꿀 수 있다.
// 5. copy = original 은 복사가 아니다. { ...original } 로 복사한다.
//    단, 한 겹만 복사된다. 안에 객체가 또 있으면 그쪽은 이어져 있다. (09단원 개념04)


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const book = {};
//    book.title = "자바스크립트 입문";
//    book.price = 25000;
//    console.log(book);
//    // 출력: { title: '자바스크립트 입문', price: 25000 }
//
// 2) product.price = 20000;
//    console.log(product);
//    // 출력: { price: 20000, count: 3, total: 30000 }
//    // total 은 자동으로 다시 계산되지 않습니다. 넣을 때 계산된 값이 그대로입니다.
//
// 3) const temp = { a: 1, b: 2 };
//    delete temp.b;
//    console.log(temp);              // 출력: { a: 1 }
//
// 4) console.log("fontSize" in config);   // 출력: true
//
// 5) const o = { n: 1 };
//    const c = { ...o };
//    c.n = 100;
//    console.log(c.n);               // 출력: 100
//    console.log(o.n);               // 출력: 1
