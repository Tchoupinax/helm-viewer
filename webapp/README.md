# helm-viewer-api

## Spec

### Upload a chart

```
curl -X POST http://localhost:3000/api/chart-upload -H 'Content-type: application/json' --data '{ "chartId": "efef", "content": "dzalmfjeoijf" }'
```

### Download a chart

```
curl http://localhost:3000/api/chart-download?chartId=efef22
```
