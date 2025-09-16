# ACTA Frontend

Next.js application for creating and managing verifiable credentials on Stellar blockchain.

## Quick Start

```bash
cd dApp-ACTA/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- 🔗 Stellar wallet integration (Freighter, Albedo, xBull, Lobstr, Rabet)
- 🔑 API key generation and management
- 📜 Create verifiable credentials
- ✅ Verify credentials on blockchain
- 📱 Responsive design

## Usage

1. **Connect Wallet**: Connect your Stellar wallet
2. **Generate API Key**: Create authenticated API key
3. **Create Credentials**: Issue new credentials on blockchain
4. **Verify**: Check credential validity

## Configuration

The API endpoint is configured via the `NEXT_PUBLIC_API_URL` environment variable in `.env`:

```bash
# Production (default)
NEXT_PUBLIC_API_URL=https://acta-api.vercel.app/api

# For local development
# NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Tech Stack

- Next.js 15.5.0
- TypeScript
- Tailwind CSS
- Stellar SDK
- Stellar Wallet Kit