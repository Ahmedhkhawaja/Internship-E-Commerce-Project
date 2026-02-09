export default function TextInput({
  type = "text",
  value,
  onChange,
  placeholder,
  rightElement,
}) {
  // Optional rightElement enables inline actions (e.g., show/hide password).
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          "w-full rounded-xl border border-gray-200 px-4 py-2",
          "bg-white text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500",
          rightElement ? "pr-12" : "",
        ].join(" ")}
      />
      {rightElement ? (
        <div className="absolute inset-y-0 right-3 flex items-center">{rightElement}</div>
      ) : null}
    </div>
  );
}
