import * as React from "react";

export const Tabs = ({ children, defaultValue }: { children: React.ReactNode; defaultValue: string }) => {
  const [active, setActive] = React.useState(defaultValue);
  return (
    <div>
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, { active, setActive })
      )}
    </div>
  );
};

export const TabsList = ({ children, active, setActive }: any) => (
  <div className="flex gap-2 mb-4">{children}</div>
);

export const TabsTrigger = ({ value, children, active, setActive }: any) => (
  <button
    onClick={() => setActive(value)}
    className={`px-4 py-2 rounded-xl border ${active === value ? "bg-blue-600 text-white" : "bg-gray-100"}`}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, active }: any) =>
  active === value ? <div>{children}</div> : null;
