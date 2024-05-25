declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STAGINGPORT: string;
      PRODUCTIONPORT: string;
      SECRET_KEY: string;
      MAX_CHECKS: number;
      MAX_CHECKS_PROD: number;
    }
  }
}

export {};
