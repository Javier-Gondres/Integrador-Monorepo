"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ProfileTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
}

export function ProfileTabs({ tabs, defaultTab }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Tab Headers */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          borderBottom: `1px solid ${C.cardBorder}`,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 0",
                fontSize: "14px",
                fontWeight: 600,
                color: isActive ? C.primary : C.bodyText,
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isActive ? `2px solid ${C.primary}` : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>{activeTabContent}</div>
    </div>
  );
}
