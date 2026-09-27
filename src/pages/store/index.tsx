import { useEffect, useState } from "react";
import { ProductService } from "../../services/product";
import { Product } from "./components/product";
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

  useEffect(() => {
    Promise.all([cartApi.getCart(), prodApi.products()]).then(
      ([guid, prods]) => {
        setCartGuid(guid);
        setProducts(prods);
      }
    );
  }, []);

  if (!cartGuid)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );

  return (
    <div className="index-layout">
      <Header />
      <div className="flex gap-8 flex-wrap px-4 py-16 overflow-auto">
        {products?.map((product) => (
          <Product key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}

export default Store;
