//dependencies
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

import dotenv from "dotenv";
import lib from "./data";
import { utilities } from "../helpers/utilities";
dotenv.config();

type Check = {
  id: string;
  userPhone: string;
  protocol: "http" | "https";
  method: "get" | "post" | "put";
  url: string;
  successCodes: number[];
  timeoutSeconds: number;
};

type Worker = {
  init?: () => void;
  gatherAllChecks?: () => string[];
};

const worker: Worker = {};

worker.init = () => {};

worker.gatherAllChecks = () => {
  lib.list("checks", (err, checkIds) => {
    if (err) console.log("Could not find any checks to process");

    checkIds = checkIds as string[];

    checkIds.forEach((checkId) => {
      lib.read("checks", checkId, (err, checkData) => {
        if (err) {
          console.log("Error reading one of checks data");
          return;
        }

        if (checkData) {
          const parsedCheck = utilities.parseJSON(checkData as string);
          
        }
      });
    });
  });
};

const checks = worker.gatherAllChecks();

const allChecks: Check[] = [
  {
    id: "fh93gtv8x0xuh37",
    userPhone: "01966666666",
    protocol: "http",
    method: "get",
    url: "www.facebook.com",
    successCodes: [200, 201],
    timeoutSeconds: 2,
  },
  {
    id: "fh93gtv8x0xuh37",
    userPhone: "01966666666",
    protocol: "http",
    method: "get",
    url: "www.google.com",
    successCodes: [200, 201],
    timeoutSeconds: 2,
  },
];

const initiateCheck = (checkId: Check) => {
  let prevStatus = -1;
  let checksCount = 0;

  if (process.env.MAX_CHECKS && checksCount > +process.env.MAX_CHECKS) {
    console.log(`Check limit is over for the check id: ${checkId.id}`);
    return;
  }

  const intervalId = setInterval(() => {
    const options: http.RequestOptions = {
      hostname: checkId.url,
      method: checkId.method,
    };

    const request = http.request(options, (res) => {
      const status = res.statusCode as number;

      if (checkId.successCodes.includes(200)) {
        if (prevStatus !== 1) {
          const isoTimestamp = new Date().toISOString();
          console.log(`${isoTimestamp}\n${checkId.url} is Up and running`);
          prevStatus = 1;
          checksCount++;
        }
      } else {
        // console.log("prevstatus: ", prevStatus);
        if (prevStatus !== 0) {
          const isoTimestamp = new Date().toISOString();
          console.log(`${isoTimestamp}\n${checkId.url} is down`);
          prevStatus = 0;
          checksCount++;
        }
      }
    });

    request.on("error", (err) => {
      console.log("error happened: " + err);
    });

    request.end();
  }, checkId.timeoutSeconds * 1000);
};

allChecks.forEach((check) => {
  initiateCheck(check);
});

console.log("hhelleooo");
export default worker;
