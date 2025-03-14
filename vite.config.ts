import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 公共路径，可以设置为CDN地址
  // base: 'https://cdn.yourdomain.com/myapp/',
  build: {
    outDir: 'dist',          // 输出目录（默认）
    assetsDir: 'assets',     // 静态资源子目录（默认）
    assetsInlineLimit: 4096, // 资源内联阈值（默认）
    cssCodeSplit: true,      // CSS 代码拆分（默认）
    sourcemap: false,        // Sourcemap 生成（默认）
    minify: 'esbuild',       // 压缩工具（默认）
    emptyOutDir: true,       // 清空输出目录（默认）
    rollupOptions: {
      input: './index.html', // 客户端入口HTML文件（默认）
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const moduleName = id.split('node_modules/')[1].split('/')[0];
            if (['react', 'react-dom'].includes(moduleName)) {
              // 将react和react-dom 打包到vendor-react中
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
  plugins: [react()],
});
