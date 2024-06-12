import { createServer } from "http";
import { createProxyServer } from "http-proxy";
import { Socket } from "net";
import { exit } from "process";
import config from "../config";

interface Options {
  whiteList: number[];
}

export function defineConfig(options: Options) {
  return options;
}

let portWhiteList = new Set();
for (let x of config.whiteList) {
  portWhiteList.add(x);
}

let proxy = createProxyServer({
  ws: true,
});
proxy.on("error", (_err, _req, res) => {
  if (res instanceof Socket) {
    res.end();
    return;
  }

  res.writeHead(500, {
    "Content-Type": "text/plain",
  });
  res.end("500");
});

let host = process.env.PROXY_HOST ?? "http://127.0.0.1";
if (host.endsWith("/")) {
  host = host.slice(0, host.length - 1);
}
const port = process.env.PORT ?? 3000;

const server = createServer((req, res) => {
  const port = parseInt(req.headers?.host?.split(".")[0] ?? "");

  if (isNaN(port)) {
    res.writeHead(400, { "Content-Type": "text-plain" });
    res.end("400");
    return;
  }

  if (!portWhiteList.has(port)) {
    res.writeHead(403, { "Content-Type": "text-plain" });
    res.end("403");
    return;
  }

  proxy.web(req, res, { target: `${host}:${port}` });
});

server.on("upgrade", (req, socket, head) => {
  const port = parseInt(req.headers?.host?.split(".")[0] ?? "");

  if (isNaN(port) || !portWhiteList.has(port)) {
    socket.destroy();
    return;
  }

  proxy.ws(req, socket, head, {
    target: `${host.replace("http", "ws")}:${port}`,
  });
});

server.listen(port);

console.log(`listening on ${host}:${port}`);

process.on("SIGTERM", () => {
  console.log("closing server...");
  server.close(() => {
    exit();
  });
});

process.on("SIGINT", () => {
  console.log("closing server...");
  server.close(() => {
    exit();
  });
});
