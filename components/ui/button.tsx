import * as React from "react";

export const Button = ({
  children,
  onClick,
  disabled,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  className?: string;
}) => {
  const base = "px-4 py-2 rounded-2xl font-semibold transition";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-400 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className || ""}`}
    >
      {children}
    </button>
  );
};
