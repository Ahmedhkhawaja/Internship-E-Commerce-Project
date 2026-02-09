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
      // Admin uses same products endpoint for listing.
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
    // Simple confirmation to avoid accidental deletes.
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

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Products</h2>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          No products yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          {products.map((p) => (
            <div
              key={p._id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg flex flex-col gap-3"
            >
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-500">
                  ${(p.priceCents / 100).toFixed(2)} • stock: {p.countInStock}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  className="rounded-full border border-gray-200 px-3 py-1 text-sm hover:border-red-600"
                  to={`/admin/products/${p._id}/edit`}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="rounded-full border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
