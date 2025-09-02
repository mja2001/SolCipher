# SolCipher – Secure Document Sharing on Solana

Welcome to **SolCipher**, a privacy‑first dApp that lets you share documents securely between Solana wallets. Using client‑side AES‑256‑GCM encryption with SHA‑256‑derived keys, decentralized IPFS storage and on‑chain access control, SolCipher ensures that your sensitive files stay private — even as they traverse the public blockchain.

## 🚀 Why SolCipher?

Traditional file sharing services own your data and control access. SolCipher flips the script:

* **End‑to‑End Encryption** – Files are encrypted in your browser before upload, so only you and your recipient can decrypt them.
* **Decentralized Storage** – Encrypted files are stored on IPFS via Web3.Storage.
* **On‑Chain Access Control** – A Solana smart contract manages permissions, expiries and revocations transparently.
* **Wallet‑Based Sharing** – Share files directly to any Solana wallet address with derived keys.
* **Batch Uploads** – Upload multiple files in a single transaction using manifest CIDs.
* **Expiry & Revocation** – Automatically revoke access once a file expires or the sender decides to remove permissions.

## 🛠️ Architecture

SolCipher combines the best of cryptography, decentralized storage and smart contracts in a streamlined workflow:

```text
User selects file(s) in the browser
    ↓ (derive key from wallet signature)
Encrypt files using AES‑256‑GCM
    ↓
Upload encrypted blobs & manifest to IPFS
    ↓
Record metadata & access list on Solana
    ↓
Recipient checks on-chain permission, fetches data from IPFS and decrypts in the browser
```

## 📦 Installation

To get SolCipher running locally, follow these steps:

1. Install **Node.js ≥ 18** and **yarn** or **npm**.

2. Install the **Solana CLI** and **Anchor** for program development.

3. Clone the repo:

   ```bash
   git clone https://github.com/your‑username/SolCipher.git
   ```

4. Install front‑end dependencies:

   ```bash
   cd app && yarn install
   ```

5. Create a `.env` file (see `.env.example`) and set your Web3.Storage token and program ID.

6. Build and deploy the smart contract:

   ```bash
   cd programs/SolCipher && anchor build && anchor deploy
   ```

7. Start the front‑end:

   ```bash
   cd app && yarn dev
   ```

## 📂 Usage

### Uploading a Single Document

1. Connect your wallet (e.g., Phantom).
2. Select a file and enter the recipient’s wallet address.
3. Optionally set an expiry time.
4. Click **Upload**; the file will be encrypted, uploaded to IPFS and a record stored on‑chain.

### Batch Upload

1. Choose multiple files and provide a recipient address.
2. All files are encrypted with one key and uploaded to IPFS.
3. A manifest is created; a single batch record is stored on‑chain.

### Viewing Shared Documents

1. Enter the document or batch public key on the **View** page.
2. The app checks your access rights on‑chain.
3. If authorized, the files are downloaded and decrypted in your browser.

## 🤝 Contributing

SolCipher is open source and community‑driven. Feel free to fork the repository, fix bugs, add features or improve documentation. Pull requests and issues are warmly welcomed!

## 📄 License

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

---

