import { Header } from "@src/components/header";
import { CartService } from "@src/services/cart";
import { PaymentService } from "@src/services/payment";
import { ProductService } from "@src/services/product";
import {
  CartSummary,
  CheckoutForm,
  CheckoutFormSchema,
  Product,
} from "@types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

function Checkout() {
  const cartApi = CartService.getInstance();
  const paymentApi = PaymentService.getInstance();
  const prodApi = ProductService.getInstance();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<CartSummary>();
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string>();
  const [declined, setDeclined] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(CheckoutFormSchema),
  });

  useEffect(() => {
    (async () => {
      const cartSummary = await cartApi.getSummary();
      if (cartSummary) {
        setSummary(cartSummary);

        const byId = new Map<number, Product>();
        for (const item of cartSummary.items) {
          const product = await prodApi.productById(item.product_id);
          if (product) byId.set(item.product_id, product);
        }
        setProducts(byId);

        // this request superseded the header's own summary fetch (aborted
        // calls keep stale state), so ask the header to refetch
        document.dispatchEvent(new Event("cart-updated"));
      }
      setLoading(false);
    })();
  }, []);

  // auto-fills the address from ViaCEP once the CEP has 8 digits
  const cep = watch("cep");
  useEffect(() => {
    const digits = (cep ?? "").replace(/\D/g, "");
    if (digits.length !== 8) return;

    let cancelled = false;
    setCepLoading(true);
    fetch(`https://viacep.com.br/ws/${digits}/json/`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || data.erro) return;
        if (data.logradouro) setValue("street", data.logradouro);
        if (data.bairro) setValue("neighborhood", data.bairro);
        if (data.localidade) setValue("city", data.localidade);
        if (data.uf) setValue("state", data.uf);
      })
      .catch(() => {
        // CEP lookup is best-effort; the user can type the address manually
      })
      .finally(() => {
        if (!cancelled) setCepLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cep]);

  const onSubmit = async (data: CheckoutForm) => {
    setPaymentError(undefined);
    setDeclined(false);

    try {
      const cartGuid = await cartApi.getCart();
      const payment = await paymentApi.pay(cartGuid, data);

      if (payment.status === "approved") {
        cartApi.clearCart();
        document.dispatchEvent(new Event("cart-updated"));
        navigate("/checkout/success", { state: { payment } });
      } else {
        setDeclined(true);
      }
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Failed to process the payment"
      );
    }
  };

  const items = summary?.items ?? [];

  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      <main className="container mx-auto p-4">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="skeleton h-64 w-full" />
            <div className="skeleton h-96 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="card bg-base-100 shadow-xl max-w-md w-full mx-auto">
            <div className="card-body items-center text-center gap-4">
              <span className="material-symbols-outlined text-6xl text-base-content/40">
                shopping_basket
              </span>
              <h1 className="card-title text-2xl">Your cart is empty</h1>
              <p className="text-base-content/60">
                Add some products before finalizing your purchase.
              </p>
              <Link to="/store" className="btn btn-primary w-full">
                Back to store
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 items-start">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body gap-4">
                <h2 className="card-title">Order summary</h2>
                <ul className="flex flex-col gap-3">
                  {items.map((item) => {
                    const product = products.get(item.product_id);
                    return (
                      <li
                        key={item.product_id}
                        className="flex items-center gap-3"
                      >
                        {product?.image ? (
                          <img
                            className="size-12 rounded bg-white object-contain"
                            src={product.image}
                            alt={product.title ?? ""}
                            loading="lazy"
                          />
                        ) : (
                          <span className="material-symbols-outlined size-12 flex items-center justify-center text-base-content/40">
                            image
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className="overflow-hidden text-ellipsis whitespace-nowrap"
                            title={product?.title ?? ""}
                          >
                            {product?.title ?? `Product #${item.product_id}`}
                          </p>
                          <span className="badge badge-soft badge-secondary">
                            {item.quantity} x
                          </span>
                        </div>
                        <span className="badge badge-soft badge-accent">
                          R${" "}
                          {((product?.price ?? 0) * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex justify-end">
                  <div className="badge badge-soft badge-secondary badge-lg">
                    TOTAL: R$ {summary?.total.toFixed(2) ?? "0.00"}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <form
                className="card-body gap-4"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <h2 className="card-title">Payment</h2>

                {declined ? (
                  <div role="alert" className="alert alert-warning alert-soft">
                    <span className="material-symbols-outlined">warning</span>
                    <span>
                      Payment declined. Check the card data and try again.
                    </span>
                  </div>
                ) : null}

                {paymentError ? (
                  <div role="alert" className="alert alert-error alert-soft">
                    <span className="material-symbols-outlined">error</span>
                    <span>{paymentError}</span>
                  </div>
                ) : null}

                <div>
                  <label
                    className={`input w-full${errors.card_number ? " input-error" : ""}`}
                  >
                    <span className="material-symbols-outlined">
                      credit_card
                    </span>
                    <input
                      type="text"
                      placeholder="Card number"
                      aria-invalid={Boolean(errors.card_number)}
                      autoComplete="cc-number"
                      inputMode="numeric"
                      {...register("card_number")}
                    />
                  </label>
                  {errors.card_number ? (
                    <p className="text-error text-xs mt-1">
                      {errors.card_number.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`input w-full${errors.card_expiry ? " input-error" : ""}`}
                    >
                      <span className="material-symbols-outlined">event</span>
                      <input
                        type="text"
                        placeholder="Expiry (MM/YY)"
                        aria-invalid={Boolean(errors.card_expiry)}
                        autoComplete="cc-exp"
                        inputMode="numeric"
                        {...register("card_expiry")}
                      />
                    </label>
                    {errors.card_expiry ? (
                      <p className="text-error text-xs mt-1">
                        {errors.card_expiry.message}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label
                      className={`input w-full${errors.card_cvv ? " input-error" : ""}`}
                    >
                      <span className="material-symbols-outlined">lock</span>
                      <input
                        type="text"
                        placeholder="CVV"
                        aria-invalid={Boolean(errors.card_cvv)}
                        autoComplete="cc-csc"
                        inputMode="numeric"
                        {...register("card_cvv")}
                      />
                    </label>
                    {errors.card_cvv ? (
                      <p className="text-error text-xs mt-1">
                        {errors.card_cvv.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <h3 className="font-semibold">Delivery address</h3>

                <div>
                  <label
                    className={`input w-full${errors.cep ? " input-error" : ""}`}
                  >
                    <span className="material-symbols-outlined">
                      local_post_office
                    </span>
                    <input
                      type="text"
                      placeholder="CEP"
                      aria-invalid={Boolean(errors.cep)}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      {...register("cep")}
                    />
                    {cepLoading ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : null}
                  </label>
                  {errors.cep ? (
                    <p className="text-error text-xs mt-1">
                      {errors.cep.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label
                      className={`input w-full${errors.street ? " input-error" : ""}`}
                    >
                      <span className="material-symbols-outlined">route</span>
                      <input
                        type="text"
                        placeholder="Street"
                        aria-invalid={Boolean(errors.street)}
                        autoComplete="address-line1"
                        {...register("street")}
                      />
                    </label>
                    {errors.street ? (
                      <p className="text-error text-xs mt-1">
                        {errors.street.message}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label
                      className={`input w-full${errors.number ? " input-error" : ""}`}
                    >
                      <input
                        type="text"
                        placeholder="Number"
                        aria-invalid={Boolean(errors.number)}
                        autoComplete="address-line2"
                        {...register("number")}
                      />
                    </label>
                    {errors.number ? (
                      <p className="text-error text-xs mt-1">
                        {errors.number.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label
                    className={`input w-full${errors.neighborhood ? " input-error" : ""}`}
                  >
                    <span className="material-symbols-outlined">home</span>
                    <input
                      type="text"
                      placeholder="Neighborhood"
                      aria-invalid={Boolean(errors.neighborhood)}
                      autoComplete="address-level3"
                      {...register("neighborhood")}
                    />
                  </label>
                  {errors.neighborhood ? (
                    <p className="text-error text-xs mt-1">
                      {errors.neighborhood.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label
                      className={`input w-full${errors.city ? " input-error" : ""}`}
                    >
                      <span className="material-symbols-outlined">
                        location_city
                      </span>
                      <input
                        type="text"
                        placeholder="City"
                        aria-invalid={Boolean(errors.city)}
                        autoComplete="address-level2"
                        {...register("city")}
                      />
                    </label>
                    {errors.city ? (
                      <p className="text-error text-xs mt-1">
                        {errors.city.message}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label
                      className={`input w-full${errors.state ? " input-error" : ""}`}
                    >
                      <input
                        type="text"
                        placeholder="UF"
                        aria-invalid={Boolean(errors.state)}
                        autoComplete="address-level1"
                        maxLength={2}
                        {...register("state")}
                      />
                    </label>
                    {errors.state ? (
                      <p className="text-error text-xs mt-1">
                        {errors.state.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : null}
                  Pay R$ {summary?.total.toFixed(2) ?? "0.00"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Checkout;
