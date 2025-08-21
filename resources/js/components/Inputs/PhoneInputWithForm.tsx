import React from 'react';
import { UseFormRegister, FieldError, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import PhoneInput from './PhoneInput';

interface PhoneInputWithFormProps {
  name: string;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  error?: FieldError;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  requiredClassName?: string;
}

const PhoneInputWithForm: React.FC<PhoneInputWithFormProps> = ({
  name,
  register,
  watch,
  setValue,
  error,
  label,
  placeholder,
  required = false,
  className,
  labelClassName,
  requiredClassName,
}) => {
  // Register the field with react-hook-form
  register(name, {
    required: required ? `${label} is required` : false,
    validate: (value: string | undefined) => {
      // Handle undefined or empty values
      const stringValue = value || '';

      if (!stringValue && !required) return true;
      if (!stringValue && required) return `${label} is required`;

      // Extract digits for validation
      const digitsOnly = stringValue.replace(/\D/g, '');

      // US phone number should have exactly 10 digits when provided
      if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
        return 'Phone number must be 10 digits';
      }

      // Basic US phone number validation (not starting with 0 or 1)
      if (digitsOnly.length === 10 && (digitsOnly[0] === '0' || digitsOnly[0] === '1')) {
        return 'Invalid US phone number format';
      }

      return true;
    },
  });

  const fieldValue = watch(name) || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract only digits for the form value
    const digitsOnly = e.target.value.replace(/\D/g, '');

    // Update the form with digits only, or empty string if no digits
    setValue(name, digitsOnly || '', { shouldValidate: true });
  };

  return (
    <PhoneInput
      id={name}
      name={name}
      value={fieldValue}
      onChange={handleChange}
      error={error?.message}
      label={label}
      placeholder={placeholder}
      required={required}
      className={className}
      labelClassName={labelClassName}
      requiredClassName={requiredClassName}
    />
  );
};

export default PhoneInputWithForm;
