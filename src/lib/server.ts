// Description: Project Initial file
import http, { IncomingMessage, ServerResponse } from "http";
import handler from "../helpers/handleReqRes";
import environment from "../helpers/environments";
// import data from "./lib/data";

type App = {
  //config?: AppConfig;
  createServer: () => void;
  handleReqRes?: (req: IncomingMessage, res: ServerResponse) => void;
  init: () => void;
};

const app: App = {
  createServer: () => {},
  init: () => {},
};

app.createServer = () => {
  const server = http.createServer(app.handleReqRes);

  server.listen(environment.port, () => {
    console.log(`Listening to port ${environment.port}`);
  });
};

app.handleReqRes = handler.handleReqRes;

app.init = () => app.createServer();

export default app;
