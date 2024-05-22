import http, { IncomingMessage, ServerResponse } from "http";
import handler from "./helpers/handleReqRes";
import environment from "./helpers/environments";
import data from "./lib/data";

type App = {
  //config?: AppConfig;
  createServer?: () => void;
  handleReqRes?: (req: IncomingMessage, res: ServerResponse) => void;
};

// type AppConfig = {
//   port?: number;
// };

const app: App = {};

// data.delete("test", "newFile", (err) => {
//   console.log(err);
// });

// app.config = {
//   port: 3000,
// };

app.createServer = () => {
  const server = http.createServer(app.handleReqRes);

  server.listen(environment.port, () => {
    console.log(`Listening to port ${environment.port}`);
  });
};

app.handleReqRes = handler.handleReqRes;

app.createServer();
