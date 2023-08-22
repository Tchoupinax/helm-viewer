import http from 'http'

export function serverFileTemporary(payload: Object, port: number) {
  return new Promise(resolve => {
    const httpServer = http.createServer((_, response) => {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      };
  
      response.writeHead(200, headers);
      response.end(JSON.stringify(payload), 'utf-8');
      console.log('Closing server...')
      httpServer.close(() => {
        resolve(undefined)
      });
    });

    httpServer.listen(port)
  });
}