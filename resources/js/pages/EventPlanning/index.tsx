import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
import { useEvent, useEventPlanning, useSaveEventPlanning } from '@/hooks';
import PlanningForm from './components/PlanningForm';
import { PlanningFormData } from '@/types';

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

  const isLoading = eventLoading || planningLoading;
  const error = eventError || planningError;

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

        {/* Planning Form */}
        {showPlanningForm ? (
          <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in">
            {/* Save Status Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 animate-fade-in">
                    Wedding Planning Form
                  </h3>
                  <p className="text-sm text-gray-600 animate-slide-up animation-delay-100">
                    Fill out the details to help us plan your perfect day!
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
            {/* Planning Form - Let it control its own height */}
            <PlanningForm
              onSave={handlePlanningFormSave}
              initialData={planningData?.planning_data || undefined}
            />
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
