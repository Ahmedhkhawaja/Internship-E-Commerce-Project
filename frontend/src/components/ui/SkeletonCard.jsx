export default function SkeletonCard() {
  // Shimmer placeholder for loading product cards.
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-4">
      <div className="rounded-xl aspect-4/3 skeleton" />
      <div className="mt-3 h-4 rounded skeleton" />
      <div className="mt-2 h-4 w-2/3 rounded skeleton" />
      <div className="mt-4 h-9 rounded skeleton" />
    </div>
  );
}
