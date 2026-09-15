import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ModalProvider, ToastProvider, configure } from "bongchil-design-system";
import { App } from "./App";
import "./styles.css";

// 패키지가 모르는 바깥 세계를 카탈로그가 채워 넣는다.
// 실제 앱에선 uploadImage가 자기 백엔드로 간다 — 여기선 올린 척만 한다.
configure({
  uploadImage: async (blob) => ({ url: URL.createObjectURL(blob) }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModalProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ModalProvider>
  </StrictMode>,
);
