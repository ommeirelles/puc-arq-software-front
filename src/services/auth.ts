import { Api } from "./api";
import {
  ApiErrorSchema,
  AuthToken,
  AuthTokenSchema,
  User,
  UserSchema,
  ValidationErrorsSchema,
} from "@types";

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
        const parsed: unknown = JSON.parse(raw);

        const validationErrors = ValidationErrorsSchema.safeParse(parsed);
        const apiError = ApiErrorSchema.safeParse(parsed);

        if (validationErrors.success) {
          // validation errors returned by the API (HTTP 422)
          message =
            validationErrors.data
              .map((detail) => {
                const field = detail.loc[detail.loc.length - 1];
                return field ? `${field}: ${detail.msg}` : detail.msg;
              })
              .join("; ") || message;
        } else if (apiError.success) {
          message = apiError.data.message;
        }
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
