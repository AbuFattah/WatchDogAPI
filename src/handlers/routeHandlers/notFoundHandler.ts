import { ReqProperties } from "../../helpers/handleReqRes";

type Callback = (statusCode: number, payload: object | string) => void;

type Handle = {
  handle?: (reqProp: ReqProperties, callback: Callback) => void;
};

export const notFoundHandler: Handle = {};

notFoundHandler.handle = (reqProp, callback) => {
  callback(200, {
    messaage: "Request Not Found Sorry UwU.",
  });
  console.log("Not Found");
};
