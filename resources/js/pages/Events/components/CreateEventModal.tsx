import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema, type CreateEventFormData, defaultEventFormValues } from '@/schemas';
import { useCreateEvent, useNotification } from '@/hooks';
import { FIELD_TO_TAB_MAP, type CreateEventTab } from '@/types';

// Import tab components
import ClientTab from './tabs/ClientTab';
import DetailsTab from './tabs/DetailsTab';
import FinancialsTab from './tabs/FinancialsTab';
import VenueTab from './tabs/VenueTab';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<CreateEventTab>('client');
  const [addOns, setAddOns] = useState<
    Array<{ name: string; price: number; quantity: number; total_price: number }>
  >([]);

  const { mutate: createEvent, isPending } = useCreateEvent();
  const { addNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: defaultEventFormValues,
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
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Event created successfully!',
            message: `"${data.name}" has been added to your events.`,
          });
          onEventCreated();
          reset();
          setAddOns([]);
          setActiveTab('client');
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
    } catch (error) {
      console.error('Failed to create event:', error);
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
              <h2 className="text-lg sm:text-2xl font-bold text-secondary">Create New Event</h2>
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
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
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
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
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
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
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
                    {isPending ? 'Creating...' : 'Create Event'}
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
                  {isPending ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
