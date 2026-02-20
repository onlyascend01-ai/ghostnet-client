# GhostNet Client 

**GhostNet** is an ephemeral, peer-to-peer (P2P) encrypted chat application. It allows two users to establish a secure, direct communication tunnel via WebRTC protocols.

##  Features

- **Zero-Knowledge Architecture:** Messages flow directly between peers. The server never sees the content.
- **Ephemeral:** Refreshing the page destroys the encryption keys and chat history forever.
- **End-to-End Encryption:** Powered by WebRTC (DTLS-SRTP).
- **Cyberpunk UI:** Matrix rain aesthetics with a glassmorphism interface.

##  Quick Start

### Prerequisites
- Node.js 18+
- A running Signaling Server (see `ghostnet-server`)

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/onlyascend01-ai/ghostnet-client.git
   cd ghostnet-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables:
   Create a `.env` file in the root:
   ```env
   VITE_SIGNALING_SERVER=http://localhost:3000
   ```
   *(Or use your deployed server URL)*

4. Run locally:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **P2P Networking:** Simple-Peer (WebRTC)
- **Real-time Signaling:** Socket.io Client

##  Deployment

This client is optimized for **Vercel**.

1. Fork this repo.
2. Import to Vercel.
3. Set the `VITE_SIGNALING_SERVER` environment variable to your backend URL (e.g., Render/Railway URL).
4. Deploy.

##  Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

##  License

[MIT](LICENSE)
