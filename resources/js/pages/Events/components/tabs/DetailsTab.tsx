import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CreateEventFormData } from '@/schemas';

interface DetailsTabProps {
  register: UseFormRegister<CreateEventFormData>;
  errors: FieldErrors<CreateEventFormData>;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      {/* Event Information */}
      <div>
        <h3 className="text-lg font-semibold text-secondary mb-4">Event Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Event Name *</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Smith Wedding"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Guest Count *</label>
            <input
              type="number"
              {...register('guest_count', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.guest_count ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="150"
              min="1"
            />
            {errors.guest_count && (
              <p className="text-red-600 text-sm mt-1">{errors.guest_count.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Event Date */}
      <div>
        <h4 className="text-md font-semibold text-secondary mb-4">Event Date</h4>
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Event Date *</label>
          <input
            type="date"
            {...register('event_date')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.event_date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.event_date && (
            <p className="text-red-600 text-sm mt-1">{errors.event_date.message}</p>
          )}
        </div>
      </div>

      {/* Event Times */}
      <div>
        <h4 className="text-md font-semibold text-secondary mb-4">Event Times</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Setup Time *</label>
            <input
              type="time"
              {...register('setup_time')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.setup_time ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.setup_time && (
              <p className="text-red-600 text-sm mt-1">{errors.setup_time.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Start Time *</label>
            <input
              type="time"
              {...register('start_time')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.start_time ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.start_time && (
              <p className="text-red-600 text-sm mt-1">{errors.start_time.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">End Time *</label>
            <input
              type="time"
              {...register('end_time')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.end_time ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.end_time && (
              <p className="text-red-600 text-sm mt-1">{errors.end_time.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Package */}
      <div>
        <h4 className="text-md font-semibold text-secondary mb-4">Service Package</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Service Package *
            </label>
            <input
              type="text"
              {...register('service_package')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.service_package ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Premium Wedding Package"
            />
            {errors.service_package && (
              <p className="text-red-600 text-sm mt-1">{errors.service_package.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Service Description
            </label>
            <textarea
              {...register('service_description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Describe the services you'll provide..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;
