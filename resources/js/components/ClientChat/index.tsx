import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Send, Upload, Calendar } from 'lucide-react';
import apiClient from '../../services/api-client';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: string[];
}

interface ChatProgress {
  id: number;
  event_id: number;
  user_id: number;
  current_step: number;
  answers: Record<number, string>;
  chat_messages: ChatMessage[];
  is_completed: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

interface CurrentStepData {
  question: string;
  options?: string[];
  input_type: 'text' | 'options' | 'upload' | 'date' | 'time' | 'link';
  next_step?: number;
}

interface ClientChatProps {
  eventId: number;
  onTimelineUpload?: () => void;
  onStartQuestions?: () => void;
  onDocumentProcessed?: (data: any) => void;
  onDocumentProcessingComplete?: (data?: any) => void;
}

const ClientChat: React.FC<ClientChatProps> = ({
  eventId,
  onTimelineUpload,
  onStartQuestions,
  onDocumentProcessed: _onDocumentProcessed,
  onDocumentProcessingComplete,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentStepData, setCurrentStepData] = useState<CurrentStepData | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatProgress, setChatProgress] = useState<ChatProgress | null>(null);
  const [djCalendarLink, setDjCalendarLink] = useState<string | null>(null);

  // Ref for chat container to enable auto-scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  const addBotMessage = useCallback(
    (text: string, options?: string[]) => {
      setIsTyping(true);
      setTimeout(() => {
        let messageText = text;

        // Add calendar link to step 99 messages
        if (
          text.includes('This was fun! I think we have all of the info we need') &&
          djCalendarLink
        ) {
          messageText += `<br /> <a href="${djCalendarLink}" target="_blank">${djCalendarLink}</a>`;
        }

        const newMessage: ChatMessage = {
          id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: messageText,
          isBot: true,
          timestamp: new Date(),
          options,
        };
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(
            msg =>
              msg.id === newMessage.id ||
              (msg.text === newMessage.text &&
                msg.isBot === newMessage.isBot &&
                Math.abs(msg.timestamp.getTime() - newMessage.timestamp.getTime()) < 1000)
          );

          if (exists) {
            return prev; // Don't add duplicate
          }
          return [...prev, newMessage];
        });
        setIsTyping(false);
        // Scroll to bottom after message is added
        setTimeout(scrollToBottom, 100);
      }, 1000);
    },
    [djCalendarLink, scrollToBottom]
  );

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const exists = prev.some(
        msg =>
          msg.id === newMessage.id ||
          (msg.text === newMessage.text &&
            msg.isBot === newMessage.isBot &&
            Math.abs(msg.timestamp.getTime() - newMessage.timestamp.getTime()) < 1000)
      );

      if (exists) {
        return prev; // Don't add duplicate
      }
      return [...prev, newMessage];
    });
    // Scroll to bottom after message is added
    setTimeout(scrollToBottom, 100);
  };

  const loadChatProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/client/events/${eventId}/chat-progress`);
      const data = response.data;

      setChatProgress(data.chat_progress);
      setCurrentStep(data.chat_progress.current_step);
      setCurrentStepData(data.current_step_data);
      setIsCompleted(data.is_completed);
      setDjCalendarLink(data.dj_calendar_link);

      // Load chat messages
      if (data.chat_progress.chat_messages && data.chat_progress.chat_messages.length > 0) {
        const formattedMessages = data.chat_progress.chat_messages.map((msg: any) => {
          let messageText = msg.text;

          // Add calendar link to step 99 bot messages
          if (
            msg.is_bot &&
            messageText.includes('This was fun! I think we have all of the info we need') &&
            data.dj_calendar_link
          ) {
            messageText += ` <a href="${data.dj_calendar_link}" target="_blank">${data.dj_calendar_link}</a>`;
          }

          return {
            ...msg,
            text: messageText,
            isBot: msg.is_bot, // Convert is_bot to isBot
            timestamp: new Date(msg.timestamp),
          };
        });

        // Remove duplicates based on ID and text content
        const uniqueMessages = formattedMessages.filter(
          (msg: ChatMessage, index: number, self: ChatMessage[]) =>
            index === self.findIndex((m: ChatMessage) => m.id === msg.id && m.text === msg.text)
        );

        setMessages(uniqueMessages);
        // Scroll to bottom after loading messages
        setTimeout(scrollToBottom, 100);
      } else {
        // Initialize with first message if no messages exist
        const firstStepData = data.current_step_data;
        if (firstStepData) {
          addBotMessage(firstStepData.question, firstStepData.options);
        }
      }
    } catch (error) {
      console.error('Error loading chat progress:', error);
      // Initialize with first message if no progress exists
      setCurrentStep(1);
      setCurrentStepData({
        question:
          'Welcome to our planning app! A couple of quick questions to make sure we have the right show',
        options: ['OK', 'Hello'],
        input_type: 'options',
        next_step: 2,
      });
      addBotMessage(
        'Welcome to our planning app! A couple of quick questions to make sure we have the right show',
        ['OK', 'Hello']
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventId, addBotMessage]);

  const saveAnswer = async (answer: string) => {
    try {
      console.log('🔵 [CHAT-SAVE] Saving answer to backend');
      console.log('🔵 [CHAT-SAVE] Answer details:', {
        eventId: eventId,
        currentStep: currentStep,
        answer: answer,
        answerLength: answer.length,
      });

      const response = await apiClient.post(`/client/events/${eventId}/chat-progress`, {
        step: currentStep,
        answer: answer,
      });

      console.log('🟢 [CHAT-SAVE] Backend response received:', {
        hasResponse: !!response.data,
        isCompleted: response.data?.is_completed,
        newStep: response.data?.chat_progress?.current_step,
        hasNextStepData: !!response.data?.next_step_data,
      });

      const data = response.data;

      setChatProgress(data.chat_progress);
      setCurrentStep(data.chat_progress.current_step);
      setCurrentStepData(data.next_step_data);
      setIsCompleted(data.is_completed);

      console.log('🔵 [CHAT-SAVE] Updated state:', {
        newCurrentStep: data.chat_progress.current_step,
        isCompleted: data.is_completed,
        hasNextStep: !!data.next_step_data,
      });

      // Add user message
      addUserMessage(answer);

      // Add bot response if not completed
      if (!data.is_completed && data.next_step_data) {
        console.log('🔵 [CHAT-SAVE] Adding bot response for next step');
        // Add bot message immediately without timeout
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          text: data.next_step_data.question,
          isBot: true,
          timestamp: new Date(),
          options: data.next_step_data.options,
        };
        setMessages(prev => [...prev, newMessage]);
      }

      // If completed, trigger form filling callback
      if (data.is_completed) {
        console.log('🟢 [CHAT-SAVE] Chat completed, triggering form filling');
        onDocumentProcessingComplete?.();
      }
    } catch (error) {
      console.error('🔴 [CHAT-SAVE] Error saving answer:', error);
      console.error('🔴 [CHAT-SAVE] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  const handleOptionClick = async (option: string) => {
    if (option === 'Upload Timeline') {
      // Save the answer first to progress the workflow
      await saveAnswer(option);
      // Then open the upload modal
      onTimelineUpload?.();
      return;
    }

    if (option === 'Calendar Link') {
      // Handle calendar link - you can implement this based on your calendar system
      window.open('https://calendly.com/your-dj-company', '_blank');
      return;
    }

    if (option === 'Done') {
      // Handle Done button - save answer and fill forms
      await saveAnswer(option);
      // The form filling will be triggered by the backend when is_completed is true
      return;
    }

    await saveAnswer(option);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    await saveAnswer(userInput.trim());
    setUserInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e);
    }
  };

  const handleFillForms = async () => {
    try {
      const response = await apiClient.post(`/client/events/${eventId}/chat-progress/fill-forms`);

      if (response.data.message) {
        // Show success message
        addBotMessage(
          '✅ Forms have been successfully filled with your chat data! You can now review and edit the forms.'
        );

        // Call the callback to notify parent component with the filled data
        onDocumentProcessingComplete?.(response.data);
      }
    } catch (error) {
      console.error('Error filling forms:', error);
      addBotMessage('❌ There was an error filling the forms. Please try again.');
    }
  };

  const renderInput = () => {
    if (!currentStepData || isCompleted) return null;

    const { input_type, options } = currentStepData;

    if (input_type === 'options' && options) {
      return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className="bg-brand hover:bg-brand-dark text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 animate-glow text-sm"
            >
              {option === 'Upload Timeline' && <Upload className="w-3 h-3 sm:w-4 sm:h-4" />}
              {option === 'Calendar Link' && <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span>{option}</span>
            </button>
          ))}
        </div>
      );
    }

    if (input_type === 'upload' && options) {
      return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className="bg-brand hover:bg-brand-dark text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 animate-glow text-sm"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{option}</span>
            </button>
          ))}
        </div>
      );
    }

    if (input_type === 'link' && options) {
      return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className="bg-brand hover:bg-brand-dark text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 animate-glow text-sm"
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{option}</span>
            </button>
          ))}
        </div>
      );
    }

    // Text input for other types
    return (
      <form onSubmit={handleTextSubmit} className="flex gap-2">
        <input
          type={input_type === 'date' ? 'date' : input_type === 'time' ? 'time' : 'text'}
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          autoFocus
        />
        <button
          type="submit"
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    );
  };

  // Initialize chat on mount
  useEffect(() => {
    loadChatProgress();
  }, [loadChatProgress]);

  // Scroll to bottom when messages change or typing indicator changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg flex flex-col h-[500px] sm:h-[600px]">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Wedding Planning Chat</h3>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-gray-500">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-[500px] sm:h-[600px] hover-lift animate-scale-in animation-delay-200">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-brand to-brand-dark text-white rounded-t-lg">
        <h3 className="text-lg font-semibold">Wedding Planning Chat</h3>
      </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-slide-up`}
          >
            <div
              className={`max-w-[80%] px-3 sm:px-4 py-2 rounded-lg ${
                message.isBot ? 'bg-gray-100 text-gray-900' : 'bg-brand text-white'
              }`}
            >
              <p
                className="text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: message.text }}
              />
              {message.timestamp && (
                <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
              )}
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

      {/* Input Area */}
      {!isCompleted && <div className="border-t border-gray-200 p-3 sm:p-4">{renderInput()}</div>}
    </div>
  );
};

export default ClientChat;
