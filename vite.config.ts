import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// The dev server proxies /petclinic to Spring PetClinic REST, so the browser sees one origin
// and we never touch the backend's CORS configuration.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/petclinic": "http://localhost:9966" } },
  test: { environment: "jsdom" },
});
