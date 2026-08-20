// ============================================================
// 예제 하나가 에러를 내도 나머지는 볼 수 있게 감싸 주는 상자
// ------------------------------------------------------------
// 이 파일은 자료가 미리 만들어 둔 '틀'입니다. 읽지 않아도 됩니다.
// (여기 쓰인 class 문법은 이 자료에서 가르치지 않습니다.
//  React 에서 에러를 잡아내는 이 방법만 아직 class 를 씁니다.)
// ============================================================

import { Component } from "react";

export default class ErrorBox extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="errorBox">
          <h3>이 예제에서 에러가 났습니다</h3>
          <pre>{String(this.state.error)}</pre>
          <p>
            F12 → Console 의 <strong>맨 위 빨간 줄</strong>부터 보세요. 고친 뒤 저장하면
            화면이 저절로 다시 그려집니다.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
