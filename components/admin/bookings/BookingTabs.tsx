'use client';

import React from 'react';

type BookingTabsProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const BookingTabs = ({ tabs, activeTab, onTabChange }: BookingTabsProps) => {
  return (
    <div className="flex -mb-0.5">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`
            px-10 py-2 text-sm font-medium
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
        </button>
      ))}
    </div>
  );
};

export default BookingTabs;
