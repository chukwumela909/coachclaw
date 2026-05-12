import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import { authConfig } from "@/auth.config";
import { getMongoClient } from "@/lib/db/mongo-client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(getMongoClient),
});
