"use server";
import { queryCorpBalence } from "~/server/queryActions";

export async function getCorpBalanceCardInfo(corpId: number) {
  const recv = await queryCorpBalence(corpId);
  if ("error" in recv) {
    throw Error(recv.error);
  }
  const balanceStr = `${new Intl.NumberFormat().format(recv.balance / 1000000000)}B isk`;
  return {
    balance: balanceStr,
    updater: recv.updater,
    updatedAt: recv.updateAt.toString(),
  };
}
