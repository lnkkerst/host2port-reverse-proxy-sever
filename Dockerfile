FROM node:20-alpine as build-stage

WORKDIR /app
RUN corepack enable

COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

RUN pnpm build

FROM node:20-alpine as production-stage

WORKDIR /app
COPY --from=build-stage /app/dist/index.js ./
ENV PORT=80
EXPOSE 80

CMD ["node", "index.js"]
