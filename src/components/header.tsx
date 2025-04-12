import { CartService } from "@src/services/cart";
import { useEffect, useRef, useState } from "react";
import { Loading } from "./loading";
import { ProductService } from "@src/services/product";
import { Product } from "@types";

export function Header() {
  const cartApi = useRef(new CartService());
  const prodApi = useRef(new ProductService());
  const [isLoading, setIsLoading] = useState(false);
  const [cartSummary, setCartSummary] =
    useState<Awaited<ReturnType<typeof cartApi.current.getSummary>>>();
  const products = useRef<Map<number, Product>>(new Map());

  useEffect(() => {
    loadSummary();
    document.addEventListener("cart-updated", () => loadSummary());

    return () =>
      document.removeEventListener("cart-updated", () => loadSummary());
  }, []);

  const loadSummary = async () => {
    setIsLoading(true);
    const summary = await cartApi.current.getSummary();
    for (const item of summary?.items ?? []) {
      const product = await prodApi.current.productById(item.product_id);
      if (!product) continue;

      products.current.set(item.product_id, product);
    }

    setIsLoading(false);
    setCartSummary(summary);
  };

  const removeItem = (entryId: number) => async () => {
    cartApi.current.removeItem(entryId).then(() => {
      loadSummary();
    });
  };

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-none">
        <a className="btn btn-ghost text-xl">Fake Store APP</a>
      </div>
      <div className="flex flex-1 justify-center">
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary className="indicator">
                <span className="indicator-item badge badge-secondary indicator-bottom indicator-start">
                  {cartSummary?.items?.length ?? 0}
                </span>
                <span className="material-symbols-outlined">shopping_bag</span>
              </summary>
              <ul className="bg-base-100 rounded-t-none p-2 w-md mr-0 z-10 shadow-md shadow-gray-700 left-[-224px]">
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
                    <li key={el.id}>
                      <div
                        className="grid max-w-full overflow-auto"
                        style={{
                          gridTemplate:
                            "'title price delete' 1fr / 1fr auto auto",
                        }}
                      >
                        <p
                          className="overflow-hidden text-ellipsis whitespace-nowrap"
                          title={
                            products.current.get(el.product_id)?.title ?? ""
                          }
                        >
                          {products.current.get(el.product_id)?.title ?? ""}
                        </p>
                        <span className="badge badge-soft badge-accent">
                          R$:{" "}
                          {products.current
                            .get(el.product_id)
                            ?.price.toFixed(2) ?? "0.00"}
                        </span>
                        <button
                          className="btn btn-error btn-soft btn-xs"
                          onClick={removeItem(el.id)}
                        >
                          <span className="material-symbols-outlined">
                            delete_forever
                          </span>
                        </button>
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
    </div>
  );
}
