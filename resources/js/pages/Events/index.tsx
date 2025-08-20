import React, { useState } from 'react';
import CreateEventModal from './components/CreateEventModal';
import { useEvents } from '@/hooks/useEvents';
import type { Event } from '@/types/event';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Loader2
} from 'lucide-react';

const Events: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: events = [], isLoading, error, refetch } = useEvents();

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleEventCreated = (newEvent: Event) => {
    // Handle the newly created event
    console.log('Event created:', newEvent);
    setIsCreateModalOpen(false);
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
    <div className="bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand">Events</h1>
            <p className="text-gray-300 mt-2">Manage your wedding events and bookings</p>
          </div>
          <button
            onClick={handleCreateEvent}
            className="bg-brand hover:bg-brand-dark text-secondary font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first wedding event.</p>
            <button
              onClick={handleCreateEvent}
              className="bg-brand hover:bg-brand-dark text-secondary font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                    {event.service_package}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.client_firstname} {event.client_lastname}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {event.guest_count} guests
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
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
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="text-brand hover:text-brand-dark font-medium text-sm">
                    View Details →
                  </button>
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
