# helm-viewer-api

## Spec

### Upload a chart

```
curl -X POST http://localhost:8000/charts -H 'Content-type: application/json' --data '{ "chartId": "efef", "content": "dzalmfjeoijf" }'
```

### Download a chart

```
curl http://localhost:8000/charts/toto
```
