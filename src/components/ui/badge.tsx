import * as React from "react";

export const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm font-medium">
    {children}
  </span>
);
