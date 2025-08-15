import { Web3Storage } from 'web3.storage';

// Create a Web3.Storage client using the API token provided via environment
const token = import.meta.env.VITE_WEB3_STORAGE_TOKEN as string;
const client = new Web3Storage({ token });

/**
 * Upload a single encrypted Blob to IPFS and return its CID.  A new File is
 * created with the fixed name `encrypted-file` because the file name is not
 * important for retrieval.
 */
export async function uploadToIPFS(fileBlob: Blob): Promise<string> {
  const cid = await client.put([new File([fileBlob], 'encrypted-file')]);
  return cid;
}

/**
 * Upload multiple encrypted files and a manifest describing them.  Returns
 * the CID of the uploaded manifest.  Each entry in `encryptedFiles` should
 * contain a `blob` property (Blob) and metadata fields (name, size, type, iv).
 */
export async function uploadBatchToIPFS(
  encryptedFiles: Array<{ name: string; size: number; type: string; iv: number[]; blob: Blob }>,
  encryptedKeys: Record<string, any>
): Promise<string> {
  // Upload each encrypted file separately and collect their CIDs
  const manifest = {
    files: [] as Array<{
      name: string;
      type: string;
      size: number;
      iv: number[];
      cid: string;
    }> ,
    keys: encryptedKeys,
    createdAt: new Date().toISOString(),
  };

  for (const ef of encryptedFiles) {
    const cid = await uploadToIPFS(ef.blob);
    manifest.files.push({ name: ef.name, type: ef.type, size: ef.size, iv: ef.iv, cid });
  }

  // Upload manifest.json containing metadata for the batch
  const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const manifestCid = await uploadToIPFS(manifestBlob);
  return manifestCid;
}

/**
 * Fetch an encrypted file from IPFS by CID.  Web3.Storage makes files
 * available via w3s.link subdomains.  This helper returns a Blob.
 */
export async function getFromIPFS(cid: string): Promise<Blob> {
  // Note: For a manifest CID you will receive the manifest itself; for a file
  // CID you receive the encrypted file.  This helper treats everything as a
  // single file called `encrypted-file`.
  const response = await fetch(`https://${cid}.ipfs.w3s.link/encrypted-file`);
  if (!response.ok) {
    throw new Error('Failed to fetch from IPFS');
  }
  return await response.blob();
}