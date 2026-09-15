import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// bongchil-design-system는 workspace 심링크로 붙는다 — 실제 소비 경로(package exports)를 그대로 타면서
// 패키지 소스를 고치면 HMR이 바로 붙는다. (배포 앱은 `pnpm add github:bongchil/bongchil-design-system`)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 일기(7787) 바로 옆 칸. strictPort — 포트가 물리면 조용히 옆 번호로 새지 말고 실패한다
  server: { port: 7788, strictPort: true },
  preview: { port: 7788, strictPort: true },
  optimizeDeps: { exclude: ["bongchil-design-system"] },
});
