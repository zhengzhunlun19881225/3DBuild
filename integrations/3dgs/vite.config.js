import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir: '../../public/3dgs',
    // Preserve the local survey, character and collider assets beside the build.
    emptyOutDir: false,
    target: 'esnext',
    chunkSizeWarningLimit: 4000,
  },
});
