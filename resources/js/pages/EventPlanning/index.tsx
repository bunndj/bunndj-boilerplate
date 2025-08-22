import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4 animate-slide-up">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center text-gray-300 hover:text-white mb-4 transition-all duration-200 group hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Events
          </button>
        </div>

        {/* Planning Forms */}
        {showPlanningForm ? (
          <div className="space-y-6">
            {/* Save Status Header */}
            <div className="bg-white rounded-lg shadow-lg p-4 hover-lift animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 animate-fade-in">
                    Event Planning
                  </h3>
                  <p className="text-sm text-gray-600 animate-slide-up animation-delay-100">
                    Plan your perfect wedding day with our comprehensive tools!
                  </p>
                </div>
                <div className="flex items-center">
                  {saveStatus === 'saving' && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm">Saving...</span>
                    </div>
                  )}
                  {saveStatus === 'success' && (
                    <div className="flex items-center text-green-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">Saved successfully!</span>
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="flex items-center text-red-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">Error saving. Please try again.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Planning Sections Form */}
            <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-100">
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📋</span>
                  <h3 className="text-lg font-semibold text-gray-900">Planning Sections</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Fill out the details to help us plan your perfect day!
                </p>
              </div>
              <PlanningForm
                onSave={handlePlanningFormSave}
                initialData={planningData?.planning_data || undefined}
              />
            </div>

            {/* Music Ideas Form */}
            <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-200">
              <div className="p-4 border-b border-gray-200 bg-purple-50">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎵</span>
                  <h3 className="text-lg font-semibold text-gray-900">Music Ideas</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Add your music preferences and special song requests!
                </p>
              </div>
              <MusicIdeasForm
                onSave={handleMusicIdeasSave}
                initialData={musicIdeasData?.music_ideas || undefined}
              />
            </div>

            {/* Timeline Form */}
            <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-300">
              <div className="p-4 border-b border-gray-200 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⏰</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Plan your wedding day timeline with activities and time slots!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-gray-500 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Auto-saving
                    </div>
                    <button
                      id="timeline-add-activity-btn"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Add Activity</span>
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
          <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px] hover-lift animate-scale-in animation-delay-200">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 animate-fade-in">
                Planning Assistant
              </h3>
              <p className="text-sm text-gray-600 animate-slide-up animation-delay-100">
                Let&apos;s plan your perfect wedding day!
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      message.isBot ? 'bg-gray-100 text-gray-900' : 'bg-brand text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
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
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
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
            <div className="border-t border-gray-200 p-4">
              {messages.length > 0 && messages[messages.length - 1].options && (
                <div className="flex flex-wrap gap-2">
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
                      className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 hover:scale-105 animate-glow"
                    >
                      {option === 'Upload Timeline' && <Upload className="w-4 h-4" />}
                      {option === 'Start Questions' && <FileText className="w-4 h-4" />}
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPlanning;
