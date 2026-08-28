import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 이 파일도 .ts 입니다. 설정 파일에도 타입이 붙습니다.
// defineConfig 에 마우스를 올려 보면 무엇을 받는지 보입니다.
export default defineConfig({
  plugins: [react()],
});
