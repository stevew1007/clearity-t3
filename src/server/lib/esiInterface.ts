import "server-only";

export interface token {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface charactersInfo {
  alliance_id: number;
  birthday: string;
  bloodline_id: number;
  corporation_id: number;
  description: string;
  gender: string;
  name: string;
  race_id: number;
  security_status: number;
  title: string;
}

export interface corpInfo {
  alliance_id?: number;
  ceo_id: number;
  creator_id: number;
  date_founded?: string;
  description?: string;
  home_station_id: number;
  member_count: number;
  name: string;
  shares: number;
  tax_rate: number;
  ticker: string;
  url: string;
}

export interface corpBalancePerDivision {
  balance: number;
  division: number;
}

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
