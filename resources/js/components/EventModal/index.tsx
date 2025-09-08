import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { createEventSchema, type CreateEventFormData, defaultEventFormValues } from '@/schemas';
import { useCreateEvent, useUpdateEvent, useNotification } from '@/hooks';
import { FIELD_TO_TAB_MAP, type CreateEventTab, type Event } from '@/types';

// Import tab components
import ClientTab from './tabs/ClientTab';
import DetailsTab from './tabs/DetailsTab';
import FinancialsTab from './tabs/FinancialsTab';
import VenueTab from './tabs/VenueTab';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
  onEventUpdated?: () => void;
  mode?: 'create' | 'update';
  event?: Event | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  onEventUpdated,
  mode = 'create',
  event = null,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<CreateEventTab>('client');
  const [addOns, setAddOns] = useState<
    Array<{ name: string; price: number; quantity: number; total_price: number }>
  >([]);

  const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent();
  const { addNotification } = useNotification();

  const isPending = isCreating || isUpdating;
  const isUpdateMode = mode === 'update' && event;

  // Prepare initial form values
  const getInitialValues = useCallback((): CreateEventFormData => {
    if (isUpdateMode) {
      // Helper function to extract date from ISO string (YYYY-MM-DD format)
      const extractDate = (isoString: string | null | undefined) => {
        if (!isoString) return '';
        try {
          return isoString.split('T')[0]; // Extract date part before 'T'
        } catch (error) {
          console.warn('Error parsing date:', error);
          return '';
        }
      };

      // Helper function to extract time from ISO string (HH:MM format)
      const extractTime = (isoString: string | null | undefined) => {
        if (!isoString) return '';
        try {
          const timePart = isoString.split('T')[1]; // Get time part after 'T'
          if (!timePart) return '';
          return timePart.substring(0, 5); // Extract HH:MM (first 5 characters)
        } catch (error) {
          console.warn('Error parsing time:', error);
          return '';
        }
      };

      // Convert event data to form format
      return {
        ...defaultEventFormValues,
        name: event.name || '',
        client_firstname: event.client_firstname || '',
        client_lastname: event.client_lastname || '',
        client_organization: event.client_organization || '',
        client_cell_phone: event.client_cell_phone || '',
        client_home_phone: event.client_home_phone || '',
        client_email: event.client_email || '',
        client_address: event.client_address || '',
        client_address_line2: event.client_address_line2 || '',
        client_city: event.client_city || '',
        client_state: event.client_state || '',
        client_zipcode: event.client_zipcode || '',
        event_date: extractDate(event.event_date),
        setup_time: extractTime(event.setup_time),
        start_time: extractTime(event.start_time),
        end_time: extractTime(event.end_time),
        service_package: event.service_package || '',
        service_description: event.service_description || '',
        guest_count: event.guest_count || undefined,
        package:
          typeof event.package === 'string'
            ? parseFloat(event.package) || 0
            : typeof event.package === 'number'
              ? event.package
              : 0,
        venue_name: event.venue_name || '',
        venue_address: event.venue_address || '',
        venue_city: event.venue_city || '',
        venue_state: event.venue_state || '',
        venue_zipcode: event.venue_zipcode || '',
        venue_phone: event.venue_phone || '',
        venue_email: event.venue_email || '',
        partner_name: event.partner_name || '',
        partner_email: event.partner_email || '',
        mob_fog: event.mob_fog || '',
        mob_fog_email: event.mob_fog_email || '',
        other_contact: event.other_contact || '',
        poc_email_phone: event.poc_email_phone || '',
        vibo_link: event.vibo_link || '',
        deposit_value:
          typeof event.deposit_value === 'string'
            ? parseFloat(event.deposit_value) || 0
            : typeof event.deposit_value === 'number'
              ? event.deposit_value
              : 0,
        add_ons: Array.isArray(event.add_ons)
          ? event.add_ons.map(addon => ({
              name: addon.name || '',
              price: typeof addon.price === 'number' ? addon.price : parseFloat(addon.price) || 0,
              quantity:
                typeof addon.quantity === 'number' ? addon.quantity : parseInt(addon.quantity) || 1,
              total_price:
                (typeof addon.price === 'number' ? addon.price : parseFloat(addon.price) || 0) *
                (typeof addon.quantity === 'number'
                  ? addon.quantity
                  : parseInt(addon.quantity) || 1),
            }))
          : [],
      };
    }
    return defaultEventFormValues;
  }, [isUpdateMode, event]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: getInitialValues(),
  });

  // Watch package and deposit for calculations
  const watchedPackagePrice = watch('package');
  const watchedDepositValue = watch('deposit_value');

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [isOpen]);

  // Reset form when event changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const initialValues = getInitialValues();
      reset(initialValues);

      // Set add-ons if in update mode
      if (isUpdateMode && event?.add_ons && Array.isArray(event.add_ons)) {
        const transformedAddOns = event.add_ons.map(addon => ({
          name: addon.name || '',
          price: typeof addon.price === 'number' ? addon.price : parseFloat(addon.price) || 0,
          quantity:
            typeof addon.quantity === 'number' ? addon.quantity : parseInt(addon.quantity) || 1,
          total_price:
            (typeof addon.price === 'number' ? addon.price : parseFloat(addon.price) || 0) *
            (typeof addon.quantity === 'number' ? addon.quantity : parseInt(addon.quantity) || 1),
        }));
        setAddOns(transformedAddOns);
      } else {
        setAddOns([]);
      }
    }
  }, [isOpen, mode, event?.id, reset, getInitialValues, isUpdateMode, event?.add_ons]);

  // Calculate totals when add-ons or package changes
  useEffect(() => {
    setValue('add_ons', addOns);
  }, [addOns, setValue]);

  const addAddOn = () => {
    setAddOns([...addOns, { name: '', price: 0, quantity: 1, total_price: 0 }]);
  };

  const updateAddOn = (index: number, field: keyof (typeof addOns)[0], value: string | number) => {
    const updated = [...addOns];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'price' || field === 'quantity') {
      updated[index].total_price = updated[index].price * updated[index].quantity;
    }

    setAddOns(updated);
  };

  const removeAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateEventFormData) => {
    try {
      if (isUpdateMode) {
        // Update event
        updateEvent(
          { id: event.id, data },
          {
            onSuccess: (response: any) => {
              // Check if email was changed and invitation was sent
              const emailChanged = response?.data?.email_changed;
              const invitation = response?.data?.invitation;
              
              let notificationMessage = `"${data.name}" has been updated.`;
              
              if (emailChanged && invitation) {
                notificationMessage += ' The invitation has been updated and sent to the new client email.';
              } else if (emailChanged) {
                notificationMessage += ' Client email has been updated.';
              }

              addNotification({
                type: 'success',
                title: 'Event updated successfully!',
                message: notificationMessage,
              });
              onEventUpdated?.();
              onClose();
            },
            onError: (error: any) => {
              addNotification({
                type: 'error',
                title: 'Failed to update event',
                message:
                  error.response?.data?.message || 'Please check your information and try again.',
              });
            },
          }
        );
      } else {
        // Create event
        createEvent(data, {
          onSuccess: () => {
            addNotification({
              type: 'success',
              title: 'Event created successfully!',
              message: `"${data.name}" has been added to your events.`,
            });
            onEventCreated?.();
            onClose();
          },
          onError: (error: any) => {
            addNotification({
              type: 'error',
              title: 'Failed to create event',
              message:
                error.response?.data?.message || 'Please check your information and try again.',
            });
          },
        });
      }
    } catch (error) {
      console.error(`Failed to ${isUpdateMode ? 'update' : 'create'} event:`, error);
    }
  };

  const onInvalidSubmit = (errors: any) => {
    // Define tab priority order (client → details → financials → venue)
    const tabPriority: CreateEventTab[] = ['client', 'details', 'financials', 'venue'];

    // Get all error tabs and find the highest priority tab with errors
    const errorFieldNames = Object.keys(errors);
    const errorTabs = errorFieldNames
      .map(fieldName => FIELD_TO_TAB_MAP[fieldName])
      .filter(tab => tab !== undefined);

    // Find the first tab in priority order that has errors
    for (const tab of tabPriority) {
      if (errorTabs.includes(tab)) {
        setActiveTab(tab);
        break;
      }
    }

    // Show notification about validation errors
    addNotification({
      type: 'error',
      title: 'Please fix validation errors',
      message: 'Some required fields are missing or contain invalid data. Please check all tabs.',
    });
  };

  // Function to check if a tab has errors
  const getTabHasErrors = (tabId: CreateEventTab): boolean => {
    const errorFieldNames = Object.keys(errors);
    return errorFieldNames.some(fieldName => FIELD_TO_TAB_MAP[fieldName] === tabId);
  };

  const handleClose = () => {
    if (isPending) return;

    // Reset form and state
    reset(defaultEventFormValues);
    setAddOns([]);
    setActiveTab('client');
    setIsAnimating(false);

    // Close modal
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      handleClose();
    }
  };

  const tabs = [
    { id: 'client', label: 'Client', icon: '👤' },
    { id: 'details', label: 'Details', icon: '📅' },
    { id: 'financials', label: 'Financials', icon: '💰' },
    { id: 'venue', label: 'Venue', icon: '📍' },
  ] as const;

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 transition-all duration-300 ease-in-out ${
        isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onMouseDown={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-t-3xl sm:rounded-xl shadow-2xl w-full sm:max-w-6xl sm:w-full h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out ${
          isAnimating
            ? 'translate-y-0 sm:scale-100 opacity-100'
            : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 relative bg-white">
          {/* Mobile handle bar */}
          <div className="sm:hidden absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full"></div>

          <div className="flex justify-between items-center mt-2 sm:mt-0">
            <div className="flex-1">
              <h2 className="text-lg sm:text-2xl font-bold text-secondary">
                {isUpdateMode ? 'Update Event' : 'Create New Event'}
              </h2>
              {/* Mobile progress indicator */}
              <div className="sm:hidden mt-2">
                <div className="text-xs text-gray-500">
                  Step {tabs.findIndex(tab => tab.id === activeTab) + 1} of {tabs.length}
                </div>
                <div className="mt-1 flex space-x-1">
                  {tabs.map((tab, index) => (
                    <div
                      key={tab.id}
                      className={`h-1 flex-1 rounded-full ${
                        index <= tabs.findIndex(t => t.id === activeTab)
                          ? 'bg-brand'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isPending}
              className={`p-2 rounded-full transition-colors ml-4 ${
                isPending
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Tabs - Hidden on mobile, shown on desktop */}
          <div className="hidden sm:flex space-x-1 mt-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors relative flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-brand text-secondary'
                    : 'text-gray-300 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {getTabHasErrors(tab.id) && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full z-10 border border-white"></span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile tab title and navigation */}
          <div className="sm:hidden mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{tabs.find(tab => tab.id === activeTab)?.icon}</span>
                <h3 className="text-lg font-semibold text-secondary">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                {getTabHasErrors(activeTab) && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>

              {/* Mobile tab selector */}
              <div className="flex items-center space-x-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative p-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-brand text-secondary'
                        : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {getTabHasErrors(tab.id) && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto overscroll-contain bg-gray-50 sm:bg-white">
            <div className="p-4 sm:p-6">
              {/* Client Tab */}
              {activeTab === 'client' && (
                <ClientTab register={register} watch={watch} setValue={setValue} errors={errors} />
              )}

              {/* Details Tab */}
              {activeTab === 'details' && <DetailsTab register={register} errors={errors} />}

              {/* Financials Tab */}
              {activeTab === 'financials' && (
                <FinancialsTab
                  register={register}
                  errors={errors}
                  addOns={addOns}
                  watchedPackagePrice={watchedPackagePrice}
                  watchedDepositValue={watchedDepositValue}
                  addAddOn={addAddOn}
                  updateAddOn={updateAddOn}
                  removeAddOn={removeAddOn}
                />
              )}

              {/* Venue Tab */}
              {activeTab === 'venue' && (
                <VenueTab register={register} watch={watch} setValue={setValue} errors={errors} />
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 bg-white flex-shrink-0">
            {/* Mobile Layout */}
            <div className="sm:hidden">
              {/* Navigation and Action Buttons */}
              <div className="p-4 space-y-3">
                {/* Top row - Navigation buttons */}
                <div className="flex justify-between items-center">
                  {activeTab !== 'client' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1].id);
                        }
                      }}
                      disabled={isPending}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {activeTab !== 'venue' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1].id);
                        }
                      }}
                      disabled={isPending}
                      className="flex items-center space-x-2 px-4 py-2 bg-brand hover:bg-brand-dark text-secondary rounded-lg transition-colors duration-200 font-medium"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div></div>
                  )}
                </div>

                {/* Bottom row - Primary action and cancel */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="flex-1 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-3 bg-brand hover:bg-brand-dark disabled:bg-gray-400 text-secondary font-semibold rounded-lg transition-colors duration-200"
                  >
                    {isPending
                      ? isUpdateMode
                        ? 'Updating...'
                        : 'Creating...'
                      : isUpdateMode
                        ? 'Update Event'
                        : 'Create Event'}
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex justify-between items-center p-6">
              {/* Navigation buttons */}
              <div className="flex space-x-2">
                {activeTab !== 'client' && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1].id);
                      }
                    }}
                    disabled={isPending}
                    className="px-4 py-2 text-gray-300 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Previous
                  </button>
                )}
                {activeTab !== 'venue' && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1].id);
                      }
                    }}
                    disabled={isPending}
                    className="px-4 py-2 bg-brand hover:bg-brand-dark text-secondary rounded-lg transition-colors duration-200"
                  >
                    Next
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isPending
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 bg-brand hover:bg-brand-dark disabled:bg-gray-400 text-secondary font-semibold rounded-lg transition-colors duration-200"
                >
                  {isPending
                    ? isUpdateMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isUpdateMode
                      ? 'Update Event'
                      : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
