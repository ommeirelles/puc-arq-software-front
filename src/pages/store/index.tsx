import { useEffect, useState } from "react";
import { ProductService } from "../../services/product";
import { Product } from "./components/product";
import { CategoryFilter } from "./components/category-filter";
import { EmptyState } from "./components/empty-state";
import { CartService } from "@src/services/cart";
import { Header } from "@src/components/header";
import { Loading } from "@src/components/loading";

import "./index.css";

function Store() {
  const prodApi = ProductService.getInstance();
  const cartApi = CartService.getInstance();
  const [cartGuid, setCartGuid] = useState<string>();
  const [products, setProducts] =
    useState<Awaited<ReturnType<typeof prodApi.products>>>();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    Promise.all([cartApi.getCart(), prodApi.products()]).then(
      ([guid, prods]) => {
        setCartGuid(guid);
        setProducts(prods);
        setSelectedCategories(
          new Set((prods ?? []).map((product) => product.category))
        );
      }
    );
  }, []);

  if (!cartGuid)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );

  const categories = [
    ...new Set((products ?? []).map((product) => product.category)),
  ];
  const visibleProducts = products?.filter((product) =>
    selectedCategories.has(product.category)
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const toggleAllCategories = (selectAll: boolean) => {
    setSelectedCategories(selectAll ? new Set(categories) : new Set());
  };

  return (
    <div className="index-layout">
      <Header />
      <div className="drawer lg:drawer-open min-h-0 h-full">
        <input
          id="category-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={(e) => setDrawerOpen(e.target.checked)}
        />
        <div className="drawer-content min-h-0 overflow-auto">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-8 px-4 py-16 content-start">
            {visibleProducts?.length ? (
              visibleProducts.map((product) => (
                <Product key={product.id} {...product} />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
          {!drawerOpen && (
            <button
              className="btn btn-secondary btn-circle fixed bottom-6 right-6 z-20 shadow-lg lg:hidden"
              onClick={() => setDrawerOpen(true)}
              title="Filter by category"
            >
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          )}
        </div>
        <div className="drawer-side min-h-0 h-full">
          <div
            className="drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          ></div>
          <div className="h-full lg:hidden">
            <CategoryFilter
              categories={categories}
              selected={selectedCategories}
              onToggle={toggleCategory}
              onToggleAll={toggleAllCategories}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
          <div className="hidden lg:block h-full">
            <CategoryFilter
              categories={categories}
              selected={selectedCategories}
              onToggle={toggleCategory}
              onToggleAll={toggleAllCategories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Store;
