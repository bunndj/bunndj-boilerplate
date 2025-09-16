import type { PlanningFormData, MusicIdeasFormData, TimelineFormData } from '@/types';

/**
 * Convert chat planning data from nested format to flat form format
 * Chat format: {"ceremony": {"parents_grandparents_entrance": "FFF"}, "reception": {...}}
 * Form format: {ceremonyParentsEntrance: "FFF", ...}
 */
export function convertChatPlanningDataToForm(chatData: any): Partial<PlanningFormData> {
  if (!chatData || typeof chatData !== 'object') {
    return {};
  }

  const formData: any = {};

  // Handle ceremony section
  if (chatData.ceremony) {
    const ceremony = chatData.ceremony;
    if (ceremony.parents_grandparents_entrance) {
      formData.parentsEntranceSong = ceremony.parents_grandparents_entrance;
    }
    if (ceremony.officiant_groom) {
      formData.officiantName = ceremony.officiant_groom;
    }
    if (ceremony.groomsmen) {
      formData.weddingPartyIntroductions = ceremony.groomsmen;
    }
    if (ceremony.bridesmaids) {
      formData.weddingPartyIntroSong = ceremony.bridesmaids;
    }
    if (ceremony.processional) {
      formData.guestArrivalMusic = ceremony.processional;
    }
    if (ceremony.recessional) {
      formData.ceremonyNotes = ceremony.recessional;
    }
  }

  // Handle reception section
  if (chatData.reception) {
    const reception = chatData.reception;
    if (reception.introduction) {
      formData.coupleIntroSong = reception.introduction;
    }
    if (reception.first_dance) {
      formData.specialDances = reception.first_dance;
    }
    if (reception.dinner_playlist) {
      formData.dinnerMusic = reception.dinner_playlist;
    }
  }

  return formData;
}

/**
 * Convert chat music data from array format to music form format  
 * Chat format: [{"field_name": "first_dance_song", "field_value": "OOO"}]
 * Form format: {must_play: [{song_title: "Song", artist: "Artist"}], ...}
 */
export function convertChatMusicDataToForm(chatDataArray: any[]): Partial<MusicIdeasFormData> {
  if (!Array.isArray(chatDataArray)) {
    return {};
  }

  const formData: Partial<MusicIdeasFormData> = {
    must_play: [],
    play_if_possible: [],
    dedication: [],
    play_only_if_requested: [],
    do_not_play: [],
    guest_request: [],
  };

  // Convert chat fields to music categories
  chatDataArray.forEach(item => {
    if (!item.field_name || !item.field_value) return;

    const fieldName = item.field_name;
    const fieldValue = item.field_value;

    // Map chat field names to music categories
    switch (fieldName) {
      case 'first_dance_song':
        if (fieldValue && formData.must_play) {
          formData.must_play.push({
            song_title: fieldValue,
            artist: '',
            client_visible_title: 'First Dance'
          });
        }
        break;
      
      case 'client_name':
      case 'fiance_name':
        // These might be used for special dedications
        if (fieldValue && formData.dedication) {
          formData.dedication.push({
            song_title: `Special song for ${fieldValue}`,
            artist: '',
            client_visible_title: `For ${fieldValue}`
          });
        }
        break;
      
      case 'ceremony_music':
        if (fieldValue && formData.play_if_possible) {
          formData.play_if_possible.push({
            song_title: fieldValue,
            artist: '',
            client_visible_title: 'Ceremony Music'
          });
        }
        break;
      
      // Add more field mappings as needed
      default:
        // For any music-related field, add to play_if_possible
        if (fieldValue && (fieldName.includes('music') || fieldName.includes('song')) && formData.play_if_possible) {
          formData.play_if_possible.push({
            song_title: fieldValue,
            artist: '',
            client_visible_title: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          });
        }
        break;
    }
  });

  return formData;
}

/**
 * Convert chat data to timeline format
 * This extracts timing information from the chat data
 */
export function convertChatDataToTimeline(chatDataArray: any[]): Partial<TimelineFormData> {
  if (!Array.isArray(chatDataArray)) {
    return {};
  }

  const timelineItems: any[] = [];

  chatDataArray.forEach(item => {
    if (!item.field_name || !item.field_value) return;

    const fieldName = item.field_name;
    const fieldValue = item.field_value;

    // Extract timing information
    switch (fieldName) {
      case 'ceremony_time':
        if (fieldValue) {
          timelineItems.push({
            id: 'ceremony-time',
            name: 'Ceremony',
            start_time: fieldValue,
            end_time: '',
            notes: 'Wedding ceremony',
            time_offset: 0,
            order: 0
          });
        }
        break;
      
      case 'cocktail_hour_time':
        if (fieldValue) {
          timelineItems.push({
            id: 'cocktail-time',
            name: 'Cocktail Hour',
            start_time: fieldValue,
            end_time: '',
            notes: 'Cocktail hour and mingling',
            time_offset: 0,
            order: 1
          });
        }
        break;
      
      // Add more timeline mappings as needed
    }
  });

  return {
    timeline_items: timelineItems
  };
}

/**
 * Convert generic chat field array to planning form data
 * This handles the array format: [{"field_name": "client_name", "field_value": "AAA"}]
 */
export function convertChatFieldArrayToPlanningForm(chatDataArray: any[]): Partial<PlanningFormData> {
  if (!Array.isArray(chatDataArray)) {
    return {};
  }

  const formData: any = {};

  chatDataArray.forEach(item => {
    if (!item.field_name || item.field_value === undefined) return;

    const fieldName = item.field_name;
    const fieldValue = item.field_value;

    // Map chat field names to planning form fields
    switch (fieldName) {
      case 'client_name':
        // This might go into general information
        formData.otherNotes = (formData.otherNotes || '') + `Client: ${fieldValue}\n`;
        break;
      
      case 'fiance_name':
        formData.otherNotes = (formData.otherNotes || '') + `Fiancé: ${fieldValue}\n`;
        break;
      
      case 'wedding_date':
        formData.otherNotes = (formData.otherNotes || '') + `Wedding Date: ${fieldValue}\n`;
        break;
      
      case 'wedding_location':
        formData.ceremonyLocation = fieldValue;
        break;
      
      case 'guest_count':
        if (fieldValue && !isNaN(Number(fieldValue))) {
          formData.guestCount = Number(fieldValue);
        }
        break;
      
      case 'ceremony_time':
        formData.ceremonyStartTime = fieldValue;
        break;
      
      case 'ceremony_location':
        formData.ceremonyLocation = fieldValue;
        break;
      
      case 'cocktail_hour_location':
        formData.cocktailHourLocation = fieldValue;
        break;
      
      case 'introduction_text':
        formData.weddingPartyIntroductions = fieldValue;
        break;
      
      case 'first_dance_song':
        formData.specialDances = fieldValue;
        break;
      
      case 'dinner_style':
        formData.dinnerStyle = fieldValue;
        break;
      
      case 'welcome_speaker_name':
        formData.welcomeBy = fieldValue;
        break;
      
      // Add more field mappings as needed
      default:
        // For unmapped fields, add to notes
        if (fieldValue) {
          formData.otherComments = (formData.otherComments || '') + `${fieldName.replace(/_/g, ' ')}: ${fieldValue}\n`;
        }
        break;
    }
  });

  // Clean up notes fields
  if (formData.otherNotes) {
    formData.otherNotes = formData.otherNotes.trim();
  }
  if (formData.otherComments) {
    formData.otherComments = formData.otherComments.trim();
  }

  return formData;
}
