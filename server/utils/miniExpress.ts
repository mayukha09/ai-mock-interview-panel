import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

type Handler = (req: any, res: any, next?: any) => void | Promise<void>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handlers: Handler[];
}

export class MiniExpressRouter {
  public routes: Route[] = [];
  public middlewares: Handler[] = [];

  use(...args: any[]) {
    if (args.length === 1 && typeof args[0] === 'function') {
      this.middlewares.push(args[0]);
    } else if (args.length >= 2 && typeof args[0] === 'string') {
      const prefix = args[0];
      const sub = args[1];
      if (sub && sub.routes) {
        for (const r of sub.routes) {
          const combined = prefix.replace(/\/$/, '') + '/' + r.pattern.source.replace(/^\^|\$$/g, '').replace(/\/$/, '');
          const { pattern, paramNames } = pathToRegex(combined);
          this.routes.push({
            method: r.method,
            pattern,
            paramNames,
            handlers: [...sub.middlewares, ...r.handlers]
          });
        }
      } else if (typeof sub === 'function') {
        this.middlewares.push((req, res, next) => {
          if (req.url.startsWith(prefix)) {
            sub(req, res, next);
          } else {
            next();
          }
        });
      }
    }
    return this;
  }

  get(pathStr: string, ...handlers: Handler[]) {
    this.addRoute('GET', pathStr, handlers);
    return this;
  }

  post(pathStr: string, ...handlers: Handler[]) {
    this.addRoute('POST', pathStr, handlers);
    return this;
  }

  options(pathStr: string, ...handlers: Handler[]) {
    this.addRoute('OPTIONS', pathStr, handlers);
    return this;
  }

  private addRoute(method: string, pathStr: string, handlers: Handler[]) {
    const { pattern, paramNames } = pathToRegex(pathStr);
    this.routes.push({ method, pattern, paramNames, handlers });
  }
}

function pathToRegex(pathStr: string): { pattern: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const clean = pathStr.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  
  const regexStr = clean.split('/').map(segment => {
    if (segment.startsWith(':')) {
      paramNames.push(segment.slice(1));
      return '([^/]+)';
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('/');

  return {
    pattern: new RegExp(`^${regexStr || '/'}(?:/)?$`),
    paramNames
  };
}

export function createMiniExpress() {
  const router = new MiniExpressRouter();

  const app: any = (req: http.IncomingMessage, res: http.ServerResponse) => {
    handleRequest(app, router, req, res);
  };

  app.use = (...args: any[]) => { router.use(...args); return app; };
  app.get = (...args: any[]) => { router.get(...args as [string, ...Handler[]]); return app; };
  app.post = (...args: any[]) => { router.post(...args as [string, ...Handler[]]); return app; };
  app.options = (...args: any[]) => { router.options(...args as [string, ...Handler[]]); return app; };

  app.listen = (port: number, cb?: () => void) => {
    const server = http.createServer(app);
    return server.listen(port, cb);
  };

  return app;
}

export function Router() {
  return new MiniExpressRouter();
}

export const miniJson = () => (req: any, res: any, next: () => void) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  let data = '';
  req.on('data', (chunk: Buffer) => { data += chunk; });
  req.on('end', () => {
    if (data) {
      try {
        req.body = JSON.parse(data);
      } catch {
        req.body = data;
      }
    } else {
      req.body = {};
    }
    next();
  });
};

export const miniCors = () => (req: any, res: any, next: () => void) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  next();
};

export const miniStatic = (rootDir: string) => (req: any, res: any, next: () => void) => {
  if (req.method !== 'GET') return next();
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname || '/';
  let target = path.join(rootDir, pathname === '/' ? 'index.html' : pathname);

  if (fs.existsSync(target) && fs.statSync(target).isFile()) {
    const ext = path.extname(target).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    return fs.createReadStream(target).pipe(res);
  }
  next();
};

async function handleRequest(
  app: any,
  router: MiniExpressRouter,
  req: any,
  res: any
) {
  const parsedUrl = url.parse(req.url, true);
  req.query = parsedUrl.query || {};
  req.params = {};
  const pathname = parsedUrl.pathname || '/';

  // Decorate response
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };

  res.json = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };

  res.send = (body: any) => {
    if (typeof body === 'object') {
      return res.json(body);
    }
    res.end(String(body));
    return res;
  };

  res.sendFile = (filePath: string) => {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const mimeMap: Record<string, string> = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript',
        '.css': 'text/css'
      };
      res.setHeader('Content-Type', mimeMap[ext] || 'text/plain');
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.status(404).end('File not found');
    }
  };

  // Run middlewares then matching routes
  const pipeline: Handler[] = [...router.middlewares];

  let matchedRoute: Route | null = null;
  for (const r of router.routes) {
    if (r.method === req.method || r.method === 'ALL') {
      const match = pathname.match(r.pattern);
      if (match) {
        matchedRoute = r;
        const vals = match.slice(1);
        r.paramNames.forEach((name, i) => {
          req.params[name] = decodeURIComponent(vals[i] || '');
        });
        pipeline.push(...r.handlers);
        break;
      }
    }
  }

  let idx = 0;
  function next(err?: any) {
    if (err) {
      res.status(500).json({ error: err.message || 'Internal Server Error' });
      return;
    }
    if (idx >= pipeline.length) {
      if (!res.writableEnded) {
        // If not found and not an API call, serve SPA index.html
        if (!pathname.startsWith('/api') && fs.existsSync(path.resolve(process.cwd(), 'public/index.html'))) {
          return res.sendFile(path.resolve(process.cwd(), 'public/index.html'));
        }
        res.status(404).json({ error: `Cannot ${req.method} ${pathname}` });
      }
      return;
    }
    const handler = pipeline[idx++];
    try {
      const resVal = handler(req, res, next);
      if (resVal && typeof resVal.catch === 'function') {
        resVal.catch((pErr: any) => next(pErr));
      }
    } catch (handlerErr: any) {
      next(handlerErr);
    }
  }

  next();
}
