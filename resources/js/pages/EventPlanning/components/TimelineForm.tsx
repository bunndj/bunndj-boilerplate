import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import type { TimelineFormData, TimelineItem } from '@/types';
import { DEFAULT_TIMELINE_SECTIONS } from '@/types';
import { useDebounce } from '@/hooks';

interface TimelineFormProps {
  onSave: (data: TimelineFormData) => void;
  initialData?: Partial<TimelineFormData>;
}

const TimelineForm: React.FC<TimelineFormProps> = ({ onSave, initialData = {} }) => {
  const [formData, setFormData] = useState<TimelineFormData>(() => {
    // Initialize with default sections if no initial data
    const defaultItems: TimelineItem[] = DEFAULT_TIMELINE_SECTIONS.map((section, index) => ({
      ...section,
      id: `default-${index}`,
      order: index,
    }));

    return {
      timeline_items: initialData.timeline_items || defaultItems,
    };
  });

  const [hasInitialized, setHasInitialized] = useState(false);

  // Create debounced save function (500ms delay)
  const debouncedSave = useDebounce((data: TimelineFormData) => {
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

  // Update form data when initialData changes (for AI-filled data)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // Auto-save on field changes (debounced) - save on every change
  const updateFormData = (newData: TimelineFormData) => {
    setFormData(newData);

    // Save on every change (debounced)
    debouncedSave(newData);
  };

  const addTimelineItem = useCallback(() => {
    const newItem: TimelineItem = {
      id: `custom-${Date.now()}`,
      name: 'New Activity',
      start_time: '',
      end_time: '',
      notes: '',
      time_offset: 0,
      order: formData.timeline_items.length,
    };

    const newData = {
      ...formData,
      timeline_items: [...formData.timeline_items, newItem],
    };
    setFormData(newData);

    // Save the new data (debounced)
    debouncedSave(newData);
  }, [formData, debouncedSave]);

  // Connect the header button to addTimelineItem function
  useEffect(() => {
    const button = document.getElementById('timeline-add-activity-btn');
    if (button) {
      const handleClick = () => addTimelineItem();
      button.addEventListener('click', handleClick);
      return () => button.removeEventListener('click', handleClick);
    }
  }, [addTimelineItem]);

  const removeTimelineItem = (id: string) => {
    const newData = {
      ...formData,
      timeline_items: formData.timeline_items.filter(item => item.id !== id),
    };
    updateFormData(newData);
  };

  const updateTimelineItem = (id: string, field: keyof TimelineItem, value: string | number) => {
    const newData = {
      ...formData,
      timeline_items: formData.timeline_items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    };
    updateFormData(newData);
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const items = [...formData.timeline_items];
    const currentIndex = items.findIndex(item => item.id === id);

    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < items.length - 1)
    ) {
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      [items[currentIndex], items[newIndex]] = [items[newIndex], items[currentIndex]];

      // Update order numbers
      items.forEach((item, index) => {
        item.order = index;
      });

      const newData = {
        ...formData,
        timeline_items: items,
      };
      updateFormData(newData);
    }
  };

  return (
    <div className="h-auto lg:h-[calc(100vh-300px)] min-h-[300px] lg:min-h-[600px] bg-white">
      {/* Timeline Table Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Desktop Table Layout */}
          <div className="hidden lg:block flex-1 overflow-hidden bg-white rounded-lg border border-gray-200">
            {/* Table Header - Fixed */}
            <div className="bg-blue-600 text-white sticky top-0 z-10">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm">
                <div className="col-span-1">Order</div>
                <div className="col-span-4">Name Of Activity</div>
                <div className="col-span-1">Start Time</div>
                <div className="col-span-1">End Time</div>
                <div className="col-span-3">Notes</div>
                <div className="col-span-1">Time Offset</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body - Scrollable */}
            <div
              className="overflow-y-auto h-full divide-y divide-gray-200"
              style={{ maxHeight: 'calc(100vh - 400px)' }}
            >
              {formData.timeline_items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">📅</div>
                  <p>No timeline activities yet</p>
                  <p className="text-sm mt-2">
                    Click &quot;Add Activity&quot; above to get started
                  </p>
                </div>
              ) : (
                formData.timeline_items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-24 gap-2 p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Order */}
                    <div className="col-span-1 flex items-center space-x-1">
                      <span className="text-gray-600 text-sm">{index + 1}</span>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveItem(item.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveItem(item.id, 'down')}
                          disabled={index === formData.timeline_items.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => updateTimelineItem(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Activity name"
                      />
                    </div>

                    {/* Start Time */}
                    <div className="col-span-3">
                      <input
                        type="time"
                        value={item.start_time || ''}
                        onChange={e => updateTimelineItem(item.id, 'start_time', e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* End Time */}
                    <div className="col-span-3">
                      <input
                        type="time"
                        value={item.end_time || ''}
                        onChange={e => updateTimelineItem(item.id, 'end_time', e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* Notes */}
                    <div className="col-span-8">
                      <textarea
                        value={item.notes || ''}
                        onChange={e => updateTimelineItem(item.id, 'notes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        placeholder="Notes..."
                      />
                    </div>

                    {/* Time Offset */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.time_offset || ''}
                        onChange={e =>
                          updateTimelineItem(item.id, 'time_offset', parseInt(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <button
                        onClick={() => removeTimelineItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete activity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden p-3">
            {formData.timeline_items.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-2">📅</div>
                <p>No timeline activities yet</p>
                <p className="text-sm mt-2">Click &quot;Add&quot; above to get started</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {formData.timeline_items.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => moveItem(item.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveItem(item.id, 'down')}
                            disabled={index === formData.timeline_items.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTimelineItem(item.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete activity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Activity Name */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Activity Name
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => updateTimelineItem(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Activity name"
                      />
                    </div>

                    {/* Time Row */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={item.start_time || ''}
                          onChange={e => updateTimelineItem(item.id, 'start_time', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={item.end_time || ''}
                          onChange={e => updateTimelineItem(item.id, 'end_time', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={item.notes || ''}
                        onChange={e => updateTimelineItem(item.id, 'notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        placeholder="Add notes about this activity..."
                      />
                    </div>

                    {/* Time Offset */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Time Offset (minutes)
                      </label>
                      <input
                        type="number"
                        value={item.time_offset || ''}
                        onChange={e =>
                          updateTimelineItem(item.id, 'time_offset', parseInt(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineForm;
