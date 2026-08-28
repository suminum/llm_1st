// ============================================================
// 03단원 연습문제 정답 — 컴포넌트와 props
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================

// ───── 문제 1 ─────

function Hello() {
  return <p>안녕하세요, 김민준입니다</p>;
}

// 컴포넌트는 화면을 돌려주는 함수입니다. 새 문법은 없습니다.
// 이름을 hello 라고 쓰면 React 가 HTML 태그로 읽어서 화면에서 사라집니다.

// ───── 문제 2 ─────

// 원래 코드는 이랬습니다.
//
//     function header() { ... }        ← 소문자로 시작
//     <header />                       ← 쓰는 쪽도 소문자
//
// header 는 실제로 있는 HTML 태그 이름입니다.
// 그래서 React 는 "빈 <header> 태그를 만들라" 로 읽었고,
// 우리가 만든 함수는 한 번도 불리지 않았습니다. 에러도 안 났습니다.
//
// 이름을 대문자로 시작하게 바꾸고, 쓰는 쪽도 함께 바꿉니다.

function ShopTitle() {
  return <h4>동네 카페</h4>;
}

// ───── 문제 3 ─────

function Coffee() {
  return <p>아메리카노</p>;
}

function Cake() {
  return <p>케이크</p>;
}

function MenuList() {
  return (
    <div>
      <Coffee />
      <Cake />
    </div>
  );
}

// 돌려주는 것은 항상 하나여야 하므로 <div> 로 감쌌습니다.
// 02단원에서 배운 <> </> 로 감싸도 똑같이 동작합니다.
//
//     return (
//       <>
//         <Coffee />
//         <Cake />
//       </>
//     );

// ───── 문제 4 ─────

function Welcome(props) {
  return <p>{props.name}님 환영합니다</p>;
}

// 넘기는 쪽은 <Welcome name="이서연" /> 입니다.
// 넘긴 것이 { name: '이서연' } 이라는 객체 하나가 되어 props 로 옵니다.
// 개념03을 배웠으니 function Welcome({ name }) 으로 써도 됩니다.

// ───── 문제 5 ─────

function PriceTag(props) {
  return (
    <div>
      {props.price}원
      <br />
      500원 더하면 {props.price + 500}원
    </div>
  );
}

// price={4000} 처럼 중괄호로 넘겨야 숫자입니다.
// price="4000" 으로 넘기면 화면 첫 줄은 똑같이 4000원으로 보이지만
// 둘째 줄이 4000500원이 됩니다. 문자열끼리 이어 붙었기 때문입니다.

// ───── 문제 6 · 7 ─────

// [문제 6] props 로 받은 모습입니다.
//
//     function MenuItem(props) {
//       return (
//         <p>
//           {props.name} — {props.price}원
//         </p>
//       );
//     }
//
// [문제 7] 매개변수 자리에서 구조분해한 모습입니다. 아래가 최종 답입니다.

function MenuItem({ name, price }) {
  return (
    <p>
      {name} — {price}원
    </p>
  );
}

// 넘기는 쪽은 한 글자도 안 바뀝니다. 받는 쪽 괄호 안만 바뀝니다.
// 구조분해한 뒤에도 props.name 을 쓰면 ReferenceError: props is not defined 가 납니다.
// { name } 이라고 쓰면 props 라는 이름 자체가 만들어지지 않기 때문입니다.

// ───── 문제 8 ─────

function Greeting({ name = "손님" }) {
  return <p>{name}님, 어서 오세요.</p>;
}

// 기본값은 name 이 undefined 일 때만 쓰입니다. (JS자료 09단원 개념02)
// <Greeting name="" /> 처럼 빈 문자열을 넘기면 기본값이 안 쓰이고
// "님, 어서 오세요." 가 됩니다. 안 넘긴 것처럼 보여서 헷갈리기 쉽습니다.

// ───── 문제 9 ─────

function Box({ children }) {
  return <div className="output">{children}</div>;
}

// 태그 사이에 넣은 "오늘도 좋은 하루" 가 children 으로 들어옵니다.
// {children} 을 안 쓰면 흰 칸만 나오고 글자는 사라집니다. 에러는 안 납니다.

// ───── 문제 10 ─────

function TitleBox({ title, children }) {
  return (
    <div className="output">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

// 짧은 값(title)은 속성으로, 화면 덩어리는 children 으로 받았습니다.
// 둘 다 결국 props 입니다. Object.keys(props) 를 찍어 보면 ['title', 'children'] 입니다.

// ───── 문제 11 ─────

function NoticeLine({ text }) {
  return (
    <div>
      <strong>[알림]</strong> {text}
    </div>
  );
}

function BigNotice() {
  return (
    <div className="output">
      <NoticeLine text="오전 8시에 문을 엽니다" />
      <NoticeLine text="오후 10시에 문을 닫습니다" />
      <NoticeLine text="케이크는 6000원입니다" />
    </div>
  );
}

// 세 줄에서 달라지는 것은 글자 하나뿐이므로 그것만 props 로 뺐습니다.
// [알림] 표시는 세 줄이 모두 같으므로 NoticeLine 안에 그대로 뒀습니다.
// 이제 [알림] 을 [공지] 로 바꾸려면 NoticeLine 한 곳만 고치면 됩니다.
//
// props 이름을 text 대신 message 나 content 라고 지어도 맞습니다.

// ───── 문제 12 ───── [응용]

const americano = { name: "아메리카노", price: 4000 };
const latte = { name: "라떼", price: 4500 };

function OrderCard({ item, count = 1 }) {
  const { name, price } = item; // 받은 객체에서 다시 꺼냅니다
  const total = price * count; // props 를 읽어서 새 값을 만듭니다

  return (
    <div className="output">
      {name} {count}개 — 합계 {total}원
    </div>
  );
}

// 객체를 통째로 넘길 때는 <OrderCard item={americano} /> 처럼 중괄호가 필요합니다.
// item="americano" 라고 쓰면 글자가 넘어가서 name 과 price 가 undefined 가 됩니다.
//
// total 은 props 를 '읽어서' 새로 만든 값입니다. props 자체를 고친 것이 아닙니다.
// item.price = ... 처럼 안쪽 값을 고치면 에러 없이 원본까지 바뀝니다. (개념05)
//
// 매개변수 자리에서 한 번에 꺼낼 수도 있습니다. 되지만 읽기는 조금 어렵습니다.
//
//     function OrderCard({ item: { name, price }, count = 1 }) { ... }

// ───── 문제 13 ───── [도전]

function Receipt({ title, total = 0, children }) {
  return (
    <div className="output">
      <h4>{title}</h4>
      {children}
      <div>
        <strong>합계 {total}원</strong>
      </div>
    </div>
  );
}

// 쓰는 쪽은 이렇게 됩니다.
//
//     <Receipt title="영수증" total={16500}>
//       <OrderCard item={americano} count={3} />
//       <OrderCard item={latte} />
//     </Receipt>
//
// 여기서 children 은 OrderCard 두 개입니다. 두 개라서 배열로 들어옵니다.
// 그래도 {children} 한 줄이면 React 가 알아서 둘 다 그려 줍니다.
//
// 상자(Receipt) 는 안에 무엇이 들어오는지 모릅니다. 제목과 합계, 테두리만 담당합니다.
// 그래서 주문 목록이 아니라 다른 내용을 넣어도 그대로 동작합니다.
//
// 합계 16500 은 12000 + 4500 을 손으로 계산해 넘긴 값입니다.
// 목록에서 합계를 자동으로 구하는 것은 05단원(map)과 07단원에서 배웁니다.

// ───── 문제 14 ───── (에러 확인)

// function ChangeProps(props) {
//   props.name = "바꿈";
//   return <p>{props.name}</p>;
// }
//
// 주석을 풀면 이렇게 됩니다.
//
//   화면: 이 파일의 화면이 통째로 빕니다. 문제 14 칸만 비는 것이 아닙니다.
//         React 는 그리는 도중에 에러가 나면 화면 전체를 지워 버립니다.
//
//   콘솔: TypeError: Cannot assign to read only property 'name' of object '#<Object>'
//         그 아래에 "The above error occurred in the <ChangeProps> component" 도 함께 나옵니다.
//
// 왜 이렇게 되나:
//   props 는 부모가 자식에게 준 값입니다. 자식이 마음대로 고치면
//   부모가 아는 값과 화면에 보이는 값이 달라지고, 누가 고쳤는지 찾을 수 없습니다.
//   그래서 React 는 개발 중에 props 객체를 아예 못 고치게 잠가 둡니다.
//   잠긴 값에 대입하려고 하면 위 TypeError 가 납니다.
//
// 고치는 방법:
//   1. 그냥 읽어서 새 변수를 만든다 — const newName = props.name + "님";
//   2. 값이 바뀌어야 하는 화면이라면 04단원의 state 를 씁니다.
//
// ★ props 안에 든 '객체' 를 고치는 것은 에러조차 나지 않습니다.
//   props.item.price = 0 은 조용히 통과하고 원본 객체까지 바꿔 버립니다.
//   이쪽이 더 위험합니다. 개념05 화면 ⑥ 에서 확인했습니다.

// ============================================================
// 화면에 그리기
// ============================================================

export default function ExerciseAnswers() {
  return (
    <div>
      <h1>03단원 연습문제 정답 — 컴포넌트와 props</h1>

      <p className="guide">
        먼저 스스로 풀어 본 다음에 보세요. 화면과 <strong>F12 → Console</strong> 을 함께 확인하세요.
        <br />
        <br />
        정답이 하나뿐인 문제는 거의 없습니다. 화면이 기대 결과와 같다면 맞은 것입니다. 아래 풀이는 이 단원에서 배운 방법으로 쓴 것입니다.
      </p>

      <>
        <div className="demo">
          <h3>문제 1</h3>
          <div className="output">
            <Hello />
          </div>
        </div>

        <div className="demo">
          <h3>문제 2</h3>
          <div className="output">
            <ShopTitle />
          </div>
        </div>

        <div className="demo">
          <h3>문제 3</h3>
          <div className="output">
            <MenuList />
          </div>
        </div>

        <div className="demo">
          <h3>문제 4</h3>
          <div className="output">
            <Welcome name="이서연" />
          </div>
        </div>

        <div className="demo">
          <h3>문제 5</h3>
          <div className="output">
            <PriceTag price={4000} />
          </div>
        </div>

        <div className="demo">
          <h3>문제 6 · 7</h3>
          <div className="output">
            <MenuItem name="아메리카노" price={4000} />
            <MenuItem name="라떼" price={4500} />
            <MenuItem name="케이크" price={6000} />
          </div>
        </div>

        <div className="demo">
          <h3>문제 8</h3>
          <div className="output">
            <Greeting name="박지훈" />
            <Greeting />
          </div>
        </div>

        <div className="demo">
          <h3>문제 9</h3>
          <Box>오늘도 좋은 하루</Box>
        </div>

        <div className="demo">
          <h3>문제 10</h3>
          <TitleBox title="오늘의 메뉴">
            <p>아메리카노 4000원</p>
          </TitleBox>
        </div>

        <div className="demo">
          <h3>문제 11</h3>
          <BigNotice />
        </div>

        <div className="demo">
          <h3>문제 12 [응용]</h3>
          <OrderCard item={americano} count={3} />
          <OrderCard item={latte} />
        </div>

        <div className="demo">
          <h3>문제 13 [도전]</h3>
          <Receipt title="영수증" total={16500}>
            <OrderCard item={americano} count={3} />
            <OrderCard item={latte} />
          </Receipt>
        </div>

        <div className="demo">
          <h3>문제 14 (에러 확인)</h3>
          <div className="output">{/* <ChangeProps name="김민준" /> */}</div>
        </div>
      </>
    </div>
  );
}
