// lib/esiClient.ts
import "server-only";
import axios from "axios";
import type {
  charactersInfo,
  corpBalancePerDivision,
  corpInfo,
  corpJournalEntry,
  token,
} from "./esiInterface";
import { env } from "~/env";

export const esiClient = axios.create({
  baseURL: "https://esi.evetech.net/latest/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function getRefreshToken(refreshToken: string) {
  const response = await axios.post(
    "https://login.eveonline.com/v2/oauth/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${env.EVE_CLIENT_ID}:${env.EVE_CLIENT_SECRET}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  return response.data as token;
}

export async function getCharacterInfo(characterId: string) {
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
  // console.log("response::: ", response);
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

export async function getCorpJournal(
  corpId: number,
  token: string,
  division: number,
) {
  const response = await esiClient.get(
    `/corporations/${corpId}/wallets/${division}/journal/?datasource=tranquility`,
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
      "Failed to get corp journal, error: " + response.statusText,
    );
  }

  // return response.data;
  return response.data as corpJournalEntry[];
}
