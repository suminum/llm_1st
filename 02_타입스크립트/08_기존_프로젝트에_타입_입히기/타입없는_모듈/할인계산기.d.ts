// ============================================================
// 08단원 · 개념04 부속 — 위 .js 에 손으로 붙인 타입 (선언 파일)
// ------------------------------------------------------------
// ★ .d.ts 는 '선언 파일' 입니다. 모양만 적고 실행되는 코드는 한 줄도 없습니다.
//
// 이 파일이 있으면 할인계산기.js 를 타입스크립트에서 안전하게 쓸 수 있습니다.
// 없으면 TS7016 이 납니다. 개념04 섹션1에서 직접 확인합니다.
//
// declare 는 "코드는 저쪽에 있고, 모양만 여기 적는다" 는 뜻입니다.
// ============================================================

export declare function getDiscounted(price: number, percent: number): number;

export declare function getShipping(total: number): number;

export declare const DEFAULT_PERCENT: number;
