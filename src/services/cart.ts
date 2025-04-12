import { Api } from "./api";
import { Cart, CartSchema } from "@types";
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


    const response = await this.get<Cart>("cart", CartSchema);
    if (!response?.guid) {
      this.leaveCart();
      throw new Error("Failed to create cart");
    }

    localStorage.setItem(this.cartKey, response.guid);
    return response.guid;
  }

  leaveCart() {
    localStorage.removeItem(this.cartKey);
  }
}
