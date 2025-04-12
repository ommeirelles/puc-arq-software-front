import { useEffect, useRef, useState } from "react";
import { ProductService } from "../../services/product";
import { Product } from "./components/product";
import { CartService } from "@src/services/cart";
import { Header } from "@src/components/header";
import { Loading } from "@src/components/loading";

import "./index.css";

function App() {
  const prodApi = useRef(new ProductService());
  const cartApi = useRef(new CartService());
  const [cartGuid, setCartGuid] = useState<string>();
  const [products, setProducts] =
    useState<Awaited<ReturnType<typeof prodApi.current.products>>>();

  useEffect(() => {
    // cartApi.current.getCart().then((guid) => {
    //   setCartGuid(guid);
    // });
    Promise.all([cartApi.current.getCart(), prodApi.current.products()]).then(
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

export default App;
