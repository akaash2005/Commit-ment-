import * as React from "react";

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
}

interface TabsListProps {
  children: React.ReactNode;
  active?: string;
  setActive?: (value: string) => void;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  active?: string;
  setActive?: (value: string) => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  active?: string;
}

export const Tabs = ({ children, defaultValue }: TabsProps) => {
  const [active, setActive] = React.useState(defaultValue);
  return (
    <div>
      {React.Children.map(children, (child: React.ReactElement<any>) =>
        React.cloneElement(child, { active, setActive } as any)
      )}
    </div>
  );
};

export const TabsList = ({ children, active, setActive }: TabsListProps) => (
  <div className="flex gap-2 mb-4">{children}</div>
);

export const TabsTrigger = ({ value, children, active, setActive }: TabsTriggerProps) => (
  <button
    onClick={() => setActive?.(value)}
    className={`px-4 py-2 rounded-xl border ${active === value ? "bg-blue-600 text-white" : "bg-gray-100"}`}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, active }: TabsContentProps) =>
  active === value ? <div>{children}</div> : null;
