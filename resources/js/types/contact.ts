/**
 * Contact related types and interfaces
 */

export interface ContactFormData {
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}
