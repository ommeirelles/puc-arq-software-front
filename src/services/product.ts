import { Product, ProductSchema } from "@types";
import { Api } from "./api";
import * as z from "zod";

export class ProductService extends Api {
  private static instance: ProductService;
  protected apiUrl = import.meta.env.VITE_FAKE_STORE_API_URL;
  private cachedProducts: Map<number, Product> = new Map();

  constructor() {
    super();

    if (ProductService.instance) {
      return ProductService.instance;
    }

    ProductService.instance = this;
    return this;
  }

  async products() {
    const ProductArraySchema = z.array(ProductSchema);

    const products = await this.get<z.infer<typeof ProductArraySchema>>(
      "products",
      {
        schemaValidation: ProductArraySchema,
      }
    );

    (products ?? []).forEach((product) => {
      this.cachedProducts.set(product.id, product);
    });

    return products;
  }

  async productById(id: number) {
    if (this.cachedProducts.has(id)) {
      return this.cachedProducts.get(id);
    }

    const product = await this.get<Product>(`products/${id}`, {
      schemaValidation: ProductSchema,
    });

    if (product) {
      this.cachedProducts.set(id, product);
    }

    return product;
  }
}
