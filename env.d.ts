declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STAGINGPORT: string;
      PRODUCTIONPORT: string;
      SECRET_KEY: string;
    }
  }
}

export {};
