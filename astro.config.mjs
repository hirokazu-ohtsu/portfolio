import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 本番URL。サイトマップと canonical に使う。独自ドメインを付けたらここを変える
  site: 'https://portfolio.kazucchi1016.workers.dev',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  vite: { plugins: [tailwindcss()] },
});
