import { Api } from "./api";
import {
  AddItemToCartReturn,
  AddItemToCartReturnSchema,
  Cart,
  CartSchema,
  CartSummary,
  CartSummarySchema,
} from "@types";
import * as z from "zod";

export class CartService extends Api {
  private static instance: CartService;
  protected apiUrl = import.meta.env.VITE_CART_API_URL;
  private cartKey = "cart_guid";

  constructor() {
    super();

    if (CartService.instance) {
      return CartService.instance;
    }

    CartService.instance = this;
  }

  async getCart() {
    const cartGuid = localStorage.getItem(this.cartKey);
    if (cartGuid) return cartGuid;

    const response = await this.get<Cart>("cart", {
      schemaValidation: CartSchema,
    });
    if (!response?.guid || response.deleted === true) {
      this.leaveCart();
      throw new Error("Failed to create cart");
    }

    localStorage.setItem(this.cartKey, response.guid);
    return response.guid;
  }

  leaveCart() {
    localStorage.removeItem(this.cartKey);
    window.location.reload();
  }

  getSummaryAbortController: AbortController | undefined = undefined;
  async getSummary() {
    if (this.getSummaryAbortController) {
      this.getSummaryAbortController.abort();
    }
    this.getSummaryAbortController = new AbortController();

    const queryString = new URLSearchParams({
      guid: (await this.getCart()) ?? "",
    });

    try {
      const summary = await this.get<CartSummary>(
        `cart/summary?${queryString.toString()}`,
        {
          schemaValidation: CartSummarySchema,
          signal: this.getSummaryAbortController.signal,
        }
      );
      this.getSummaryAbortController = undefined;

      return summary;
    } catch (error) {
      // this.leaveCart();
      console.error(error);
    }
  }

  async addItem(prodID: number) {
    return this.post<AddItemToCartReturn>(
      `product/${prodID}?${new URLSearchParams({
        cart_guid: await this.getCart(),
        quantity: "1",
      }).toString()}`,
      {
        schemaValidation: AddItemToCartReturnSchema,
      }
    );
  }

  async removeItem(entryId: number) {
    return this.delete(
      `product/${entryId}?${new URLSearchParams({
        cart_guid: await this.getCart(),
      }).toString()}`,
      {
        schemaValidation: z.object({ message: z.string() }),
      }
    );
  }
}
