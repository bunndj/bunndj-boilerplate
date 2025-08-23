import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Check, X, Plus, Edit } from 'lucide-react';
import {
  useEvent,
  useEventPlanning,
  useSaveEventPlanning,
  useEventMusicIdeas,
  useSaveEventMusicIdeas,
  useEventTimeline,
  useSaveEventTimeline,
} from '@/hooks';
import PlanningForm from './components/PlanningForm';
import MusicIdeasForm from './components/MusicIdeasForm';
import TimelineForm from './components/TimelineForm';
import EventModal from '@/components/EventModal';
import { PlanningFormData, MusicIdeasFormData, TimelineFormData } from '@/types';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: string[];
}

const EventPlanning: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = id ? parseInt(id, 10) : 0;

  // Helper function to extract time from ISO string without timezone conversion
  const extractTimeFromISO = (isoString: string | null | undefined) => {
    if (!isoString) return 'Not set';
    try {
      const timePart = isoString.split('T')[1]; // Get time part after 'T'
      if (!timePart) return 'Not set';
      const time = timePart.substring(0, 5); // Extract HH:MM

      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';

      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      console.warn('Error parsing time:', error);
      return 'Invalid time';
    }
  };

  // Helper function to extract date from ISO string
  const extractDateFromISO = (isoString: string | null | undefined) => {
    if (!isoString) return 'Not set';
    try {
      const datePart = isoString.split('T')[0]; // Get date part before 'T'
      const date = new Date(datePart + 'T00:00:00'); // Add time to avoid timezone issues
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Error parsing date:', error);
      return 'Invalid date';
    }
  };
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const {
    data: planningData,
    isLoading: planningLoading,
    error: planningError,
  } = useEventPlanning(eventId);
  const savePlanningMutation = useSaveEventPlanning();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<
    'initial' | 'planner-question' | 'timeline-upload' | 'questions' | 'planning-form'
  >('initial');
  const [isTyping, setIsTyping] = useState(false);
  const [showPlanningForm, setShowPlanningForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add music ideas hooks
  const {
    data: musicIdeasData,
    isLoading: musicIdeasLoading,
    error: musicIdeasError,
  } = useEventMusicIdeas(eventId);
  const saveMusicIdeasMutation = useSaveEventMusicIdeas();

  // Add timeline hooks
  const {
    data: timelineData,
    isLoading: timelineLoading,
    error: timelineError,
  } = useEventTimeline(eventId);
  const saveTimelineMutation = useSaveEventTimeline();

  const addBotMessage = useCallback((text: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text,
        isBot: true,
        timestamp: new Date(),
        options,
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (event && !planningLoading) {
      // Check if planning data exists
      const hasPlanningData = planningData?.planning_data;

      if (!hasPlanningData) {
        addBotMessage(
          'Hi, we are so glad you booked us for your wedding! Ready to start planning?',
          ['YES']
        );
      } else {
        // If planning data exists, show the form directly
        setShowPlanningForm(true);
      }
    }
  }, [event, planningData, planningLoading, addBotMessage]);

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);

    if (currentStep === 'initial' && option === 'YES') {
      setCurrentStep('planner-question');
      addBotMessage(
        "Great, let's do it! Have you hired a professional wedding planner to work with you?",
        ['YES', 'NO']
      );
    } else if (currentStep === 'planner-question') {
      if (option === 'YES') {
        setCurrentStep('timeline-upload');
        addBotMessage('Smart move. Have they given you a timeline yet? If so, upload it here', [
          'Upload Timeline',
        ]);
      } else if (option === 'NO') {
        setCurrentStep('planning-form');
        addBotMessage(
          "No worries! We'll help guide you through the planning process. Let's start with some questions to understand your vision.",
          ['Start Questions']
        );
      }
    } else if (currentStep === 'planning-form' && option === 'Start Questions') {
      // Create an empty planning record before showing the form
      handleCreateEmptyPlanningRecord();
    }
  };

  const handleTimelineUpload = () => {
    // TODO: Implement file upload functionality
    console.log('Timeline upload clicked');
  };

  const handleCreateEmptyPlanningRecord = async () => {
    try {
      // Create an empty planning record to indicate onboarding is complete
      const emptyData: Partial<PlanningFormData> = {};
      await savePlanningMutation.mutateAsync({ eventId, data: emptyData as PlanningFormData });
      setShowPlanningForm(true);
    } catch (error) {
      console.error('Error creating empty planning record:', error);
      // Still show the form even if the backend call fails
      setShowPlanningForm(true);
    }
  };

  const handlePlanningFormSave = async (data: PlanningFormData) => {
    try {
      setSaveStatus('saving');
      await savePlanningMutation.mutateAsync({ eventId, data });
      setSaveStatus('success');

      // Reset save status after showing success for a moment
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving planning data:', error);

      // Reset error status after showing error for a moment
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleMusicIdeasSave = async (data: MusicIdeasFormData) => {
    try {
      setSaveStatus('saving');
      await saveMusicIdeasMutation.mutateAsync({ eventId, data });
      setSaveStatus('success');

      // Reset save status after showing success for a moment
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving music ideas:', error);

      // Reset error status after showing error for a moment
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleTimelineSave = async (data: TimelineFormData) => {
    try {
      setSaveStatus('saving');
      await saveTimelineMutation.mutateAsync({ eventId, data });
      setSaveStatus('success');

      // Reset save status after showing success for a moment
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving timeline:', error);

      // Reset error status after showing error for a moment
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const isLoading = eventLoading || planningLoading || musicIdeasLoading || timelineLoading;
  const error = eventError || planningError || musicIdeasError || timelineError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-300">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Event Not Found</h3>
          <p className="text-gray-300 mb-4">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="bg-brand hover:bg-brand-dark text-secondary font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 animate-slide-up">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center text-gray-300 hover:text-white mb-4 transition-all duration-200 group hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm sm:text-base">Back to Events</span>
          </button>
        </div>

        {/* Event Details Header */}
        {event && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 hover-lift animate-scale-in">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {event.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Date:</span>
                    <span className="text-gray-800">{extractDateFromISO(event.event_date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Setup:</span>
                    <span className="text-gray-800">{extractTimeFromISO(event.setup_time)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Event:</span>
                    <span className="text-gray-800">
                      {extractTimeFromISO(event.start_time)} - {extractTimeFromISO(event.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Venue:</span>
                    <span className="text-gray-800">{event.venue_name || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Guests:</span>
                    <span className="text-gray-800">{event.guest_count || 'TBD'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Package:</span>
                    <span className="text-gray-800">{event.service_package || 'Not selected'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Client:</span>
                    <span className="text-gray-800">
                      {event.client_firstname} {event.client_lastname}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Contact:</span>
                    <span className="text-gray-800">
                      {event.client_email || event.client_cell_phone || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Event</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Planning Forms */}
        {showPlanningForm ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Save Status Header */}
            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 hover-lift animate-scale-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 animate-fade-in">
                    Event Planning
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 animate-slide-up animation-delay-100">
                    Plan your perfect wedding day with our comprehensive tools!
                  </p>
                </div>
                <div className="flex items-center justify-start sm:justify-end">
                  {saveStatus === 'saving' && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-xs sm:text-sm">Saving...</span>
                    </div>
                  )}
                  {saveStatus === 'success' && (
                    <div className="flex items-center text-green-600">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">Saved successfully!</span>
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="flex items-center text-red-600">
                      <X className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">Error saving. Please try again.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Planning Sections Form */}
            <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-100">
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-lg">📋</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Planning Sections
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Fill out the details to help us plan your perfect day!
                    </p>
                  </div>
                </div>
              </div>
              <PlanningForm
                onSave={handlePlanningFormSave}
                initialData={planningData?.planning_data || undefined}
              />
            </div>

            {/* Music Ideas Form */}
            <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-200">
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-purple-50">
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-lg">🎵</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Music Ideas
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Add your music preferences and special song requests!
                    </p>
                  </div>
                </div>
              </div>
              <MusicIdeasForm
                onSave={handleMusicIdeasSave}
                initialData={musicIdeasData?.music_ideas || undefined}
              />
            </div>

            {/* Timeline Form */}
            <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-300">
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-green-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg">⏰</span>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Timeline</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Plan your wedding day timeline with activities and time slots!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3">
                    <div className="text-xs text-gray-500 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Auto-saving
                    </div>
                    <button
                      id="timeline-add-activity-btn"
                      className="px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Add Activity</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              </div>
              <TimelineForm
                onSave={handleTimelineSave}
                initialData={timelineData?.timeline_data || undefined}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg flex flex-col h-[500px] sm:h-[600px] hover-lift animate-scale-in animation-delay-200">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 animate-fade-in">
                Planning Assistant
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 animate-slide-up animation-delay-100">
                Let&apos;s plan your perfect wedding day!
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      message.isBot ? 'bg-gray-100 text-gray-900' : 'bg-brand text-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-slide-up">
                  <div className="bg-gray-100 text-gray-900 px-3 sm:px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Options/Actions Area */}
            <div className="border-t border-gray-200 p-3 sm:p-4">
              {messages.length > 0 && messages[messages.length - 1].options && (
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  {messages[messages.length - 1].options!.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (option === 'Upload Timeline') {
                          handleTimelineUpload();
                        } else {
                          handleOptionClick(option);
                        }
                      }}
                      className="bg-brand hover:bg-brand-dark text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 animate-glow text-sm"
                    >
                      {option === 'Upload Timeline' && <Upload className="w-3 h-3 sm:w-4 sm:h-4" />}
                      {option === 'Start Questions' && (
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Edit Modal */}
      <EventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEventUpdated={() => {
          setIsEditModalOpen(false);
        }}
        mode="update"
        event={event}
      />
    </div>
  );
};

export default EventPlanning;
