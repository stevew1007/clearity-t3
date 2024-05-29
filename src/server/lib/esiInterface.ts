// import { all } from "axios";
import "server-only";
import z from "zod";

export interface token {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

// export interface charactersInfo {
//   alliance_id: number;
//   birthday: string;
//   bloodline_id: number;
//   corporation_id: number;
//   description: string;
//   gender: string;
//   name: string;
//   race_id: number;
//   security_status: number;
//   title: string;
// }

export const charactersInfoSchema = z.object({
  alliance_id: z.number(),
  birthday: z.string(),
  bloodline_id: z.number(),
  corporation_id: z.number(),
  description: z.string(),
  gender: z.string(),
  name: z.string(),
  race_id: z.number(),
  security_status: z.number(),
  title: z.string(),
});

// export interface corpInfo {
//   alliance_id?: number;
//   ceo_id: number;
//   creator_id: number;
//   date_founded?: string;
//   description?: string;
//   home_station_id: number;
//   member_count: number;
//   name: string;
//   shares: number;
//   tax_rate: number;
//   ticker: string;
//   url: string;
// }

export const corpInfoSchema = z.object({
  alliance_id: z.number(),
  ceo_id: z.number(),
  creator_id: z.number(),
  date_founded: z.string(),
  description: z.string(),
  home_station_id: z.number(),
  member_count: z.number(),
  name: z.string(),
  shares: z.number(),
  tax_rate: z.number(),
  ticker: z.string(),
  url: z.string(),
  war_eligible: z.boolean(),
});

export interface corpBalancePerDivision {
  balance: number;
  division: number;
}

export const corpBalanceSchema = z.array(
  z.object({
    balance: z.number(),
    division: z.number(),
  }),
);

export interface corpJournalEntry {
  amount: number;
  balance: number;
  context_id: number;
  context_id_type: string;
  date: string;
  description: string;
  first_party_id: number;
  id: number;
  reason: string;
  ref_type: string;
  second_party_id: number;
  tax: number;
  tax_receiver_id: number;
}

export const corpJournalEntrySchema = z.object({
  amount: z.number(),
  balance: z.number(),
  context_id: z.number(),
  context_id_type: z.string(),
  date: z.string(),
  description: z.string(),
  first_party_id: z.number(),
  id: z.number(),
  reason: z.string(),
  ref_type: z.string(),
  second_party_id: z.number(),
  tax: z.number(),
  tax_receiver_id: z.number(),
});

export const corpJournalSchema = z.array(corpJournalEntrySchema);
