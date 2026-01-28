import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../../api/http";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const res = await http.get("/api/products");
      const items = Array.isArray(res.data) ? res.data : res.data.products || [];
      setProducts(items);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;

    try {
      await http.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert("Failed to delete");
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Products</h2>

      {products.length === 0 ? (
        <div>No products.</div>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <li key={p._id} className="border rounded p-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm opacity-70">
                  ${(p.priceCents / 100).toFixed(2)} • stock: {p.countInStock}
                </div>
              </div>
              <button
                onClick={() => handleDelete(p._id)}
                className="text-red-600 underline"
              >
                Delete
              </button>

              <Link className="underline" to={`/admin/products/${p._id}/edit`}>
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
