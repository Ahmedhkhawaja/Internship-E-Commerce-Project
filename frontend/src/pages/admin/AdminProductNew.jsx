import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/http";

export default function AdminProductNew() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [description, setDescription] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload image first, then store URL in product payload.
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send image URL as part of the product payload.
      await http.post("/api/products", {
        name,
        priceCents: Number(priceCents),
        description,
        countInStock: Number(countInStock),
        images: imageUrl ? [imageUrl] : [],
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
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Create Product</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
      >
        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Price (cents)"
          type="number"
          value={priceCents}
          onChange={(e) => setPriceCents(e.target.value)}
          required
        />

        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Stock count"
          type="number"
          value={countInStock}
          onChange={(e) => setCountInStock(e.target.value)}
          required
        />

        <textarea
          className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          disabled={loading || uploading}
        >
          {loading ? "Creating..." : uploading ? "Uploading..." : "Create"}
        </button>
      </form>
    </div>
  );
}
