// src/components/ui/badge.tsx
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children }) => {
  return (
    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
      {children}
    </span>
  );
};
