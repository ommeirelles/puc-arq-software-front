import { Api } from "./api";
import { AuthToken, AuthTokenSchema } from "@types";

const globalForServices = globalThis as unknown as {
  authService?: AuthService;
};

export class AuthService extends Api {
  protected apiUrl = import.meta.env.VITE_AUTH_API_URL;
  private tokenKey = "auth_token";

  private constructor() {
    super();
  }

  static getInstance(): AuthService {
    return (globalForServices.authService ??= new AuthService());
  }

  getToken() {
    return sessionStorage.getItem(this.tokenKey);
  }

  async login(username: string, password: string) {
    const response = await this.post<AuthToken>("login", {
      body: { username, password },
      headers: { "Content-Type": "application/json" },
      schemaValidation: AuthTokenSchema,
    });

    if (!response?.token) {
      throw new Error("Failed to authenticate");
    }

    sessionStorage.setItem(this.tokenKey, response.token);
    return response.token;
  }

  async logout() {
    const token = this.getToken();

    try {
      if (token) {
        await this.post("logout", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } finally {
      this.clearSession();
    }
  }

  clearSession() {
    sessionStorage.removeItem(this.tokenKey);
  }
}
