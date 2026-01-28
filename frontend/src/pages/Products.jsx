import { useEffect, useState } from "react";
import {http} from "../api/http";
import { useCart } from "../cart/CartContext";


export default function Products () {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  const { items } = useCart();
  console.log("cart:", items);

  useEffect(()=>{
    let cancelled = false;
    async function load() {
      try{
        const res = await http.get("/api/products");

        if (cancelled) return;

        const items = Array.isArray(res.data) ? res.data : res.data.products || []

        setProducts(items);
      } catch(e){
        if (!cancelled) setError("Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    }
  }, []);
  
  if (loading) return <div className="p-6 text-xl font-semibold">Loading...</div>
  if (error) return <div className="p-6 text-xl font-semibold">{error}</div>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">Products</h1>

      {products.length === 0 ? (
        <div>No products found.</div>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <li key={p._id} className="border rounded p-3">
              <div className="font-semibold">{p.name}</div>
              <div>${(p.priceCents / 100).toFixed(2)}</div>
                <button
                  onClick={() => addToCart(p)}
                  className="mt-2 border px-3 py-1 rounded"
                >
                  Add to cart
                </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

