import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import EveonlineProvider from "./auth_provider/eveProvider";
// import DiscordProvider from "next-auth/providers/discord";

import { env } from "~/env";
import { db } from "~/server/db";
import { createTable } from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: DrizzleAdapter(db, createTable) as Adapter,
  providers: [
    EveonlineProvider({
      clientId: env.EVE_CLIENT_ID,
      clientSecret: env.EVE_CLIENT_SECRET,
      // redirectUri: env.EVE_REDIRECT_URI,
    }),
    // {
    //   id: "eveonline",
    //   name: "EVE Online",
    //   type: "oauth",
    //   version: "2.0",
    //   accessTokenUrl: "https://login.eveonline.com/v2/oauth/token",
    //   requestTokenUrl: "https://login.eveonline.com/v2/oauth/authorize",
    //   authorizationUrl:
    //     "https://login.eveonline.com/v2/oauth/authorize?response_type=code",
    //   profileUrl: "https://esi.evetech.net/verify",
    //   profile(profile) {
    //     return {
    //       id: profile.CharacterID,
    //       name: profile.CharacterName,
    //       email: null,
    //       image: `https://images.evetech.net/characters/${profile.CharacterID}/portrait`,
    //     };
    //   },
    //   clientId: env.EVE_CLIENT_ID,
    //   clientSecret: env.EVE_CLIENT_SECRET,
    // }
    // EVEOnlineProvider({
    //   clientId: env.EVE_CLIENT_ID,
    //   clientSecret: env.EVE_CLIENT_SECRET,
    // }),
    // DiscordProvider({
    //   clientId: env.EVEONLINE_CLIENT_ID,
    //   clientSecret: env.EVEONLINE_CLIENT_SECRET,
    // }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
