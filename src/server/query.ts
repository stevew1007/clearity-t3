import "server-only";
import { db } from "./db";
import { getCorpBalence } from "./lib/esiClient";
import { cache } from "react";

/* Account Table */
export async function getAccountById(id: string) {
  return await db.query.accounts.findFirst({
    where: (model, { eq }) => eq(model.providerAccountId, id),
  });
}

export async function getAccountsByUserId(id: string) {
  return await db.query.accounts.findMany({
    where: (model, { eq }) => eq(model.userId, id),
  });
}
/* Corp Table */
export interface DbCorpEntry {
  name: string | null;
  id: string;
  alliance_id: number | null;
  esi_id: number | null;
  updatedBy: string | null;
  balence: number | null;
}

export async function getCorpById(
  id: number,
): Promise<DbCorpEntry | undefined> {
  return await db.query.corps.findFirst({
    where: (model, { eq }) => eq(model.esi_id, id),
  });
}

export async function getAllCorps(): Promise<DbCorpEntry[]> {
  return await db.query.corps.findMany();
}

export async function getCorpUpdaterInfo(id: number) {
  const corp = await getCorpById(id);
  if (!corp) {
    throw new Error("Corp not found");
  }
  return await getAccountById(corp.updatedBy!);
}

export const queryCorpBalence = cache(async (id: number) => {
  try {
    console.log("loading corp balence for: ", id);
    const corp = await getCorpById(id);
    // console.log("corp::: ", corp);
    if (!corp) {
      throw new Error("Corp not found");
    }
    const updater = await getCorpUpdaterInfo(id);
    // console.log("updater::: ", updater);
    if (!updater) {
      throw new Error("Updater not set for this corp.");
    }
    const balence = await getCorpBalence(id, updater.access_token!);
    return {
      balence,
      updater_id: updater.providerAccountId,
      updated_at: Date.now(),
    };
  } catch (e) {
    if (e instanceof Error) {
      return { message: `Failed to get corp balence. ${e.message}` };
    }
  }
});
