import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface ZipCodeInputProps {
  label?: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const ZipCodeInput: React.FC<ZipCodeInputProps> = ({
  label,
  name,
  register,
  error,
  placeholder = '12345',
  required = false,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...register(name, {
          pattern: {
            value: /^[0-9]{5}$/,
            message: 'Zip code must be exactly 5 digits',
          },
          ...(required && {
            required: 'Zip code is required',
          }),
        })}
        type="text"
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          text-secondary
        `}
        maxLength={5}
        pattern="[0-9]{5}"
        title="Please enter a valid 5-digit zip code"
        onInput={e => {
          // Only allow numeric input
          const target = e.target as HTMLInputElement;
          target.value = target.value.replace(/[^0-9]/g, '');
        }}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default ZipCodeInput;
