const http = require('http');

class Context {
  constructor(request, response) {
    this.request = request;
    this.response = response;

    this.response.get = (name) => response.getHeader(name);
  }

  set(name, value) {
    return this.response.setHeader(name, value);
  }

  get method() {
    return this.request.method;
  }

  get url() {
    return this.request.url;
  }
}

module.exports = class Koa {
  constructor() {
    this.middlewareList = [];
  }

  use(middleware) {
    this.middlewareList.push(middleware);
  }

  static handleRequest1(ctx, middlewareList) {
    const boundMiddlewareList = [];

    for (let i = middlewareList.length - 1; i >= 0; i--) {
      if (middlewareList.length == i + 1) {
        console.log('index', i, 'bound to', Promise.resolve);

        boundMiddlewareList.unshift(
          middlewareList[i].bind(ctx.app, ctx, Promise.resolve)
        );
      } else {
        console.log('index', i, 'bound to', boundMiddlewareList[0]);

        boundMiddlewareList.unshift(
          middlewareList[i].bind(ctx.app, ctx, boundMiddlewareList[0])
        );
      }
    }

    return boundMiddlewareList[0]();
  }

  static handleRequest(ctx, middlewareList) {
    function dispatch(index) {
      const middleware = middlewareList[index];

      if (!middleware) {
        return Promise.resolve();
      }

      return middleware(ctx, dispatch.bind(null, index + 1));
    }

    return dispatch(0);
  }

  handleResponse(ctx) {
    ctx.response.writeHead(200, { 'Content-Type': 'text/plain' });
    ctx.response.end(ctx.body);
  }

  callback() {
    return (request, response) => {
      const ctx = new Context(request, response);

      Koa.handleRequest(ctx, this.middlewareList).then(() =>
        this.handleResponse(ctx)
      );
    };
  }

  listen(port) {
    http.createServer(this.callback()).listen(port);
  }
};
