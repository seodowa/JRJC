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
    <div className="w-full overflow-x-auto pb-1 custom-scrollbar">
      <div className="flex -mb-0.25 min-w-max">
        {tabs.map((tab) => (
          <AsyncButton
            key={tab}
            className={`
              px-6 md:px-10 py-2 text-sm font-medium whitespace-nowrap
              ${activeTab === tab
                ? 'border-t border-x-1 rounded-t-xl border-gray-400 text-white bg-[#A1E3F9]'
                : 'text-black border rounded-t-xl border-gray-200 hover:text-gray-700 mx-2 '
              }
              focus:outline-none
              transition-colors duration-200 ease-in-out
            `}
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
