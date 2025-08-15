SolCipher
===========

SolCipher is a decentralised application (dApp) built on the Solana blockchain that enables secure, encrypted document sharing between wallets.  It combines client‑side encryption, decentralised storage via IPFS and on‑chain access control so that files can be shared privately without relying on a central server.  This repository provides a complete reference implementation of both the React front‑end and the Solana program.  It supports uploading individual files **or** batches of files at once, stores the encrypted files on IPFS and records access permissions on‑chain.

## Features

* **End‑to‑End Encryption** – All files are encrypted in the browser using AES‑GCM before they ever leave the client【450654620246674†L11-L17】.
* **Decentralised Storage** – Encrypted blobs (and batch manifest files) are stored on IPFS via Web3.Storage【450654620246674†L13-L18】.
* **On‑Chain Access Control** – A Solana program written in Rust/Anchor stores document metadata, manages access lists and supports batch sharing.  Owners can grant and revoke access to specific wallet addresses and set expiry times.
* **Wallet‑Based Sharing** – Documents are shared securely between Solana wallets; decryption keys are derived from a wallet signature and never stored on a server.  Only the intended recipient can decrypt the files.
* **Expiry & Revocation** – Owners can set an expiry timestamp for each share.  A cleanup script periodically revokes expired access entries【450654620246674†L139-L149】.
* **Batch Upload** – Upload multiple files at once.  A manifest JSON file containing metadata for each encrypted file is uploaded to IPFS【462778180827301†L0-L17】.  A single on‑chain record points to this manifest and records the total number of files, saving transaction fees.
* **Automation** – A Node.js script is provided to revoke expired access entries and can be scheduled with cron【450654620246674†L139-L149】.

## Architecture Overview

````text
┌──────────────┐    1. User selects files            ┌─────────────┐
│  Web Wallet  │────────────────────────────────────▶│ React Front │
│  (Phantom)   │                                     │  End       │
└──────────────┘                                     └─────────────┘
        │                                               │
        │ 2. Sign message / derive key                 │ 3. Encrypt files in browser
        ├──────────────────────────────────────────────▶│ (AES‑GCM)
        │                                               │
        │ 4. Upload encrypted blobs to IPFS            │ 5. Upload manifest (batch)
        └──────────────────────────────────────────────▶│ (Web3.Storage)
                                                        │
                                                        ▼
                                          ┌──────────────────────────┐
                                          │  Solana Program (Rust)   │
                                          │ – Stores metadata (CID)  │
                                          │ – Tracks access lists    │
                                          │ – Supports expiry & rev. │
                                          └──────────────────────────┘
                                                        │
                                                        ▼
                                        6. Recipient checks on‑chain access
                                                        │
                                                        ▼
                                        7. Download encrypted files from IPFS
                                                        │
                                                        ▼
                                        8. Decrypt in browser with wallet key
````

## Tech Stack

| Layer        | Technology                 | Purpose                                                |
|--------------|---------------------------|---------------------------------------------------------|
| Blockchain   | **Solana**                | Fast, low‑cost smart‑contract execution                |
| Smart‑Contract | **Rust + Anchor**        | Defines document/batch data structures & access logic  |
| Frontend     | **React + Vite**          | Web UI for uploading, viewing and sharing documents    |
| Encryption   | **Web Crypto API (AES‑GCM)** | Client‑side encryption and decryption                |
| Storage      | **IPFS via Web3.Storage** | Decentralised file hosting                             |
| Wallet       | **Phantom + Wallet Adapter** | Authentication and key derivation                   |
| Automation   | **Node.js Script**        | Scheduled access revocation                            |

## Installation

### Prerequisites

* [Node.js](https://nodejs.org/) ≥ 18 and either **npm** or **yarn**【450654620246674†L71-L90】
* [Solana CLI](https://docs.solana.com/cli/install-solana-cli) for deploying the program【450654620246674†L75-L100】
* [Anchor](https://www.anchor-lang.com/docs/installation) for building the Rust program
* A Phantom wallet (or another Solana wallet) for testing

### Clone and Install

```bash
# Clone this repository
git clone https://github.com/your‑username/SolCipher.git
cd SolCipher

# Install front‑end dependencies
cd app && yarn install  # or npm install

# (Optional) install project‑level dependencies for scripts
cd .. && yarn global add ts-node
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your credentials.  The front‑end uses
environment variables prefixed with `VITE_` so that Vite can expose them at build time.

```.env.example
VITE_WEB3_STORAGE_TOKEN=your_web3_storage_api_key
VITE_SOLANA_NETWORK=devnet
PROGRAM_ID=SoLD0cs11111111111111111111111111111111111111
ANCHOR_WALLET=/path/to/your/id.json
```

### Building the Solana Program

From the `programs/SolCipher` directory run the following commands to build and deploy the program.  This assumes you have Anchor installed and a funded keypair in your Solana CLI config.

```bash
cd programs/SolCipher
anchor build
anchor deploy

# Note the new program ID printed after deploy and update the PROGRAM_ID in your `.env` file.
```

### Running the Front‑end

```bash
cd app
yarn dev  # or npm run dev

# The app will be available at http://localhost:5173 (default for Vite).
```

### Cleaning Up Expired Access

To automatically revoke expired documents/batches, run the cleanup script.  You can execute it manually or schedule it via cron.

```bash
ts-node scripts/cleanup.ts
```

## Repository Structure

````text
SolCipher/
├── app/                   # React + Vite front‑end
│   ├── src/
│   │   ├── components/    # Reusable React components (e.g. MultiFileUploader)
│   │   ├── pages/         # Top‑level pages for upload & view
│   │   ├── utils/         # Client‑side crypto, IPFS helpers, Solana client
│   │   ├── App.tsx        # App root with simple navigation
│   │   └── main.tsx       # Vite entry point
│   ├── package.json       # Front‑end dependencies & scripts
│   ├── vite.config.ts     # Vite configuration
│   └── tsconfig.json      # TypeScript configuration
│
├── programs/SolCipher/    # Rust/Anchor program
│   ├── Cargo.toml         # Rust package definition
│   ├── Anchor.toml        # Anchor configuration
│   └── src/lib.rs         # Smart contract code
│
├── scripts/cleanup.ts     # Node script to revoke expired access
├── idl/                   # Directory for generated Anchor IDL
├── .env.example           # Example environment variables
├── .gitignore             # Files/directories ignored by Git
├── LICENSE                # Open source licence (MIT)
└── README.md              # Project overview and setup (this file)
````

## Usage

### Uploading a Single Document

1. Connect your wallet in the web UI.
2. Select a file to upload and choose a recipient’s wallet address.
3. Optionally set an expiry time.  If omitted the document will be available indefinitely until revoked.
4. The file is encrypted in the browser, uploaded to IPFS and a record is stored on Solana with its CID and expiry【450654620246674†L123-L131】.
5. The recipient can later decrypt the file using their wallet.

### Uploading Multiple Documents (Batch Share)

1. Select multiple files in the **MultiFileUploader** component.
2. A single AES key is derived from your wallet signature and used to encrypt all files.  Each file’s IV and metadata are recorded.
3. Each encrypted file is uploaded to IPFS and the resulting CIDs are collected in a `manifest.json` file.
4. The manifest is uploaded to IPFS and a `BatchShare` record is created on‑chain via the `create_batch_share` instruction【462778180827301†L0-L17】【879866446900270†L1-L14】.
5. Recipients fetch the manifest, download all encrypted files and decrypt them using the same derived key.

### Viewing a Shared Document or Batch

1. Navigate to the **View** page and enter the document public key (or batch public key).
2. The app checks on‑chain access lists using `fetchDocAccess` and fetches the document metadata【450654620246674†L123-L138】.
3. If permitted, the encrypted file(s) are downloaded from IPFS and decrypted in the browser.

## Contributing

Pull requests are welcome!  If you plan a significant change, please open an issue first to discuss your idea.  Make sure to format code with Prettier and run `yarn lint` before submitting.

## Licence

This project is licensed under the MIT License—see the `LICENSE` file for details.