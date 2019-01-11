// const Koa = require('koa');

const Koa = require('./my-koa');

const app = new Koa();

// logger

app.use(async (ctx, next) => {
  // console.log('next 1:', next);
  console.log('1');
  await next();
  console.log('5');

  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
  console.log('2');
  const start = Date.now();

  // console.log('next 2:', next);

  await next();

  console.log('4');

  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// response

app.use(async (ctx, next) => {
  console.log('3');
  ctx.body = 'Hello World';

  // console.log('next 3:', next);

  await sleep(500);
});

app.listen(3000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
