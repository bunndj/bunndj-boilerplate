import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema, type CreateEventFormData } from '@/schemas/event';
import { useCreateEvent } from '@/hooks/useEvents';

// Import tab components
import ClientTab from './tabs/ClientTab';
import DetailsTab from './tabs/DetailsTab';
import FinancialsTab from './tabs/FinancialsTab';
import VenueTab from './tabs/VenueTab';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: any) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<'client' | 'details' | 'financials' | 'venue'>(
    'client'
  );
  const [addOns, setAddOns] = useState<
    Array<{ name: string; price: number; quantity: number; total_price: number }>
  >([]);

  const { mutate: createEvent, isPending } = useCreateEvent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      service_package: '',
      guest_count: 1,
      client_cell_phone: '',
      client_home_phone: '',
      venue_phone: '',
    },
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
      createEvent(data, {
        onSuccess: newEvent => {
          onEventCreated(newEvent);
          reset();
          setAddOns([]);
          setActiveTab('client');
        },
      });
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const onInvalidSubmit = (errors: any) => {
    // Define field to tab mapping
    const fieldToTabMap: Record<string, 'client' | 'details' | 'financials' | 'venue'> = {
      // Client tab fields
      client_firstname: 'client',
      client_lastname: 'client',
      client_cell_phone: 'client',
      client_email: 'client',
      client_organization: 'client',
      client_home_phone: 'client',
      client_address: 'client',
      client_address_line2: 'client',
      client_city: 'client',
      client_state: 'client',
      client_zipcode: 'client',
      partner_name: 'client',
      partner_email: 'client',
      mob_fog: 'client',
      mob_fog_email: 'client',
      other_contact: 'client',
      poc_email_phone: 'client',
      vibo_link: 'client',

      // Details tab fields
      name: 'details',
      event_date: 'details',
      setup_time: 'details',
      start_time: 'details',
      end_time: 'details',
      service_package: 'details',
      service_description: 'details',
      guest_count: 'details',

      // Financials tab fields
      package: 'financials',
      add_ons: 'financials',
      deposit_value: 'financials',

      // Venue tab fields
      venue_name: 'venue',
      venue_address: 'venue',
      venue_city: 'venue',
      venue_state: 'venue',
      venue_zipcode: 'venue',
      venue_phone: 'venue',
      venue_email: 'venue',
    };

    // Define tab priority order (client → details → financials → venue)
    const tabPriority: ('client' | 'details' | 'financials' | 'venue')[] = [
      'client',
      'details',
      'financials',
      'venue',
    ];

    // Get all error tabs and find the highest priority tab with errors
    const errorFieldNames = Object.keys(errors);
    const errorTabs = errorFieldNames
      .map(fieldName => fieldToTabMap[fieldName])
      .filter(tab => tab !== undefined);

    // Find the first tab in priority order that has errors
    for (const tab of tabPriority) {
      if (errorTabs.includes(tab)) {
        setActiveTab(tab);
        break;
      }
    }
  };

  // Function to check if a tab has errors
  const getTabHasErrors = (tabId: 'client' | 'details' | 'financials' | 'venue'): boolean => {
    const fieldToTabMap: Record<string, 'client' | 'details' | 'financials' | 'venue'> = {
      // Client tab fields
      client_firstname: 'client',
      client_lastname: 'client',
      client_cell_phone: 'client',
      client_email: 'client',
      client_organization: 'client',
      client_home_phone: 'client',
      client_address: 'client',
      client_address_line2: 'client',
      client_city: 'client',
      client_state: 'client',
      client_zipcode: 'client',
      partner_name: 'client',
      partner_email: 'client',
      mob_fog: 'client',
      mob_fog_email: 'client',
      other_contact: 'client',
      poc_email_phone: 'client',
      vibo_link: 'client',

      // Details tab fields
      name: 'details',
      event_date: 'details',
      setup_time: 'details',
      start_time: 'details',
      end_time: 'details',
      service_package: 'details',
      service_description: 'details',
      guest_count: 'details',

      // Financials tab fields
      package: 'financials',
      add_ons: 'financials',
      deposit_value: 'financials',

      // Venue tab fields
      venue_name: 'venue',
      venue_address: 'venue',
      venue_city: 'venue',
      venue_state: 'venue',
      venue_zipcode: 'venue',
      venue_phone: 'venue',
      venue_email: 'venue',
    };

    const errorFieldNames = Object.keys(errors);
    return errorFieldNames.some(fieldName => fieldToTabMap[fieldName] === tabId);
  };

  const handleClose = () => {
    if (isPending) return;
    reset();
    setAddOns([]);
    setActiveTab('client');
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
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-200 ease-in-out ${
        isAnimating ? 'bg-[#33333380] bg-opacity-80 backdrop-blur-sm' : 'bg-secondary bg-opacity-0'
      }`}
      onMouseDown={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden transform transition-all duration-200 ease-in-out ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-secondary">Create New Event</h2>
            <button
              onClick={handleClose}
              disabled={isPending}
              className={`transition-colors ${
                isPending ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors relative ${
                  activeTab === tab.id
                    ? 'bg-brand text-secondary'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {getTabHasErrors(tab.id) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="p-6 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
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

          {/* Form Actions */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0 mt-auto">
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
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
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
                {isPending ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
