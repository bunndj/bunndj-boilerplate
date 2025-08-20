import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { CreateEventFormData } from '@/schemas/event';
import { PhoneInput, SelectState } from '@/components/Inputs';

interface ClientTabProps {
  register: UseFormRegister<CreateEventFormData>;
  watch: UseFormWatch<CreateEventFormData>;
  setValue: UseFormSetValue<CreateEventFormData>;
  errors: FieldErrors<CreateEventFormData>;
}

const ClientTab: React.FC<ClientTabProps> = ({ register, watch, setValue, errors }) => {
  return (
    <div className="space-y-6">
      {/* Name Section */}
      <div>
        <h3 className="text-lg font-semibold text-secondary mb-4">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">First Name *</label>
            <input
              type="text"
              {...register('client_firstname')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.client_firstname ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="John"
            />
            {errors.client_firstname && (
              <p className="text-red-600 text-sm mt-1">{errors.client_firstname.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Last Name *</label>
            <input
              type="text"
              {...register('client_lastname')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.client_lastname ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Smith"
            />
            {errors.client_lastname && (
              <p className="text-red-600 text-sm mt-1">{errors.client_lastname.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Organization</label>
            <input
              type="text"
              {...register('client_organization')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Company Name"
            />
            {errors.client_organization && (
              <p className="text-red-600 text-sm mt-1">{errors.client_organization.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div>
        <h4 className="text-md font-semibold text-secondary mb-4">Contact Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PhoneInput
            name="client_cell_phone"
            register={register}
            watch={watch}
            setValue={setValue}
            error={errors.client_cell_phone}
            label="Cell Phone"
            required={true}
          />
          <PhoneInput
            name="client_home_phone"
            register={register}
            watch={watch}
            setValue={setValue}
            error={errors.client_home_phone}
            label="Home Phone"
            required={false}
          />
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Email Address *</label>
            <input
              type="email"
              {...register('client_email')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.client_email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="john@example.com"
            />
            {errors.client_email && (
              <p className="text-red-600 text-sm mt-1">{errors.client_email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h4 className="text-md font-semibold text-secondary mb-4">Address</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Address *</label>
            <input
              type="text"
              {...register('client_address')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.client_address ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="123 Main Street"
            />
            {errors.client_address && (
              <p className="text-red-600 text-sm mt-1">{errors.client_address.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Address Line 2</label>
            <input
              type="text"
              {...register('client_address_line2')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Apt, Suite, etc."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">City *</label>
              <input
                type="text"
                {...register('client_city')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                  errors.client_city ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="City"
              />
              {errors.client_city && (
                <p className="text-red-600 text-sm mt-1">{errors.client_city.message}</p>
              )}
            </div>
            <SelectState
              name="client_state"
              register={register}
              error={errors.client_state}
              label="State"
              required={true}
            />
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Zip Code *</label>
              <input
                type="text"
                {...register('client_zipcode')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                  errors.client_zipcode ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="12345"
              />
              {errors.client_zipcode && (
                <p className="text-red-600 text-sm mt-1">{errors.client_zipcode.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Client Fields */}
      <div>
        <h4 className="text-md font-semibold text-secondary mb-4">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Partner&apos;s Name
            </label>
            <input
              type="text"
              {...register('partner_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Partner's Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Partner&apos;s Email
            </label>
            <input
              type="email"
              {...register('partner_email')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.partner_email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="partner@example.com"
            />
            {errors.partner_email && (
              <p className="text-red-600 text-sm mt-1">{errors.partner_email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">MOB/FOG</label>
            <input
              type="text"
              {...register('mob_fog')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Mother/Father of Bride/Groom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">MOB/FOG Email</label>
            <input
              type="email"
              {...register('mob_fog_email')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.mob_fog_email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="mobfog@example.com"
            />
            {errors.mob_fog_email && (
              <p className="text-red-600 text-sm mt-1">{errors.mob_fog_email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Other Point of Contact
            </label>
            <input
              type="text"
              {...register('other_contact')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Contact Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">POC Email/Phone</label>
            <input
              type="text"
              {...register('poc_email_phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="contact@example.com or (555) 123-4567"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary mb-2">Vibo Link</label>
            <input
              type="url"
              {...register('vibo_link')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.vibo_link ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://vibo.example.com"
            />
            {errors.vibo_link && (
              <p className="text-red-600 text-sm mt-1">{errors.vibo_link.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTab;
