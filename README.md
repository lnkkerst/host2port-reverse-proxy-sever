# host2port-reverse-proxy-server

A simple sever to proxy port specified by host.

## Configuration

create `config.ts`

```typescript
// config.ts

import { defineConfig } from './src';

export default defineConfig({
  whiteList: [
    ...Array.from({ length: 100 }, (_v, index) => index),
    3000,
    3001,
    8080
  ]
});
```

## Usage

### Build

```bash
pnpm run build
```

### Production

```bash
node dist/index.js
```

### Docker

`docker-compose`

```bash
docker-compose up -d
```
