import { ProductSchema } from "@types";
import { Api } from "./api";
import * as z from "zod";

export class ProductService extends Api {
  private static instance: ProductService;
  protected apiUrl = import.meta.env.VITE_FAKE_STORE_API_URL;

  constructor() {
    super();

    if (ProductService.instance) {
      return ProductService.instance;
    }

    ProductService.instance = this;
    return this;
  }

  products() {
    const ProductArraySchema = z.array(ProductSchema);

    return this.get<z.infer<typeof ProductArraySchema>>(
      "products",
      ProductArraySchema
    );
  }
}
