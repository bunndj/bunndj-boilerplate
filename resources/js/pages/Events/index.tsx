import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CreateEventModal from './components/CreateEventModal';
import { useEvents } from '@/hooks';
import type { Event } from '@/types';
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  ArrowRight,
} from 'lucide-react';

const Events: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: events = [], isLoading, error, refetch } = useEvents();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if URL is /events/create and open modal automatically
  useEffect(() => {
    if (location.pathname === '/events/create') {
      setIsCreateModalOpen(true);
    }
  }, [location.pathname]);

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    // Navigate back to /events when modal is closed
    if (location.pathname === '/events/create') {
      navigate('/events');
    }
  };

  const handleEventCreated = () => {
    setIsCreateModalOpen(false);
    // Navigate back to /events when event is created
    if (location.pathname === '/events/create') {
      navigate('/events');
    }
    // Refetch events to get the latest data
    refetch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-brand mx-auto mb-4" />
          <p className="text-gray-300">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Events</h3>
          <p className="text-gray-300 mb-4">
            {error instanceof Error ? error.message : 'Failed to load events'}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-brand hover:bg-brand-dark text-secondary font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0 animate-slide-up">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand animate-fade-in">My Events</h1>
            <p className="text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base animate-slide-up animation-delay-100">
              Manage your wedding events and bookings
            </p>
          </div>
          <button
            onClick={handleCreateEvent}
            className="bg-brand hover:bg-brand-dark text-secondary font-semibold py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto group hover-lift animate-glow hover:scale-105"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-12 text-center mx-2 sm:mx-0 hover-lift animate-scale-in">
            <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 animate-float">
              <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 animate-slide-up animation-delay-100">
              No events yet
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base animate-slide-up animation-delay-200">
              Get started by creating your first wedding event.
            </p>
            <button
              onClick={handleCreateEvent}
              className="bg-brand hover:bg-brand-dark text-secondary font-semibold py-2 px-4 rounded-lg transition-all duration-200 w-full sm:w-auto hover:scale-105 animate-glow"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event: Event, index: number) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-[1.02] mx-2 sm:mx-0 hover-lift animate-scale-in group"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-2 leading-tight group-hover:text-brand transition-colors duration-200">
                    {event.name}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize whitespace-nowrap group-hover:bg-brand group-hover:text-secondary transition-colors duration-200">
                    {event.service_package}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{formatDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {event.client_firstname} {event.client_lastname}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span>{event.guest_count} guests</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">
                      {new Date(event.start_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}{' '}
                      -{' '}
                      {new Date(event.end_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-brand hover:text-brand-dark font-medium text-sm">
                      Start Planning
                    </span>
                    <ArrowRight className="w-4 h-4 text-brand" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Event Modal */}
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onEventCreated={handleEventCreated}
        />
      </div>
    </div>
  );
};

export default Events;
