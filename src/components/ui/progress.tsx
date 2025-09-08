import * as React from "react";

export const Progress = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div
      className="bg-green-500 h-3 transition-all"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);
