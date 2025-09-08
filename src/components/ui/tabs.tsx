// src/components/ui/tabs.tsx
import React, { useState } from "react";

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultValue, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (val: string) => void;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className, setActiveTab }) => {
  return <div className={`flex gap-2 ${className}`}>{React.Children.map(children, (child: any) =>
    React.cloneElement(child, { setActiveTab })
  )}</div>;
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  setActiveTab?: (val: string) => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, setActiveTab }) => {
  return (
    <button
      onClick={() => setActiveTab && setActiveTab(value)}
      className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-semibold"
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, activeTab }) => {
  if (activeTab !== value) return null;
  return <div className="mt-4">{children}</div>;
};
