import http, { IncomingMessage, ServerResponse } from "http";
import { parse, UrlWithParsedQuery } from "url";
import { StringDecoder } from "string_decoder";

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
  const parsedUrl: UrlWithParsedQuery = parse(req.url!, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path?.replace(/^\/+|\/(?=\?)|\/$/g, "");

  const method = req.method?.toLowerCase();
  const qryStrObj = parsedUrl.query;
  const headersObj = req.headers;

  const decoder = new StringDecoder("utf-8");
  let realData: string = "";

  req.on("data", (buffer: Buffer) => {
    realData += decoder.write(buffer);
  });

  req.on("end", () => {
    realData += decoder.end();
    console.log(realData);
  });

  console.log(headersObj);

  console.log(trimmedPath);
  console.log(qryStrObj);

  res.end("Hello Pooogiess");
};

app.createServer();
