import { Api, ApiError } from "./api";
import { AuthService } from "./auth";
import { CartService } from "./cart";
import {
  ApiErrorSchema,
  CheckoutForm,
  Payment,
  PaymentSchema,
  ValidationErrorsSchema,
} from "@types";

const globalForServices = globalThis as unknown as {
  paymentService?: PaymentService;
};

export class PaymentService extends Api {
  protected apiUrl = import.meta.env.VITE_PAYMENT_API_URL;

  private constructor() {
    super();
  }

  static getInstance(): PaymentService {
    return (globalForServices.paymentService ??= new PaymentService());
  }

  async pay(cartGuid: string, form: CheckoutForm): Promise<Payment> {
    const token = AuthService.getInstance().getToken();
    try {
      const payment = await this.post<Payment>(`pay/${cartGuid}`, {
        body: {
          card_number: form.card_number,
          card_expiry: form.card_expiry,
          card_cvv: form.card_cvv,
          address: {
            cep: form.cep,
            street: form.street,
            number: form.number,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
          },
        },
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        schemaValidation: PaymentSchema,
      });

      if (!payment) {
        throw new Error("Failed to process the payment");
      }

      return payment;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          AuthService.getInstance().clearSession();
          CartService.getInstance().clearCart();
          window.location.assign("/");
          throw new Error("Session expired");
        }

        if (error.status === 402) {
          // a declined payment still returns the registered payment
          try {
            const parsed = PaymentSchema.safeParse(JSON.parse(error.message));
            if (parsed.success) return parsed.data;
          } catch {
            // not a JSON body; fall through to the generic error
          }
        }

        throw new Error(this.parseErrorMessage(error.message));
      }

      throw error;
    }
  }

  private parseErrorMessage(raw: string): string {
    let message = raw || "Failed to process the payment";
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

    return message;
  }
}
