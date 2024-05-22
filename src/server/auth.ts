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
import { getCharacterInfo, getCorpBalence, getCorpInfo } from "./lib/esiClient";
import { eq } from "drizzle-orm";
import { getAccountById, getCorpById } from "./query";
import { newCorp } from "./insert";
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
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  events: {
    async signIn({ account }) {
      //
      if (account?.provider === "eveonline") {
        //
        const { providerAccountId } = account;
        try {
          const info = await getCharacterInfo(providerAccountId);
          let corp = await getCorpById(info.corporation_id);
          const db_acc = await getAccountById(providerAccountId);

          if (corp === undefined) {
            corp = await newCorp(info.corporation_id);
          }

          if (corp.balence === null && db_acc && account.access_token) {
            try {
              const balence = await getCorpBalence(
                info.corporation_id,
                account.access_token,
              );
              if (balence > 0) {
                await db
                  .update(corps)
                  .set({
                    balence: balence,
                    updatedBy: providerAccountId,
                  })
                  .where(eq(corps.esi_id, info.corporation_id));
              }
            } catch (error) {
              console.error(error);
            }
          }
          await db
            .update(accounts)
            .set({
              alliance_id: info.alliance_id,
              corporation_id: info.corporation_id,
              character_name: info.name,
              title: info.title,
            })
            .where(eq(accounts.providerAccountId, providerAccountId));
        } catch (error) {
          console.error("Error fetching character info", error);
          // return false;
        }
      }
      // return true;
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
