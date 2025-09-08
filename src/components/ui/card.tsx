import * as React from "react";

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl shadow p-4 bg-white ${className || ""}`}>{children}</div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className || ""}>{children}</div>
);
