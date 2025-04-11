import { useEffect, useRef, useState } from "react";
import { ProductService } from "../../services/product";
import { Product } from "./components/product";

function App() {
  const api = useRef(new ProductService());
  const [products, setProducts] =
    useState<Awaited<ReturnType<typeof api.current.products>>>();

  useEffect(() => {
    api.current.products().then((products) => {
      setProducts(products);
    });
  }, []);

  return (
    <div className="flex gap-8 flex-wrap px-4 py-16">
      {products?.map((product) => (
        <Product key={product.id} {...product} />
      ))}
    </div>
  );
}

export default App;
