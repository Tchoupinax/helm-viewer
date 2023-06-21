# helm-viewer

## Motivation

When you are writing a [helm Chart](https://helm.sh/docs/topics/charts/), you often want to generate the template and check what is the final result. To reach this goal, helm provides this command : `helm template`.

However, the output of this command is a huge raw text and it is mainly painful.

This project aims to give you the right tool to build helm chart.

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
```

It will analyze the helm chart and generate a HTML report, automatically opened in your favorite browser.


# Development
## Generate the binary

```
just
```

