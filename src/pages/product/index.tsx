import { Header } from "@src/components/header";
import { CartService } from "@src/services/cart";
import { ProductService } from "@src/services/product";
import { AddToCartForm, AddToCartFormSchema, type Product } from "@types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useParams } from "react-router";

function ProductDetailsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="skeleton h-4 w-64"></div>
      <div className="card card-border bg-base-100 shadow-md lg:card-side">
        <figure className="p-8 lg:w-2/5">
          <div className="skeleton h-96 w-full"></div>
        </figure>
        <div className="card-body gap-4">
          <div className="skeleton h-5 w-32"></div>
          <div className="skeleton h-8 w-3/4"></div>
          <div className="skeleton h-5 w-48"></div>
          <div className="skeleton h-32 w-full"></div>
          <div className="skeleton h-10 w-40 self-end"></div>
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="material-symbols-outlined text-6xl text-base-content/40">
        inventory_2
      </span>
      <h2 className="text-xl font-semibold">Product not found</h2>
      <p className="max-w-sm text-base-content/60">
        The product you are looking for does not exist or is no longer
        available.
      </p>
      <Link to="/store" className="btn btn-neutral">
        Back to store
      </Link>
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const prodApi = ProductService.getInstance();
  const cartApi = CartService.getInstance();
  const [product, setProduct] = useState<Product | null>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddToCartForm>({
    resolver: zodResolver(AddToCartFormSchema),
    defaultValues: { quantity: 1 },
  });

  useEffect(() => {
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setProduct(null);
      return;
    }

    setProduct(undefined);
    prodApi
      .productById(productId)
      .then((result) => setProduct(result ?? null))
      .catch(() => setProduct(null));
  }, [id]);

  const addToCart = async (data: AddToCartForm) => {
    if (!product) return;
    await cartApi.addItem(product.id, data.quantity);
    document.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto px-4 pt-8 pb-16">
        {product === undefined ? <ProductDetailsSkeleton /> : null}
        {product === null ? <ProductNotFound /> : null}
        {product ? (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <div className="breadcrumbs text-sm">
              <ul>
                <li>
                  <Link to="/store">Store</Link>
                </li>
                <li>
                  <Link
                    to={`/store?category=${encodeURIComponent(product.category)}`}
                    className="capitalize"
                  >
                    {product.category}
                  </Link>
                </li>
                <li>
                  <span className="line-clamp-1 max-w-64">
                    {product.title ?? "No title found"}
                  </span>
                </li>
              </ul>
            </div>
            <div className="card card-border bg-base-100 shadow-md lg:card-side">
              <figure className="bg-white p-8 lg:w-2/5">
                <img
                  className="max-h-96 w-full object-contain"
                  src={product.image}
                  alt={product.title ?? ""}
                />
              </figure>
              <div className="card-body">
                <div className="flex items-center gap-2">
                  <span className="badge badge-soft badge-secondary capitalize">
                    {product.category}
                  </span>
                  <span className="text-xs text-base-content/50">
                    Product #{product.id}
                  </span>
                </div>
                <h1 className="card-title text-2xl">
                  {product.title ?? "No title found"}
                </h1>
                {product.rating ? (
                  <div className="flex items-center gap-2">
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className="mask mask-star"
                          aria-label={`${star} star`}
                          aria-current={
                            star === Math.round(product.rating?.rate ?? 0)
                              ? "true"
                              : undefined
                          }
                        ></div>
                      ))}
                    </div>
                    <span className="text-sm text-base-content/70">
                      {product.rating.rate.toFixed(1)} ({product.rating.count}{" "}
                      reviews)
                    </span>
                  </div>
                ) : null}
                <p className="text-base-content/80">
                  {product.description ?? ""}
                </p>
                <div className="mt-auto flex flex-col gap-2 pt-4">
                  <span className="badge badge-soft badge-accent badge-lg self-start">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <div className="card-actions items-center justify-between">
                    <Link to="/store" className="btn btn-ghost">
                      <span className="material-symbols-outlined">
                        arrow_back
                      </span>
                      Back to store
                    </Link>
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
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default ProductDetails;
