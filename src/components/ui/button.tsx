// src/components/ui/button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline";
}

export const Button: React.FC<ButtonProps> = ({ children, variant = "default", className, ...props }) => {
  let baseStyle = "px-4 py-2 rounded-md font-semibold transition ";
  let variantStyle = "";

  switch (variant) {
    case "destructive":
      variantStyle = "bg-red-500 text-white hover:bg-red-600";
      break;
    case "outline":
      variantStyle = "border border-gray-300 text-gray-700 hover:bg-gray-100";
      break;
    default:
      variantStyle = "bg-indigo-600 text-white hover:bg-indigo-700";
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className ? className : ""}`} {...props}>
      {children}
    </button>
  );
};
