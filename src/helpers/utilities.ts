import { createHmac } from "node:crypto";
import dotenv from "dotenv";
dotenv.config();

class Utilities {
  public hash(str: string): string {
    const hashed = createHmac("sha256", process.env.SECRET_KEY || "abc")
      .update(str)
      .digest("hex");

    return hashed;
  }
  public parseJSON(jsonString: string): object {
    let output: object;
    try {
      output = JSON.parse(jsonString);
    } catch (error) {
      output = {};
    }

    return output;
  }
}

export const utilities = new Utilities();