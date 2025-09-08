import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNotification } from '@/hooks';
import { documentService } from '@/services';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  onDocumentProcessed?: (parsedData: any) => void;
  isClientUser?: boolean;
}

interface UploadState {
  isUploading: boolean;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onDocumentProcessed,
  isClientUser = false,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    isProcessing: false,
    progress: 0,
    error: null,
    success: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const { addNotification } = useNotification();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadState(prev => ({ ...prev, error: 'Please select a PDF file' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setUploadState(prev => ({ ...prev, error: 'File size must be less than 10MB' }));
        return;
      }
      setSelectedFile(file);
      setUploadState(prev => ({ ...prev, error: null }));
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setUploadState(prev => ({ ...prev, error: 'Please select a file' }));
      return;
    }

    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      // Upload and parse document
      const response = isClientUser 
        ? await documentService.uploadAndParseForClient(eventId, selectedFile, 'pdf')
        : await documentService.uploadAndParse(eventId, selectedFile, 'pdf');

      clearInterval(progressInterval);

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        isProcessing: true,
        progress: 95,
      }));
      
      // Add a progress simulation for long-running operations
      const processingProgressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 2, 95), // Increment progress but don't reach 100%
        }));
      }, 2000);

      // Simulate processing time
      setTimeout(() => {
        clearInterval(processingProgressInterval);
        
        setUploadState(prev => ({
          ...prev,
          isProcessing: false,
          progress: 100,
          success: true,
        }));

        // Handle different response structures for client vs DJ/Admin
        const parsedData = response.data.parsed_data || (response.data as any).ai_analysis;
        setParsedData(parsedData);
        setShowResults(true);

        const confidenceScore = parsedData.confidence_score || 0;
        const fieldCount = Object.keys(parsedData.extracted_fields || {}).length;
        
        if (confidenceScore > 0) {
          addNotification({
            type: 'success',
            title: 'Document Processed Successfully!',
            message: `AI extracted ${fieldCount} fields with ${confidenceScore.toFixed(1)}% confidence.`,
          });
        } else {
          addNotification({
            type: 'warning',
            title: 'Document Processed with Limited Success',
            message: `Document was uploaded but AI analysis had issues. ${fieldCount} fields were extracted using fallback methods.`,
          });
        }

        // Don't automatically call onDocumentProcessed here
        // Only call it when user clicks "Apply to Forms" button
      }, 1500);

    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        isProcessing: false,
        error: error.response?.data?.message || 'Upload failed. Please try again.',
      }));

      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.response?.data?.message || 'Failed to upload document. Please try again.',
      });
    }
  }, [selectedFile, eventId, addNotification]);

  const handleClose = useCallback(() => {
    if (!uploadState.isUploading && !uploadState.isProcessing) {
      setUploadState({
        isUploading: false,
        isProcessing: false,
        progress: 0,
        error: null,
        success: false,
      });
      setSelectedFile(null);
      setParsedData(null);
      setShowResults(false);
      onClose();
    }
  }, [uploadState.isUploading, uploadState.isProcessing, onClose]);

  const handleApplyToForms = useCallback(() => {
    if (parsedData && onDocumentProcessed) {
      onDocumentProcessed(parsedData);
      handleClose();
    }
  }, [parsedData, onDocumentProcessed, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-900/70 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand to-brand-dark px-6 py-4 text-secondary">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Upload & Parse Document</h3>
              </div>
              <button
                onClick={handleClose}
                disabled={uploadState.isUploading || uploadState.isProcessing}
                className="rounded-full p-1 text-secondary hover:bg-secondary hover:bg-opacity-20 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-secondary/80">
              Upload your wedding planning document and let AI extract the information for you
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {!showResults ? (
              <>
                {/* File Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select PDF File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{selectedFile.name}</span>
                      <span className="text-gray-400">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {uploadState.error && (
                  <div className="mb-4 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-700">{uploadState.error}</span>
                  </div>
                )}

                {/* Progress Bar */}
                {(uploadState.isUploading || uploadState.isProcessing) && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>
                        {uploadState.isUploading ? 'Uploading...' : 'Processing with AI...'}
                      </span>
                      <span>{uploadState.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-brand to-brand-dark h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleClose}
                    disabled={uploadState.isUploading || uploadState.isProcessing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadState.isUploading || uploadState.isProcessing}
                    className="px-4 py-2 text-sm font-medium text-secondary bg-brand border border-transparent rounded-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 flex items-center space-x-2"
                  >
                    {uploadState.isUploading || uploadState.isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {uploadState.isUploading ? 'Uploading...' : 'Processing with AI...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Upload & Parse</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Results Display */
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Document Successfully Processed!
                  </h4>
                  <p className="text-sm text-gray-600">
                    AI extracted information with{' '}
                    <span className="font-semibold text-green-600">
                      {parsedData?.confidence_score?.toFixed(1)}% confidence
                    </span>
                  </p>
                </div>

                {/* Extracted Fields Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Extracted Information</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {parsedData?.extracted_fields && Object.entries(parsedData.extracted_fields).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-gray-900 font-medium">
                          {Array.isArray(value) ? value.length : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowResults(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={handleApplyToForms}
                    className="px-4 py-2 text-sm font-medium text-secondary bg-brand border border-transparent rounded-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                  >
                    Apply to Forms
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
