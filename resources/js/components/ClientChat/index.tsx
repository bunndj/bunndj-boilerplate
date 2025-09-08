import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: string[];
}

interface ClientChatProps {
  onTimelineUpload: () => void;
  onStartQuestions: () => void;
  onDocumentProcessed?: (parsedData: any) => void;
  onDocumentProcessingComplete?: () => void;
}

const ClientChat: React.FC<ClientChatProps> = ({ 
  onTimelineUpload, 
  onStartQuestions, 
  onDocumentProcessed: _onDocumentProcessed,
  onDocumentProcessingComplete
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<
    'initial' | 'planner-question' | 'timeline-upload' | 'questions' | 'planning-form'
  >('initial');
  const [isTyping, setIsTyping] = useState(false);

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
      // Call the callback to start questions
      onStartQuestions();
    }
  };

  const handleTimelineUpload = () => {
    onTimelineUpload();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDocumentProcessingComplete = () => {
    if (onDocumentProcessingComplete) {
      onDocumentProcessingComplete();
    } else {
      // Fallback: transition to planning form
      setCurrentStep('planning-form');
      addBotMessage(
        "Great! I've processed your timeline document and filled in the forms with the extracted information. You can now review and edit the planning details.",
        ['Review Forms']
      );
    }
  };


  // Initialize the chat with the first message
  React.useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(
        'Hi, we are so glad you booked us for your wedding! Ready to start planning?',
        ['YES']
      );
    }
  }, [messages.length, addBotMessage]);

  return (
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
                <span>{option}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientChat;
