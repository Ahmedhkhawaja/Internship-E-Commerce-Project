import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/http";

export default function AdminProductNew() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [description, setDescription] = useState("");
  const [countInStock, setCountInStock] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await http.post("/api/products", {
        name,
        priceCents: Number(priceCents),
        description,
        countInStock: Number(countInStock),
      });

      // success → go back to admin products list
      nav("/admin/products");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Create Product</h2>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">

        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Price (cents)"
          type="number"
          value={priceCents}
          onChange={(e) => setPriceCents(e.target.value)}
          required
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Stock count"
          type="number"
          value={countInStock}
          onChange={(e) => setCountInStock(e.target.value)}
          required
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          className="border px-4 py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>

      </form>
    </div>
  );
}
