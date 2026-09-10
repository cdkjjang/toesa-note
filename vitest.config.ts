import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig의 `@/*` 별칭을 vitest에도 알려 준다.
  // 이게 없으면 `app/` 아래 모듈(예: app/calc/*/page.tsx)을 테스트에서 못 불러온다.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
