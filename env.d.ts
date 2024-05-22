declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STAGINGPORT: string;
      PRODUCTIONPORT: string;
    }
  }
}

export {};
