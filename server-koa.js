import fs from 'node:fs/promises';
import Koa from 'koa';
import Router from '@koa/router';
import koaStatic from 'koa-static';
import compress from 'koa-compress';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5177;
const base = process.env.BASE || '/';

const app = new Koa();
const router = new Router();

// 如果koaStatic在前，会优先尝试匹配静态文件（如index.html），若找到则直接返回响应，​跳过后续路由。
app.use(router.routes());
app.use(router.allowedMethods());

let vite;

// 开发环境中间件
if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: 'ssr' },
    appType: 'custom',
    base,
  });

  // 使用 koa-connect 适配 Vite 中间件
  const { default: koaConnect } = await import('koa-connect');
  // 集成Vite开发中间件
  app.use(koaConnect(vite.middlewares));
} else {
  // 生产环境中间件
  app.use(compress()); // 启用响应压缩（gzip等）
  app.use(koaStatic('./dist/client', { extensions: [''] })); // 静态文件服务
}

router.get(['/', '/web'], async (ctx) => {
  try {
    const url = ctx.path.replace(base, '');
    let template;
    let render;

    // 开发环境
    if (!isProduction) {
      // 读取原始HTML模板
      template = await fs.readFile('./index.html', 'utf-8');
      // 转换Vite专属标签
      template = await vite.transformIndexHtml(url, template);
      // 动态加载SSR模块
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      // 生产环境
      template = await fs.readFile('./dist/client/index.html', 'utf-8');
      render = (await import('./dist/server/entry-server.js')).render;
    }

    // 服务端SSR渲染出html
    const rendered = await render(url);

    const html = template
      .replace('<!--app-head-->', rendered.head ?? '')
      .replace('<!--app-html-->', rendered.html ?? '');

    ctx.type = 'text/html';
    ctx.body = html;
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.error(e.stack);
    ctx.status = 500;
    ctx.body = e.stack;
  }
});

app.listen(port, () => {
  console.log(`Koa2 Server started at http://localhost:${port}`);
});
