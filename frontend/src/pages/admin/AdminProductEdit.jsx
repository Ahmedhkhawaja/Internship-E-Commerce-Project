import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../../api/http";

export default function AdminProductEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [description, setDescription] = useState("");
  const [countInStock, setCountInStock] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load product once
  useEffect(() => {
    async function load() {
      try {
        const res = await http.get(`/api/products/${id}`);
        const p = res.data.thisProduct || res.data;

        setName(p.name || "");
        setPriceCents(p.priceCents || "");
        setDescription(p.description || "");
        setCountInStock(p.countInStock || "");
      } catch (e) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await http.patch(`/api/products/${id}`, {
        name,
        priceCents: Number(priceCents),
        description,
        countInStock: Number(countInStock),
      });

      nav("/admin/products");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <input
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />

        <input
          className="w-full border p-2 rounded"
          type="number"
          value={priceCents}
          onChange={(e) => setPriceCents(e.target.value)}
          placeholder="Price (cents)"
          required
        />

        <input
          className="w-full border p-2 rounded"
          type="number"
          value={countInStock}
          onChange={(e) => setCountInStock(e.target.value)}
          placeholder="Stock"
          required
        />

        <textarea
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          className="border px-4 py-2 rounded disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
