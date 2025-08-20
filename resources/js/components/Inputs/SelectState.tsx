import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { usStates } from '@/types/event';

interface SelectStateProps {
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const SelectState: React.FC<SelectStateProps> = ({
  name,
  register,
  error,
  label,
  required = false,
  placeholder = 'Select State',
  className = '',
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-secondary mb-2">
        {label} {required && '*'}
      </label>
      <select
        {...register(name)}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <option value="">{placeholder}</option>
        {usStates.map(state => (
          <option key={state.value} value={state.value}>
            {state.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default SelectState;
