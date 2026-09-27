'use client';

import React from 'react';
import AsyncButton from "@/components/AsyncButton";

type BookingTabsProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const BookingTabs = ({ tabs = [], activeTab, onTabChange }: BookingTabsProps) => {
  return (
    <div className="w-full overflow-x-auto border-b border-line custom-scrollbar" role="tablist">
      <div className="flex min-w-max gap-7">
        {tabs.map((tab) => (
          <AsyncButton
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`-mb-px border-b-2 pb-3 text-[15px] whitespace-nowrap transition-colors duration-150 ${
              activeTab === tab
                ? 'border-ink font-medium text-ink'
                : 'border-transparent text-ink-2 hover:text-ink'
            }`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </AsyncButton>
        ))}
      </div>
    </div>
  );
};

export default BookingTabs;
