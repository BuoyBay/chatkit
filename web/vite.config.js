import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One self-contained, ASCII-only HTML file: loaded via HTMLView.LoadHTML with
// no base URL and no network, then embedded as a Buoy string literal.
export default defineConfig(({ command }) => ({
  plugins: [svelte(), viteSingleFile({ removeViteModuleLoader: true })],
  define: {
    __DEMO_AUTOPLAY__: JSON.stringify(command === 'serve' || !!process.env.VITE_DEMO),
    __DEMO_FAST__: JSON.stringify(process.env.VITE_DEMO === 'fast'),
  },
  esbuild: { charset: 'ascii', legalComments: 'none' },
  build: {
    target: 'es2020',
    cssTarget: 'safari14',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    modulePreload: false,
    reportCompressedSize: false,
  },
}));
