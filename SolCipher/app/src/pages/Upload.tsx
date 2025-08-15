import React from 'react';
import MultiFileUploader from '../components/MultiFileUploader';

/**
 * Upload page – wraps the multi file uploader in a simple layout.
 */
export default function UploadPage() {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>Upload Files</h2>
      <p>Select one or more files and share them with a recipient’s wallet address.</p>
      <MultiFileUploader />
    </div>
  );
}