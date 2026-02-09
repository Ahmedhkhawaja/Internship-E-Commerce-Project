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
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Load product once for edit form defaults.
  useEffect(() => {
    async function load() {
      try {
        const res = await http.get(`/api/products/${id}`);
        const p = res.data.thisProduct || res.data;

        setName(p.name || "");
        setPriceCents(p.priceCents || "");
        setDescription(p.description || "");
        setCountInStock(p.countInStock || "");
        setImageUrl(p.images?.[0] || "");
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
      // Persist edits (including optional image URL).
      await http.patch(`/api/products/${id}`, {
        name,
        priceCents: Number(priceCents),
        description,
        countInStock: Number(countInStock),
        images: imageUrl ? [imageUrl] : [],
      });

      nav("/admin/products");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload replacement image and update preview URL.
    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await http.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(res.data.imageUrl || "");
    } catch (e) {
      setUploadError(e?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Edit Product</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
      >
        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />

        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          type="number"
          value={priceCents}
          onChange={(e) => setPriceCents(e.target.value)}
          placeholder="Price (cents)"
          required
        />

        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          type="number"
          value={countInStock}
          onChange={(e) => setCountInStock(e.target.value)}
          placeholder="Stock"
          required
        />

        <textarea
          className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />

        <div className="space-y-2">
          <input
            className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
          {uploading && <div className="text-sm text-gray-500">Uploading...</div>}
          {uploadError && <div className="text-sm text-red-600">{uploadError}</div>}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="h-40 w-full rounded-xl border border-gray-200 object-cover"
            />
          )}
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          className="rounded-xl bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
          disabled={saving || uploading}
        >
          {saving ? "Saving..." : uploading ? "Uploading..." : "Save"}
        </button>
      </form>
    </div>
  );
}
