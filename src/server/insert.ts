import "server-only";
import { db } from "./db";
import { accounts, corps } from "./db/schema";
import { getCorpBalence, getCorpInfo, getRefreshToken } from "./lib/esiClient";
import {
  type DbCorpEntry,
  getCorpById,
  getAccountById,
  getAccountsByUserId,
} from "./query";
import { eq } from "drizzle-orm";
import { token } from "./lib/esiInterface";

export async function updateTokenIfNeededForUser(user_id: string) {
  const account_list = await getAccountsByUserId(user_id);

  await Promise.all(
    account_list.map(
      async ({ providerAccountId, expires_at, refresh_token }) => {
        if (expires_at! * 1000 < Date.now()) {
          console.log("Refreshing token for: ", providerAccountId);
          const token = await getRefreshToken(refresh_token!);
          // console.log("token::: ", token);
          await db
            .update(accounts)
            .set({
              access_token: token.access_token,
              expires_at: Math.floor(Date.now() / 1000 + token.expires_in),
              refresh_token: token.refresh_token,
            })
            .where(eq(accounts.providerAccountId, providerAccountId));
        } else {
          return null;
        }
      },
    ),
  );
}

export async function newCorp(id: number) {
  const corp_info = await getCorpInfo(id);
  await db.insert(corps).values({
    esi_id: id,
    name: corp_info.name,
    alliance_id: corp_info.alliance_id,
  });
  const entry = await getCorpById(id);
  if (entry) {
    return entry;
  } else {
    throw new Error("Failed to create new corp");
  }
}

export async function updateCorpBalence(id: number) {
  const corp = await getCorpById(id);
  if (!corp) {
    throw new Error("Corp not found");
  }
  const updater = await getAccountById(corp.updatedBy!);
  if (!updater) {
    throw new Error("Updater not found");
  }
  const balence = await getCorpBalence(id, updater.access_token!);
  await db.update(corps).set({ balence: balence }).where(eq(corps.esi_id, id));
  return balence;
}
