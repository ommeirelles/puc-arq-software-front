import { CartService } from "@src/services/cart";
import { AddToCartForm, AddToCartFormSchema, type Product } from "@types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function Product(product: Product) {
  const cartAPI = CartService.getInstance();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddToCartForm>({
    resolver: zodResolver(AddToCartFormSchema),
    defaultValues: { quantity: 1 },
  });

  if (!product.id) return null;

  const addToCart = async (data: AddToCartForm) => {
    await cartAPI.addItem(product.id, data.quantity);
    document.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <div className="card card-border bg-base-100 w-full h-full shadow-md transition-shadow hover:shadow-xl">
      <figure className="h-48 bg-white">
        <img
          className="h-full w-full object-contain p-4"
          src={product.image}
          alt={product.title ?? ""}
          loading="lazy"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title line-clamp-2" title={product.title ?? ""}>
          {product.title ?? "No title found"}
        </h2>
        <p
          className="line-clamp-3 text-sm text-base-content/70"
          title={product.description ?? ""}
        >
          {product.description ?? ""}
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <span className="badge badge-soft badge-accent badge-lg self-start">
            R$ {product.price.toFixed(2)}
          </span>
          <div className="card-actions justify-end items-center">
            <form
              className="flex items-center gap-2"
              onSubmit={handleSubmit(addToCart)}
              noValidate
            >
              <input
                type="number"
                min={1}
                step={1}
                className={`input w-20${errors.quantity ? " input-error" : ""}`}
                aria-invalid={Boolean(errors.quantity)}
                title={errors.quantity?.message ?? "Quantity"}
                {...register("quantity")}
              />
              <button
                type="submit"
                className="btn btn-accent"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : null}
                Buy Now
              </button>
            </form>
          </div>
          {errors.quantity ? (
            <p className="text-error text-xs text-right">
              {errors.quantity.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
