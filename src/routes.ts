/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This page handles all routes
 */
import { sampleHandler } from "./handlers/routeHandlers/sampleHandler";
import userHandler from "./handlers/routeHandlers/userHandler";
import tokenHandler from "./handlers/routeHandlers/tokenHandler";
import checkHandler from "./handlers/routeHandlers/checkHandler";

type Routes = {
  sample?: typeof sampleHandler.handle;
  [key: string]: any;
};

const routes: Routes = {
  sample: sampleHandler.handle,
  user: userHandler,
  token: tokenHandler.tokenHandler,
  check: checkHandler,
};

export default routes;
