import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { CreateEventFormData } from '@/schemas/event';
import { PhoneInput, SelectState } from '@/components/Inputs';

interface VenueTabProps {
  register: UseFormRegister<CreateEventFormData>;
  watch: UseFormWatch<CreateEventFormData>;
  setValue: UseFormSetValue<CreateEventFormData>;
  errors: FieldErrors<CreateEventFormData>;
}

const VenueTab: React.FC<VenueTabProps> = ({ register, watch, setValue, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-secondary mb-4">Venue Information</h3>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Venue Name</label>
          <input
            type="text"
            {...register('venue_name')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.venue_name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Grand Ballroom"
          />
          {errors.venue_name && (
            <p className="text-red-600 text-sm mt-1">{errors.venue_name.message}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-secondary mb-2">Venue Address</label>
          <input
            type="text"
            {...register('venue_address')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.venue_address ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="123 Main Street"
          />
          {errors.venue_address && (
            <p className="text-red-600 text-sm mt-1">{errors.venue_address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">City</label>
            <input
              type="text"
              {...register('venue_city')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.venue_city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="City"
            />
            {errors.venue_city && (
              <p className="text-red-600 text-sm mt-1">{errors.venue_city.message}</p>
            )}
          </div>

          <SelectState
            name="venue_state"
            register={register}
            error={errors.venue_state}
            label="State"
            required={false}
          />

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Zip Code</label>
            <input
              type="text"
              {...register('venue_zipcode')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.venue_zipcode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="12345"
            />
            {errors.venue_zipcode && (
              <p className="text-red-600 text-sm mt-1">{errors.venue_zipcode.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <PhoneInput
            name="venue_phone"
            register={register}
            watch={watch}
            setValue={setValue}
            error={errors.venue_phone}
            label="Venue Phone"
            required={false}
          />

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Venue Email</label>
            <input
              type="email"
              {...register('venue_email')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.venue_email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="venue@example.com"
            />
            {errors.venue_email && (
              <p className="text-red-600 text-sm mt-1">{errors.venue_email.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueTab;
