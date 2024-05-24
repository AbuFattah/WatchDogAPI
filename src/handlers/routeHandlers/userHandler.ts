import { ReqProperties } from "../../helpers/handleReqRes";
import data from "../../lib/data";
import { utilities } from "../../helpers/utilities";

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
  userHandler?: (reqProp: ReqProperties, callback: Callback) => void;
  _users: User;
};

const handler: Handle = {
  _users: {},
};

export default handler.userHandler = (reqProp, callback) => {
  const methodsSet: Set<string> = new Set(["get", "put", "post", "delete"]);

  if (!methodsSet.has(reqProp.method ?? "")) {
    callback(405);
    return;
  }
  reqProp.method && handler._users[reqProp.method](reqProp, callback);
};

handler._users = {};

handler._users.get = (reqProp, callback) => {
  const phone = reqProp.qryStrObj.phone as string;

  if (!validatePhone(phone)) {
    callback(404, {
      error: "Requested user was not founfd",
    });
  }
  //if valid phone
  data.read("users", phone, (err, data) => {
    if (err) {
      callback(500, {
        error: "Server Error",
      });
      return;
    }
    //if no error
    const user = utilities.parseJSON(data || "");
    delete user.password;
    callback(200, user);
  });
};

handler._users.put = (reqProp, callback) => {
  const phone = validatePhone(reqProp.body.phone);

  if (!phone) {
    callback(400, { error: "There is a problem with your request" });
    return;
  }

  data.read("users", phone, (err, dta) => {
    if (err) {
      callback(400, { error: "There is a problem with your request" });
      return;
    }

    const userData = utilities.parseJSON(dta || "");

    const firstName = validateName(reqProp.body.firstName);
    const lastName = validateName(reqProp.body.lastName);
    const password = validateName(reqProp.body.password);

    firstName && (userData.firstName = firstName);
    lastName && (userData.lastName = lastName);
    password && (userData.password = utilities.hash(password));

    data.update("users", phone, userData, (err) => {
      if (err) {
        callback(500, {
          error: "There was a problem in server side",
        });
        return;
      }

      callback(200, {
        message: "User updated successfully ",
      });
    });
  });
};

handler._users.post = (reqProp, callback) => {
  const firstName = validateName(reqProp.body.firstName);
  const lastName = validateName(reqProp.body.lastName);
  const phone = validatePhone(reqProp.body.phone);
  const password = validatePwd(reqProp.body.password);
  const tosAgreement = validateTosAgreement(reqProp.body.tosAgreement);

  if (firstName && lastName && phone && password && tosAgreement) {
    data.read("users", phone, (err) => {
      if (err) {
        const userObj = {
          firstName,
          lastName,
          phone,
          password: password && utilities.hash(password as string),
          tosAgreement,
        };
        data.create("users", phone, userObj, (err) => {
          if (err) {
            callback(500, { error: "Internal Error" });
            return;
          }
          callback(200, {
            msg: "User created successfully",
          });
        });
      } else {
        callback(500, {
          error: "Server Error",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

handler._users.delete = (reqProp, callback) => {
  const phone = validatePhone(reqProp.qryStrObj.phone as string);
  if (!phone) {
    callback(400, { error: "You have a problem in your request." });
    return;
  }

  data.read("users", phone, (err) => {
    if (err) {
      callback(500, {
        error: "There is a problem in Server side",
      });
      return;
    }
    data.delete("users", phone, (err) => {
      if (err) {
        callback(500, {
          error: "There is a problem in Server side",
        });
        return;
      }

      callback(200, {
        message: "User deleted successfully",
      });
    });
  });
};

// VALIDATION LOGIC
function validateName(firstName: string) {
  const fName: string | false =
    typeof firstName === "string" && firstName.trim().length > 0
      ? firstName
      : false;
  return fName;
}

function validatePhone(phone: string): string | false {
  const phn =
    typeof phone === "string" && phone.trim().length === 11 ? phone : false;

  return phn;
}

function validatePwd(password: string): string | false {
  const pwd =
    typeof password === "string" && password.trim().length > 0
      ? password
      : false;

  return pwd;
}

function validateTosAgreement(tosAgreement: boolean): boolean {
  const tosAgmt = typeof tosAgreement === "boolean" ? tosAgreement : false;

  return tosAgmt;
}
