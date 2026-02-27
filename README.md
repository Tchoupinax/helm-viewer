<div align="center">

# ⎈ helm-viewer

**Instantly visualize your Helm chart templates in the browser**

[![Build](https://github.com/Tchoupinax/helm-viewer/actions/workflows/pull-request.yml/badge.svg)](https://github.com/Tchoupinax/helm-viewer/actions/workflows/pull-request.yml)
[![Release](https://github.com/Tchoupinax/helm-viewer/actions/workflows/tag.yml/badge.svg)](https://github.com/Tchoupinax/helm-viewer/actions/workflows/tag.yml)
[![npm version](https://img.shields.io/npm/v/helm-viewer?color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/helm-viewer)
[![npm downloads](https://img.shields.io/npm/dm/helm-viewer?color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/helm-viewer)
[![Docker Pulls](https://img.shields.io/docker/pulls/tchoupinax/helm-viewer-webapp?color=2496ed&logo=docker&logoColor=white)](https://hub.docker.com/r/tchoupinax/helm-viewer-webapp)
[![Docker Image Size](https://img.shields.io/docker/image-size/tchoupinax/helm-viewer-webapp/latest?color=2496ed&logo=docker&logoColor=white)](https://hub.docker.com/r/tchoupinax/helm-viewer-webapp)
[![Node.js >= 20](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/github/license/Tchoupinax/helm-viewer?color=blue)](https://github.com/Tchoupinax/helm-viewer/blob/master/LICENSE)

[GitHub](https://github.com/Tchoupinax/helm-viewer) · [npm](https://www.npmjs.com/package/helm-viewer) · [Docker Hub](https://hub.docker.com/r/tchoupinax/helm-viewer-webapp)

</div>

## Motivation

When writing a [helm Chart](https://helm.sh/docs/topics/charts/), you often want to generate the template and check what the final result is. To help reach this goal, helm provides this command : `helm template`.

However, the command output is a huge raw text and it's very painful to read.

This project aims to give you the right tool to build helm chart.

Also as DevOps we, build, maintain and deploy our charts. When doing a chart review, it may be hard to determine if the chart is correctly done. A subgoal is to easily build the chart in the CI and be able to see the built chart from a link, automatically pasted in the merge request.

## Features

- Local by design : all your work is offline. Your data are not sent anywhere and no backend server is used.
- Create a share link by using the CLI or the Web interface. Read a chart from a link, only. Internet's required.
- Encryption by design: You can share the result with a link. Data are encrypted end-to-end and then stored on S3. The encrypted key in the shared link is the **only way** to access your data. Backend side is just a proxy to store charts on a S3 backend.

## Installation

⚠️ Node.js >= 20 is required to use the CLI

```bash
# Install globally
npm i -g helm-viewer
```

## Usage

```bash
# When you are in a helm chart folder
helm-viewer

# To target a specific path
helm-viewer path/of/the/chart

# To compute the chart with an external values file
helm-viewer path/of/the/chart path/of/the/values/file

# To get a public link (with encrypted data)
helm-viewer path/of/the/chart --push
```

It will analyze the helm chart and generate a HTML report, automatically opened in your favorite browser.

# Selfhost

The application is only a CLI. If you want to use the share and the CI feature, you need to use the backend (e2e encryption). If you want to host the backend on your side, you can customize the app using the env var `BACKEND_ENDPOINT`.
Also, you can provide a different url for the push operation and the read operation. By default, both will be defined by `BACKEND_ENDPOINT`. If you want to set a different url for the read operation, you can do it by `BACKEND_READ_ENDPOINT`.

```bash
BACKEND_ENDPOINT="http://my-custom-domain.com" helm-viewer my-chart --push
```

And do not forget to provide the env var to your backend!

```bash
BACKEND_S3_BUCKETNAME=""
```

⚠️ For the moment, the custom BACKEND_ENDPOINT must be provided while building the Docker image for the frontend

```bash
docker build -t myregistry.com/helm-viewer-webapp --build-arg BACKEND_ENDPOINT=https://custom.url .
```

# Development
## Generate the binary

```
just
```
