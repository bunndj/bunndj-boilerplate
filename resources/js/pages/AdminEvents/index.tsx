import { useState, useEffect } from 'react';
import { Search, Filter, Trash2 } from 'lucide-react';
import { useAdminEvents, useDeleteAdminEvent } from '@/hooks';
import { useNavigate } from 'react-router-dom';

interface AdminEvent {
  id: number;
  name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_city: string;
  venue_state: string;
  guest_count: number;
  dj: {
    id: number;
    name: string;
    organization: string;
  };
  client_firstname: string;
  client_lastname: string;
  client_email: string;
  package: number;
  created_at: string;
}

function AdminEvents() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [djFilter, setDjFilter] = useState<string>('all');
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    eventId: number | null;
    eventName: string;
  }>({
    isOpen: false,
    eventId: null,
    eventName: '',
  });

  // API hooks
  const {
    data: eventsResponse,
    isLoading: loading,
    error,
    refetch,
  } = useAdminEvents({
    search: debouncedSearchTerm,
    dj: djFilter,
    page: currentPage,
    per_page: 50, // Show more events per page
  });

  const deleteEventMutation = useDeleteAdminEvent();

  const events = (eventsResponse?.data || []) as unknown as AdminEvent[];
  const pagination = eventsResponse?.pagination || {};

  // Debug logging
  useEffect(() => {
    console.log('AdminEvents - eventsResponse:', eventsResponse);
    console.log('AdminEvents - events:', events);
    console.log('AdminEvents - loading:', loading);
    console.log('AdminEvents - error:', error);
  }, [eventsResponse, events, loading, error]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search and filter changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    refetch();
  }, [debouncedSearchTerm, djFilter, refetch]);

  // Handle page changes
  useEffect(() => {
    refetch();
  }, [currentPage, refetch]);

  // Since filtering is now handled by the API, we can use events directly
  const filteredEvents = events;

  const handleSelectEvent = (eventId: number) => {
    setSelectedEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(event => event.id));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    // If timeString is already in HH:MM format, return it as is
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    // Otherwise, parse as date
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleDeleteEvent = (eventId: number) => {
    console.log('🗑️ Delete button clicked for event ID:', eventId);

    const event = events.find(e => e.id === eventId);
    if (!event) {
      console.error('❌ Event not found:', eventId);
      return;
    }

    // Show custom confirmation modal
    setDeleteConfirmModal({
      isOpen: true,
      eventId: eventId,
      eventName: event.name,
    });
  };

  const handleConfirmDelete = async () => {
    const { eventId } = deleteConfirmModal;
    if (!eventId) return;

    console.log('✅ User confirmed deletion, proceeding...');

    try {
      console.log('🔄 Calling delete mutation...');
      await deleteEventMutation.mutateAsync(eventId);
      console.log('✅ Delete mutation successful');

      setSelectedEvents(prev => prev.filter(id => id !== eventId));
      // Refetch events to update the list after deletion
      refetch();
      console.log('🔄 Refetch called, list should update');

      // Close modal
      setDeleteConfirmModal({ isOpen: false, eventId: null, eventName: '' });
    } catch (error) {
      console.error('❌ Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    console.log('❌ User cancelled deletion');
    setDeleteConfirmModal({ isOpen: false, eventId: null, eventName: '' });
  };

  const handleRowClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const uniqueDjs = Array.from(new Set(events.map(event => event.dj.id)))
    .map(id => events.find(event => event.dj.id === id)?.dj)
    .filter((dj): dj is NonNullable<typeof dj> => Boolean(dj));

  if (loading) {
    return (
      <div className="bg-secondary">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-gray-300">Loading events...</p>
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Error loading events:</strong>
              <span className="block sm:inline"> {error.message || 'Unknown error'}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-brand animate-fade-in">
            Event Management
          </h1>
          <p className="text-gray-300">
            View and manage all events across the platform. Click on any row to view event details.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <select
              value={djFilter}
              onChange={e => setDjFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="all">All DJs</option>
              {uniqueDjs.map(dj => (
                <option key={dj.id} value={dj.id.toString()}>
                  {dj.name} - {dj.organization}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Showing {filteredEvents.length} of {pagination.total || events.length} events
              </span>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map(event => (
                  <tr
                    key={event.id}
                    className="hover:bg-blue-50 hover:shadow-md cursor-pointer transition-all duration-200 group"
                    onClick={() => handleRowClick(event.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {event.name}
                          </div>
                          <div className="text-sm text-gray-500">{event.guest_count} guests</div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{formatDate(event.event_date)}</div>
                        <div className="text-sm text-gray-500">
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{event.venue_name}</div>
                        <div className="text-sm text-gray-500">
                          {event.venue_city}, {event.venue_state}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{event.dj.name}</div>
                        <div className="text-sm text-gray-500">{event.dj.organization}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {event.client_firstname} {event.client_lastname}
                        </div>
                        <div className="text-sm text-gray-500">{event.client_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(event.package)}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deleteEventMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Event"
                        >
                          {deleteEventMutation.isPending ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedEvents.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedEvents.length} event(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Export Selected
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.last_page}({pagination.total} total
                events)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
                  disabled={currentPage >= pagination.last_page}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center mb-4">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Event</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete "{deleteConfirmModal.eventName}"? This action
                    cannot be undone.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={handleCancelDelete}
                    disabled={deleteEventMutation.isPending}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleteEventMutation.isPending}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteEventMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Event</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminEvents;
