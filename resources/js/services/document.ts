import apiClient from './api-client';

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: {
    document: any;
    parsed_data: {
      extracted_fields: Record<string, any>;
      confidence_score: number;
      raw_text: string;
      analysis_timestamp: string;
    };
    s3_url: string;
  };
}

export interface EventDocument {
  id: number;
  event_id: number;
  document_type: 'pdf' | 'email' | 'note';
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  parsed_data: any;
  is_processed: boolean;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

export interface GetEventDocumentsResponse {
  success: boolean;
  data: EventDocument[];
}

export interface NotesParseResponse {
  success: boolean;
  message: string;
  data: {
    extracted_fields: Record<string, any>;
    confidence_score: number;
    raw_text: string;
    analysis_timestamp: string;
    ai_model: string;
    ai_response: string;
  };
}

class DocumentService {
  /**
   * Upload and parse a document (for DJ/Admin users)
   */
  async uploadAndParse(
    eventId: number,
    file: File,
    documentType: 'pdf' | 'email' | 'note'
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('event_id', eventId.toString());
    formData.append('document', file);
    formData.append('document_type', documentType);

    const response = await apiClient.post(`/events/${eventId}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload and parse a document (for Client users)
   */
  async uploadAndParseForClient(
    eventId: number,
    file: File,
    documentType: 'pdf' | 'email' | 'note'
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('event_id', eventId.toString());
    formData.append('document', file);
    formData.append('document_type', documentType);

    const response = await apiClient.post(`/client/events/${eventId}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Get all documents for an event
   */
  async getEventDocuments(eventId: number): Promise<GetEventDocumentsResponse> {
    const response = await apiClient.get(`/events/${eventId}/documents`);
    return response.data;
  }

  /**
   * Parse notes text using AI (for DJ/Admin users)
   */
  async parseNotes(eventId: number, notes: string): Promise<NotesParseResponse> {
    const response = await apiClient.post(`/events/${eventId}/documents/parse-notes`, {
      event_id: eventId,
      notes: notes,
    });
    return response.data;
  }

  /**
   * Parse notes text using AI (for Client users)
   */
  async parseNotesForClient(eventId: number, notes: string): Promise<NotesParseResponse> {
    const response = await apiClient.post(`/client/events/${eventId}/documents/parse-notes`, {
      event_id: eventId,
      notes: notes,
    });
    return response.data;
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  }
}

export const documentService = new DocumentService();
