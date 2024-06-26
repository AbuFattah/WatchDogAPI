/*
 * Title: Handle Request Response
 * Description: Handle Resquest and response
 *
 */
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { StringDecoder } from "string_decoder";
import { parse, UrlWithParsedQuery } from "url";
import routes from "../routes";
import { notFoundHandler } from "../handlers/routeHandlers/notFoundHandler";
import { ParsedUrlQuery } from "querystring";
import { utilities } from "./utilities";

type Handle = {
  handleReqRes?: (req: IncomingMessage, res: ServerResponse) => void;
};

export type ReqProperties = {
  parsedUrl: UrlWithParsedQuery;
  path: string | null;
  trimmedPath: string;
  method: string | undefined;
  qryStrObj: ParsedUrlQuery;
  headersObj: IncomingHttpHeaders;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: { [key: string]: any };
};

const handler: Handle = {};

handler.handleReqRes = (req, res) => {
  const parsedUrl: UrlWithParsedQuery = parse(req.url!, true);
  const path = parsedUrl.pathname;

  const trimmedPath = path?.replace(/^\/+|\/(?=\?)|\/$/g, "") as string;
  const method = req.method?.toLowerCase();
  const qryStrObj = parsedUrl.query;
  const headersObj = req.headers;

  const requestProperties: ReqProperties = {
    parsedUrl,
    path,
    trimmedPath,
    method,
    qryStrObj,
    headersObj,
    body: {},
  };

  const chosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler.handle;

  const decoder = new StringDecoder("utf-8");
  let realData: string = "";

  req.on("data", (buffer: Buffer) => {
    realData += decoder.write(buffer);
  });

  req.on("end", () => {
    realData += decoder.end();
    console.log(realData);
    requestProperties.body = utilities.parseJSON(realData);
    chosenHandler(
      requestProperties,
      (statusCode: number, payload: string | object) => {
        //
        payload = typeof payload === "object" ? payload : {};
        const payloadStr = JSON.stringify(payload);

        res.setHeader("Content-Type", "application/json");
        res.writeHead(statusCode);
        res.end(payloadStr);
      }
    );
  });
};

export default handler;
