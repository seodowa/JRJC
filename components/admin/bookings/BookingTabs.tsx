'use client';

import React from 'react';

type BookingTabsProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const BookingTabs = ({ tabs, activeTab, onTabChange }: BookingTabsProps) => {
  return (
    <div className="flex -mb-px border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`
            px-4 py-2 text-sm font-medium
            ${activeTab === tab
              ? 'border-b-2 border-blue-500 text-blue-600 bg-gray-100'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
            focus:outline-none focus:text-blue-800 focus:border-blue-800
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
