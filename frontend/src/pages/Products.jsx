import { useEffect, useState } from "react";
import { http } from "../api/http";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import ProductCard from "../components/ui/ProductCard";
import SkeletonCard from "../components/ui/SkeletonCard";
import Pagination from "../components/ui/Pagination";

const PAGE_SIZE = 8;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    // Debounce search to avoid firing a request on every keystroke.
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Server-side pagination + search for consistent results.
        const res = await http.get("/api/products", {
          params: {
            page,
            limit: PAGE_SIZE,
            search: debouncedSearch || undefined,
          },
        });

        if (cancelled) return;

        const items = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.products || [];
        setProducts(items);
        setTotalPages(res.data.totalPages || 1);
      } catch (e) {
        if (!cancelled) setError("Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shop Products</h1>
          <p className="text-sm text-gray-500">
            Explore curated picks and add favorites to your cart.
          </p>
        </div>

        <div className="w-full md:w-80">
          <div className="relative">
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
              <h2 className="text-lg font-semibold">No products found</h2>
              <p className="text-sm text-gray-500 mt-1">
                Try a different search term or clear your filters.
              </p>
              <button
                className="mt-4 rounded-xl border border-red-600 px-4 py-2 text-red-600 font-semibold"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} onAdd={(item) => dispatch(addToCart(item))} />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
