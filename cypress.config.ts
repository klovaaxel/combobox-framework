import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    devServer: {
      framework: 'cypress-ct-html' as any,
      bundler: 'vite',
      viteConfig: {},
    },
  },
});
