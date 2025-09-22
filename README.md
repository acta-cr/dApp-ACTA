# ACTA dApp

Decentralized application for creating and managing verifiable credentials on Stellar blockchain with Passkey authentication.

## Key Features

**Passkey Authentication**
- Secure biometric authentication using WebAuthn
- No passwords or seed phrases required
- Automatic Stellar wallet creation via passkey
- Cross-device synchronization

**Verifiable Credentials**
- Create tamper-proof credentials on Stellar blockchain
- Public verification system without requiring login
- Support for multiple credential types and claims
- Blockchain-based authenticity guarantees

**Modern dApp Experience**
- Responsive design with particle background effects
- Real-time credential verification
- Secure API key management
- Seamless user experience

## Quick Start

```bash
cd dApp-ACTA/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

### Authentication Flow
1. **Visit Application**: Navigate to root URL (/)
2. **Passkey Login**: Click "Authenticate with Passkey"
3. **Biometric Verification**: Use fingerprint, face recognition, or PIN
4. **Automatic Wallet Creation**: Stellar wallet generated from passkey
5. **Access Dashboard**: Redirected to /dashboard upon successful authentication

### Route Structure
```
/ (root)                    - Login with passkey authentication
├── /dashboard              - Main dashboard (requires authentication)
├── /dashboard/profile      - User profile and wallet information
├── /dashboard/api-key      - API key generation and management
├── /dashboard/credentials  - Create new verifiable credentials
├── /dashboard/my-credentials - View and manage your credentials
├── /dashboard/search-credential - Search for credentials
└── /verify                 - Public credential verification (no login required)
```

### Passkey Technology
- **WebAuthn Standard**: Industry-standard biometric authentication
- **Cross-Platform**: Works on desktop, mobile, and tablets
- **Secure**: Private keys never leave your device
- **Convenient**: No passwords to remember or lose
- **Stellar Integration**: Passkey directly generates Stellar wallet

## Credential Verification

The `/verify` endpoint allows anyone to verify credential authenticity:

**URL Format**: `/verify?id=CREDENTIAL_ID&issuer=ISSUER_ADDRESS`

**Example**: `https://acta.com/verify?id=cert123&issuer=GABCD...`

**Verification Process**:
1. Queries Stellar blockchain for credential data
2. Validates issuer authenticity
3. Checks expiration status
4. Displays credential details and verification status

**Use Cases**:
- Employers verifying job candidate certifications
- Universities checking transfer student credentials
- Organizations validating partner certifications
- Government agencies verifying compliance documents

## Configuration

Environment variables in `.env`:

```bash
# API Backend URL
NEXT_PUBLIC_API_URL=https://acta.up.railway.app/v1

# For local development
# NEXT_PUBLIC_API_URL=http://localhost:8000/v1
```

## Development

### Build Commands
```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint check
npm run typecheck  # TypeScript validation
```

### Project Structure
```
src/
├── app/                    # Next.js 15 app router
│   ├── page.tsx           # Login page (root)
│   ├── dashboard/         # Protected dashboard routes
│   └── verify/            # Public credential verification
├── components/
│   ├── layout/            # Sidebar and layout components
│   ├── modules/           # Feature-specific components
│   │   ├── auth/          # Passkey authentication
│   │   ├── credentials/   # Credential management
│   │   └── dashboard/     # Dashboard components
│   ├── ui/                # Reusable UI components
│   └── magicui/           # Special effects (particles)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── providers/             # React context providers
└── services/              # API communication
```

## Tech Stack

**Frontend Framework**
- Next.js 15.5.0 with App Router
- TypeScript for type safety
- Tailwind CSS for styling

**Authentication & Blockchain**
- WebAuthn for passkey authentication
- Stellar SDK for blockchain interactions
- Custom wallet management via passkeys

**UI/UX**
- Radix UI components
- Lucide React icons
- Custom particle effects
- Glassmorphism design

**Development Tools**
- ESLint for code quality
- Prettier for formatting
- Turbopack for fast builds

## Security Features

**Passkey Security**
- Biometric data never leaves device
- Private keys stored in secure hardware
- Phishing-resistant authentication
- No passwords to compromise

**Blockchain Security**
- All credentials immutable on Stellar
- Cryptographic proof of authenticity
- Decentralized verification
- No single point of failure

**Application Security**
- HTTPS-only communication
- Secure token management
- Input validation and sanitization
- Protected route authorization

## Browser Support

**Passkey Requirements**:
- Chrome 67+ (Windows, macOS, Android)
- Safari 14+ (macOS, iOS)
- Firefox 60+ (Windows, macOS)
- Edge 79+ (Windows)

**Platform Support**:
- Windows Hello (Windows 10+)
- Touch ID/Face ID (macOS/iOS)
- Android Biometric (Android 9+)
- Security keys (FIDO2/U2F)

## Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

**Production URL**: TBD
**Staging URL**: TBD

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is part of the ACTA ecosystem for verifiable credentials on Stellar blockchain.