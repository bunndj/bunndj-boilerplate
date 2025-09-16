import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Check, X, Plus, Edit, Send, Mail, CalendarX, ChevronDown, ChevronUp } from 'lucide-react';
import {
  useEvent,
  useEventPlanning,
  useSaveEventPlanning,
  useEventMusicIdeas,
  useSaveEventMusicIdeas,
  useEventTimeline,
  useSaveEventTimeline,
  useRole,
  useSendEventInvitation,
  useNotification,
} from '@/hooks';
import PlanningForm from './components/PlanningForm';
import MusicIdeasForm from './components/MusicIdeasForm';
import TimelineForm from './components/TimelineForm';
import EventModal from '@/components/EventModal';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import { PlanningFormData, MusicIdeasFormData, TimelineFormData } from '@/types';
import { AIFormFiller } from '@/utils/aiFormFiller';
import { documentService } from '@/services/document';

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
  const { isAdmin, isDj, isClient, canEditEvents, canUploadDocuments } = useRole();
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
  const [showPlanningForm, setShowPlanningForm] = useState(isAdmin || isDj);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDocumentUploadModalOpen, setIsDocumentUploadModalOpen] = useState(false);

  // State for notes input and parsing
  const [notes, setNotes] = useState('');
  const [isProcessingNotes, setIsProcessingNotes] = useState(false);

  // Invitation hooks and state
  const { mutate: sendInvitation, isPending: isSendingInvitation } = useSendEventInvitation();
  const { addNotification } = useNotification();

  // Accordion state management - timeline is open by default
  type AccordionSection = 'timeline' | 'planning' | 'music';
  const [openSection, setOpenSection] = useState<AccordionSection>('timeline');

  // State for AI-filled data
  const [aiFilledPlanningData, setAiFilledPlanningData] = useState<PlanningFormData | null>(null);
  const [aiFilledMusicData, setAiFilledMusicData] = useState<MusicIdeasFormData | null>(null);
  const [aiFilledTimelineData, setAiFilledTimelineData] = useState<TimelineFormData | null>(null);

  // State for chat button loading
  const [isChatButtonLoading, setIsChatButtonLoading] = useState(false);
  
  // Ref to prevent multiple rapid clicks (even faster than state updates)
  const isProcessingClickRef = useRef(false);
  
  // Additional loading states for other action buttons
  const [isInvitationLoading, setIsInvitationLoading] = useState(false);
  const [isEditModalLoading, setIsEditModalLoading] = useState(false);
  const [isUploadModalLoading, setIsUploadModalLoading] = useState(false);
  const [isParsingNotesLoading, setIsParsingNotesLoading] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);

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

  // Effect to check if data is already in correct format from chat workflow
  useEffect(() => {
    console.log('=== CHAT DATA CHECK ===');
    console.log('Planning data:', planningData);
    console.log('Music ideas data:', musicIdeasData);
    console.log('Timeline data:', timelineData);

    // Check if planning data exists and is in the correct format (already processed by backend)
    if (planningData?.planning_data && !Array.isArray(planningData.planning_data)) {
      console.log('Planning data already in form format, using directly');
      setAiFilledPlanningData(planningData.planning_data as PlanningFormData);
    }

    // Check if music data exists and is in the correct format
    if (musicIdeasData?.music_ideas && 
        typeof musicIdeasData.music_ideas === 'object' && 
        'must_play' in musicIdeasData.music_ideas) {
      console.log('Music data already in form format, using directly');
      setAiFilledMusicData(musicIdeasData.music_ideas as MusicIdeasFormData);
    }

    // Check if timeline data exists and is in the correct format
    if (timelineData?.timeline_data && 
        typeof timelineData.timeline_data === 'object' &&
        'timeline_items' in timelineData.timeline_data) {
      console.log('Timeline data already in form format, using directly');
      setAiFilledTimelineData(timelineData.timeline_data as TimelineFormData);
    }
    
    console.log('=== END CHAT DATA CHECK ===');
  }, [planningData, musicIdeasData, timelineData]);

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

      if (!hasPlanningData && isClient) {
        addBotMessage(
          'Hi, we are so glad you booked us for your wedding! Ready to start planning?',
          ['YES']
        );
      } else {
        // If planning data exists or user is admin/DJ, show the form directly
        setShowPlanningForm(true);
      }
    }
  }, [event, planningData, planningLoading, addBotMessage, isClient]);

  // Test the AIFormFiller when component mounts
  useEffect(() => {
    // Test field mapping functionality
    AIFormFiller.testFieldMapping();
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

  const handleOptionClick = async (option: string) => {
    console.log('Processing option click:', option);
    
    try {
      // Add user message
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
        await handleCreateEmptyPlanningRecord();
      }
    } catch (error) {
      console.error('Error handling option click:', error);
    } finally {
      // Add a small delay to prevent rapid clicking and ensure smooth UX
      setTimeout(() => {
        console.log('Resetting button loading state');
        isProcessingClickRef.current = false;
        setIsChatButtonLoading(false);
      }, 500);
    }
  };

  const handleTimelineUpload = () => {
    console.log('Opening timeline upload modal');
    setIsDocumentUploadModalOpen(true);
    
    // Reset loading state immediately since modal opening doesn't need extended loading
    setTimeout(() => {
      console.log('Resetting button loading state for timeline upload');
      isProcessingClickRef.current = false;
      setIsChatButtonLoading(false);
    }, 100);
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

  const handleDocumentProcessed = async (parsedData: any) => {
    try {
      console.log('=== DOCUMENT PROCESSING START ===');
      console.log('Parsed data received:', parsedData);
      console.log('Current planning data:', planningData);
      console.log('Current music data:', musicIdeasData);
      console.log('Current timeline data:', timelineData);

      // Create default data structures if they don't exist
      const defaultPlanningData: PlanningFormData = {
        mailingAddress: '',
        guestCount: 0,
        coordinatorEmail: '',
        photographerEmail: '',
        videographerEmail: '',
        isWedding: true,
        ceremonyCeremonyAudio: false,
        ceremonyStartTime: '',
        ceremonyLocation: '',
        officiantName: '',
        providingCeremonyMusic: false,
        guestArrivalMusic: '',
        ceremonyNotes: '',
        providingCeremonyMicrophones: false,
        whoNeedsMic: '',
        ceremonyDjNotes: '',
        uplighting: false,
        uplightingColor: '',
        uplightingNotes: '',
        photoBooth: false,
        photoBoothLocation: '',
        logoDesign: '',
        photoText: '',
        photoColorScheme: '',
        ledRingColor: '',
        backdrop: '',
        photoEmailLocation: '',
        cocktailHourMusic: false,
        cocktailHourLocation: '',
        cocktailMusic: '',
        cocktailNotes: '',
        introductionsTime: '',
        parentsEntranceSong: '',
        weddingPartyIntroSong: '',
        coupleIntroSong: '',
        weddingPartyIntroductions: '',
        specialDances: '',
        otherNotes: '',
        dinnerMusic: '',
        dinnerStyle: '',
        welcomeBy: '',
        blessingBy: '',
        toasts: '',
        receptionNotes: '',
        exitDescription: '',
        otherComments: '',
        spotifyPlaylists: '',
        lineDances: '',
        takeRequests: '',
        musicNotes: '',
      };

      const defaultMusicData: MusicIdeasFormData = {
        must_play: [],
        play_if_possible: [],
        dedication: [],
        play_only_if_requested: [],
        do_not_play: [],
        guest_request: [],
      };

      const defaultTimelineData: TimelineFormData = {
        timeline_items: [],
      };

      // Apply AI-extracted data to all forms
      console.log('Processing planning form...');
      const filledPlanningData = AIFormFiller.fillPlanningForm(
        planningData?.planning_data || defaultPlanningData,
        parsedData
      );

      console.log('Filled planning data:', filledPlanningData);

      // Set AI-filled data in state
      setAiFilledPlanningData(filledPlanningData);

      // Save to backend - this will trigger a re-fetch and update the UI
      await handlePlanningFormSave(filledPlanningData);

      console.log('Processing music ideas form...');
      const filledMusicData = AIFormFiller.fillMusicIdeasForm(
        musicIdeasData?.music_ideas || defaultMusicData,
        parsedData
      );

      console.log('Filled music data:', filledMusicData);

      // Set AI-filled data in state
      setAiFilledMusicData(filledMusicData);

      // Save to backend
      await handleMusicIdeasSave(filledMusicData);

      console.log('Processing timeline form...');
      const filledTimelineData = AIFormFiller.fillTimelineForm(
        timelineData?.timeline_data || defaultTimelineData,
        parsedData
      );

      console.log('Filled timeline data:', filledTimelineData);
      console.log('Timeline items count:', filledTimelineData.timeline_items?.length);
      console.log('Timeline items:', filledTimelineData.timeline_items);

      // Set AI-filled data in state
      setAiFilledTimelineData(filledTimelineData);

      // Save to backend
      await handleTimelineSave(filledTimelineData);

      // Forms will now update automatically with AI-filled data

      // Show success notification with field count
      const totalFields = Object.keys(parsedData.extracted_fields || {}).length;
      addBotMessage(
        `Great! I've analyzed your document and filled in ${totalFields} fields across your forms. The forms have been updated with the extracted information. Please review and edit as needed.`,
        ['Review Forms']
      );

      console.log('=== DOCUMENT PROCESSING COMPLETE ===');
    } catch (error) {
      console.error('Error applying AI-extracted data:', error);
      addBotMessage(
        'I found some information in your document, but there was an issue applying it to the forms. Please review manually.',
        ['Review Forms']
      );
    }
  };

  const handleNotesProcessed = async (notesText: string) => {
    try {
      console.log('=== NOTES PROCESSING START ===');
      console.log('Notes text received:', notesText);

      setIsProcessingNotes(true);

      // Parse notes using AI service (same as document parsing)
      console.log('Sending notes to AI service for parsing...');
      const parseResponse = await documentService.parseNotes(eventId!, notesText);

      if (!parseResponse.success) {
        throw new Error(parseResponse.message || 'Failed to parse notes');
      }

      console.log('AI parsing response:', parseResponse.data);

      // Create default data structures if they don't exist
      const defaultPlanningData: PlanningFormData = {
        mailingAddress: '',
        guestCount: 0,
        coordinatorEmail: '',
        photographerEmail: '',
        videographerEmail: '',
        isWedding: true,
        ceremonyCeremonyAudio: false,
        ceremonyStartTime: '',
        ceremonyLocation: '',
        officiantName: '',
        providingCeremonyMusic: false,
        guestArrivalMusic: '',
        ceremonyNotes: '',
        providingCeremonyMicrophones: false,
        whoNeedsMic: '',
        ceremonyDjNotes: '',
        uplighting: false,
        uplightingColor: '',
        uplightingNotes: '',
        photoBooth: false,
        photoBoothLocation: '',
        logoDesign: '',
        photoText: '',
        photoColorScheme: '',
        ledRingColor: '',
        backdrop: '',
        photoEmailLocation: '',
        cocktailHourMusic: false,
        cocktailHourLocation: '',
        cocktailMusic: '',
        cocktailNotes: '',
        introductionsTime: '',
        parentsEntranceSong: '',
        weddingPartyIntroSong: '',
        coupleIntroSong: '',
        weddingPartyIntroductions: '',
        specialDances: '',
        otherNotes: '',
        dinnerMusic: '',
        dinnerStyle: '',
        welcomeBy: '',
        blessingBy: '',
        toasts: '',
        receptionNotes: '',
        exitDescription: '',
        otherComments: '',
        spotifyPlaylists: '',
        lineDances: '',
        takeRequests: '',
        musicNotes: '',
      };

      const defaultMusicData: MusicIdeasFormData = {
        must_play: [],
        play_if_possible: [],
        dedication: [],
        play_only_if_requested: [],
        do_not_play: [],
        guest_request: [],
      };

      const defaultTimelineData: TimelineFormData = {
        timeline_items: [],
      };

      // Use the AI-parsed data (same structure as document parsing)
      const aiParsedData = parseResponse.data;

      // Apply AI-extracted data to all forms using the same logic as document processing
      console.log('Processing planning form from AI-parsed notes...');
      const filledPlanningData = AIFormFiller.fillPlanningForm(
        planningData?.planning_data || defaultPlanningData,
        aiParsedData,
        true // appendMode = true for notes parsing
      );

      console.log('Filled planning data from AI-parsed notes:', filledPlanningData);

      // Set AI-filled data in state
      console.log('Setting AI-filled planning data:', filledPlanningData);
      setAiFilledPlanningData(filledPlanningData);

      // Save to backend
      await handlePlanningFormSave(filledPlanningData);

      console.log('Processing music ideas form from AI-parsed notes...');
      const filledMusicData = AIFormFiller.fillMusicIdeasForm(
        musicIdeasData?.music_ideas || defaultMusicData,
        aiParsedData,
        true // appendMode = true for notes parsing
      );

      console.log('Filled music data from AI-parsed notes:', filledMusicData);

      // Set AI-filled data in state
      console.log('Setting AI-filled music data:', filledMusicData);
      setAiFilledMusicData(filledMusicData);

      // Save to backend
      await handleMusicIdeasSave(filledMusicData);

      console.log('Processing timeline form from AI-parsed notes...');
      const filledTimelineData = AIFormFiller.fillTimelineForm(
        timelineData?.timeline_data || defaultTimelineData,
        aiParsedData,
        true // appendMode = true for notes parsing
      );

      console.log('Filled timeline data from AI-parsed notes:', filledTimelineData);

      // Set AI-filled data in state
      console.log('Setting AI-filled timeline data:', filledTimelineData);
      setAiFilledTimelineData(filledTimelineData);

      // Save to backend
      await handleTimelineSave(filledTimelineData);

      // Clear the notes input
      setNotes('');

      // Show success notification
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);

      // Show AI processing notification
      addBotMessage(
        `Great! I've processed your notes and filled in the forms with relevant information. The forms have been updated with the extracted data. Please review and edit as needed.`,
        ['Review Forms']
      );

      console.log('=== NOTES PROCESSING COMPLETE ===');
    } catch (error) {
      console.error('Error processing notes:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsProcessingNotes(false);
    }
  };

  // Function to toggle accordion sections
  const toggleSection = (section: AccordionSection) => {
    setOpenSection(openSection === section ? openSection : section);
  };

  // Function to handle invitation sending
  const handleSendInvitation = useCallback(() => {
    if (isInvitationLoading) {
      console.log('Invitation send blocked - already processing');
      return;
    }

    if (!event?.client_email) {
      addNotification({
        type: 'error',
        title: 'Cannot send invitation',
        message: 'This event does not have a client email address.',
      });
      return;
    }

    setIsInvitationLoading(true);

    sendInvitation(eventId, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Invitation sent!',
          message: `Invitation has been sent to ${event.client_email}.`,
        });
        setIsInvitationLoading(false);
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Failed to send invitation',
          message: error.response?.data?.message || 'Please try again.',
        });
        setIsInvitationLoading(false);
      },
    });
  }, [eventId, event?.client_email, sendInvitation, addNotification, isInvitationLoading]);

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
    // Check if it's a past event error for DJs
    const isPastEventError = error && 
      (error as any)?.response?.data?.is_past_event === true;
    
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          {isPastEventError ? (
            <>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <CalendarX className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Event Unavailable</h3>
              <p className="text-gray-600 mb-4">
                This event has already passed and cannot be accessed for planning.
              </p>
            </>
          ) : (
            <>
          <h3 className="text-lg font-semibold text-white mb-2">Event Not Found</h3>
          <p className="text-gray-600 mb-4">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
            </>
          )}
          <button
            onClick={() => navigate(isAdmin ? '/admin/events' : '/events')}
            className="bg-brand hover:bg-brand-dark text-secondary font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 animate-slide-up">
          <button
            onClick={() => navigate(isAdmin ? '/admin/events' : '/events')}
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
                <h1 className="text-xl sm:text-2xl lg:text-2xl sm:text-3xl font-bold text-brand animate-fade-in">
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
              {canEditEvents && (
                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                  {/* Send Invitation Button */}
                  {event.client_email && (
                  <button
                      onClick={handleSendInvitation}
                      disabled={isSendingInvitation || isInvitationLoading}
                      className={`flex items-center space-x-2 px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
                        (isSendingInvitation || isInvitationLoading)
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-brand hover:bg-brand-dark text-secondary'
                      }`}
                      title={`Send invitation to ${event.client_email}`}
                    >
                      {(isSendingInvitation || isInvitationLoading) ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Invitation</span>
                        </>
                      )}
                    </button>
                  )}
                  {!event.client_email && (
                    <div 
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-500 font-medium rounded-lg"
                      title="Add client email to send invitation"
                    >
                      <Mail className="w-4 h-4" />
                      <span>No Email</span>
                    </div>
                  )}
                  
                  {/* Edit Event Button */}
                  <button
                    onClick={() => {
                      if (isEditModalLoading) {
                        console.log('Edit modal open blocked - already processing');
                        return;
                      }
                      setIsEditModalLoading(true);
                      setIsEditModalOpen(true);
                      setTimeout(() => setIsEditModalLoading(false), 300);
                    }}
                    disabled={isEditModalLoading}
                    className={`flex items-center space-x-2 px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
                      isEditModalLoading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isEditModalLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Opening...</span>
                      </>
                    ) : (
                      <>
                    <Edit className="w-4 h-4" />
                        <span>Edit Event</span>
                      </>
                    )}
                  </button>
                </div>
              )}
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
                <div className="flex items-center justify-start sm:justify-end space-x-3">
                  {/* Upload Document Button for DJ users */}
                  {canUploadDocuments && (
                    <button
                      onClick={() => {
                        if (isUploadModalLoading) {
                          console.log('Upload modal open blocked - already processing');
                          return;
                        }
                        setIsUploadModalLoading(true);
                        setIsDocumentUploadModalOpen(true);
                        setTimeout(() => setIsUploadModalLoading(false), 300);
                      }}
                      disabled={isUploadModalLoading}
                      className={`flex items-center space-x-2 px-3 py-2 font-medium rounded-lg transition-colors duration-200 text-sm sm:w-auto w-full ${
                        isUploadModalLoading
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isUploadModalLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Opening...</span>
                        </>
                      ) : (
                        <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Document</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Save Status Indicators */}
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

              {/* Notes Input Section for DJ users */}
              {canUploadDocuments && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">📝</span>
                      <h4 className="text-sm font-semibold text-gray-900">AI Notes Parser</h4>
                    </div>
                    <p className="text-xs text-gray-600">
                      Type your notes here and AI will automatically fill the forms with relevant
                      information.
                    </p>
                    <div className="flex gap-2 sm:flex-row flex-col">
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Enter your notes here... (e.g., 'Wedding is at 4 PM, bride wants to walk down to Canon in D, 150 guests expected, cocktail hour at 5 PM, dinner at 6 PM, first dance to Perfect by Ed Sheeran...')"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                        rows={3}
                        disabled={isProcessingNotes}
                      />
                      <button
                        onClick={() => {
                          if (isParsingNotesLoading || isProcessingNotes) {
                            console.log('Notes parsing blocked - already processing');
                            return;
                          }
                          setIsParsingNotesLoading(true);
                          handleNotesProcessed(notes);
                          setTimeout(() => setIsParsingNotesLoading(false), 1000);
                        }}
                        disabled={!notes.trim() || isProcessingNotes || isParsingNotesLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 text-sm flex items-center space-x-2"
                      >
                        {(isProcessingNotes || isParsingNotesLoading) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Parse</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* AI Processing Status */}
                    {(aiFilledPlanningData || aiFilledMusicData || aiFilledTimelineData) && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-700">
                          <span className="text-sm">✅</span>
                          <span className="text-xs font-medium">AI data applied to forms</span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          The forms below have been automatically filled with information from your
                          notes.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Forms */}
            
            {/* Timeline Form - First (opened by default) */}
            <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in">
              <div 
                className="p-3 sm:p-4 border-b border-gray-200 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors duration-200"
                onClick={() => toggleSection('timeline')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg">⏰</span>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Timeline</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:block hidden">
                        Plan your wedding day timeline with activities and time slots!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {openSection === 'timeline' && (
                      <div className="flex items-center justify-between sm:justify-end space-x-3">
                        <div className="text-xs text-gray-500 items-center sm:flex hidden">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          Auto-saving
                        </div>
                        <button
                          id="timeline-add-activity-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAddingActivity) {
                              console.log('Add activity blocked - already processing');
                              return;
                            }
                            setIsAddingActivity(true);
                            // Simulate adding activity action
                            setTimeout(() => {
                              console.log('Activity add completed');
                              setIsAddingActivity(false);
                            }, 800);
                          }}
                          disabled={isAddingActivity}
                          className={`px-3 py-2 sm:px-4 font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm ${
                            isAddingActivity
                              ? 'bg-gray-400 cursor-not-allowed text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isAddingActivity ? (
                            <>
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span className="hidden sm:inline">Adding...</span>
                              <span className="sm:hidden">Adding</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Add Activity</span>
                              <span className="sm:hidden">Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {openSection === 'timeline' ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
              {openSection === 'timeline' && (
                <div className="animate-scale-in">
                  <TimelineForm
                    onSave={handleTimelineSave}
                    initialData={aiFilledTimelineData || timelineData?.timeline_data || undefined}
                    key={`timeline-${aiFilledTimelineData ? 'ai-filled' : timelineData?.timeline_data ? 'loaded' : 'default'}`}
                  />
                  {/* Debug info */}
                  <div className="p-2 bg-gray-100 text-xs text-gray-600">
                    Debug: Timeline data available: {timelineData?.timeline_data ? 'Yes' : 'No'}
                    {aiFilledTimelineData && (
                      <div className="text-green-600">
                        AI-filled timeline data available:{' '}
                        {aiFilledTimelineData.timeline_items?.length || 0} items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Event Planning Form - Second */}
            <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-100">
              <div 
                className="p-3 sm:p-4 border-b border-gray-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                onClick={() => toggleSection('planning')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg">📋</span>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Event Planning
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:block hidden">
                        Fill out the details to help us plan your perfect day!
                      </p>
                    </div>
                  </div>
                  {openSection === 'planning' ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
              {openSection === 'planning' && (
                <div className="animate-scale-in">
              <PlanningForm
                onSave={handlePlanningFormSave}
                initialData={aiFilledPlanningData || planningData?.planning_data || undefined}
                key={`planning-${aiFilledPlanningData ? 'ai-filled' : planningData?.planning_data ? 'loaded' : 'default'}`}
              />
              {/* Debug info */}
              <div className="p-2 bg-gray-100 text-xs text-gray-600">
                Debug: Planning data available: {planningData?.planning_data ? 'Yes' : 'No'}
                {planningData?.planning_data && (
                  <div>
                    Fields:{' '}
                    {
                      Object.keys(planningData.planning_data).filter(
                        k => (planningData.planning_data as any)[k]
                      ).length
                    }{' '}
                    filled
                  </div>
                )}
                {aiFilledPlanningData && (
                  <div className="text-green-600">
                    AI-filled data available:{' '}
                    {
                      Object.keys(aiFilledPlanningData).filter(
                        k => (aiFilledPlanningData as any)[k]
                      ).length
                    }{' '}
                    fields
                  </div>
                )}
              </div>
                </div>
              )}
            </div>

            {/* Music Ideas Form - Third */}
            <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-200">
              <div 
                className="p-3 sm:p-4 border-b border-gray-200 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors duration-200"
                onClick={() => toggleSection('music')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg">🎵</span>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Music Ideas
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:block hidden">
                        Add your music preferences and special song requests!
                      </p>
                    </div>
                  </div>
                  {openSection === 'music' ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
              {openSection === 'music' && (
                <div className="animate-scale-in">
              <MusicIdeasForm
                onSave={handleMusicIdeasSave}
                initialData={aiFilledMusicData || musicIdeasData?.music_ideas || undefined}
                key={`music-${aiFilledMusicData ? 'ai-filled' : musicIdeasData?.music_ideas ? 'loaded' : 'default'}`}
              />
              {/* Debug info */}
              <div className="p-2 bg-gray-100 text-xs text-gray-600">
                Debug: Music data available: {musicIdeasData?.music_ideas ? 'Yes' : 'No'}
                {aiFilledMusicData && (
                  <div className="text-green-600">
                    AI-filled music data available:{' '}
                    {
                      Object.keys(aiFilledMusicData).filter(
                        k => (aiFilledMusicData as any)[k]?.length > 0
                      ).length
                    }{' '}
                    categories
                  </div>
                )}
              </div>
                  </div>
                )}
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
                        // Immediate protection - set loading states first
                        if (isChatButtonLoading || isProcessingClickRef.current) {
                          console.log('Click blocked by protection');
                          return;
                        }
                        
                        // Set protections immediately before any processing
                        isProcessingClickRef.current = true;
                        setIsChatButtonLoading(true);
                        
                        // Small delay to ensure state propagates, then process
                        setTimeout(() => {
                        if (option === 'Upload Timeline') {
                          handleTimelineUpload();
                        } else {
                          handleOptionClick(option);
                        }
                        }, 10);
                      }}
                      disabled={isChatButtonLoading || isProcessingClickRef.current}
                      className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                        (isChatButtonLoading || isProcessingClickRef.current)
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-brand hover:bg-brand-dark text-white hover:scale-105 animate-glow'
                      }`}
                    >
                      {(isChatButtonLoading || isProcessingClickRef.current) ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                      {option === 'Upload Timeline' && <Upload className="w-3 h-3 sm:w-4 sm:h-4" />}
                      {option === 'Start Questions' && (
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      <span>{option}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Edit Modal - Only for users who can edit events */}
      {canEditEvents && (
        <EventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEventUpdated={() => {
            setIsEditModalOpen(false);
          }}
          mode="update"
          event={event}
        />
      )}

      {/* Document Upload Modal - Only for users who can upload documents */}
      {canUploadDocuments && (
        <DocumentUploadModal
          isOpen={isDocumentUploadModalOpen}
          onClose={() => setIsDocumentUploadModalOpen(false)}
          eventId={eventId}
          onDocumentProcessed={handleDocumentProcessed}
        />
      )}
    </div>
  );
};

export default EventPlanning;
