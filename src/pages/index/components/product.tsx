import { CartService } from "@src/services/cart";
import type { Product } from "@types";
import { useRef } from "react";

export function Product(product: Product) {
  const cartAPI = useRef(new CartService());
  if (!product.id) return null;

  const addToCart = async () => {
    await cartAPI.current.addItem(product.id);
    document.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <div className="card bg-base-100 w-96 shadow-sm items-center pt-8">
      <figure className="flex h-64 max-h-64">
        <img
          className="h-full"
          src={product.image}
          alt={product.description ?? ""}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.title ?? "No title found"}</h2>
        <p>{product.description ?? ""}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-accent" onClick={addToCart}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
