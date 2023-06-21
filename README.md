# helm-viewer

- NPM: [https://www.npmjs.com/package/helm-viewer](https://www.npmjs.com/package/helm-viewer)

## Motivation

When working with [Helm Charts](https://helm.sh/docs/topics/charts/), it is often helpful to generate the template and check the final result. The `helm template` command provided by Helm serves this purpose. However, the output of this command is a large block of raw text, making it cumbersome to analyze.

The helm-viewer project aims to provide a user-friendly tool for building Helm charts.

## Installation

```bash
# Install globally
npm i -g helm-viewer
```

## Usage

```bash
# Run in a Helm chart folder
helm-viewer

# Specify a specific path
helm-viewer path/to/the/chart
```

Running the command will analyze the Helm chart and generate an HTML report, which will be automatically opened in your default web browser.

![Screenshot of the output](./.github/ressources/demo-1.png)

# Development
## Generate the binary

```bash
just
```
