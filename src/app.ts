import http, { IncomingMessage, ServerResponse } from "http";

type App = {
  config?: AppConfig;
  createServer?: () => void;
  handleReqRes?: (req: IncomingMessage, res: ServerResponse) => void;
};

type AppConfig = {
  port?: number;
};

const app: App = {};

app.config = {
  port: 3000,
};

app.createServer = () => {
  const server = http.createServer(app.handleReqRes);

  server.listen(app.config?.port, () => {
    console.log(`Listening to port ${app.config?.port}`);
  });
};

app.handleReqRes = (req, res) => {
  res.end("Hello Pooogiess");
};

app.createServer();
