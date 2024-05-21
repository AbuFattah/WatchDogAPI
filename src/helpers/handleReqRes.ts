import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { StringDecoder } from "string_decoder";
import { parse, UrlWithParsedQuery } from "url";
import routes from "../routes";
import { notFoundHandler } from "../handlers/routeHandlers/notFoundHandler";
import { ParsedUrlQuery } from "querystring";

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
};

const handler: Handle = {};

handler.handleReqRes = (req, res) => {
  const parsedUrl: UrlWithParsedQuery = parse(req.url!, true);
  const path = parsedUrl.pathname;

  const trimmedPath = path?.replace(/^\/+|\/(?=\?)|\/$/g, "") as string;
  const method = req.method?.toLowerCase();
  const qryStrObj = parsedUrl.query;
  const headersObj = req.headers;

  const requestProperties = {
    parsedUrl,
    path,
    trimmedPath,
    method,
    qryStrObj,
    headersObj,
  };

  const decoder = new StringDecoder("utf-8");
  let realData: string = "";

  req.on("data", (buffer: Buffer) => {
    realData += decoder.write(buffer);
  });

  const chosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler.handle;

  chosenHandler(
    requestProperties,
    (statusCode: number, payload: string | object) => {
      //
      payload = typeof payload === "object" ? payload : {};
      const payloadStr = JSON.stringify(payload);

      res.writeHead(statusCode);
      res.end(payloadStr);
    }
  );

  req.on("end", () => {
    realData += decoder.end();
  });
};

export default handler;
