import server from "./lib/server";
import worker from "./lib/worker";

const app = {
  init: () => {},
};

app.init = () => {
  server.init();
  worker.init();
};

app.init();

export default app;
