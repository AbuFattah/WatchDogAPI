import { ReqProperties } from "../../helpers/handleReqRes";

type Callback = (statusCode: number, payload: object | string) => void;

type Handle = {
  handle?: (reqProp: ReqProperties, callback: Callback) => void;
};

export const sampleHandler: Handle = {};

sampleHandler.handle = (reqProp, callback) => {
  callback(200, {
    message: "Hellow this is sample handler",
  });
};
