import "server-only";
import { db } from "./db";

/* Account Table */
export async function getAccountById(id: string) {
  return await db.query.accounts.findFirst({
    where: (model, { eq }) => eq(model.providerAccountId, id),
  });
}
/* Corp Table */
export async function getCorpById(id: number) {
  return await db.query.corps.findFirst({
    where: (model, { eq }) => eq(model.esi_id, id),
  });
}
