import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import { useAuth } from '@/hooks';
import { eventService } from '@/services/event';

interface ClientEvent {
  id: number;
  name: string;
  event_date: string;
  setup_time: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_city: string;
  venue_state: string;
  dj: {
    id: number;
    name: string;
    organization: string;
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

function ClientEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientEvents();
  }, []);

  const fetchClientEvents = async () => {
    try {
      setLoading(true);
      const events = await eventService.getClientEvents();
      setEvents(events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="bg-secondary">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Events</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchClientEvents}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-secondary">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Events Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't been invited to any events yet. Your DJ will send you an invitation when
              they create an event for you.
            </p>
            <Link
              to="/dashboard"
              className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand animate-fade-in">My Events</h1>
          <p className="text-gray-300">View and manage your wedding events</p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Event Header */}
              <div className="bg-gradient-to-r from-brand to-brand-dark p-4 text-white">
                <h3 className="text-xl font-bold mb-1">{event.name}</h3>
                <p className="text-brand-light text-sm">{formatDate(event.event_date)}</p>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Event Time</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </p>
                    </div>
                  </div>

                  {event.venue_name && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Venue</p>
                        <p className="text-sm text-gray-600">
                          {event.venue_name}, {event.venue_city}, {event.venue_state}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Your DJ</p>
                      <p className="text-sm text-gray-600">
                        {event.dj.name} - {event.dj.organization}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  <Link
                    to={`/client/events/${event.id}`}
                    className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center block"
                  >
                    View Event Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClientEvents;
