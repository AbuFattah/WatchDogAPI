import { ReqProperties } from "../../helpers/handleReqRes";
import data from "../../lib/data";
import { utilities } from "../../helpers/utilities";

type Callback = (statusCode: number, payload?: object | string) => void;

type User = {
  post?: (reqProp: ReqProperties, callback: Callback) => void;
  put?: (reqProp: ReqProperties, callback: Callback) => void;
  get?: (reqProp: ReqProperties, callback: Callback) => void;
  delete?: (reqProp: ReqProperties, callback: Callback) => void;
  verify: (id: string, phone: string, callback: (res: boolean) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

type Handle = {
  tokenHandler: (reqProp: ReqProperties, callback: Callback) => void;
  _token: User;
};

type Token = {
  phone: string;
  id: string;
  expires: number;
};

const handler: Handle = {
  _token: { verify: () => {} },
  tokenHandler: () => {},
};

handler.tokenHandler = (reqProp, callback) => {
  const methodsSet: Set<string> = new Set(["get", "put", "post", "delete"]);

  if (!methodsSet.has(reqProp.method ?? "")) {
    callback(405);
    return;
  }
  reqProp.method && handler._token[reqProp.method](reqProp, callback);
};

handler._token = {
  verify: () => {},
};

handler._token.post = (reqProp, callback) => {
  const phone = validatePhone(reqProp.body.phone);
  const password = reqProp.body.password;

  if (!(phone && password)) {
    callback(400, { error: "There is a problem with your request" });
    return;
  }

  data.read("users", phone, (err, userData) => {
    if (err) {
      callback(500, { error: "Sever Error" });
      return;
    }

    //const userPassword: string = utilities.parseJSON(userData || "");
    //const hashed = utilities.hash(userPassword);

    const hashedPassword = utilities.hash(password);
    const hashed = utilities.parseJSON(userData as string).password;

    if (hashed !== hashedPassword) {
      callback(400, {
        error: "Invalid Password",
      });
      return;
    }

    const tokenId = utilities.getRandomString(20);
    const expires = Date.now() + 60 * 60 * 1000;
    const tokenObj: Token = {
      expires,
      phone,
      id: tokenId,
    };

    data.create("tokens", tokenId, tokenObj, (err) => {
      if (err) {
        callback(500, {
          error: "Server side error",
        });
        return;
      }
      callback(200, tokenObj);
    });
  });
};

handler._token.get = (reqProp, callback) => {
  const id = reqProp.qryStrObj.id as string;

  if (!validateToken(id)) {
    callback(404, {
      error: "Requested token was not founfd",
    });
  }
  //if valid phone
  data.read("tokens", id, (err, data) => {
    if (err) {
      callback(500, {
        error: "Server Error",
      });
      return;
    }
    //if no error
    const token = utilities.parseJSON(data || "");
    callback(200, token);
  });
};

handler._token.put = (reqProp, callback) => {
  const id = validateToken(reqProp.body.id);
  const extend = typeof reqProp.body.extend === "boolean" ? true : false;

  if (!(id && extend)) {
    callback(400, { error: "Problem in request" });
    return;
  }

  data.read("tokens", id, (err, tokenData) => {
    if (err) {
      callback(500, { error: "Server Error" });
      return;
    }

    const parsedToken: Token = utilities.parseJSON(tokenData as string);

    // check if expired
    if (parsedToken.expires < Date.now()) {
      callback(400, { error: "Token Expired" });
      return;
    }

    // refresh token
    parsedToken.expires = Date.now() + 60 * 60 * 1000;
    data.update("tokens", id, parsedToken, (err) => {
      if (err) {
        callback(500, { error: "Server Error" });
        return;
      }

      callback(200, parsedToken);
    });
  });
};

handler._token.delete = (reqProp, callback) => {
  const id = validateToken(reqProp.qryStrObj.id as string);

  if (!id) {
    callback(400, { error: "There is a problem in your request" });
    return;
  }

  data.delete("tokens", id, (err) => {
    if (err) {
      callback(500, { error: "Server Error" });
      return;
    }

    callback(200, {
      message: "Token deleted successfully",
    });
  });
};

handler._token.verify = (id, phone, callback) => {
  data.read("tokens", id, (err, tokenData) => {
    if (err) {
      callback(false);

      return;
    }

    if (tokenData) {
      const parsedToken: Token = utilities.parseJSON(tokenData);

      if (phone === parsedToken.phone && parsedToken.expires > Date.now()) {
        callback(true);
        return;
      }

      callback(false);
    }
  });
};

function validateToken(token: string): string | false {
  const tkn =
    typeof token === "string" && token.trim().length === 20 ? token : false;
  return tkn;
}

function validatePhone(phone: string): string | false {
  const phn =
    typeof phone === "string" && phone.trim().length === 11 ? phone : false;

  return phn;
}

export default handler;
