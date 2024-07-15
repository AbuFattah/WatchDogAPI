declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STAGINGPORT: string;
      PRODUCTIONPORT: string;
      SECRET_KEY: string;
      MAX_CHECKS: number;
      MAX_CHECKS_PROD: number;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
    }
  }
}

export {};
