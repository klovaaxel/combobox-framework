import { defineConfig } from "cypress";

export default defineConfig({
    component: {
        devServer: {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            framework: "cypress-ct-html" as any,
            bundler: "vite",
            viteConfig: {},
        },
    },
});
