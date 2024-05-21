/* eslint-disable @typescript-eslint/no-explicit-any */
import { sampleHandler } from "./handlers/routeHandlers/sampleHandler";

type Routes = {
  sample?: typeof sampleHandler.handle;
  [key: string]: any;
};

const routes: Routes = {
  sample: sampleHandler.handle,
};

export default routes;
