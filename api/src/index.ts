import express from 'express';
import cors from 'cors'
import { uploadFileToS3 } from './infrastructure/upload-to-s3';
import { readFileFromS3 } from './infrastructure/read-from-s3';

const app = express();

app.use(express.json())
app.use(cors())

app.get('/charts/:chartId', async (req, res) => {
  const { chartId } = req.params;
  console.log(chartId, " downloaded!")
  const file = await readFileFromS3(chartId);
  return res.send(file)
})

app.post('/charts', async (req, res) => {
  console.log(req.body.chartId, " uploaded!")
  await uploadFileToS3(req.body.chartId, req.body.content);
  return res.send({
    chartId: req.body.chartId
  })
});

app.listen(8000, () => {
  console.log('helm-viewer-api listening on 8000');
});
