export default function Pagination({ page, totalPages, onPage }) {
  // Simple pagination controls for list views.
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={[
            "rounded-lg px-3 py-1 text-sm border",
            p === page
              ? "border-red-600 bg-red-600 text-white"
              : "border-gray-200 text-gray-900",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
