export default function AuthCard({ title, subtitle, children }) {
  // Shared card layout for auth screens.
  return (
    <div className="mt-32 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-200 p-6">
        <div className="mb-6 text-center">
          <div className="text-sm uppercase tracking-[0.2em] text-red-600 font-semibold">
            Gym Store
          </div>
          <h1 className="text-2xl font-bold mt-2">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
