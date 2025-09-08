// src/components/ui/progress.tsx
import React from "react";

interface ProgressProps {
  value: number; // 0-100
}

export const Progress: React.FC<ProgressProps> = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-indigo-600 h-4 rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};
