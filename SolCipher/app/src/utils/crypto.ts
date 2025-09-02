/**
 * Encrypt a file using an AES‑GCM key derived from the caller’s wallet.  The
 * caller is responsible for providing the raw key bytes via wallet.signMessage.
 *
 * Returns an object containing basic metadata, the IV and the encrypted blob.
 */
export async function encryptFile(file: File, keyBytes: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // Derive a 256-bit key from the provided bytes
  const hashed = await crypto.subtle.digest('SHA-256', keyBytes);
  const key = await crypto.subtle.importKey('raw', hashed, 'AES-GCM', false, [
    'encrypt',
  ]);
  const fileBuffer = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, fileBuffer);
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    iv: Array.from(iv),
    blob: new Blob([encrypted]),
  };
}

/**
 * Decrypt an encrypted Blob using the provided AES‑GCM key and IV.
 */
export async function decryptFile(
  encryptedBlob: Blob,
  keyBytes: Uint8Array,
  iv: Uint8Array
): Promise<Blob> {
  const encryptedBuffer = await encryptedBlob.arrayBuffer();
  // Use the same SHA-256 derivation as in encryptFile
  const hashed = await crypto.subtle.digest('SHA-256', keyBytes);
  const key = await crypto.subtle.importKey('raw', hashed, 'AES-GCM', false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedBuffer);
  return new Blob([decrypted]);
}