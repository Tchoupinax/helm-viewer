# helm-viewer

- Github: https://github.com/Tchoupinax/helm-viewer
- NPM: https://www.npmjs.com/package/helm-viewer

## Motivation

When you are writing a [helm Chart](https://helm.sh/docs/topics/charts/), you often want to generate the template and check what is the final result. To reach this goal, helm provides this command : `helm template`.

However, the output of this command is a huge raw text and it is mainly painful.

This project aims to give you the right tool to build helm chart.

Also, as DevOps we build, maintain and deploy our chart. When we do a review of a chart, it is hard to determine if the chart is correctly done or not. A subgoal is to easily build the chart in the CI and be able to see the built chart from a link, automatically pasted in the merge request.

## Features

- Local usage by design: if you don't do nothing, all what you do works offline. Your date are not sent, no backend server is used.
- Create a sharing link by CLI or Web interface. Read a chart from a link, only. Internet required.
- Encryption by design: You can share the result with link. Data are encrypted end-to-end by designed and then stored on S3. The encrypted key in the shared link is the **only way** to access your data. Backend side is just a proxy to store charts on a S3 backend.

## Installation

```bash
# Install globally
npm i -g helm-viewer
```

## Usage

```bash
# When you are in a chart helm folder
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

The application is a CLI alone. If you want to use the share and the CI feature, you need to use the backend (e2e encryption). If you want to host the backend on your side, you can customize the app using the env var `BACKEND_ENDPOINT`.

```bash
BACKEND_ENDPOINT="http://my-custom-domain.com" helm-viewer my-chart --push
```

And do not forget to provide the env var to our backend!

# Development
## Generate the binary

```
just
```

