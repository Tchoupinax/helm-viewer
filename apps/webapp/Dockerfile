FROM node:25-alpine AS builder

RUN apk add --no-cache --virtual .gyp git

# Install pnpm (Alpine image doesn't include Corepack)
RUN npm install -g pnpm

ARG BACKEND_ENDPOINT

ENV BACKEND_ENDPOINT=$BACKEND_ENDPOINT

WORKDIR /app

COPY package.json /app/

RUN pnpm install

COPY . .

RUN pnpm build

#########################################################
#########################################################

FROM node:25-alpine

WORKDIR /app

COPY --from=builder /app/.output /app/.output

EXPOSE 80

CMD NITRO_HOST=0.0.0.0 NITRO_PORT=80 node .output/server/index.mjs
