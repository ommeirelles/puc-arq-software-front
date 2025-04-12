import { useEffect, useRef, useState } from "react";
import { ProductService } from "../../services/product";
import { Product } from "./components/product";
import { CartService } from "@src/services/cart";

function App() {
  const prodApi = useRef(new ProductService());
  const cartApi = useRef(new CartService());
  const [cartGuid, setCartGuid] = useState<string>();
  const [products, setProducts] =
    useState<Awaited<ReturnType<typeof prodApi.current.products>>>();

  useEffect(() => {
    Promise.all([cartApi.current.getCart(), prodApi.current.products()]).then(([guid, prods]) => {
      setCartGuid(guid);
      setProducts(prods);
    });
  }, []);

  if (!cartGuid) return <div>Loading...</div>;

  return (
    <div className="flex gap-8 flex-wrap px-4 py-16">
      {products?.map((product) => (
        <Product key={product.id} {...product} />
      ))}
    </div>
  );
}

export default App;
