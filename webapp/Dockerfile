FROM node:24-alpine AS builder

RUN  apk add --no-cache --virtual .gyp git

ARG BACKEND_ENDPOINT

ENV BACKEND_ENDPOINT=$BACKEND_ENDPOINT

WORKDIR /app

COPY package.json yarn.lock /app

RUN yarn

COPY . .

RUN yarn build

#########################################################
#########################################################

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/.output /app/.output

EXPOSE 80

CMD NITRO_HOST=0.0.0.0 NITRO_PORT=80 node .output/server/index.mjs
