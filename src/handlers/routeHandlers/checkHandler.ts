/*
 * Title: Check Handler
 * Description: Handler to handle user defined checks
 *
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReqProperties } from "../../helpers/handleReqRes";
import data from "../../lib/data";
import { utilities } from "../../helpers/utilities";

import tokenHandler from "./tokenHandler";

import dotenv from "dotenv";
dotenv.config();

type Callback = (statusCode: number, payload?: object | string) => void;

type User = {
  post?: (reqProp: ReqProperties, callback: Callback) => void;
  put?: (reqProp: ReqProperties, callback: Callback) => void;
  get?: (reqProp: ReqProperties, callback: Callback) => void;
  delete?: (reqProp: ReqProperties, callback: Callback) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

type Handle = {
  checkHandler?: (reqProp: ReqProperties, callback: Callback) => void;
  _check: User;
};

type CheckObj = {
  id: string;
  userPhone: "string";
  protocol: string;
  method: string;
  url: string;
  successCodes: number[];
  timeoutSeconds: number;
};

const handler: Handle = {
  _check: {},
};

export default handler.checkHandler = (reqProp, callback) => {
  const methodsSet: Set<string> = new Set(["get", "put", "post", "delete"]);

  if (!methodsSet.has(reqProp.method ?? "")) {
    callback(405);
    return;
  }
  reqProp.method && handler._check[reqProp.method](reqProp, callback);
};

handler._check = {};

handler._check.post = (reqProp, callback) => {
  const protocol = validateProtocol(reqProp.body.protocol);
  const url = validateUrl(reqProp.body.url);
  const method = validateMethod(reqProp.body.method);
  const successCodes = validateSuccessCodes(reqProp.body.successCodes);
  const timeoutSeconds = validateTimeoutSeconds(reqProp.body.timeoutSeconds);

  // if all not okay throw error
  if (!(protocol && url && method && successCodes && timeoutSeconds)) {
    callback(400, { error: "You have a problem in your request." });
    return;
  }

  const tokken = (reqProp.headersObj.token as string) || "";

  const token: string | boolean = validateToken(tokken);

  if (!token) {
    callback(400, {
      error: "Problem in request!",
    });
    return;
  }

  //verify token
  data.read("tokens", token, (err, tokenData) => {
    if (!err && tokenData) {
      const userPhone = utilities.parseJSON(tokenData).phone;
      //verify token with token and phone
      data.read("users", userPhone, (err, userData) => {
        if (err || !userData) {
          callback(404, { error: "User Not Found" });
          return;
        }

        // If no error
        tokenHandler._token.verify(token, userPhone, (tokenId) => {
          if (!tokenId) {
            callback(403, { error: "Authentication Failure" });
            return;
          }
          //TOKEN verified
          const userObject = utilities.parseJSON(userData);

          const userChecks =
            userObject.checks instanceof Array ? userObject.checks : [];
          let maxChecks = 5;
          if (process.env.MAX_CHECKS) {
            maxChecks = +process.env.MAX_CHECKS;
          }
          if (userChecks.length >= maxChecks) {
            callback(401, {
              error: "User reached max check limit",
            });
            return;
          }
          //IF more checks left
          const checkId: string = utilities.getRandomString(15);
          const checkObject: CheckObj = {
            id: checkId,
            userPhone,
            protocol,
            method,
            url,
            successCodes,
            timeoutSeconds,
          };

          data.create("checks", checkId, checkObject, (err) => {
            if (err) {
              callback(500, { error: "Problem in server side" });
              return;
            }

            // ADD check id to the users object
            userObject.checks = userChecks;
            userObject.checks.push(checkId);

            //save new user data
            data.update("users", userPhone, userObject, (err) => {
              if (err) {
                callback(500, { error: "Server error" });
                return;
              }

              callback(200, checkObject);
            });
          });
        });
      });
    } else {
      callback(403, {
        error: "Authentication Problem",
      });
    }

    // if token found
  });
};

handler._check.get = (reqProp, callback) => {
  const id = validateCheckId(reqProp.qryStrObj.id as string);

  if (!id) {
    callback(400, { error: "There is a problem in your request" });
    return;
  }

  data.read("checks", id, (err, checksData) => {
    if (err || !checksData) {
      callback(500, { error: "Server Error" });
      return;
    }

    const tokken = (reqProp.headersObj.token as string) || "";
    const token: string | boolean = validateToken(tokken);

    if (!token) {
      callback(403, { error: "Invalid Token" });
      return;
    }
    const phone = utilities.parseJSON(checksData).userPhone;
    //verifying token
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        const parsedData = utilities.parseJSON(checksData);
        callback(200, parsedData);
      } else {
        callback(403, {
          error: "Authentication Failure",
        });
      }
    });
  });
};

handler._check.put = (reqProp, callback) => {
  const id = validateCheckId(reqProp.body.id);

  if (!id) {
    callback(400, {
      error: "Problem in request",
    });
    return;
  }

  const protocol = validateProtocol(reqProp.body.protocol);
  const url = validateUrl(reqProp.body.url);
  const method = validateMethod(reqProp.body.method);
  const successCodes = validateSuccessCodes(reqProp.body.successCodes);
  const timeoutSeconds = validateTimeoutSeconds(reqProp.body.timeoutSeconds);

  if (!(protocol || url || method || successCodes || timeoutSeconds)) {
    callback(304, {
      error: "Not Modified",
    });
    return;
  }

  data.read("checks", id, (err, checksData) => {
    if (err || !checksData) {
      callback(500, { error: "Server Error" });
      return;
    }

    const tokken = (reqProp.headersObj.token as string) || "";
    const token: string | boolean = validateToken(tokken);

    if (!token) {
      callback(403, { error: "Invalid Token" });
      return;
    }

    const phone = utilities.parseJSON(checksData).userPhone;
    //verifying token
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        const parsedData: CheckObj = utilities.parseJSON(checksData);

        protocol && (parsedData.protocol = protocol);
        method && (parsedData.method = method);
        url && (parsedData.url = url);
        successCodes && (parsedData.successCodes = successCodes);
        timeoutSeconds && (parsedData.timeoutSeconds = timeoutSeconds);

        data.update("checks", id, parsedData, (err) => {
          if (err) {
            callback(500, { error: "Server Error" });
            return;
          }

          callback(200, parsedData);
        });
      } else {
        callback(403, {
          error: "Authentication Failure",
        });
      }
    });
  });
};

handler._check.delete = (reqProp, callback) => {
  const id = validateCheckId(reqProp.qryStrObj.id as string);

  if (!id) {
    callback(400, { error: "There is a problem in your request" });
    return;
  }

  data.read("checks", id, (err, checksData) => {
    if (err || !checksData) {
      callback(500, { error: "Server Error" });
      return;
    }

    const tokken = (reqProp.headersObj.token as string) || "";
    const token: string | boolean = validateToken(tokken);

    if (!token) {
      callback(403, { error: "Invalid Token" });
      return;
    }
    const phone = utilities.parseJSON(checksData).userPhone;
    //verifying token
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.delete("checks", id, (err) => {
          if (err) {
            callback(500, { error: "Server Error" });
            return;
          }

          data.read("users", phone, (err, userData) => {
            if (err || !userData) {
              callback(500, { error: "Server Error" });
              return;
            }
            const parsedUser = utilities.parseJSON(userData);

            let userChecks =
              typeof parsedUser.checks === "object" &&
              parsedUser.checks instanceof Array
                ? parsedUser.checks
                : [];

            userChecks = parsedUser.checks;

            const checksArr = [...userChecks];

            const indexOfCheck = checksArr.indexOf(id);

            if (indexOfCheck < 0) {
              callback(500, { error: "Server Errorey" });
              return;
            }

            //if check found in user's checks array
            checksArr.splice(indexOfCheck, 1);
            parsedUser.checks = checksArr;

            data.update("users", phone, parsedUser, (err) => {
              if (err) {
                callback(500, { error: "Server Error" });
                return;
              }

              callback(200, {
                message: "Check data deleted successfully",
              });
            });
          });
        });
      } else {
        callback(403, {
          error: "Authentication Failure",
        });
      }
    });
  });
};

// VALIDATION LOGIC
function validateProtocol(protocol: any) {
  const allowedProtocols: Set<string> = new Set(["http", "https"]);
  const validProtocol: string | false =
    typeof protocol === "string" && allowedProtocols.has(protocol)
      ? protocol
      : false;
  return validProtocol;
}

function validateUrl(url: any): string | false {
  const validUrl =
    typeof url === "string" && url.trim().length > 0 ? url : false;

  return validUrl;
}

function validateMethod(method: any): string | false {
  const allowedMethods: Set<string> = new Set(["get", "post", "put", "delete"]);

  const validMethod =
    typeof method === "string" &&
    allowedMethods.has(method.toLowerCase().trim())
      ? method
      : false;
  return validMethod;
}

function validateSuccessCodes(successCodes: any): number[] | false {
  if (successCodes.every((item: any) => typeof item === "number")) {
    return successCodes;
  }
  return false;
}
function validateTimeoutSeconds(timeout: any): number | false {
  if (typeof +timeout !== "number") return false;

  const validTimout =
    timeout % 1 === 0 && timeout >= 1 && timeout <= 5 ? timeout : false;

  return validTimout;
}

function validateToken(token: string): string | false {
  const tkn =
    typeof token === "string" && token.trim().length === 20 ? token : false;
  return tkn;
}

function validateCheckId(checkId: string): string | false {
  const cid =
    typeof checkId === "string" && checkId.trim().length === 15
      ? checkId
      : false;
  return cid;
}
