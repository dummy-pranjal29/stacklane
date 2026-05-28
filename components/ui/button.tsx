import React from "react";

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
}) {
  const baseStyles =
    "px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles =
    variant === "primary"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "border border-gray-300 hover:bg-gray-50 text-gray-700";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
