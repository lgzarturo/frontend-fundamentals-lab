import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.test.js",
        "assets/js/tailwindcss.js",
        "assets/js/analytics.js"
      ]
    },
    include: ["**/*.test.js"]
  }
})
