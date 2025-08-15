import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchDocAccess, fetchDocumentMeta } from '../utils/solanaClient';
import { decryptFile } from '../utils/crypto';
import { getFromIPFS } from '../utils/ipfs';

/**
 * View page – allows a user to enter a document public key (or batch key) and
 * decrypt the file(s) if they have permission.  For simplicity this page
 * currently handles a single document.  You could extend it to handle batch
 * shares by fetching and parsing the manifest from IPFS.
 */
export default function ViewPage() {
  const { publicKey, signMessage } = useWallet();
  const [docPubkey, setDocPubkey] = useState('');
  const [status, setStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleView = async () => {
    setStatus('');
    setDownloadUrl('');

    if (!docPubkey || !publicKey || !signMessage) {
      alert('Wallet not connected or document key missing.');
      return;
    }

    try {
      setStatus('🔒 Checking access…');
      const hasAccess = await fetchDocAccess(docPubkey, publicKey);
      if (!hasAccess) {
        setStatus('❌ Access denied');
        return;
      }

      setStatus('📄 Fetching metadata…');
      const { ipfsHash, iv } = await fetchDocumentMeta(docPubkey);
      if (!ipfsHash) {
        setStatus('❌ Document not found');
        return;
      }

      setStatus('⬇️ Downloading encrypted file…');
      const encryptedBlob = await getFromIPFS(ipfsHash);

      setStatus('🔓 Decrypting file…');
      const keyBytes = await signMessage(new TextEncoder().encode('doc-encryption-key'));
      const decryptedBlob = await decryptFile(encryptedBlob, keyBytes, iv);

      const url = URL.createObjectURL(decryptedBlob);
      setDownloadUrl(url);
      setStatus('✅ File ready to download');
    } catch (err) {
      console.error(err);
      setStatus('❌ Error decrypting file');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>View Shared Document</h2>
      <input
        type="text"
        placeholder="Document Public Key"
        value={docPubkey}
        onChange={(e) => setDocPubkey(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <button onClick={handleView}>View &amp; Decrypt</button>
      {status && <p>{status}</p>}
      {downloadUrl && (
        <p>
          <a href={downloadUrl} download="decrypted-file" target="_blank" rel="noopener noreferrer">
            ⬇️ Download Decrypted File
          </a>
        </p>
      )}
    </div>
  );
}