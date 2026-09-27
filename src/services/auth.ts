import { Api } from "./api";
import { AuthToken, AuthTokenSchema, User, UserSchema } from "@types";

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

  async login(email: string, password: string) {
    const response = await this.post<AuthToken>("login", {
      body: { email, password },
      headers: { "Content-Type": "application/json" },
      schemaValidation: AuthTokenSchema,
    });

    if (!response?.token) {
      throw new Error("Failed to authenticate");
    }

    sessionStorage.setItem(this.tokenKey, response.token);
    return response.token;
  }

  async register(name: string, email: string, password: string) {
    try {
      const user = await this.post<User>("user", {
        body: { name, email, password },
        headers: { "Content-Type": "application/json" },
        schemaValidation: UserSchema,
      });

      if (!user) {
        throw new Error("Failed to register");
      }

      return user;
    } catch (error) {
      const raw = error instanceof Error ? error.message : "";

      let message = raw || "Failed to register";
      try {
        message = (JSON.parse(raw) as { message?: string }).message ?? message;
      } catch {
        // not a JSON error body
      }

      throw new Error(message);
    }
  }

  async logout() {
    this.clearSession();
  }

  clearSession() {
    sessionStorage.removeItem(this.tokenKey);
  }
}
