import React from 'react';
import { PlanningFormData, MusicIdeasFormData, TimelineFormData } from '@/types';

interface FormDataCardsProps {
  planningData?: PlanningFormData | null;
  musicData?: MusicIdeasFormData | null;
  timelineData?: TimelineFormData | null;
}

const FormDataCards: React.FC<FormDataCardsProps> = ({ planningData, musicData, timelineData }) => {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Not specified';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  const renderPlanningCard = () => {
    if (!planningData) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in">
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📋</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Event Planning Details</h3>
              <p className="text-sm text-gray-600 mt-1">Your wedding planning information</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Basic Information
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Mailing Address:</span>{' '}
                  {formatValue(planningData.mailingAddress)}
                </div>
                <div>
                  <span className="font-medium">Guest Count:</span>{' '}
                  {formatValue(planningData.guestCount)}
                </div>
                <div>
                  <span className="font-medium">Coordinator Email:</span>{' '}
                  {formatValue(planningData.coordinatorEmail)}
                </div>
                <div>
                  <span className="font-medium">Photographer Email:</span>{' '}
                  {formatValue(planningData.photographerEmail)}
                </div>
                <div>
                  <span className="font-medium">Videographer Email:</span>{' '}
                  {formatValue(planningData.videographerEmail)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Ceremony Details
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Ceremony Start Time:</span>{' '}
                  {formatValue(planningData.ceremonyStartTime)}
                </div>
                <div>
                  <span className="font-medium">Ceremony Location:</span>{' '}
                  {formatValue(planningData.ceremonyLocation)}
                </div>
                <div>
                  <span className="font-medium">Officiant Name:</span>{' '}
                  {formatValue(planningData.officiantName)}
                </div>
                <div>
                  <span className="font-medium">Providing Ceremony Music:</span>{' '}
                  {formatValue(planningData.providingCeremonyMusic)}
                </div>
                <div>
                  <span className="font-medium">Guest Arrival Music:</span>{' '}
                  {formatValue(planningData.guestArrivalMusic)}
                </div>
                <div>
                  <span className="font-medium">Ceremony Notes:</span>{' '}
                  {formatValue(planningData.ceremonyNotes)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Reception Details
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Cocktail Hour Music:</span>{' '}
                  {formatValue(planningData.cocktailHourMusic)}
                </div>
                <div>
                  <span className="font-medium">Cocktail Hour Location:</span>{' '}
                  {formatValue(planningData.cocktailHourLocation)}
                </div>
                <div>
                  <span className="font-medium">Cocktail Music:</span>{' '}
                  {formatValue(planningData.cocktailMusic)}
                </div>
                <div>
                  <span className="font-medium">Wedding Party Introductions:</span>{' '}
                  {formatValue(planningData.weddingPartyIntroductions)}
                </div>
                <div>
                  <span className="font-medium">Couple Intro Song:</span>{' '}
                  {formatValue(planningData.coupleIntroSong)}
                </div>
                <div>
                  <span className="font-medium">Special Dances:</span>{' '}
                  {formatValue(planningData.specialDances)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Additional Details
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Dinner Music:</span>{' '}
                  {formatValue(planningData.dinnerMusic)}
                </div>
                <div>
                  <span className="font-medium">Welcome By:</span>{' '}
                  {formatValue(planningData.welcomeBy)}
                </div>
                <div>
                  <span className="font-medium">Blessing By:</span>{' '}
                  {formatValue(planningData.blessingBy)}
                </div>
                <div>
                  <span className="font-medium">Toasts:</span> {formatValue(planningData.toasts)}
                </div>
                <div>
                  <span className="font-medium">Music Notes:</span>{' '}
                  {formatValue(planningData.musicNotes)}
                </div>
                <div>
                  <span className="font-medium">Other Comments:</span>{' '}
                  {formatValue(planningData.otherComments)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMusicCard = () => {
    if (!musicData) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-100">
        <div className="p-4 border-b border-gray-200 bg-purple-50">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎵</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Music Preferences</h3>
              <p className="text-sm text-gray-600 mt-1">Your music ideas and song requests</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Must Play Songs
              </h4>
              <div className="space-y-1">
                {musicData.must_play && musicData.must_play.length > 0 ? (
                  musicData.must_play.map((song, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{song.song_title}</span> by {song.artist}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No must-play songs specified</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Do Not Play
              </h4>
              <div className="space-y-1">
                {musicData.do_not_play && musicData.do_not_play.length > 0 ? (
                  musicData.do_not_play.map((song, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{song.song_title}</span> by {song.artist}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No restrictions specified</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Play If Possible
              </h4>
              <div className="space-y-1">
                {musicData.play_if_possible && musicData.play_if_possible.length > 0 ? (
                  musicData.play_if_possible.map((song, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{song.song_title}</span> by {song.artist}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No suggestions specified</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Dedication Songs
              </h4>
              <div className="space-y-1">
                {musicData.dedication && musicData.dedication.length > 0 ? (
                  musicData.dedication.map((song, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{song.song_title}</span> by {song.artist}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No dedication songs specified</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineCard = () => {
    if (!timelineData || !timelineData.timeline_items || timelineData.timeline_items.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-200">
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⏰</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Event Timeline</h3>
                <p className="text-sm text-gray-600 mt-1">Your wedding day schedule</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="text-center text-gray-500">
              <p>No timeline items have been added yet.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg hover-lift animate-scale-in animation-delay-200">
        <div className="p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⏰</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Event Timeline</h3>
              <p className="text-sm text-gray-600 mt-1">Your wedding day schedule</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {timelineData.timeline_items.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{item.activity}</div>
                    <div className="flex items-center space-x-1 text-brand font-semibold text-sm">
                      <span>🕐</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                  {item.notes && <div className="text-xs text-gray-500 mt-1">{item.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {renderPlanningCard()}
      {renderMusicCard()}
      {renderTimelineCard()}
    </div>
  );
};

export default FormDataCards;
