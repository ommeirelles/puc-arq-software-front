import { Api, ApiError } from "./api";
import { AuthService } from "./auth";
import {
  AddItemToCartReturn,
  AddItemToCartReturnSchema,
  Cart,
  CartSchema,
  CartSummary,
  CartSummarySchema,
} from "@types";
import * as z from "zod";

const globalForServices = globalThis as unknown as {
  cartService?: CartService;
};

export class CartService extends Api {
  protected apiUrl = import.meta.env.VITE_CART_API_URL;
  private cartKey = "cart_guid";

  private constructor() {
    super();
  }

  static getInstance(): CartService {
    return (globalForServices.cartService ??= new CartService());
  }

  private authHeaders(): Record<string, string> {
    const token = AuthService.getInstance().getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private handleUnauthorized(): never {
    AuthService.getInstance().clearSession();
    this.clearCart();
    window.location.assign("/");
    throw new Error("Session expired");
  }

  private async withCartRecovery<Ret>(
    request: () => Promise<Ret>,
    retried = false
  ): Promise<Ret> {
    try {
      return await request();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          this.handleUnauthorized();
        }

        if (
          !retried &&
          error.status === 400 &&
          error.message.includes("Cart not found")
        ) {
          // the stored cart guid is no longer valid: discard it and
          // retry once, so a fresh cart is created
          this.clearCart();
          return this.withCartRecovery(request, true);
        }
      }

      throw error;
    }
  }

  async getCart() {
    const cartGuid = localStorage.getItem(this.cartKey);
    if (cartGuid) return cartGuid;

    const response = await this.withCartRecovery(() =>
      this.get<Cart>("cart", {
        headers: this.authHeaders(),
        schemaValidation: CartSchema,
      })
    );
    if (!response?.guid || response.deleted === true) {
      this.leaveCart();
      throw new Error("Failed to create cart");
    }

    localStorage.setItem(this.cartKey, response.guid);
    return response.guid;
  }

  clearCart() {
    localStorage.removeItem(this.cartKey);
  }

  leaveCart() {
    this.clearCart();
    window.location.reload();
  }

  private getSummaryAbortController: AbortController | undefined = undefined;
  async getSummary() {
    if (this.getSummaryAbortController) {
      this.getSummaryAbortController.abort();
    }
    const controller = new AbortController();
    this.getSummaryAbortController = controller;

    try {
      const summary = await this.withCartRecovery(async () =>
        this.get<CartSummary>(
          `cart/summary?${new URLSearchParams({
            guid: await this.getCart(),
          }).toString()}`,
          {
            headers: this.authHeaders(),
            schemaValidation: CartSummarySchema,
            signal: controller.signal,
          }
        )
      );
      if (this.getSummaryAbortController === controller) {
        this.getSummaryAbortController = undefined;
      }

      return summary;
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error(error);
    }
  }

  async addItem(prodID: number, quantity = 1) {
    return this.withCartRecovery(() =>
      this.getCart().then((cartGuid) =>
        this.post<AddItemToCartReturn>(
          `product/${prodID}?${new URLSearchParams({
            cart_guid: cartGuid,
            quantity: String(quantity),
          }).toString()}`,
          {
            headers: this.authHeaders(),
            schemaValidation: AddItemToCartReturnSchema,
          }
        )
      )
    );
  }

  async removeItem(productId: number, quantity?: number) {
    return this.withCartRecovery(() =>
      this.getCart().then((cartGuid) => {
        const params = new URLSearchParams({ cart_guid: cartGuid });
        if (quantity) {
          params.set("quantity", String(quantity));
        }

        return this.delete(`product/${productId}?${params.toString()}`, {
          headers: this.authHeaders(),
          schemaValidation: z.object({ message: z.string() }),
        });
      })
    );
  }
}
