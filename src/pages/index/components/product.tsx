import type { Product } from "@types";

export function Product(product: Product) {
  if (!product.id) return null;

  return (
    <div className="card bg-base-100 w-96 shadow-sm items-center">
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
          <button className="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </div>
  );
}
