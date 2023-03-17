import { createProxyServer } from 'http-proxy';
import { createServer } from 'http';
import { Socket } from 'net';

let proxy = createProxyServer();
proxy.on('error', (_err, _req, res) => {
  if (res instanceof Socket) {
    res.end();
    return;
  }

  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('500');
});

let host = process.env.PROXY_HOST ?? 'http://127.0.0.1';
if (host.endsWith('/')) {
  host = host.slice(0, host.length - 1);
}
const port = process.env.PORT ?? 3000;

createServer((req, res) => {
  const port = req.headers?.host?.split('.')[0];
  proxy.web(req, res, { target: `${host}:${port}` });
}).listen(port);

console.log(`listening on ${host}:${port}`);
