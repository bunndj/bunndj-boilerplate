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
  onUploadCompleted?: (saveAnswerFn: (answer: string) => Promise<void>) => void;
}

const ClientChat: React.FC<ClientChatProps> = ({
  eventId,
  onTimelineUpload,
  onStartQuestions,
  onDocumentProcessed: _onDocumentProcessed,
  onDocumentProcessingComplete,
  onUploadCompleted,
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
  
  // Loading states for button protection
  const [isOptionLoading, setIsOptionLoading] = useState(false);
  const [isTextSubmitLoading, setIsTextSubmitLoading] = useState(false);
  const isProcessingRef = useRef(false);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

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
      const messageTimeout = setTimeout(() => {
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
        const scrollTimeout = setTimeout(scrollToBottom, 100);
        timeoutRefs.current.push(scrollTimeout);
      }, 1000);
      timeoutRefs.current.push(messageTimeout);
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
    const scrollTimeout = setTimeout(scrollToBottom, 100);
    timeoutRefs.current.push(scrollTimeout);
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
        const scrollTimeout = setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
        timeoutRefs.current.push(scrollTimeout);
      } else {
        // Initialize with first message if no messages exist
        const firstStepData = data.current_step_data;
        if (firstStepData) {
          // Add first message directly instead of using addBotMessage to avoid dependency loop
          setIsTyping(true);
          const messageTimeout = setTimeout(() => {
            const newMessage: ChatMessage = {
              id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              text: firstStepData.question,
              isBot: true,
              timestamp: new Date(),
              options: firstStepData.options,
            };
            setMessages([newMessage]);
            setIsTyping(false);
            const scrollTimeout = setTimeout(() => {
              if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
              }
            }, 100);
            timeoutRefs.current.push(scrollTimeout);
          }, 1000);
          timeoutRefs.current.push(messageTimeout);
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
      // Add first message directly to avoid dependency loop
      setIsTyping(true);
      const messageTimeout = setTimeout(() => {
        const newMessage: ChatMessage = {
          id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: 'Welcome to our planning app! A couple of quick questions to make sure we have the right show',
          isBot: true,
          timestamp: new Date(),
          options: ['OK', 'Hello'],
        };
        setMessages([newMessage]);
        setIsTyping(false);
        const scrollTimeout = setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
        timeoutRefs.current.push(scrollTimeout);
      }, 1000);
      timeoutRefs.current.push(messageTimeout);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const saveAnswer = useCallback(async (answer: string) => {
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
      
      // Update DJ calendar link if provided in response
      if (data.dj_calendar_link) {
        setDjCalendarLink(data.dj_calendar_link);
      }

      console.log('🔵 [CHAT-SAVE] Updated state:', {
        newCurrentStep: data.chat_progress.current_step,
        isCompleted: data.is_completed,
        hasNextStep: !!data.next_step_data,
      });

      // Add user message directly
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: answer,
        isBot: false,
        timestamp: new Date(),
      };
      setMessages(prev => {
        const exists = prev.some(
          msg =>
            msg.id === userMessage.id ||
            (msg.text === userMessage.text &&
              msg.isBot === userMessage.isBot &&
              Math.abs(msg.timestamp.getTime() - userMessage.timestamp.getTime()) < 1000)
        );
        if (exists) {
          return prev;
        }
        return [...prev, userMessage];
      });
      
      // Scroll to bottom after user message
      const userScrollTimeout = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      timeoutRefs.current.push(userScrollTimeout);

      // Add bot response if not completed
      if (!data.is_completed && data.next_step_data) {
        console.log('🔵 [CHAT-SAVE] Adding bot response for next step');
        setIsTyping(true);
        const botTimeout = setTimeout(() => {
          let messageText = data.next_step_data.question;

          // Add calendar link logic for step 99 messages
          if (
            messageText.includes('This was fun! I think we have all of the info we need') &&
            djCalendarLink
          ) {
            messageText += `<br /> <a href="${djCalendarLink}" target="_blank">${djCalendarLink}</a>`;
          }

          const botMessage: ChatMessage = {
            id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: messageText,
            isBot: true,
            timestamp: new Date(),
            options: data.next_step_data.options,
          };
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
          
          // Scroll to bottom after bot message
          const botScrollTimeout = setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
          }, 100);
          timeoutRefs.current.push(botScrollTimeout);
        }, 1000);
        timeoutRefs.current.push(botTimeout);
      }

      // If completed, trigger form filling callback
      if (data.is_completed) {
        console.log('🟢 [CHAT-SAVE] Chat completed, triggering form filling');
        onDocumentProcessingComplete?.();
      }
    } catch (error: any) {
      console.error('🔴 [CHAT-SAVE] Error saving answer:', error);
      console.error('🔴 [CHAT-SAVE] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }, [eventId, currentStep, djCalendarLink]);

  const handleOptionClick = async (option: string) => {
    // Protection against multiple clicks
    if (isOptionLoading || isProcessingRef.current) {
      console.log('Option click blocked - already processing');
      return;
    }

    console.log('Processing option click:', option);
    isProcessingRef.current = true;
    setIsOptionLoading(true);

    try {
      if (option === 'Upload Timeline') {
        // Open the upload modal WITHOUT saving the answer yet
        // The answer will be saved only after successful upload and processing
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
    } catch (error) {
      console.error('Error processing option click:', error);
    } finally {
      const resetTimeout = setTimeout(() => {
        console.log('Resetting option loading state');
        isProcessingRef.current = false;
        setIsOptionLoading(false);
      }, 500);
      timeoutRefs.current.push(resetTimeout);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    // Protection against multiple submits
    if (isTextSubmitLoading || isProcessingRef.current) {
      console.log('Text submit blocked - already processing');
      return;
    }

    console.log('Processing text submit:', userInput.trim());
    setIsTextSubmitLoading(true);

    try {
      await saveAnswer(userInput.trim());
      setUserInput('');
    } catch (error) {
      console.error('Error processing text submit:', error);
    } finally {
      const resetTimeout = setTimeout(() => {
        console.log('Resetting text submit loading state');
        setIsTextSubmitLoading(false);
      }, 500);
      timeoutRefs.current.push(resetTimeout);
    }
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

  // Expose saveAnswer function to parent component
  useEffect(() => {
    if (onUploadCompleted) {
      onUploadCompleted(saveAnswer);
    }
  }, [onUploadCompleted, saveAnswer]);

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
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                if (isOptionLoading || isProcessingRef.current) {
                  return;
                }
                handleOptionClick(option);
              }}
              disabled={isOptionLoading || isProcessingRef.current}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base min-h-[44px] break-words ${
                (isOptionLoading || isProcessingRef.current)
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-brand hover:bg-brand-dark text-white hover:scale-105 animate-glow'
              }`}
            >
              {(isOptionLoading || isProcessingRef.current) ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {option === 'Upload Timeline' && <Upload className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {option === 'Calendar Link' && <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span>{option}</span>
                </>
              )}
            </button>
          ))}
        </div>
      );
    }

    if (input_type === 'upload' && options) {
      return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                if (isOptionLoading || isProcessingRef.current) {
                  return;
                }
                handleOptionClick(option);
              }}
              disabled={isOptionLoading || isProcessingRef.current}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base min-h-[44px] break-words ${
                (isOptionLoading || isProcessingRef.current)
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-brand hover:bg-brand-dark text-white hover:scale-105 animate-glow'
              }`}
            >
              {(isOptionLoading || isProcessingRef.current) ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{option}</span>
                </>
              )}
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
              onClick={() => {
                if (isOptionLoading || isProcessingRef.current) {
                  return;
                }
                handleOptionClick(option);
              }}
              disabled={isOptionLoading || isProcessingRef.current}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                (isOptionLoading || isProcessingRef.current)
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-brand hover:bg-brand-dark text-white hover:scale-105 animate-glow'
              }`}
            >
              {(isOptionLoading || isProcessingRef.current) ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{option}</span>
                </>
              )}
            </button>
          ))}
        </div>
      );
    }

    // Text input for other types
    return (
      <form onSubmit={handleTextSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type={input_type === 'date' ? 'date' : input_type === 'time' ? 'time' : 'text'}
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer..."
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent min-h-[44px]"
          autoFocus
        />
        <button
          type="submit"
          disabled={isTextSubmitLoading || isProcessingRef.current}
          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base min-h-[44px] min-w-[44px] ${
            (isTextSubmitLoading || isProcessingRef.current)
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-brand hover:bg-brand-dark text-white hover:scale-105'
          }`}
        >
          {(isTextSubmitLoading || isProcessingRef.current) ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    );
  };

  // Initialize chat on mount
  useEffect(() => {
    if (eventId) {
    loadChatProgress();
    }
  }, [eventId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
    };
  }, []);

  // Scroll to bottom when messages change or typing indicator changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
    scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
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
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-[400px] sm:h-[500px] md:h-[600px] hover-lift animate-scale-in animation-delay-200">
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
              className={`max-w-[85%] sm:max-w-[80%] px-2 sm:px-3 md:px-4 py-2 rounded-lg break-words ${
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
