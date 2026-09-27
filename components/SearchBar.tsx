'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string; // Allow parent component to pass custom classes
}

const SearchBar = ({ placeholder, onChange, className }: SearchBarProps) => {
  const containerClasses = `relative flex ${className || 'w-full'}`;

  return (
    <div className={containerClasses}>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <Search
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
      />
      <input
        id="search"
        type="search"
        className="field pl-10"
        placeholder={placeholder}
        onChange={onChange}
        defaultValue={''}
      />
    </div>
  );
};

export default SearchBar;
