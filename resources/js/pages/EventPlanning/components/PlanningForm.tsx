import React, { useState, useEffect } from 'react';
import type { PlanningFormData, PlanningFormProps, PlanningTab } from '@/types';
import { defaultPlanningFormValues } from '@/schemas';
import { useDebounce } from '@/hooks';
import GeneralInformationTab from './tabs/GeneralInformationTab';
import CeremonyTab from './tabs/CeremonyTab';
import AddOnsTab from './tabs/AddOnsTab';
import CocktailHourTab from './tabs/CocktailHourTab';
import IntroductionsTab from './tabs/IntroductionsTab';
import ReceptionEventsTab from './tabs/ReceptionEventsTab';
import TheMusicTab from './tabs/TheMusicTab';

const PlanningForm: React.FC<PlanningFormProps> = ({ onSave, initialData = {} }) => {
  const [activeTab, setActiveTab] = useState<PlanningTab>('general');
  const [formData, setFormData] = useState<PlanningFormData>({
    ...defaultPlanningFormValues,
    ...initialData,
  });

  const [hasInitialized, setHasInitialized] = useState(false);

  // Create debounced save function (500ms delay)
  const debouncedSave = useDebounce((data: PlanningFormData) => {
    if (hasInitialized) {
      onSave(data);
    }
  }, 500);

  // Initialize form data and mark as initialized
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // Auto-save on field changes (debounced)
  const handleInputChange = (field: keyof PlanningFormData, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // Use debounced save instead of immediate save
    debouncedSave(newFormData);
  };

  const tabs = [
    { id: 'general' as PlanningTab, label: 'General Information', icon: '📋' },
    { id: 'ceremony' as PlanningTab, label: 'Ceremony', icon: '💒' },
    { id: 'addons' as PlanningTab, label: 'Add Ons', icon: '✨' },
    { id: 'cocktail' as PlanningTab, label: 'Cocktail Hour', icon: '🍸' },
    { id: 'introductions' as PlanningTab, label: 'Introductions & Dances', icon: '🎵' },
    { id: 'reception' as PlanningTab, label: 'Reception Events', icon: '🎉' },
    { id: 'music' as PlanningTab, label: 'The Music', icon: '🎶' },
  ];

  const getTabCompletion = (tabId: PlanningTab): { filled: number; total: number } => {
    const isFieldFilled = (value: any): boolean => {
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return value > 0;
      if (typeof value === 'boolean') return true; // Booleans are always considered filled
      return false;
    };

    switch (tabId) {
      case 'general': {
        const generalFields = [
          formData.mailingAddress,
          formData.guestCount,
          formData.coordinatorEmail,
          formData.photographerEmail,
          formData.videographerEmail,
        ];
        return {
          filled: generalFields.filter(isFieldFilled).length,
          total: generalFields.length,
        };
      }

      case 'ceremony': {
        const ceremonyFields = [
          formData.ceremonyStartTime,
          formData.ceremonyLocation,
          formData.officiantName,
          formData.guestArrivalMusic,
          formData.ceremonyNotes,
          formData.whoNeedsMic,
          formData.ceremonyDjNotes,
        ];
        return {
          filled: ceremonyFields.filter(isFieldFilled).length,
          total: ceremonyFields.length,
        };
      }

      case 'addons': {
        const addonFields = [
          formData.uplightingColor,
          formData.uplightingNotes,
          formData.photoBoothLocation,
          formData.logoDesign,
          formData.photoText,
          formData.photoColorScheme,
          formData.ledRingColor,
          formData.backdrop,
          formData.photoEmailLocation,
        ];
        return {
          filled: addonFields.filter(isFieldFilled).length,
          total: addonFields.length,
        };
      }

      case 'cocktail': {
        const cocktailFields = [
          formData.cocktailHourLocation,
          formData.cocktailMusic,
          formData.cocktailNotes,
        ];
        return {
          filled: cocktailFields.filter(isFieldFilled).length,
          total: cocktailFields.length,
        };
      }

      case 'introductions': {
        const introFields = [
          formData.introductionsTime,
          formData.parentsEntranceSong,
          formData.weddingPartyIntroSong,
          formData.coupleIntroSong,
          formData.weddingPartyIntroductions,
          formData.specialDances,
          formData.otherNotes,
        ];
        return {
          filled: introFields.filter(isFieldFilled).length,
          total: introFields.length,
        };
      }

      case 'reception': {
        const receptionFields = [
          formData.dinnerMusic,
          formData.dinnerStyle,
          formData.welcomeBy,
          formData.blessingBy,
          formData.toasts,
          formData.receptionNotes,
          formData.exitDescription,
          formData.otherComments,
        ];
        return {
          filled: receptionFields.filter(isFieldFilled).length,
          total: receptionFields.length,
        };
      }

      case 'music': {
        const musicFields = [
          formData.spotifyPlaylists,
          formData.lineDances,
          formData.takeRequests,
          formData.musicNotes,
        ];
        return {
          filled: musicFields.filter(isFieldFilled).length,
          total: musicFields.length,
        };
      }

      default:
        return { filled: 0, total: 0 };
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralInformationTab data={formData} onChange={handleInputChange} />;
      case 'ceremony':
        return <CeremonyTab data={formData} onChange={handleInputChange} />;
      case 'addons':
        return <AddOnsTab data={formData} onChange={handleInputChange} />;
      case 'cocktail':
        return <CocktailHourTab data={formData} onChange={handleInputChange} />;
      case 'introductions':
        return <IntroductionsTab data={formData} onChange={handleInputChange} />;
      case 'reception':
        return <ReceptionEventsTab data={formData} onChange={handleInputChange} />;
      case 'music':
        return <TheMusicTab data={formData} onChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-300px)] min-h-[600px] bg-white">
      {/* Left Sidebar - Tabs */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Planning Sections</h3>
          <div className="text-xs text-gray-500 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Auto-saving
          </div>
        </div>
        <nav className="space-y-2">
          {tabs.map(tab => {
            const completion = getTabCompletion(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium text-sm">{tab.label}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {completion.filled}/{completion.total}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">
              Please fill out the information below to help us plan your perfect event.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default PlanningForm;
