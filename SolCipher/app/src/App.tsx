import React, { useState } from 'react';
import Upload from './pages/Upload';
import View from './pages/View';

/**
 * Root component with simple tab navigation between the Upload and View pages.
 */
export default function App() {
  const [page, setPage] = useState<'upload' | 'view'>('upload');

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '1rem' }}>
        <button onClick={() => setPage('upload')} disabled={page === 'upload'}>
          Upload
        </button>{' '}
        <button onClick={() => setPage('view')} disabled={page === 'view'}>
          View
        </button>
      </header>
      {page === 'upload' ? <Upload /> : <View />}
    </div>
  );
}