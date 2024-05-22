import "server-only";
import { db } from "./db";
import { corps } from "./db/schema";
import { getCorpInfo } from "./lib/esiClient";
import { getCorpById } from "./query";

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
