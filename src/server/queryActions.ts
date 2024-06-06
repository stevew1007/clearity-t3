"use server";
import { db } from "./db";
import { updateCorpBalence } from "./insertActions";
import { fetchCorpBalence } from "./lib/esiClient";
// import { InferSelectModel } from "drizzle-orm";
// import { corps } from "./db/schema";

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

export async function getAllAccounts() {
  return await db.query.accounts.findMany();
}

export async function getCorpById(id: number) {
  return await db.query.corps.findFirst({
    where: (model, { eq }) => eq(model.esi_id, id),
  });
}

export async function getAllCorps() {
  return await db.query.corps.findMany();
}

export async function getCorpUpdaterInfo(id: number) {
  const corp = await getCorpById(id);
  if (!corp) {
    throw new Error("Corp not found");
  }
  return await getAccountById(corp.updatedBy!);
}

export async function queryCorpBalence(
  id: number,
  timeout: number = 1000 * 60 * 15, // 15 minute timeout
): Promise<
  { balance: number; updateAt: Date; updater: string } | { error: string }
> {
  try {
    const corp = await getCorpById(id);

    if (!corp) {
      throw new Error("Corp not found");
    }

    if (corp.balance && corp.updatedAt && corp.updatedBy) {
      if (new Date().getTime() - corp.updatedAt.getTime() < timeout) {
        const updater = await getAccountById(corp.updatedBy);
        if (!updater) {
          throw new Error("Failed to get updater by ID.");
        }
        // Haven't hit timeout. Return cached value.
        return {
          balance: corp.balance,
          updateAt: corp.updatedAt,
          updater: updater?.character_name!,
        };
      }
    }
    const ret = await updateCorpBalence(corp.esi_id!);
    if ("error" in ret) {
      throw new Error(`Failed to update corp balence. ${ret.error}`);
    }
    return { balance: ret.balance, updateAt: ret.updatedAt };
  } catch (e) {
    if (e instanceof Error) {
      return { error: `Failed to get corp balence. ${e.message}` };
    } else {
      return { error: "Unknown error" };
    }
  }
}

// export async function queryCorpBalence(id: number) {
//   try {
//     const corp = await getCorpById(id);
//     // console.log("corp::: ", corp);
//     if (!corp) {
//       throw new Error("Corp not found");
//     }
//     const updater = await getCorpUpdaterInfo(id);
//     // console.log("updater::: ", updater);
//     if (!updater) {
//       throw new Error("Updater not set for this corp.");
//     }
//     const corpBalInfo = await fetchCorpBalence(id, updater.access_token!);
//     if ("error" in corpBalInfo) {
//       throw new Error(`Failed to get corp balence. ${corpBalInfo.error}`);
//     } else {
//       corpBalInfo.balance
//     }
//     return {
//       balence,
//       updater_id: updater.providerAccountId,
//       updated_at: Date.now(),
//     };
//   } catch (e) {
//     if (e instanceof Error) {
//       return { error: `Failed to get corp balence. ${e.message}` };
//     } else {
//       return { error: "Unknown error" };
//     }
//   }
// }
