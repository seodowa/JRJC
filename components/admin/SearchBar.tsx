'use client';

import SearchIcon from '@/components/icons/SearchIcon';
import { useState } from 'react';

interface SearchBarProps {
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string; // Allow parent component to pass custom classes
}

const SearchBar = ({ placeholder, onChange, className }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // Set default width if no className is provided, otherwise use the provided className.
  const containerClasses = `relative flex ${className || 'w-full'}`;

  return (
    <div className={containerClasses}>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className={`w-full pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
          isFocused ? 'pl-4' : 'pl-10'
        }`}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        defaultValue={''}
      />
      <SearchIcon
        className={`absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 transition-all duration-300 ${
          isFocused ? 'opacity-0 -translate-x-full' : 'opacity-100'
        }`}
      />
    </div>
  );
};

export default SearchBar;
