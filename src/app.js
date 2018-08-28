const Koa = require('koa');
const Router = require('koa-router');
const bouncer = require('koa-bouncer');
const send = require('koa-send');
const fs = require('fs');
const path = require('path');
const kreq = require('koa-req');
const resize = require('./resizeImage');
const app = new Koa();
const router = new Router({ prefix: '/gallery' });
app.port = 7559;
app.proxy = true;
kreq(app, {
  cors: {
    origin: '*',
    allowMethods: ['GET', 'OPTIONS', 'HEAD'],
    maxAge: 86400
  }
});
app.use(bouncer.middleware());
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof bouncer.ValidationError) {
      ctx.body = {
        success: false
      };
    }
    ctx.app.emit('error', err, ctx);
  }
});
router.get('/:image', async (ctx, next) => {
  ctx.validateParam('image').required().isString();
  const imagePath = path.resolve(__dirname, '../gallery', ctx.vals.image);
  if (fs.existsSync(imagePath)) {
    await send(ctx, ctx.path, { root: path.resolve(__dirname, '../') });
  } else {
    const imageParts = ctx.vals.image.split('.');
    if (imageParts.length < 3) {
      ctx.status = 404;
      ctx.body = 'Image not found';
    } else {
      const imageFromParts = path.resolve(__dirname, '../gallery', `${imageParts[0]}.${imageParts[2]}`);
      if (fs.existsSync(imageFromParts)) {
        let w = imageParts[1].match(/w(\d*\.?\d*)/);
        if (w) {
          w = +w[1] || null;
        }
        let h = imageParts[1].match(/h(\d*\.?\d*)/);
        if (h) {
          h = +h[1] || null;
        }
        if (!w && !h) {
          ctx.status = 404;
          ctx.body = 'Image not found';
          return next();
        }
        const newPath = await resize(imageFromParts, w, h);
        await send(ctx, newPath, { root: path.resolve(__dirname, '../') });
      } else {
        ctx.status = 404;
        ctx.body = 'Image not found';
      }
    }
  }
});
app
  .use(router.routes())
  .use(router.allowedMethods());
app.on('error', (err) => {
  console.error(err);
});
app.use((ctx) => {
  ctx.status = 404;
  ctx.body = 'Endpoint not found';
});
module.exports = app;