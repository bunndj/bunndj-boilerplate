import type { PlanningFormData, MusicIdeasFormData, TimelineFormData } from '@/types';

export interface ExtractedData {
  extracted_fields: Record<string, any>;
  confidence_score: number;
  raw_text: string;
  analysis_timestamp: string;
}

/**
 * AI Form Filler - Intelligently maps extracted data to form fields
 */
export class AIFormFiller {
  /**
   * Test function to verify field mapping works
   */
  static testFieldMapping() {
    const testExtractedData: ExtractedData = {
      extracted_fields: {
        guestCount: 150,
        mailingAddress: "123 Wedding Lane, Love City, LC 12345",
        coordinatorEmail: "planner@wedding.com",
        ceremonyStartTime: "2:00 PM",
        ceremonyLocation: "Beautiful Gardens Chapel",
        officiantName: "Reverend Smith",
        uplighting: true,
        photoBooth: true,
        isWedding: true,
        providingCeremonyMusic: true,
        guestArrivalMusic: "classical",
        providingCeremonyMicrophones: true,
        whoNeedsMic: "officiant only",
        spotifyPlaylists: "https://open.spotify.com/playlist/123",
        lineDances: "Electric Slide, Cupid Shuffle",
        takeRequests: "yes",
        songs: [
          { title: "Perfect", artist: "Ed Sheeran", category: "must_play" },
          { title: "All of Me", artist: "John Legend", category: "dedication" }
        ]
      },
      confidence_score: 95,
      raw_text: "Test wedding planning document",
      analysis_timestamp: new Date().toISOString()
    };

    const testCurrentData: PlanningFormData = {
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

    console.log('=== TESTING AIFormFiller ===');
    console.log('Test extracted data:', testExtractedData);
    console.log('Test current data:', testCurrentData);
    
    const result = this.fillPlanningForm(testCurrentData, testExtractedData);
    console.log('Test result:', result);
    
    // Check specific fields
    console.log('Guest count filled:', result.guestCount);
    console.log('Mailing address filled:', result.mailingAddress);
    console.log('Uplighting filled:', result.uplighting);
    console.log('Photo booth filled:', result.photoBooth);
    
    return result;
  }

  /**
   * Convert time string to HTML time input format (HH:MM)
   */
  private static convertTimeToTimeInputFormat(timeStr: string): string {
    if (!timeStr) return '';
    
    console.log('Converting time:', timeStr);
    
    // Handle various time formats
    const time = timeStr.toLowerCase().trim();
    
    // Extract hours and minutes
    let hours = 0;
    let minutes = 0;
    
    // Pattern 1: "5pm", "5:30pm", "17:30"
    const timePattern1 = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
    const match1 = time.match(timePattern1);
    if (match1) {
      hours = parseInt(match1[1]);
      minutes = match1[2] ? parseInt(match1[2]) : 0;
      const period = match1[3].toLowerCase();
      
      if (period === 'pm' && hours !== 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }
    }
    
    // Pattern 2: "17:30", "17:30:00"
    const timePattern2 = /(\d{1,2}):(\d{2})(?::(\d{2}))?/;
    const match2 = time.match(timePattern2);
    if (match2 && !match1) { // Only if pattern 1 didn't match
      hours = parseInt(match2[1]);
      minutes = parseInt(match2[2]);
    }
    
    // Pattern 3: Just "5" (assume PM for evening times)
    if (!match1 && !match2 && /^\d{1,2}$/.test(time)) {
      hours = parseInt(time);
      if (hours < 12) hours += 12; // Assume PM for single digits
    }
    
    // Convert to HH:MM format
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const result = `${formattedHours}:${formattedMinutes}`;
    
    console.log(`Converted "${timeStr}" to "${result}" (${hours}:${minutes})`);
    return result;
  }

  /**
   * Fill planning form with extracted data
   */
  static fillPlanningForm(
    currentData: PlanningFormData,
    extractedData: ExtractedData,
    appendMode: boolean = false
  ): PlanningFormData {
    const fields = extractedData.extracted_fields;
    const filledData = { ...currentData };
    
    // Clear existing data to prevent duplication
    console.log('Clearing existing planning form data to prevent duplication');

    // Map extracted fields to planning form fields - now using OpenAI extracted fields
    const fieldMappings = {
      // General Information
      guestCount: fields.guestCount,
      mailingAddress: fields.mailingAddress,
      coordinatorEmail: fields.coordinatorEmail,
      photographerEmail: fields.photographerEmail,
      videographerEmail: fields.videographerEmail,
      isWedding: fields.isWedding,

      // Ceremony - Convert time fields to proper format
      ceremonyStartTime: this.convertTimeToTimeInputFormat(fields.ceremonyStartTime),
      ceremonyLocation: fields.ceremonyLocation,
      officiantName: fields.officiantName,
      providingCeremonyMusic: fields.providingCeremonyMusic,
      guestArrivalMusic: fields.guestArrivalMusic,
      ceremonyNotes: fields.ceremonyNotes,
      providingCeremonyMicrophones: fields.providingCeremonyMicrophones,
      whoNeedsMic: fields.whoNeedsMic,
      ceremonyDjNotes: fields.ceremonyDjNotes,

      // Add-ons
      uplighting: fields.uplighting,
      uplightingColor: fields.uplightingColor,
      uplightingNotes: fields.uplightingNotes,
      photoBooth: fields.photoBooth,
      photoBoothLocation: fields.photoBoothLocation,
      logoDesign: fields.logoDesign,
      photoText: fields.photoText,
      photoColorScheme: fields.photoColorScheme,
      ledRingColor: fields.ledRingColor,
      backdrop: fields.backdrop,
      photoEmailLocation: fields.photoEmailLocation,

      // Cocktail Hour
      cocktailHourMusic: fields.cocktailHourMusic,
      cocktailHourLocation: fields.cocktailHourLocation,
      cocktailMusic: fields.cocktailMusic,
      cocktailNotes: fields.cocktailNotes,

      // Introductions & Dances - Convert time fields to proper format
      introductionsTime: this.convertTimeToTimeInputFormat(fields.introductionsTime),
      parentsEntranceSong: fields.parentsEntranceSong,
      weddingPartyIntroSong: fields.weddingPartyIntroSong,
      coupleIntroSong: fields.coupleIntroSong,
      weddingPartyIntroductions: fields.weddingPartyIntroductions,
      specialDances: fields.specialDances,
      otherNotes: fields.otherNotes,

      // Reception Events
      dinnerMusic: fields.dinnerMusic,
      dinnerStyle: fields.dinnerStyle,
      welcomeBy: fields.welcomeBy,
      blessingBy: fields.blessingBy,
      toasts: fields.toasts,
      receptionNotes: fields.receptionNotes,
      exitDescription: fields.exitDescription,
      otherComments: fields.otherComments,

      // Music
      spotifyPlaylists: fields.spotifyPlaylists,
      lineDances: fields.lineDances,
      takeRequests: fields.takeRequests,
      musicNotes: fields.musicNotes,
    };

    // Apply mappings, handling different data types properly
    Object.entries(fieldMappings).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const planningKey = key as keyof PlanningFormData;
        if (planningKey in filledData) {
          // Handle different data types appropriately
          if (typeof value === 'boolean') {
            // Always apply boolean values
            (filledData as any)[planningKey] = value;
          } else if (typeof value === 'number') {
            // Always apply numeric values
            (filledData as any)[planningKey] = value;
          } else if (typeof value === 'string' && value.trim() !== '') {
            // Only apply non-empty strings
            (filledData as any)[planningKey] = value.trim();
          }
        }
      }
    });

    return filledData;
  }

  /**
   * Fill music ideas form with extracted data
   */
  static fillMusicIdeasForm(
    currentData: MusicIdeasFormData,
    extractedData: ExtractedData,
    appendMode: boolean = false
  ): MusicIdeasFormData {
    const fields = extractedData.extracted_fields;
    const filledData = { ...currentData };

    // Extract songs from the document using OpenAI categorization
    if (fields.songs && Array.isArray(fields.songs)) {
      console.log('Processing songs:', fields.songs);
      
      // Clear existing song data to prevent duplication (only if not in append mode)
      if (!appendMode) {
        filledData.must_play = [];
        filledData.play_if_possible = [];
        filledData.dedication = [];
        filledData.play_only_if_requested = [];
        filledData.do_not_play = [];
        filledData.guest_request = [];
      }
      
      // OpenAI should have already categorized the songs
      fields.songs.forEach((song: any) => {
        // Ensure we get the full song title and artist (no truncation)
        let songTitle = song.title || song.song_title || '';
        const artistName = song.artist || '';
        
        // Clean up song title - remove line breaks and excessive text
        songTitle = songTitle.replace(/\n/g, ' ').trim();
        
        // If title is too long (likely not a real song), try to extract actual song info
        if (songTitle.length > 100) {
          // Look for common patterns like "Song Name - Artist" or "Song Name by Artist"
          const songPattern = /^([^-]+?)(?:\s*-\s*|\s+by\s+)([^-\n]+)/i;
          const match = songTitle.match(songPattern);
          if (match) {
            songTitle = match[1].trim();
          } else {
            // If no pattern found, truncate to first meaningful part
            const words = songTitle.split(' ');
            if (words.length > 8) {
              songTitle = words.slice(0, 8).join(' ');
            }
          }
        }
        
        // Skip if title is still too long or contains timeline-like text
        if (songTitle.length > 255) {
          console.log('Skipping invalid song title:', songTitle);
          return;
        }
        
        // Ensure title and artist are not too long for database (backend allows 500 chars but let's be safe)
        songTitle = songTitle.substring(0, 250).trim();
        const cleanArtist = artistName.substring(0, 250).trim();
        
        const songData = {
          song_title: songTitle,
          artist: cleanArtist,
          client_visible_title: songTitle, // Use the cleaned title
        };

        console.log('Song data prepared:', songData);

        // Apply to the appropriate category based on OpenAI's categorization
        switch (song.category) {
          case 'must_play':
            filledData.must_play.push(songData);
            break;
          case 'play_if_possible':
            filledData.play_if_possible.push(songData);
            break;
          case 'dedication':
            filledData.dedication.push(songData);
            break;
          case 'play_only_if_requested':
            filledData.play_only_if_requested.push(songData);
            break;
          case 'do_not_play':
            filledData.do_not_play.push(songData);
            break;
          case 'guest_request':
            filledData.guest_request.push(songData);
            break;
          default:
            // If no category specified, add to play if possible
            filledData.play_if_possible.push(songData);
        }
      });
    }

    return filledData;
  }

  /**
   * Fill timeline form with extracted data
   */
  static fillTimelineForm(
    currentData: TimelineFormData,
    extractedData: ExtractedData,
    appendMode: boolean = false
  ): TimelineFormData {
    const fields = extractedData.extracted_fields;
    const filledData = { ...currentData };

    console.log('Processing timeline data:', fields);
    console.log('Current timeline items:', filledData.timeline_items);
    console.log('Timeline times found:', fields.timeline_times);
    console.log('Timeline activities found:', fields.timeline_activities);

    // Use OpenAI extracted timeline information
    if (fields.timeline_times && Array.isArray(fields.timeline_times)) {
      console.log('Timeline times found:', fields.timeline_times);
      
      // Clear existing timeline data to prevent duplication (only if not in append mode)
      if (!appendMode) {
        filledData.timeline_items = [];
      }
      
      // Create new timeline items from extracted times with meaningful names and calculated end times
      console.log('Creating new timeline items from extracted data');
      
      // Sort times chronologically first
      const sortedTimes = [...fields.timeline_times].sort((a, b) => {
        const timeA = this.convertTimeToTimeInputFormat(a);
        const timeB = this.convertTimeToTimeInputFormat(b);
        return timeA.localeCompare(timeB);
      });
      
      // Create new timeline items and append them to existing ones
      // Generate unique IDs that don't conflict with existing ones
      const existingIds = new Set(filledData.timeline_items.map(item => item.id));
      let nextId = 0;
      const getUniqueId = () => {
        let id;
        do {
          id = `temp_${nextId}`;
          nextId++;
        } while (existingIds.has(id));
        existingIds.add(id);
        return id;
      };
      
      const newTimelineItems = sortedTimes.map((time, index) => {
        const startTime = this.convertTimeToTimeInputFormat(time);
        let endTime = '';
        
        // Calculate end time based on next event's start time
        if (index < sortedTimes.length - 1) {
          const nextTime = this.convertTimeToTimeInputFormat(sortedTimes[index + 1]);
          endTime = nextTime;
        }
        
        // Create meaningful activity name from notes or generate descriptive name
        let activityName = '';
        if (fields.timeline_activities && fields.timeline_activities[index]) {
          // Use the first few words of the activity description
          const activity = fields.timeline_activities[index];
          const words = activity.split(' ').slice(0, 4).join(' '); // First 4 words
          activityName = words.length > 20 ? words.substring(0, 20) + '...' : words;
        } else {
          // Generate descriptive name based on time context
          const hour = parseInt(startTime.split(':')[0]);
          if (hour < 12) {
            activityName = 'Morning Activity';
          } else if (hour < 17) {
            activityName = 'Afternoon Activity';
          } else {
            activityName = 'Evening Activity';
          }
        }
        
        return {
          id: getUniqueId(),
          name: activityName,
          start_time: startTime,
          end_time: endTime,
          notes: fields.timeline_activities?.[index] || '',
          time_offset: 0,
          order: filledData.timeline_items.length + index
        };
      });
      
      // Append new timeline items to existing ones
      if (appendMode) {
        filledData.timeline_items = [...filledData.timeline_items, ...newTimelineItems];
      } else {
        filledData.timeline_items = newTimelineItems;
      }
    }

    // Also handle individual time fields that might be extracted
    if (fields.ceremonyStartTime) {
      console.log('Ceremony start time found:', fields.ceremonyStartTime);
      // Find and update the ceremony timeline item
      const ceremonyItem = filledData.timeline_items.find(item => 
        item.name.toLowerCase().includes('ceremony') || 
        item.notes?.toLowerCase().includes('ceremony')
      );
      if (ceremonyItem) {
        ceremonyItem.start_time = this.convertTimeToTimeInputFormat(fields.ceremonyStartTime);
        // Set end time to cocktail hour start time if available
        if (fields.cocktailHourStartTime) {
          ceremonyItem.end_time = this.convertTimeToTimeInputFormat(fields.cocktailHourStartTime);
        }
      }
    }

    if (fields.cocktailHourStartTime) {
      console.log('Cocktail hour start time found:', fields.cocktailHourStartTime);
      // Find and update the cocktail hour timeline item
      const cocktailItem = filledData.timeline_items.find(item => 
        item.name.toLowerCase().includes('cocktail') || 
        item.notes?.toLowerCase().includes('cocktail')
      );
      if (cocktailItem) {
        cocktailItem.start_time = this.convertTimeToTimeInputFormat(fields.cocktailHourStartTime);
        // Set end time to dinner start time if available
        if (fields.dinnerStartTime) {
          cocktailItem.end_time = this.convertTimeToTimeInputFormat(fields.dinnerStartTime);
        }
      }
    }

    if (fields.dinnerStartTime) {
      console.log('Dinner start time found:', fields.dinnerStartTime);
      // Find and update the dinner timeline item
      const dinnerItem = filledData.timeline_items.find(item => 
        item.name.toLowerCase().includes('dinner') || 
        item.notes?.toLowerCase().includes('dinner')
      );
      if (dinnerItem) {
        dinnerItem.start_time = this.convertTimeToTimeInputFormat(fields.dinnerStartTime);
        // Set end time to reception start time if available
        if (fields.receptionStartTime) {
          dinnerItem.end_time = this.convertTimeToTimeInputFormat(fields.receptionStartTime);
        }
      }
    }

    if (fields.receptionStartTime) {
      console.log('Reception start time found:', fields.receptionStartTime);
      // Find and update the reception timeline item
      const receptionItem = filledData.timeline_items.find(item => 
        item.name.toLowerCase().includes('reception') || 
        item.notes?.toLowerCase().includes('reception')
      );
      if (receptionItem) {
        receptionItem.start_time = this.convertTimeToTimeInputFormat(fields.receptionStartTime);
      }
    }

    if (fields.introductionsTime) {
      console.log('Introductions time found:', fields.introductionsTime);
      // Find and update the introductions timeline item
      const introItem = filledData.timeline_items.find(item => 
        item.name.toLowerCase().includes('introduction') || 
        item.notes?.toLowerCase().includes('introduction')
      );
      if (introItem) {
        introItem.start_time = this.convertTimeToTimeInputFormat(fields.introductionsTime);
      }
    }

    console.log('Final timeline data:', filledData);
    return filledData;
  }

  /**
   * Extract time from text array
   */
  private static extractTimeFromText(times: string[] | undefined): string {
    if (!times || times.length === 0) return '';
    
    // Return the first time found, or try to find a ceremony time
    const ceremonyTime = times.find(time => 
      time.toLowerCase().includes('ceremony') || 
      time.toLowerCase().includes('start')
    );
    
    return ceremonyTime || times[0];
  }

  /**
   * Generate ceremony notes from extracted data
   */
  private static generateCeremonyNotes(fields: Record<string, any>): string {
    const notes = [];
    
    if (fields.venueLocation) {
      notes.push(`Venue: ${fields.venueLocation}`);
    }
    if (fields.officiantName) {
      notes.push(`Officiant: ${fields.officiantName}`);
    }
    if (fields.times && fields.times.length > 0) {
      notes.push(`Times: ${fields.times.join(', ')}`);
    }

    return notes.length > 0 ? notes.join('\n') : '';
  }

  /**
   * Detect uplighting from text
   */
  private static detectUplighting(text: string): boolean {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return lowerText.includes('uplighting') || 
           lowerText.includes('up lighting') || 
           lowerText.includes('ambient lighting');
  }

  /**
   * Detect photo booth from text
   */
  private static detectPhotoBooth(text: string): boolean {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return lowerText.includes('photo booth') || 
           lowerText.includes('photobooth') || 
           lowerText.includes('photo station');
  }

  /**
   * Extract Spotify playlists from text
   */
  private static extractSpotifyPlaylists(text: string): string {
    if (!text) return '';
    
    const spotifyRegex = /(https?:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+)/g;
    const matches = text.match(spotifyRegex);
    
    return matches ? matches.join('\n') : '';
  }

  /**
   * Extract line dances from text
   */
  private static extractLineDances(text: string): string {
    if (!text) return '';
    
    const lineDanceKeywords = [
      'cupid shuffle', 'cha cha slide', 'wobble', 'electric slide',
      'macarena', 'chicken dance', 'hokey pokey', 'y.m.c.a'
    ];
    
    const foundDances = lineDanceKeywords.filter(dance => 
      text.toLowerCase().includes(dance.toLowerCase())
    );
    
    return foundDances.length > 0 ? foundDances.join(', ') : '';
  }

  /**
   * Generate music notes from extracted data
   */
  private static generateMusicNotes(fields: Record<string, any>): string {
    const notes = [];
    
    if (fields.songs && fields.songs.length > 0) {
      notes.push(`Songs mentioned: ${fields.songs.length}`);
    }
    if (fields.packagePrice) {
      notes.push(`Package price: $${fields.packagePrice}`);
    }

    return notes.length > 0 ? notes.join('\n') : '';
  }

  /**
   * Detect dinner style from text
   */
  private static detectDinnerStyle(text: string): string {
    if (!text) return '';
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('plated') || lowerText.includes('sit down')) {
      return 'plated';
    } else if (lowerText.includes('buffet')) {
      return 'buffet';
    } else if (lowerText.includes('family style')) {
      return 'family-style';
    } else if (lowerText.includes('stations') || lowerText.includes('food stations')) {
      return 'food stations';
    }
    
    return '';
  }

  /**
   * Generate reception notes from extracted data
   */
  private static generateReceptionNotes(fields: Record<string, any>): string {
    const notes = [];
    
    if (fields.venueLocation) {
      notes.push(`Reception venue: ${fields.venueLocation}`);
    }
    if (fields.guestCount) {
      notes.push(`Expected guests: ${fields.guestCount}`);
    }

    return notes.length > 0 ? notes.join('\n') : '';
  }

  /**
   * Categorize songs based on context
   */
  private static categorizeSongs(songs: any[], text: string): {
    mustPlay: any[];
    playIfPossible: any[];
    dedication: any[];
  } {
    const lowerText = text.toLowerCase();
    
    return {
      mustPlay: songs.filter(song => 
        lowerText.includes('must') || 
        lowerText.includes('essential') || 
        lowerText.includes('required')
      ),
      playIfPossible: songs.filter(song => 
        lowerText.includes('if possible') || 
        lowerText.includes('optional') || 
        lowerText.includes('nice to have')
      ),
      dedication: songs.filter(song => 
        lowerText.includes('dedication') || 
        lowerText.includes('special') || 
        lowerText.includes('meaningful')
      ),
    };
  }

  /**
   * Extract timeline information from text
   */
  private static extractTimelineInfo(text: string, times: string[] | undefined): Array<{
    start_time: string;
    end_time: string;
    notes: string;
  }> {
    if (!times || times.length === 0) return [];

    const timelineInfo = [];
    
    // Simple time extraction - in production, you'd use more sophisticated NLP
    for (let i = 0; i < times.length - 1; i++) {
      timelineInfo.push({
        start_time: times[i],
        end_time: times[i + 1],
        notes: `Extracted from document`,
      });
    }

    return timelineInfo;
  }

  /**
   * Get confidence score for form filling
   */
  static getFormFillingConfidence(extractedData: ExtractedData): number {
    return extractedData.confidence_score;
  }

  /**
   * Get summary of what was filled
   */
  static getFillingSummary(
    originalData: any,
    filledData: any
  ): { fieldsFilled: number; totalFields: number; filledFields: string[] } {
    const fieldsFilled = Object.keys(filledData).filter(key => {
      const original = originalData[key];
      const filled = filledData[key];
      
      if (Array.isArray(original) && Array.isArray(filled)) {
        return filled.length > original.length;
      }
      
      return filled !== original && filled !== '' && filled !== null && filled !== undefined;
    });

    return {
      fieldsFilled: fieldsFilled.length,
      totalFields: Object.keys(originalData).length,
      filledFields: fieldsFilled,
    };
  }
}
