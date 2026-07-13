import { DefaultSession } from "next-auth";

// 094 - extend session for admin
declare module "next-auth" {
  export interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
  }
}
