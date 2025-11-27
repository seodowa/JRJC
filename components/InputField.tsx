
import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  selectOptions?: { value: string; label: string }[];
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  optional = false,
  selectOptions,
  className = ''
}) => {
  const renderInput = () => {
    if (type === 'select' || selectOptions) {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Select {label.toLowerCase()}</option>
          {selectOptions?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    else if (required) {
      return (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      );
    }

    return (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {optional && <span className="text-gray-400 text-xs ml-2">(Optional)</span>}
      </label>
      {renderInput()}
    </div>
  );
};

export default InputField;