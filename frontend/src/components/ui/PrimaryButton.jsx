export default function PrimaryButton({
  children,
  className = "",
  disabled,
  type = "button",
  onClick,
}) {
  // Consistent primary button styling across the app.
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full rounded-xl px-4 py-2 font-semibold text-white",
        "bg-red-600 hover:bg-red-700",
        "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
        "transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
