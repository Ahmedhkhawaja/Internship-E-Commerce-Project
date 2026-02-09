export default function Footer() {
  // Simple global footer with contact/credits.
  return (
    <footer className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-8 grid gap-6 md:grid-cols-3">
        <div>
          <div className="text-lg font-bold text-gray-900">Gym Store</div>
          <p className="text-sm text-gray-500 mt-2">
            Premium fitness essentials delivered to your door.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          <div className="font-semibold text-gray-900">Contact</div>
          <div className="mt-2">Email: support@gymstore.com</div>
          <div>Phone: +92 300 0000000</div>
        </div>

        <div className="text-sm text-gray-500 md:text-right">
          <div className="font-semibold text-gray-900">Credits</div>
          <div className="mt-2">Made by Ahmed Hassan Khawaja</div>
        </div>
      </div>
    </footer>
  );
}
