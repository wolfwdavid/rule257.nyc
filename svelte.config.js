import adapterVercel from '@sveltejs/adapter-vercel';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isMobileBuild = process.env.BUILD_TARGET === 'mobile';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: isMobileBuild
      ? adapterStatic({
          pages: 'build',
          assets: 'build',
          fallback: 'index.html',
          strict: false
        })
      : adapterVercel(),
    ...(isMobileBuild && {
      output: { bundleStrategy: 'single' }
    }),
    alias: {
      '$lib': 'src/lib'
    }
  }
};

export default config;
