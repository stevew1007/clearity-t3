// import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import type { OAuthConfig } from "next-auth/providers/oauth";

export interface EveOnlineProviderOptions {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export interface EVEOnlineProfile extends Record<string, unknown> {
  CharacterID: number;
  CharacterName: string;
  ExpiresOn: string;
  Scopes: string;
  TokenType: string;
  CharacterOwnerHash: string;
  IntellectualProperty: string;
}

export default function EveonlineProvider(
  options: EveOnlineProviderOptions,
): OAuthConfig<EVEOnlineProfile> {
  return {
    id: "eveonline",
    name: "Eve Online",
    type: "oauth",
    version: "2.0",
    authorization: {
      url: "https://login.eveonline.com/v2/oauth/authorize",
      params: {
        scope:
          "esi-wallet.read_corporation_wallets.v1 esi-markets.read_corporation_orders.v1",
        grant_type: "authorization_code",
        response_type: "code",
        state: "",
        redirect_uri: "http://localhost:3000/api/auth/callback/eveonline",
      },
    },
    token: "https://login.eveonline.com/v2/oauth/token",
    userinfo: "https://login.eveonline.com/oauth/verify",
    profile(profile) {
      return {
        id: String(profile.CharacterID),
        name: profile.CharacterName,
        email: null, // Eve Online does not provide email
        image: `https://images.evetech.net/characters/${profile.CharacterID}/portrait`,
        role: "user",
      };
    },
    ...options,
  };
}
