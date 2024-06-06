import "server-only";
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
import { accounts, corps, createTable } from "~/server/db/schema";
import { fetchCharacterInfo, fetchCorpBalence } from "./lib/esiClient";
import { eq } from "drizzle-orm";
import { getAccountById, getCorpById } from "./queryActions";
import {
  newCorp,
  updateCorpBalence,
  updateTokenForAllAccount,
  updateTokenIfNeededForUser,
} from "./insertActions";
// import { eq } from "drizzle-orm";

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
    // signIn: async ({ account }) => {
    //   // const { providerAccountId } = account;
    //   if (account?.provider === "eveonline") {
    //     const { providerAccountId } = account;
    //     const charInfo = await fetchCharacterInfo(providerAccountId);
    //     if ("error" in charInfo) {
    //       console.error("[Error]: Cannot get character info", charInfo.error);
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   } else {
    //     return false;
    //   }
    // },
    session: async ({ session, user }) => {
      await updateTokenForAllAccount();
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
  },
  events: {
    async signIn({ account }) {
      //
      if (account?.provider === "eveonline") {
        //
        const { providerAccountId } = account;
        try {
          console.log("1. Fetching character info for: ", providerAccountId);
          const charInfo = await fetchCharacterInfo(providerAccountId);
          if ("error" in charInfo) {
            // console.error("[Error]: Cannot get character info", charInfo.error);
            // return;
            throw Error(`Cannot get character info: ${charInfo.error}`);
          }

          console.log("2. Checking if character's corp in db");
          let corp = await getCorpById(charInfo.corporation_id);

          // If corp is not in db, add new entry.
          if (corp === undefined) {
            console.log("It is not. Adding new corp entry.");
            corp = await newCorp(charInfo.corporation_id);
          }

          console.log("3. Attempt to fetch corp balance.");

          const updateCorpBalInfo = updateCorpBalence(
            charInfo.corporation_id,
            corp.updatedBy ? undefined : providerAccountId,
          );
          if ("error" in updateCorpBalInfo) {
            throw new Error(
              `Failed to update corp balance: ${updateCorpBalInfo.error}`,
            );
          }
          await db
            .update(accounts)
            .set({
              alliance_id: charInfo.alliance_id,
              corporation_id: charInfo.corporation_id,
              character_name: charInfo.name,
              title: charInfo.title,
            })
            .where(eq(accounts.providerAccountId, providerAccountId));
        } catch (e) {
          if (e instanceof Error) {
            console.error(`[Error] [Character Info Fetching] ${e.message}`, e);
          } else {
            console.error(`[Error] [Character Info Fetching] Unknown error`, e);
          }
        }
      } else {
        console.log("Not an eveonline account");
      }
    },
  },
  adapter: DrizzleAdapter(db, createTable) as Adapter,
  providers: [
    EveonlineProvider({
      clientId: env.EVE_CLIENT_ID,
      clientSecret: env.EVE_CLIENT_SECRET,
      // redirectUri: env.EVE_REDIRECT_URI,
    }),
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
  secret: env.NEXTAUTH_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
