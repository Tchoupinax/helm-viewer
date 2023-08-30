import { describe, it } from 'vitest'
import { uploadFileToS3 } from './upload-to-s3'

describe('upload to s3', () => {
  it('should upload a file', async () => {
    await uploadFileToS3("toto", Buffer.from('Test'));
  })
})