import React, { useState, useEffect } from 'react';

interface PhoneInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  label,
  placeholder = '(555) 123-4567',
  required = false,
  disabled = false,
  className = '',
}) => {
  const [formattedValue, setFormattedValue] = useState(value);

  // Format phone number as user types
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, '');

    // Limit to 10 digits for US phone numbers
    const limitedNumbers = numbers.slice(0, 10);

    // Apply formatting based on length
    if (limitedNumbers.length === 0) return '';
    if (limitedNumbers.length <= 3) return limitedNumbers;
    if (limitedNumbers.length <= 6) {
      return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3)}`;
    }
    return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3, 6)}-${limitedNumbers.slice(6)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPhoneNumber(inputValue);

    setFormattedValue(formatted);

    // Create a new event with the formatted value for the parent
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted,
      },
    };

    onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  // Update formatted value when prop value changes
  useEffect(() => {
    setFormattedValue(formatPhoneNumber(value));
  }, [value]);

  // Validate phone number and show additional error if invalid
  const numbers = formattedValue.replace(/\D/g, '');
  const isValidLength = numbers.length === 0 || numbers.length === 10;
  const showValidationError = formattedValue && !isValidLength;

  const baseClassName = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors ${
    error || showValidationError
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-brand focus:border-brand'
  } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'} ${className}`;

  const displayError =
    error || (showValidationError ? 'Please enter a valid 10-digit US phone number' : '');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="tel"
        id={id}
        name={name}
        value={formattedValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={baseClassName}
        aria-invalid={displayError ? 'true' : 'false'}
        aria-describedby={displayError ? `${id}-error` : undefined}
        maxLength={14} // Max length for formatted phone: (555) 123-4567
      />
      <div className="mt-1">
        {displayError && (
          <p id={`${id}-error`} className="text-sm text-red-600">
            {displayError}
          </p>
        )}
        {!displayError && formattedValue && numbers.length > 0 && numbers.length < 10 && (
          <p className="text-sm text-gray-500">{10 - numbers.length} more digits needed</p>
        )}
      </div>
    </div>
  );
};

export default PhoneInput;
