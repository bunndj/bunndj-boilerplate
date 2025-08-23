import React, { useState, useEffect } from 'react';
import type { MusicIdeasFormData, Song } from '@/types';
import { MUSIC_CATEGORIES } from '@/types';
import { useDebounce } from '@/hooks';

// Import individual tab components for each music category
import MustPlayTab from './music-tabs/MustPlayTab';
import PlayIfPossibleTab from './music-tabs/PlayIfPossibleTab';
import DedicationTab from './music-tabs/DedicationTab';
import PlayOnlyIfRequestedTab from './music-tabs/PlayOnlyIfRequestedTab';
import DoNotPlayTab from './music-tabs/DoNotPlayTab';
import GuestRequestTab from './music-tabs/GuestRequestTab';

interface MusicIdeasFormProps {
  onSave: (data: MusicIdeasFormData) => void;
  initialData?: Partial<MusicIdeasFormData>;
}

const MusicIdeasForm: React.FC<MusicIdeasFormProps> = ({ onSave, initialData = {} }) => {
  const [activeTab, setActiveTab] = useState<keyof MusicIdeasFormData>('must_play');
  const [formData, setFormData] = useState<MusicIdeasFormData>({
    must_play: [],
    play_if_possible: [],
    dedication: [],
    play_only_if_requested: [],
    do_not_play: [],
    guest_request: [],
    ...initialData,
  });

  const [hasInitialized, setHasInitialized] = useState(false);

  // Create debounced save function (500ms delay)
  const debouncedSave = useDebounce((data: MusicIdeasFormData) => {
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
  const handleSongsChange = (category: keyof MusicIdeasFormData, songs: Song[]) => {
    const newFormData = {
      ...formData,
      [category]: songs,
    };
    setFormData(newFormData);

    // Use debounced save instead of immediate save
    debouncedSave(newFormData);
  };

  const getTabCompletion = (
    categoryId: keyof MusicIdeasFormData
  ): { filled: number; total: number; isOverLimit: boolean } => {
    const category = MUSIC_CATEGORIES.find(cat => cat.id === categoryId);
    const songs = formData[categoryId] || [];
    const songsCount = songs.length;

    // For completion, we consider any songs added as "progress"
    const filled = songsCount > 0 ? 1 : 0;
    const total = 1; // Each category is either "has songs" or "doesn't have songs"

    // Check if over limit
    const isOverLimit =
      category?.limit !== null && category?.limit !== undefined && songsCount > category.limit;

    return { filled, total, isOverLimit };
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'must_play':
        return (
          <MustPlayTab
            songs={formData.must_play}
            onChange={(songs: Song[]) => handleSongsChange('must_play', songs)}
          />
        );
      case 'play_if_possible':
        return (
          <PlayIfPossibleTab
            songs={formData.play_if_possible}
            onChange={(songs: Song[]) => handleSongsChange('play_if_possible', songs)}
          />
        );
      case 'dedication':
        return (
          <DedicationTab
            songs={formData.dedication}
            onChange={(songs: Song[]) => handleSongsChange('dedication', songs)}
          />
        );
      case 'play_only_if_requested':
        return (
          <PlayOnlyIfRequestedTab
            songs={formData.play_only_if_requested}
            onChange={(songs: Song[]) => handleSongsChange('play_only_if_requested', songs)}
          />
        );
      case 'do_not_play':
        return (
          <DoNotPlayTab
            songs={formData.do_not_play}
            onChange={(songs: Song[]) => handleSongsChange('do_not_play', songs)}
          />
        );
      case 'guest_request':
        return (
          <GuestRequestTab
            songs={formData.guest_request}
            onChange={(songs: Song[]) => handleSongsChange('guest_request', songs)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-300px)] min-h-[400px] lg:min-h-[600px] bg-white">
      {/* Mobile Tabs - Horizontal Scroll */}
      <div className="lg:hidden bg-gray-50 border-b border-gray-200 p-3 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {MUSIC_CATEGORIES.map(category => {
            const completion = getTabCompletion(category.id);
            const currentCount = formData[category.id]?.length || 0;

            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 whitespace-nowrap ${
                  activeTab === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-base">🎵</span>
                <span className="font-medium">{category.label}</span>
                <span
                  className={`text-xs px-1 rounded ${
                    completion.isOverLimit ? 'bg-red-100 text-red-700' : 'bg-white text-gray-500'
                  }`}
                >
                  {currentCount}
                  {category.limit && `/${category.limit}`}
                </span>
                {completion.filled > 0 && (
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                      completion.isOverLimit ? 'bg-red-500' : 'bg-green-500'
                    } text-white`}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar - Vertical Tabs */}
      <div className="hidden lg:block w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Music Categories</h3>
          <div className="text-xs text-gray-500 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Auto-saving
          </div>
        </div>
        <nav className="space-y-2">
          {MUSIC_CATEGORIES.map(category => {
            const completion = getTabCompletion(category.id);
            const currentCount = formData[category.id]?.length || 0;

            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors duration-200 ${
                  activeTab === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🎵</span>
                  <div>
                    <div className="font-medium text-sm">{category.label}</div>
                    <div className="text-xs text-gray-500">
                      {currentCount} songs
                      {category.limit && ` (max ${category.limit})`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {completion.isOverLimit && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                      completion.filled > 0
                        ? completion.isOverLimit
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {completion.filled > 0 ? '✓' : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 lg:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              {MUSIC_CATEGORIES.find(cat => cat.id === activeTab)?.label}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {MUSIC_CATEGORIES.find(cat => cat.id === activeTab)?.description}
            </p>
            {MUSIC_CATEGORIES.find(cat => cat.id === activeTab)?.limit && (
              <div className="text-sm text-gray-500">
                Limit: {MUSIC_CATEGORIES.find(cat => cat.id === activeTab)?.limit} songs
              </div>
            )}
            {/* Mobile Auto-save indicator */}
            <div className="lg:hidden mt-2 text-xs text-gray-500 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Auto-saving
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicIdeasForm;
