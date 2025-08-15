import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
// The IDL for the SolCipher program.  When you run `anchor build` a JSON
// description of the program will be generated in the `target/idl` folder.
// Copy that file into the `idl` directory of the repository and adjust
// the import path below accordingly.  For now this import will throw until
// the file exists.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import idl from '../../../idl/soldocs.json';
import { getProvider } from './provider';

const programID = new web3.PublicKey(import.meta.env.PROGRAM_ID as string);

/**
 * Create a Program instance using the injected provider and compiled IDL.  This
 * helper ensures that all transactions are signed by the connected wallet.
 */
function getProgram(): Program {
  const provider: AnchorProvider = getProvider();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Program(idl as any, programID, provider);
}

/**
 * Register a single document on‑chain.  This helper mirrors the example in
 * the README and is provided for completeness.  It generates a new keypair
 * for the document account and stores the IPFS hash and expiry.
 */
export async function registerDocument(ipfsHash: string, expiresAt: number): Promise<void> {
  const program = getProgram();
  const document = web3.Keypair.generate();
  await program.methods
    .registerDocument(ipfsHash, new BN(expiresAt))
    .accounts({
      document: document.publicKey,
      owner: program.provider.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([document])
    .rpc();
}

/**
 * Create a batch share on‑chain.  Given a manifest CID, recipient public key,
 * file count and optional expiry timestamp, this will call the
 * `create_batch_share` instruction on the SolCipher program.  The program is
 * responsible for allocating the `BatchShare` account and recording the
 * relevant metadata.
 */
export async function createBatchShareOnChain(
  manifestCid: string,
  recipient: web3.PublicKey,
  fileCount: number,
  expiry?: number
): Promise<void> {
  const program = getProgram();
  await program.methods
    // expiry may be undefined; Anchor will interpret null as `None`
    .createBatchShare(manifestCid, recipient, fileCount, expiry ?? null)
    .rpc();
}