import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // build的这些配置都是默认，可以不写
  build: {
    outDir: 'dist',          // 输出目录
    assetsDir: 'assets',     // 静态资源子目录
    assetsInlineLimit: 4096, // 资源内联阈值
    cssCodeSplit: true,      // CSS 代码拆分
    sourcemap: false,        // Sourcemap 生成
    minify: 'esbuild',       // 压缩工具
    emptyOutDir: true,       // 清空输出目录
  },
  plugins: [react()],
});
