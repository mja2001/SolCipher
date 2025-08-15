import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { encryptFile } from '../utils/crypto';
import { uploadBatchToIPFS } from '../utils/ipfs';
import { createBatchShareOnChain } from '../utils/program';

/**
 * Component for uploading one or more files, encrypting them client‑side,
 * uploading the encrypted blobs to IPFS and creating a batch share on‑chain.
 */
export default function MultiFileUploader() {
  const { publicKey, signMessage } = useWallet();
  const [files, setFiles] = useState<File[]>([]);
  const [recipient, setRecipient] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [status, setStatus] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    setStatus('');
    if (!files.length || !publicKey || !signMessage) {
      alert('Please select file(s) and connect your wallet.');
      return;
    }
    if (!recipient) {
      alert('Please enter a recipient wallet address.');
      return;
    }

    try {
      setStatus('🔑 Deriving encryption key…');
      // derive an AES key from a wallet signature
      const keyBytes = await signMessage(new TextEncoder().encode('batch-encryption-key'));

      // Encrypt each file
      setStatus('🔐 Encrypting files…');
      const encryptedFiles: any[] = [];
      for (const f of files) {
        const encrypted = await encryptFile(f, keyBytes);
        encryptedFiles.push(encrypted);
      }

      // Upload to IPFS
      setStatus('📤 Uploading encrypted files to IPFS…');
      const manifestCid = await uploadBatchToIPFS(encryptedFiles, {});

      // Create batch share on chain
      setStatus('🧠 Creating batch share on‑chain…');
      const recipientPk = new PublicKey(recipient);
      const fileCount = files.length;
      const expiresAt = Math.floor(Date.now() / 1000) + expiryDays * 86400;
      await createBatchShareOnChain(manifestCid, recipientPk, fileCount, expiresAt);

      setStatus(`✅ Uploaded ${fileCount} file(s) and shared with ${recipient}.`);
      setFiles([]);
    } catch (err) {
      console.error(err);
      setStatus('❌ Error uploading files');
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <input type="file" multiple onChange={handleFileChange} />
      <br />
      <input
        type="text"
        placeholder="Recipient wallet address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ width: '100%', margin: '0.5rem 0' }}
      />
      <br />
      <label>
        Expiry (days):{' '}
        <input
          type="number"
          min={1}
          value={expiryDays}
          onChange={(e) => setExpiryDays(parseInt(e.target.value, 10) || 1)}
        />
      </label>
      <br />
      <button onClick={handleUpload} disabled={!files.length}>
        Upload &amp; Share
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}