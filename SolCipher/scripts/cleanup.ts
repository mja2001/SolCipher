import { AnchorProvider, Program, web3, BN } from '@project-serum/anchor';
// Import the generated IDL for the SolCipher program
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import idl from '../idl/soldocs.json';
import { getProvider } from '../app/src/utils/provider';
import dotenv from 'dotenv';

// Load environment variables from a .env file if present
dotenv.config({ path: '.env' });

// Read the program ID from the environment or fall back to the ID declared
// in the Anchor.toml.  The cleanup script runs off‑chain and therefore must
// know the program ID ahead of time.
const programID = new web3.PublicKey(process.env.PROGRAM_ID || 'SoLD0cs11111111111111111111111111111111111111');

async function runCleanup() {
  const provider: AnchorProvider = getProvider();
  const program: Program = new Program(idl as any, programID, provider);

  console.log('Fetching all documents…');
  const docs = await program.account.document.all();
  const now = Math.floor(Date.now() / 1000);

  for (const doc of docs) {
    if (doc.account.expiresAt < now) {
      console.log(`⏰ Expired document: ${doc.publicKey.toBase58()}`);

      // Find all access accounts pointing to this document
      const accessList = await program.account.access.all([
        {
          memcmp: {
            offset: 8, // discriminator + document pubkey starts at offset 8
            bytes: doc.publicKey.toBase58(),
          },
        },
      ]);

      for (const access of accessList) {
        if (!access.account.revoked) {
          console.log(` Revoking access for ${access.account.grantee.toBase58()}`);
          await program.methods
            .revokeAccess()
            .accounts({
              access: access.publicKey,
              owner: doc.account.owner,
            })
            .rpc();
        }
      }
    }
  }

  console.log('✅ Cleanup complete.');
}

runCleanup().catch((err) => {
  console.error('❌ Error running cleanup:', err);
});