import http from "http";
import chalk from "chalk";

export function serverFileTemporary(payload: Object, port: number) {
  return new Promise((resolve) => {
    const httpServer = http.createServer((request, response) => {
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      };

      if (request.method === "OPTIONS") {
        response.writeHead(200, headers);
        response.end();
        return;
      }

      response.writeHead(200, headers);
      response.end(JSON.stringify(payload), "utf-8");
      console.log(chalk.cyanBright(`Closing server on port ${port}...`));

      httpServer.close(() => {
        resolve(undefined);
      });

      setTimeout(() => {
        httpServer.emit("close");
      }, 100);
    });

    httpServer.listen(port);
  });
}
