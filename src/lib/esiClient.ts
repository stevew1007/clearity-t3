// lib/esiClient.ts
import axios from "axios";
import type {
  charactersInfo,
  corpBalancePerDivision,
  corpInfo,
} from "./esiInterface";

export const esiClient = axios.create({
  baseURL: "https://esi.evetech.net/latest/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function getCharacterInfo(
  characterId: string,
): Promise<charactersInfo> {
  const response = await esiClient.get(
    `/characters/${characterId}/?datasource=tranquility`,
  );
  return response.data as charactersInfo;
}

export async function getCorpInfo(corpId: number) {
  const response = await esiClient.get(
    `/corporations/${corpId}/?datasource=tranquility`,
  );
  return response.data as corpInfo;
}

export async function getCorpBalence(corpId: number, token: string) {
  const response = await esiClient.get(
    `/corporations/${corpId}/wallets/?datasource=tranquility`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status != 200) {
    if (response.status == 403) {
      return -1;
    }
    throw new Error(
      "Failed to get corp balence, error: " + response.statusText,
    );
  }
  const balence = response.data as corpBalancePerDivision[];
  return balence.reduce((acc, cur) => acc + cur.balance, 0);
}
