import dotenv from "dotenv";
dotenv.config();

type EnvDetail = {
  port: string;
  envName: string;
};

type Environment = {
  staging?: EnvDetail;
  production?: EnvDetail;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const environemnts: Environment = {};

environemnts.staging = {
  port: process.env.STAGINGPORT || "3000",
  envName: "staging",
};

environemnts.production = {
  port: process.env.PRODUCTIONPORT || "5000",
  envName: "production",
};

const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

const environmentToExport =
  typeof environemnts[currentEnvironment] === "object"
    ? environemnts[currentEnvironment]
    : environemnts.staging;

export default environmentToExport;
