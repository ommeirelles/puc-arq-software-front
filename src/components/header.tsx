import { CartService } from "@src/services/cart";
import { AuthService } from "@src/services/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Loading } from "./loading";
import { ProductService } from "@src/services/product";
import { Product } from "@types";

export function Header({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const cartApi = CartService.getInstance();
  const authApi = AuthService.getInstance();
  const prodApi = ProductService.getInstance();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cartSummary, setCartSummary] =
    useState<Awaited<ReturnType<typeof cartApi.getSummary>>>();
  const products = useRef<Map<number, Product>>(new Map());

  useEffect(() => {
    loadSummary();
    document.addEventListener("cart-updated", () => loadSummary());

    return () =>
      document.removeEventListener("cart-updated", () => loadSummary());
  }, []);

  const loadSummary = async () => {
    setIsLoading(true);
    const summary = await cartApi.getSummary();
    for (const item of summary?.items ?? []) {
      const product = await prodApi.productById(item.product_id);
      if (!product) continue;

      products.current.set(item.product_id, product);
    }

    setIsLoading(false);
    setCartSummary(summary);
  };

  const removeItem = (productId: number) => async () => {
    cartApi.removeItem(productId).then(() => {
      loadSummary();
    });
  };

  const incrementItem = (productId: number) => async () => {
    cartApi.addItem(productId, 1).then(() => {
      loadSummary();
    });
  };

  const decrementItem = (productId: number) => async () => {
    cartApi.removeItem(productId, 1).then(() => {
      loadSummary();
    });
  };

  const logout = async () => {
    await authApi.logout();
    cartApi.clearCart();
    navigate("/");
  };

  return (
    <div className="navbar bg-base-100 shadow-sm flex-wrap">
      <div className="flex w-full justify-center lg:w-auto lg:flex-none">
        <a className="btn btn-ghost text-xl">Fake Store APP</a>
      </div>
      <div className="flex flex-1 justify-center items-center gap-2 px-2">
        <input
          type="search"
          className="input input-bordered w-full max-w-xs"
          placeholder="Search products..."
          aria-label="Search products"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <ul className="menu menu-horizontal px-1">
          <li>
            <details className="overflow-visible">
              <summary className="indicator">
                <span className="indicator-item badge badge-secondary indicator-bottom indicator-start">
                  {cartSummary?.items?.reduce(
                    (total, item) => total + item.quantity,
                    0
                  ) ?? 0}
                </span>
                <span className="material-symbols-outlined">shopping_bag</span>
              </summary>
              <ul className="bg-neutral text-neutral-content rounded-t-none p-2 mr-0 z-10 border border-base-content/20 shadow-lg shadow-base-content/30 max-lg:fixed max-lg:inset-x-4 max-lg:top-28 max-lg:rounded-box lg:w-md lg:left-[-224px]">
                <li>
                  <div className="flex justify-center items-center cursor-default">
                    <div className="badge badge-soft badge-secondary">
                      TOTAL: R$ {cartSummary?.total.toFixed(2) ?? "0.00"}
                    </div>
                  </div>
                </li>
                {isLoading ? (
                  <li>
                    <div className="flex justify-center items-center">
                      <Loading size="md" />
                    </div>
                  </li>
                ) : null}
                {!isLoading && cartSummary?.items.length ? (
                  (cartSummary?.items ?? []).map((el) => (
                    <li key={el.product_id}>
                      <div
                        className="grid max-w-full items-center gap-x-2 gap-y-1"
                        style={{
                          gridTemplate:
                            "'prod-img actions' auto 'prod-img prod-name' auto / auto 1fr",
                        }}
                      >
                        {products.current.get(el.product_id)?.image ? (
                          <img
                            className="size-12 rounded bg-white object-contain"
                            style={{ gridArea: "prod-img" }}
                            src={products.current.get(el.product_id)?.image}
                            alt={
                              products.current.get(el.product_id)?.title ?? ""
                            }
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className="material-symbols-outlined size-12 flex items-center justify-center text-base-content/40"
                            style={{ gridArea: "prod-img" }}
                          >
                            image
                          </span>
                        )}
                        <div
                          className="flex items-center justify-end gap-2"
                          style={{ gridArea: "actions" }}
                        >
                          <div className="flex items-center gap-1">
                            <button
                              className="btn btn-soft btn-xs"
                              onClick={decrementItem(el.product_id)}
                              title="Remove one unit"
                            >
                              <span className="material-symbols-outlined">
                                remove
                              </span>
                            </button>
                            <span className="badge badge-soft badge-secondary">
                              {el.quantity}
                            </span>
                            <button
                              className="btn btn-soft btn-xs"
                              onClick={incrementItem(el.product_id)}
                              title="Add one unit"
                            >
                              <span className="material-symbols-outlined">
                                add
                              </span>
                            </button>
                          </div>
                          <span className="badge badge-soft badge-accent">
                            R$:{" "}
                            {(
                              (products.current.get(el.product_id)?.price ??
                                0) * el.quantity
                            ).toFixed(2)}
                          </span>
                          <button
                            className="btn btn-error btn-soft btn-xs"
                            onClick={removeItem(el.product_id)}
                            title="Remove all units"
                          >
                            <span className="material-symbols-outlined">
                              delete_forever
                            </span>
                          </button>
                        </div>
                        <p
                          className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                          style={{ gridArea: "prod-name" }}
                          title={
                            products.current.get(el.product_id)?.title ?? ""
                          }
                        >
                          {products.current.get(el.product_id)?.title ?? ""}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="flex justify-center items-center cursor-default text-md gap-2">
                      <span className="material-symbols-outlined">
                        shopping_basket
                      </span>
                      Carrinho vazio
                    </div>
                  </li>
                )}
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <div className="flex-none hidden lg:block">
        <button className="btn btn-neutral" onClick={logout} title="Logout">
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </div>
  );
}
