# Changelog

## 1.0.0 | 2026-08-22

First stable release. The viewer keeps the same local-first, encrypted-share workflow, with a rebuilt interface.

#### Features

- Redesign the web UI: header with chart metadata, filterable sidebar, editor chrome, and status bar
- Add light and dark themes, with a toggle persisted in the browser
- Show recent charts on the empty state
- Display a live watch / snapshot indicator when the CLI websocket is connected

#### Fixes

- Open source files under `templates/` correctly
- Keep the current file after a live chart reload
- Allow dismissing Helm render errors

#### Chores

- Align CLI, webapp, and workspace versions
- Require Node.js >= 20 on the published CLI package
- Upgrade dependencies

## 0.19.0 | 2024-11-04

#### Chores

- Upgrade dependencies
- Eslint configuration

## 0.17.1 | 2024-07-11

#### Fixes

- When the name of resources is changed, the editor refreshes automatically

## 0.16.0 | 2024-06-08

#### Features

- Improve UI when selecting file

## 0.15.0 | 2024-06-08

#### Features

- Automatically install helm dependencies if possible
- Remove trailing slash on `BACKEND_ENDPOINT`

## 0.10.0 | 2023-09-21

#### Features

- Configure S3 Client to accept IAM based configuration backend

#### Docs

- Fix and add documentation about how to build Docker image with custom backend endpoint

## 0.9.0 | 2023-09-21

#### Features

- Provide Docker container for the webapp

## 0.8.0 | 2023-09-21

#### Features

- Allow to target a different backend via env var (`BACKEND_ENDPOINT`, cli and webapp)

## 0.6.0 | 2023-09-14

We release the watch feature: be able to watch your local change and reload the UI!

## 0.5.0 | 2023-09-03

This new release bring the ability to compute a chart and to share it easily by url, no more required. The content of the chart is e2e encrypted so it's safe.

#### Features

- Allow to share a chart by a link (CI compatibility)
- Improve UX

## 0.3.0 | 2023-06-25

#### Features

- Allow to use an external values file to compute the chart

## 0.2.0 | 2023-06-21

#### Docs

- Improve docs

## 0.2.0rc-1 | 2023-06-21

This is the first published feature. The report provides a way to see yaml files in the chart and to see each file's details.

#### Features

- Integation of Monaco editor to have a beautiful yaml view
