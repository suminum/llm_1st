#!/usr/bin/env python3
"""
정렬을 보정한 뒤, **설명 주석만 바뀌고 나머지는 그대로인지** 확인한다.

  python3 _제작/주석만바뀌었나.py <원본폴더>

왜 필요한가:
  07~10단원은 Docker 가 있어야 출력검증을 돌릴 수 있다.
  Docker 가 없는 자리에서 정렬만 고쳤을 때, 검증 없이도 안전을 보장하려면
  **실행에 영향을 주는 부분이 한 글자도 안 바뀌었음**을 보이면 된다.

  그 부분은 두 가지다.
    ① 코드 (주석을 걷어낸 나머지)
    ② `// 출력:` 과 `// 출력?:` 줄  ← 검증기가 실행 결과와 대조하는 선언

  이 둘이 같으면 실행 결과도 같다. 그러면 출력검증 결과도 같다.
"""
import sys, os, glob, re

출력선언 = re.compile(r'^\s*//\s*출력\??:')

def 코드만(소스):
    """주석을 걷어낸다. 글자(문자열) 안의 // 는 주석이 아니므로 건드리지 않는다."""
    결과, i, n = [], 0, len(소스)
    따옴표 = None
    while i < n:
        ch = 소스[i]
        if 따옴표:
            결과.append(ch)
            if ch == "\\" and i + 1 < n:
                결과.append(소스[i + 1]); i += 2; continue
            if ch == 따옴표: 따옴표 = None
            i += 1; continue
        if ch in "\"'`":
            따옴표 = ch; 결과.append(ch); i += 1; continue
        if ch == "/" and i + 1 < n and 소스[i + 1] == "/":
            while i < n and 소스[i] != "\n": i += 1
            continue
        if ch == "/" and i + 1 < n and 소스[i + 1] == "*":
            i += 2
            while i + 1 < n and not (소스[i] == "*" and 소스[i + 1] == "/"): i += 1
            i += 2; continue
        결과.append(ch); i += 1
    # 빈 줄과 줄 끝 공백은 무시한다 (주석을 지우면 생기는 것들)
    return "\n".join(줄.rstrip() for 줄 in "".join(결과).split("\n") if 줄.strip())

def 출력줄만(소스):
    return [줄.rstrip() for 줄 in 소스.split("\n") if 출력선언.match(줄)]

def 비교(원본, 지금):
    가 = open(원본, encoding="utf-8").read()
    나 = open(지금, encoding="utf-8").read()
    문제 = []
    if 코드만(가) != 코드만(나):
        문제.append("★ 코드가 바뀌었습니다")
    if 출력줄만(가) != 출력줄만(나):
        옛, 새 = 출력줄만(가), 출력줄만(나)
        if len(옛) != len(새):
            문제.append(f"★ // 출력: 줄 수가 바뀌었습니다 ({len(옛)} → {len(새)})")
        else:
            다른 = [i for i in range(len(옛)) if 옛[i] != 새[i]]
            문제.append(f"★ // 출력: 내용이 바뀌었습니다 ({len(다른)}줄)")
            for i in 다른[:3]:
                문제.append(f"    전: {옛[i].strip()}")
                문제.append(f"    후: {새[i].strip()}")
    return 문제

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    원본뿌리 = sys.argv[1]
    지금뿌리 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    안전, 위험 = 0, 0
    for 원본 in sorted(glob.glob(os.path.join(원본뿌리, "*", "*.js"))):
        상대 = os.path.relpath(원본, 원본뿌리)
        지금 = os.path.join(지금뿌리, 상대)
        if not os.path.exists(지금):
            print(f"[없어짐] {상대}"); 위험 += 1; continue
        문제 = 비교(원본, 지금)
        if 문제:
            print(f"\n[위험] {상대}")
            for m in 문제: print("  " + m)
            위험 += 1
        else:
            안전 += 1
    print(f"\n{'='*60}")
    print(f"주석만 바뀐 파일 {안전}개 / 실행에 영향 가는 변경 {위험}개")
    if 위험 == 0:
        print("✅ 실행 결과는 바뀌지 않습니다. 출력검증을 다시 돌리지 않아도 됩니다.")
    sys.exit(1 if 위험 else 0)
