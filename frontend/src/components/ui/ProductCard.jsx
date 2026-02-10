export default function ProductCard({ product, onAdd }) {
  // Display product image + name + price with add-to-cart action.
  const image = product.images?.[0];
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const imageUrl = image?.startsWith("/uploads") ? `${baseUrl}${image}` : image;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-4 transition-transform hover:-translate-y-1">
      <div className="rounded-xl overflow-hidden bg-neutral-100 aspect-3/3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
            No image
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="font-semibold line-clamp-2 min-h-10">{product.name}</div>
        <div className="mt-2 text-lg font-bold text-red-600">
          ${(product.priceCents / 100).toFixed(2)}
        </div>
      </div>

      <button
        onClick={() => onAdd(product)}
        className="mt-3 w-full rounded-xl border border-red-600 px-4 py-2 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors active:scale-[0.98]"
      >
        Add to cart
      </button>
    </div>
  );
}
