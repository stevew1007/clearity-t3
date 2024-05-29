// lib/esiClient.ts
import "server-only";
import axios from "axios";
import {
  charactersInfoSchema,
  corpInfoSchema,
  corpBalanceSchema,
  corpJournalSchema,
} from "./esiInterface";
import type { token } from "./esiInterface";
import { env } from "~/env";
import { FetchError, apiClient } from "./apiClient";
import type { z } from "zod";

const defaultQuery = "datasource=tranquility";

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

// export async function getCharacterInfo(characterId: string) {
//   const response = await esiClient.get(
//     `/characters/${characterId}/?datasource=tranquility`,
//   );
//   return response.data as charactersInfo;
// }

export async function getCharacterInfo(
  characterId: string,
): Promise<{ message: string } | z.infer<typeof charactersInfoSchema>> {
  try {
    const response = await apiClient.get(
      `/characters/${characterId}/?datasource=tranquility`,
    );
    const data = (await response.json()) as z.infer<
      typeof charactersInfoSchema
    >;
    return charactersInfoSchema.parse(data);
  } catch (error) {
    // if (error instanceof FetchError) {
    //   switch (error.response.status) {
    //     case 403:
    //       return { message: "Forbidden" };
    //     // case 404:
    //     //   return { message: "Not found" };
    //     default:
    //       return { message: error.message };
    //   }
    // } else
    if (error instanceof Error) {
      return { message: error.message };
    } else {
      return { message: "Unknown error" };
    }
  }
}

// export async function getCorpInfo(corpId: number) {
//   const response = await esiClient.get(
//     `/corporations/${corpId}/?datasource=tranquility`,
//   );
//   return response.data as corpInfo;
// }

export async function getCorpInfo(
  corpId: number,
): Promise<{ message: string } | z.infer<typeof corpInfoSchema>> {
  try {
    const response = await apiClient.get(
      `/corporations/${corpId}/?datasource=tranquility`,
    );
    const data = (await response.json()) as z.infer<typeof corpInfoSchema>;
    return corpInfoSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      return { message: error.message };
    } else {
      return { message: "Unknown error" };
    }
  }
}

// export async function getCorpBalence(corpId: number, token: string) {
//   const response = await esiClient.get(
//     `/corporations/${corpId}/wallets/?datasource=tranquility`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     },
//   );
//   // console.log("response::: ", response);
//   if (response.status != 200) {
//     if (response.status == 403) {
//       return -1;
//     }
//     throw new Error(
//       "Failed to get corp balence, error: " + response.statusText,
//     );
//   }
//   const balence = response.data as corpBalancePerDivision[];
//   return balence.reduce((acc, cur) => acc + cur.balance, 0);
// }

export async function getCorpBalence(
  corpId: number,
  token: string,
): Promise<{ message: string } | { balance: number }> {
  try {
    const response = await apiClient.get(
      `/corporations/${corpId}/wallets/`,
      defaultQuery,
      { accessToken: token },
    );
    const data = (await response.json()) as z.infer<typeof corpBalanceSchema>;
    const balance = corpBalanceSchema
      .parse(data)
      .reduce((acc, cur) => acc + cur.balance, 0);
    return { balance };
  } catch (error) {
    if (error instanceof FetchError) {
      switch (error.response.status) {
        case 403:
          // return { message: "Forbidden" };
          if (error.message == "Character does not have required role(s)") {
            return { message: "Insufficiunt account clearance" };
          }
        default:
          return { message: error.message };
      }
    } else if (error instanceof Error) {
      return { message: error.message };
    } else {
      return { message: "Unknown error" };
    }
  }
}

// export async function getCorpJournal(
//   corpId: number,
//   token: string,
//   division: number,
// ) {
//   const response = await esiClient.get(
//     `/corporations/${corpId}/wallets/${division}/journal/?datasource=tranquility`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     },
//   );
//   if (response.status != 200) {
//     if (response.status == 403) {
//       return -1;
//     }
//     throw new Error(
//       "Failed to get corp journal, error: " + response.statusText,
//     );
//   }

//   // return response.data;
//   return response.data as corpJournalEntry[];
// }

export async function getCorpJournal(
  corpId: number,
  token: string,
  division: number,
): Promise<{ message: string } | z.infer<typeof corpJournalSchema>> {
  try {
    const response = await apiClient.get(
      `/corporations/${corpId}/wallets/${division}/journal/`,
      defaultQuery,
      { accessToken: token },
    );
    const data = (await response.json()) as z.infer<typeof corpJournalSchema>;
    return corpJournalSchema.parse(data);
  } catch (error) {
    if (error instanceof FetchError) {
      switch (error.response.status) {
        case 403:
          // return { message: "Forbidden" };
          if (error.message == "Character does not have required role(s)") {
            return { message: "Insufficiunt account clearance" };
          }
        default:
          return { message: error.message };
      }
    } else if (error instanceof Error) {
      return { message: error.message };
    } else {
      return { message: "Unknown error" };
    }
  }
}
