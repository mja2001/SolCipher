import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
// @ts-ignore
import idl from '../../../idl/soldocs.json';
import { getProvider } from './provider';

const programID = new web3.PublicKey(import.meta.env.PROGRAM_ID as string);

/**
 * Fetch whether a viewer has access to a given document.  This queries the
 * `access` accounts owned by the program and filters for a matching document
 * public key.  Returns `true` if an active (not revoked) access entry exists.
 */
export async function fetchDocAccess(docKey: string, viewer: web3.PublicKey): Promise<boolean> {
  const provider: AnchorProvider = getProvider();
  const program: Program = new Program(idl as any, programID, provider);
  const accessAccounts = await program.account.access.all([
    {
      memcmp: {
        offset: 8 + 32 + 32, // skip discriminant + doc + owner
        bytes: viewer.toBase58(),
      },
    },
  ]);
  const match = accessAccounts.find(
    (acc) => acc.account.doc.toBase58() === docKey && !acc.account.revoked
  );
  return !!match;
}

/**
 * Fetch document metadata.  This retrieves the on‑chain `document` account
 * associated with `docKey` and returns the stored IPFS hash.  The IV is not
 * stored on‑chain in this simple implementation; instead the decrypt page
 * derives the IV from the manifest or defaults to zeroes.
 */
export async function fetchDocumentMeta(
  docKey: string
): Promise<{ ipfsHash: string; iv: Uint8Array }> {
  const provider: AnchorProvider = getProvider();
  const program: Program = new Program(idl as any, programID, provider);
  // Fetch the document account.  This will throw if the account does not exist.
  const doc = await program.account.document.fetch(docKey as any);
  return { ipfsHash: doc.ipfsHash, iv: new Uint8Array(12) };
}