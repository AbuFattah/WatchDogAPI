/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This page handles all routes
 */
import { sampleHandler } from "./handlers/routeHandlers/sampleHandler";
import { handler } from "./handlers/routeHandlers/userHandler";

type Routes = {
  sample?: typeof sampleHandler.handle;
  [key: string]: any;
};

const routes: Routes = {
  sample: sampleHandler.handle,
  user: handler.userHandler,
};

export default routes;
