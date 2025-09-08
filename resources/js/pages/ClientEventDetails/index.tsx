import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, Mail, MessageCircle, FileText, Music, Clock3, ArrowLeft, Upload, Check, X, Plus, Edit } from 'lucide-react';
import { useAuth } from '@/hooks';
import { eventService } from '@/services/event';
import { useClientEventPlanning, useSaveClientEventPlanning } from '@/hooks/useClientEventPlanning';
import { useClientEventMusicIdeas, useSaveClientEventMusicIdeas } from '@/hooks/useClientEventMusicIdeas';
import { useClientEventTimeline, useSaveClientEventTimeline } from '@/hooks/useClientEventTimeline';
import PlanningForm from '@/pages/EventPlanning/components/PlanningForm';
import MusicIdeasForm from '@/pages/EventPlanning/components/MusicIdeasForm';
import TimelineForm from '@/pages/EventPlanning/components/TimelineForm';
import ClientChat from '@/components/ClientChat';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import { PlanningFormData, MusicIdeasFormData, TimelineFormData } from '@/types';
import { AIFormFiller } from '@/utils/aiFormFiller';
import { documentService } from '@/services/document';

interface EventDetails {
  id: number;
  name: string;
  event_date: string;
  setup_time: string;
  start_time: string;
  end_time: string;
  service_package: string;
  service_description: string;
  guest_count: number;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_zipcode: string;
  venue_phone: string;
  venue_email: string;
  client_firstname: string;
  client_lastname: string;
  client_organization: string;
  client_cell_phone: string;
  client_home_phone: string;
  client_email: string;
  client_address: string;
  client_city: string;
  client_state: string;
  client_zipcode: string;
  partner_name: string;
  partner_email: string;
  package: number;
  add_ons: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  deposit_value: number;
  dj: {
    id: number;
    name: string;
    organization: string;
    email: string;
    cell_phone: string;
  };
  planning?: {
    id: number;
    completion_percentage: number;
  };
  music_ideas?: {
    id: number;
  };
  timeline?: {
    id: number;
  };
}

function ClientEventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const eventId = id ? parseInt(id, 10) : 0;

  // State for event data and loading
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for forms and chat
  const [showPlanningForm, setShowPlanningForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isDocumentUploadModalOpen, setIsDocumentUploadModalOpen] = useState(false);
  
  // State for AI-filled data
  const [aiFilledPlanningData, setAiFilledPlanningData] = useState<PlanningFormData | null>(null);
  const [aiFilledMusicData, setAiFilledMusicData] = useState<MusicIdeasFormData | null>(null);
  const [aiFilledTimelineData, setAiFilledTimelineData] = useState<TimelineFormData | null>(null);

  // Form data hooks
  const {
    data: planningData,
    isLoading: planningLoading,
    error: planningError,
  } = useClientEventPlanning(eventId);
  const savePlanningMutation = useSaveClientEventPlanning();

  const {
    data: musicIdeasData,
    isLoading: musicIdeasLoading,
    error: musicIdeasError,
  } = useClientEventMusicIdeas(eventId);
  const saveMusicIdeasMutation = useSaveClientEventMusicIdeas();

  const {
    data: timelineData,
    isLoading: timelineLoading,
    error: timelineError,
  } = useClientEventTimeline(eventId);
  const saveTimelineMutation = useSaveClientEventTimeline();

  // Check if there's any form data
  const hasFormData = planningData?.planning_data || musicIdeasData?.music_ideas || timelineData?.timeline_data;

  // Load event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        console.log('🔍 [ClientEventDetails] Fetching event data for ID:', eventId);
        setIsLoading(true);
        const eventData = await eventService.getClientEvent(eventId);
        console.log('✅ [ClientEventDetails] Event data received:', eventData);
        setEvent(eventData);
        
        // Check if there's any form data to determine what to show
        const hasPlanningData = eventData.planning && eventData.planning.id;
        const hasMusicIdeas = eventData.music_ideas && eventData.music_ideas.id;
        const hasTimeline = eventData.timeline && eventData.timeline.id;
        
        console.log('🔍 [ClientEventDetails] Form data check:', {
          hasPlanningData,
          hasMusicIdeas,
          hasTimeline,
          planning: eventData.planning,
          music_ideas: eventData.music_ideas,
          timeline: eventData.timeline
        });
        
        if (hasPlanningData || hasMusicIdeas || hasTimeline) {
          console.log('✅ [ClientEventDetails] Form data exists, showing forms');
          setShowPlanningForm(true);
        } else {
          console.log('✅ [ClientEventDetails] No form data, showing chat interface');
          setShowPlanningForm(false);
        }
      } catch (err) {
        console.error('❌ [ClientEventDetails] Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  // Update showPlanningForm when form data changes
  useEffect(() => {
    if (planningData || musicIdeasData || timelineData) {
      const hasAnyFormData = planningData?.planning_data || musicIdeasData?.music_ideas || timelineData?.timeline_data;
      setShowPlanningForm(hasAnyFormData);
    }
  }, [planningData, musicIdeasData, timelineData]);

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
        musicNotes: ''
      };

      const defaultMusicData: MusicIdeasFormData = {
        must_play: [],
        play_if_possible: [],
        dedication: [],
        play_only_if_requested: [],
        do_not_play: [],
        guest_request: []
      };

      const defaultTimelineData: TimelineFormData = {
        timeline_items: []
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
      
      // Set AI-filled data in state
      setAiFilledTimelineData(filledTimelineData);
      
      // Save to backend
      await handleTimelineSave(filledTimelineData);

      console.log('=== DOCUMENT PROCESSING COMPLETE ===');
      
      // Transition to forms after successful document processing
      handleDocumentProcessingComplete();
      
    } catch (error) {
      console.error('Error applying AI-extracted data:', error);
    }
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

  const handleTimelineUpload = () => {
    setIsDocumentUploadModalOpen(true);
  };

  const handleDocumentProcessingComplete = () => {
    // Transition from chat to forms after document processing
    setShowPlanningForm(true);
  };

  const isFormLoading = planningLoading || musicIdeasLoading || timelineLoading;
  const formError = planningError || musicIdeasError || timelineError;

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

  if (error) {
    return (
      <div className="bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Event</h3>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => navigate('/client/events')}
            className="bg-brand hover:bg-brand-dark text-secondary font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-300">Loading event...</p>
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
            onClick={() => navigate('/client/events')}
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conditional Content: Forms or Chat */}
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
                initialData={aiFilledPlanningData || planningData?.planning_data || undefined}
                key={`planning-${aiFilledPlanningData ? 'ai-filled' : planningData?.planning_data ? 'loaded' : 'default'}`}
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
                initialData={aiFilledMusicData || musicIdeasData?.music_ideas || undefined}
                key={`music-${aiFilledMusicData ? 'ai-filled' : musicIdeasData?.music_ideas ? 'loaded' : 'default'}`}
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
                initialData={aiFilledTimelineData || timelineData?.timeline_data || undefined}
                key={`timeline-${aiFilledTimelineData ? 'ai-filled' : timelineData?.timeline_data ? 'loaded' : 'default'}`}
              />
            </div>
          </div>
        ) : (
          <ClientChat
            onTimelineUpload={handleTimelineUpload}
            onStartQuestions={handleCreateEmptyPlanningRecord}
            onDocumentProcessed={handleDocumentProcessed}
            onDocumentProcessingComplete={handleDocumentProcessingComplete}
          />
        )}
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isDocumentUploadModalOpen}
        onClose={() => setIsDocumentUploadModalOpen(false)}
        eventId={eventId}
        onDocumentProcessed={handleDocumentProcessed}
        isClientUser={true}
      />
    </div>
  );
}

export default ClientEventDetails;
