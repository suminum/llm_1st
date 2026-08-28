#!/usr/bin/env python3
"""
주석 표의 칸이 맞는지 본다. 한글은 터미널·에디터에서 두 칸을 차지한다.

사용:
  python3 _제작/표정렬검사.py 01_왜_데이터베이스인가        # 한 단원
  python3 _제작/표정렬검사.py                              # 전부
  python3 _제작/표정렬검사.py --고침 01_왜_데이터베이스인가   # 보고 + 고친 모양 보여주기

왜 필요한가:
  `// 출력:` 은 출력검증이 잡아 준다. 그런데 **설명용 주석 표는 아무도 안 잡는다.**
  에디터에서 자료를 읽는 학생 눈에 바로 보이는데도 그렇다.
"""
import unicodedata, re, sys, glob, os

def 폭(s):
    """터미널에서 차지하는 칸 수. 한글·한자·전각·박스문자는 2칸."""
    w = 0
    for ch in s:
        if unicodedata.combining(ch):
            continue
        # A(Ambiguous) 는 한국어 환경에서 2칸으로 그려진다 (─ │ ★ 등)
        w += 2 if unicodedata.east_asian_width(ch) in ("W", "F", "A") else 1
    return w

주석줄 = re.compile(r'^(\s*//\s*)(\S.*)$')
구분선 = re.compile(r'^[─━=\-]{4,}$')

def 표블록찾기(줄들):
    """2칸 이상 공백으로 나뉜 열이 있는 주석 줄이 3줄 이상 이어지면 표로 본다."""
    블록, 현재 = [], []
    for i, 줄 in enumerate(줄들):
        m = 주석줄.match(줄)
        본문 = m.group(2).rstrip() if m else None
        표같은가 = bool(본문) and bool(re.search(r'\S\s{2,}\S', 본문))
        구분선인가 = bool(본문) and bool(구분선.match(본문.replace(" ", "")))
        if 표같은가 or (구분선인가 and 현재):
            현재.append((i, m.group(1), 본문))
        else:
            if sum(1 for x in 현재 if re.search(r'\S\s{2,}\S', x[2])) >= 3:
                블록.append(현재)
            현재 = []
    if sum(1 for x in 현재 if re.search(r'\S\s{2,}\S', x[2])) >= 3:
        블록.append(현재)
    return 블록

def 열나누기(본문):
    """2칸 이상 공백을 경계로 열을 나눈다."""
    return [c for c in re.split(r'\s{2,}', 본문.strip()) if c]

def 블록검사(블록):
    """열 시작 위치가 줄마다 같은지 본다. 다르면 (어긋난 열 번호, 위치들) 을 돌려준다."""
    시작들 = []
    for _, _, 본문 in 블록:
        if 구분선.match(본문.replace(" ", "")):
            continue
        자리 = [폭(본문[:m.end()]) for m in re.finditer(r'\s{2,}(?=\S)', 본문)]
        if 자리:
            시작들.append(자리)
    if len(시작들) < 2:
        return None
    열수 = min(len(x) for x in 시작들)
    for c in range(열수):
        위치 = sorted({x[c] for x in 시작들})
        if len(위치) > 1:
            return (c + 2, 위치)   # 사람이 세는 열 번호(2열부터)
    return None

def 맞춘표(블록):
    """열 시작 위치를 통일한다.

    ★ 여백을 마음대로 줄이지 않는다.
      원본이 넓게 벌려 놓았으면 그 넓이를 지킨다. 글쓴이가 그렇게 둔 이유가 있다.
      **어긋난 것만 맞추고, 간격 자체는 원본에서 가장 넓은 자리를 따른다.**
    """
    행들 = [(들여, 열나누기(본문), 본문) for _, 들여, 본문 in 블록
            if not 구분선.match(본문.replace(" ", ""))]
    if not 행들:
        return None

    # 원본에서 각 열이 실제로 시작하던 자리 중 가장 오른쪽을 목표로 삼는다
    목표 = []
    열수 = max(len(c) for _, c, _ in 행들)
    for i in range(1, 열수):
        자리 = []
        for _, _, 본문 in 행들:
            끝 = [m.end() for m in re.finditer(r'\s{2,}(?=\S)', 본문)]
            if len(끝) >= i:
                자리.append(폭(본문[:끝[i - 1]]))
        if 자리:
            목표.append(max(자리))

    결과 = []
    for _, 들여, 본문 in 블록:
        if 구분선.match(본문.replace(" ", "")):
            결과.append(들여 + 본문)
            continue
        칸 = 열나누기(본문)
        줄 = ""
        for i, c in enumerate(칸):
            if i > 0:
                채울 = 목표[i - 1] - 폭(줄) if i - 1 < len(목표) else 폭(줄) + 2
                줄 += " " * max(2, 채울)
            줄 += c
        결과.append(들여 + 줄)
    return 결과

def 파일검사(경로, 고침=False):
    원본 = open(경로, encoding="utf-8").read()
    줄들 = 원본.split("\n")
    문제 = []
    for 블록 in 표블록찾기(줄들):
        결과 = 블록검사(블록)
        if 결과:
            열, 위치 = 결과
            문제.append((블록[0][0] + 1, 열, 위치, 블록))
    if 문제:
        print(f"\n[{경로}]  어긋난 표 {len(문제)}개")
        for 행, 열, 위치, 블록 in 문제:
            print(f"  {행:>4}행  {열}열 시작이 제각각입니다: {위치}")
            if 고침:
                print("       — 지금 —")
                for _, 들여, 본문 in 블록[:6]:
                    print("       " + 들여 + 본문)
                맞춘 = 맞춘표(블록)
                if 맞춘:
                    print("       — 이렇게 —")
                    for 줄 in 맞춘[:6]:
                        print("       " + 줄)
    return len(문제)

if __name__ == "__main__":
    인자 = [a for a in sys.argv[1:] if not a.startswith("--")]
    고침 = "--고침" in sys.argv
    뿌리 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    os.chdir(뿌리)
    대상 = 인자 if 인자 else sorted(glob.glob("[0-9][0-9]_*"))
    총 = 0
    for d in 대상:
        for f in sorted(glob.glob(os.path.join(d, "*.js"))):
            총 += 파일검사(f, 고침)
    print(f"\n{'='*60}\n어긋난 표: {총}개")
    sys.exit(1 if 총 else 0)
