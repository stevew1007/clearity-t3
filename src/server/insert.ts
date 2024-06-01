import "server-only";
import { db } from "./db";
import { accounts, corps } from "./db/schema";
import { fetchCorpBalence, fetchCorpInfo, refreshToken } from "./lib/esiClient";
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
          const token = await refreshToken(refresh_token!);
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
  const corp_info = await fetchCorpInfo(id);
  if ("error" in corp_info) {
    throw new Error(`Failed to fetch corp info: ${corp_info.error}`);
  }
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

export async function updateCorpBalence(id: number, updater_id?: string) {
  const corp = await getCorpById(id);
  if (!corp) {
    throw new Error("Corp not found");
  }

  let updater;
  if (corp.updatedBy) { // Only use provided updater if not available in db.
    updater = await getAccountById(corp.updatedBy!);
  } else {
    if (!updater_id) {
      throw new Error("No updater available to use.");
    }
    updater = await getAccountById(updater_id);
  } 

  if (!updater) {
    throw new Error("Updater not found");
  }

  if (!updater.access_token) {
    throw new Error("Updater does not have access token");
  }

  const corp_bal_info = await fetchCorpBalence(id, updater.access_token);
  if ("error" in corp_bal_info) {
    throw new Error(`Failed to fetch corp info: ${corp_bal_info.error}`);
  }
  await db.update(corps).set({ balance: corp_bal_info.balance, updatedAt: new Date()}).where(eq(corps.esi_id, id));
  if (updater.providerAccountId === updater_id) {
    await db.update(corps).set({ updatedBy: updater.providerAccountId }).where(eq(corps.esi_id, id));
  }
  return corp_bal_info.balance;
}
