import { z } from 'zod';

export const planningFormSchema = z.object({
  // General Information
  mailingAddress: z.string().optional(),
  guestCount: z.number().min(0).optional(),
  coordinatorEmail: z.string().email().optional().or(z.literal('')),
  photographerEmail: z.string().email().optional().or(z.literal('')),
  videographerEmail: z.string().email().optional().or(z.literal('')),
  isWedding: z.boolean().default(true),

  // Ceremony
  ceremonyCeremonyAudio: z.boolean().default(false),
  ceremonyStartTime: z.string().optional(),
  ceremonyLocation: z.string().optional(),
  officiantName: z.string().optional(),
  providingCeremonyMusic: z.boolean().default(false),
  guestArrivalMusic: z.string().optional(),
  ceremonyNotes: z.string().optional(),
  providingCeremonyMicrophones: z.boolean().default(false),
  whoNeedsMic: z.string().optional(),
  ceremonyDjNotes: z.string().optional(),

  // Add-ons
  uplighting: z.boolean().default(false),
  uplightingColor: z.string().optional(),
  uplightingNotes: z.string().optional(),
  photoBooth: z.boolean().default(false),
  photoBoothLocation: z.string().optional(),
  logoDesign: z.string().optional(),
  photoText: z.string().optional(),
  photoColorScheme: z.string().optional(),
  ledRingColor: z.string().optional(),
  backdrop: z.string().optional(),
  photoEmailLocation: z.string().optional(),

  // Cocktail Hour
  cocktailHourMusic: z.boolean().default(false),
  cocktailHourLocation: z.string().optional(),
  cocktailMusic: z.string().optional(),
  cocktailNotes: z.string().optional(),

  // Introductions and Special Dances
  introductionsTime: z.string().optional(),
  parentsEntranceSong: z.string().optional(),
  weddingPartyIntroSong: z.string().optional(),
  coupleIntroSong: z.string().optional(),
  weddingPartyIntroductions: z.string().optional(),
  specialDances: z.string().optional(),
  otherNotes: z.string().optional(),

  // Reception Events
  dinnerMusic: z.string().optional(),
  dinnerStyle: z.string().optional(),
  welcomeBy: z.string().optional(),
  blessingBy: z.string().optional(),
  toasts: z.string().optional(),
  receptionNotes: z.string().optional(),
  exitDescription: z.string().optional(),
  otherComments: z.string().optional(),

  // The Music
  spotifyPlaylists: z.string().optional(),
  lineDances: z.string().optional(),
  takeRequests: z.string().optional(),
  musicNotes: z.string().optional(),
});

export type PlanningFormSchema = z.infer<typeof planningFormSchema>;

// Default form values
export const defaultPlanningFormValues: PlanningFormSchema = {
  // General Information
  mailingAddress: '',
  guestCount: 0,
  coordinatorEmail: '',
  photographerEmail: '',
  videographerEmail: '',
  isWedding: true,

  // Ceremony
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

  // Add-ons
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

  // Cocktail Hour
  cocktailHourMusic: false,
  cocktailHourLocation: '',
  cocktailMusic: '',
  cocktailNotes: '',

  // Introductions and Special Dances
  introductionsTime: '',
  parentsEntranceSong: '',
  weddingPartyIntroSong: '',
  coupleIntroSong: '',
  weddingPartyIntroductions: '',
  specialDances: '',
  otherNotes: '',

  // Reception Events
  dinnerMusic: '',
  dinnerStyle: '',
  welcomeBy: '',
  blessingBy: '',
  toasts: '',
  receptionNotes: '',
  exitDescription: '',
  otherComments: '',

  // The Music
  spotifyPlaylists: '',
  lineDances: '',
  takeRequests: '',
  musicNotes: '',
};
