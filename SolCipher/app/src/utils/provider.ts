import { AnchorProvider, web3 } from '@project-serum/anchor';

/**
 * Obtain an Anchor provider configured for the current network.  In a real
 * application you would supply the wallet returned from the wallet adapter.
 * This stub returns a read‑only provider bound to the cluster specified in
 * `VITE_SOLANA_NETWORK`.  For signed transactions the wallet must implement
 * the `AnchorWallet` interface (see @project-serum/anchor docs).
 */
export function getProvider(): AnchorProvider {
  const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
  // Use the standard RPC URL for the selected cluster
  const url = network.startsWith('http') ? network : `https://api.${network}.solana.com`;
  const connection = new web3.Connection(url, 'confirmed');
  // When integrating with wallet adapter, pass the wallet here
  const wallet: any = {};
  return new AnchorProvider(connection, wallet, {});
}