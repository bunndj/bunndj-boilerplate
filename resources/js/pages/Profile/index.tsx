import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, useUpdateUserProfile, useNotification } from '@/hooks';
import { PhoneInput, SelectState, ZipCodeInput } from '@/components/Inputs';
import { profileSchema, type ProfileFormData, defaultProfileFormValues } from '@/schemas';

function Profile() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending: isLoading } = useUpdateUserProfile();
  const { addNotification } = useNotification();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileFormValues,
  });

  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      const formData: any = {
        name: user.name || '',
        organization: user.organization || '',
        website: user.website || '',
        cell_phone: user.cell_phone || '',
        home_phone: user.home_phone || '',
        work_phone: user.work_phone || '',
        address: user.address || '',
        address_line_2: user.address_line_2 || '',
        city: user.city || '',
        state: user.state || '',
        zipcode: user.zipcode || '',
      };

      // Only include calendar_link for DJs
      if (user.role === 'dj') {
        formData.calendar_link = user.calendar_link || '';
      }

      reset(formData);
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data, {
      onSuccess: response => {
        if (response.success) {
          addNotification({
            type: 'success',
            title: 'Profile updated successfully!',
            message: 'Your profile information has been saved.',
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Failed to update profile',
            message: response.message || 'Please check your information and try again.',
          });
        }
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || 'Failed to update profile. Please try again.';
        addNotification({
          type: 'error',
          title: 'Failed to update profile',
          message: message,
        });
      },
    });
  };

  return (
    <div className="bg-secondary">
      <main className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up">
            <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center text-secondary font-bold text-xl shadow-sm animate-float hover:animate-bounce-subtle">
                {user?.name
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase() || 'DJ'}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-secondary animate-fade-in">
                  My Profile
                </h1>
                <p className="text-gray-600 text-sm sm:text-base animate-slide-up animation-delay-100">
                  Manage your personal information and preferences
                </p>
              </div>
            </div>
          </div>

          {/* Account Information - Moved to top */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up animation-delay-200">
            <h2 className="text-lg sm:text-xl font-bold text-secondary mb-4 sm:mb-6 animate-slide-in-left">
              Account Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-4 bg-brand/10 rounded-lg hover-scale animate-scale-in animation-delay-300 group cursor-pointer">
                <div className="text-xl sm:text-2xl font-bold text-brand mb-2 group-hover:animate-bounce-subtle">
                  {user?.role ? user.role.toUpperCase() : 'N/A'}
                </div>
                <div className="text-gray-600 text-sm sm:text-base group-hover:text-brand transition-colors duration-300">
                  Account Type
                </div>
              </div>

              <div className="text-center p-4 bg-secondary/10 rounded-lg hover-scale animate-scale-in animation-delay-400 group cursor-pointer">
                <div className="text-xl sm:text-2xl font-bold text-secondary mb-2 group-hover:animate-bounce-subtle">
                  {user?.is_active ? 'Active' : 'Inactive'}
                </div>
                <div className="text-gray-600 text-sm sm:text-base group-hover:text-secondary transition-colors duration-300">
                  Account Status
                </div>
              </div>

              <div className="text-center p-4 bg-brand/10 rounded-lg sm:col-span-2 lg:col-span-1 hover-scale animate-scale-in animation-delay-500 group cursor-pointer">
                <div className="text-xl sm:text-2xl font-bold text-brand mb-2 group-hover:animate-bounce-subtle">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-gray-600 text-sm sm:text-base group-hover:text-brand transition-colors duration-300">
                  Member Since
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up animation-delay-300">
            <h2 className="text-lg sm:text-xl font-bold text-secondary mb-4 sm:mb-6 animate-slide-in-left">
              Personal Information
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>

                {/* Username (Read-only) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">Username</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-300">
                    {user?.username || 'Not provided'}
                  </div>
                </div>

                {/* Email Address (Read-only) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">Email Address</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-300">
                    {user?.email || 'Not provided'}
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">Organization</label>
                  <input
                    type="text"
                    {...register('organization')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="Enter your organization"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">Website</label>
                  <input
                    type="url"
                    {...register('website')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="Enter your website URL"
                  />
                </div>

                {/* Calendar Link - Only for DJs */}
                {user?.role === 'dj' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary">
                      Calendar Link
                    </label>
                    <input
                      type="url"
                      {...register('calendar_link')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                        errors.calendar_link ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your calendar booking link (e.g., Calendly, Acuity)"
                    />
                    {errors.calendar_link && (
                      <p className="text-red-500 text-sm">{errors.calendar_link.message}</p>
                    )}
                  </div>
                )}

                {/* Cell Phone */}
                <PhoneInput
                  name="cell_phone"
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  error={errors.cell_phone}
                  label="Cell Phone"
                  placeholder="Enter cell phone number"
                />

                {/* Home Phone */}
                <PhoneInput
                  name="home_phone"
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  error={errors.home_phone}
                  label="Home Phone"
                  placeholder="Enter home phone number"
                />

                {/* Work Phone */}
                <PhoneInput
                  name="work_phone"
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  error={errors.work_phone}
                  label="Work Phone"
                  placeholder="Enter work phone number"
                />


                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">Address</label>
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="Enter your address"
                  />
                </div>

                {/* Address Line 2 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">Address Line 2</label>
                  <input
                    type="text"
                    {...register('address_line_2')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">City</label>
                  <input
                    type="text"
                    {...register('city')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="Enter your city"
                  />
                </div>

                {/* State */}
                <SelectState
                  name="state"
                  register={register}
                  error={errors.state}
                  label="State"
                  placeholder="Select your state"
                />

                {/* Zip Code */}
                <ZipCodeInput
                  name="zipcode"
                  register={register}
                  error={errors.zipcode}
                  label="Zip Code"
                  required={false}
                />
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2 bg-brand hover:bg-brand-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-secondary font-medium rounded-lg transition-all duration-200 hover:scale-105 animate-glow"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up animation-delay-400">
            <h2 className="text-lg sm:text-xl font-bold text-secondary mb-4 sm:mb-6 animate-slide-in-left">
              Account Settings
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 space-y-2 sm:space-y-0">
                <div>
                  <h3 className="font-medium text-secondary">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive updates about your events and account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 space-y-2 sm:space-y-0">
                <div>
                  <h3 className="font-medium text-secondary">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">Get text messages for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={user?.sms_consent || false}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 space-y-2 sm:space-y-0">
                <div>
                  <h3 className="font-medium text-secondary">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-2 border border-brand text-brand rounded-lg hover:bg-brand hover:text-secondary transition-colors duration-200 w-full sm:w-auto">
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
