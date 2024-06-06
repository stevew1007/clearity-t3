// import exp from "constants";
// import { desc } from "drizzle-orm";
import "server-only";
import { env } from "~/env";

export interface ApiClientOptions {
  path?: string;
  method?: string;
  query?: string;
  body?: BodyInit;
  accessToken?: string;
  refreshToken?: string;
  headers?: Record<string, string>;
}

export class FetchError extends Error {
  response: Response;
  // errorMsg: string;
  constructor(message: string, res: Response) {
    super(message);
    this.response = res;
    // this.errorMsg = "";
    void this.getErrorMsg();
  }

  async getErrorMsg() {
    this.message = ((await this.response.json()) as { error: string }).error;
  }
}

class ApiClient {
  private base_url: string;

  constructor() {
    this.base_url = "https://esi.evetech.net/latest";
  }

  async request(options: ApiClientOptions) {
    let query = new URLSearchParams(options.query).toString();

    if (query !== "") {
      query = `?${query}`;
    }

    const headers = options.accessToken
      ? { Authorization: `Bearer ${options.accessToken}`, ...options.headers }
      : options.headers;
    const response = await fetch(this.base_url + options.path + query, {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
    });

    if (!response.ok) {
      throw new FetchError("Bad fetch response", response);
    } else {
      return response;
    }
  }

  // async requestWithAuth(options: ApiClientOptions) {
  //   if (!options.accessToken) {
  //     throw new Error("No access token provided");
  //   }
  //   return this.request({
  //     ...options,
  //     headers: {
  //       Authorization: `Bearer ${options.accessToken}`,
  //       ...options.headers,
  //     },
  //   });
  // }

  async get(path: string, query?: string, options?: ApiClientOptions) {
    return this.request({ path, method: "GET", query, ...options });
  }

  async post(path: string, body?: string, options?: ApiClientOptions) {
    return this.request({ path, method: "POST", body, ...options });
  }

  async put(path: string, body?: string, options?: ApiClientOptions) {
    return this.request({ path, method: "PUT", body, ...options });
  }

  async delete(path: string, options?: ApiClientOptions) {
    return this.request({ path, method: "DELETE", ...options });
  }

  async refreshToken(token: string) {
    const query = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token,
    }).toString();
    const response = await fetch(
      "https://login.eveonline.com/v2/oauth/token?" + query,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${env.EVE_CLIENT_ID}:${env.EVE_CLIENT_SECRET}`,
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    if (!response.ok) {
      throw new FetchError("Cannot refresh token", response);
    } else {
      return response;
    }
  }
}

// const apiClient = new ApiClient();
export const apiClient = new ApiClient();
