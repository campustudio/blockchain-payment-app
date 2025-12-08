# PayGuard - Blockchain Payment Platform

A comprehensive blockchain payment platform integrating **Web3 cryptocurrency payments** and **AI-powered fraud detection** (Corgi Labs style). Built for demonstration purposes to showcase payment optimization, risk analytics, and multi-chain payment processing.

## 🎯 Project Overview

This application combines two key business scenarios:

1. **SmartPay** - Web3 Payment Gateway

   - Multi-chain cryptocurrency support (Ethereum, Polygon, BSC)
   - Wallet-less payment flows
   - Real-time fee calculation
   - Multiple payment methods (Crypto, Card, Bank Transfer)

2. **Corgi Labs** - Payment Risk Analytics & Fraud Detection
   - AI-powered fraud detection
   - False decline reduction
   - Real-time risk scoring (0-100)
   - Revenue impact analysis
   - Explainable AI decision-making

## ✨ Key Features

### 🔐 Web3 Wallet Integration

- MetaMask wallet connection
- Multi-chain support (Ethereum, Polygon, BSC)
- Multi-account management
- Real-time balance display
- Network switching

### 💳 Payment Processing

- **Cryptocurrency Payments**: ETH, MATIC, BNB support
- **Traditional Payments**: Credit/debit cards, bank transfers
- Blockchain toggle switch (enable/disable crypto)
- Real-time fee calculation
- Gas fee estimation

### 📊 Risk Analytics Dashboard

- Transaction monitoring with risk scores
- Fraud detection metrics
- False decline analysis
- Revenue impact calculation
- Payment method performance tracking
- Risk distribution visualization

### 🎨 Modern UI/UX

- Responsive design (mobile, tablet, desktop)
- Clean Apple Pay-grade checkout interface
- Real-time data visualization
- Smooth animations and transitions
- Professional color coding for risk levels

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Custom Design System
- **State Management**: Zustand
- **Blockchain**: ethers.js v5
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Date Formatting**: date-fns

## 📁 Project Structure

```
blockchain-payment-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Header, Footer)
│   │   └── wallet/         # Wallet-related components
│   ├── hooks/              # Custom React hooks
│   │   └── useWeb3.ts      # Web3 wallet management hook
│   ├── lib/
│   │   ├── constants/      # App constants (networks, tokens, etc.)
│   │   ├── mock/           # Mock data generators
│   │   └── utils/          # Utility functions
│   ├── pages/              # Application pages
│   │   ├── Dashboard.tsx   # Transaction monitoring & risk analytics
│   │   ├── Payment.tsx     # Payment flow interface
│   │   └── Analytics.tsx   # Merchant analytics (Corgi Labs style)
│   ├── store/              # Zustand state management
│   │   ├── walletStore.ts  # Wallet state
│   │   └── paymentStore.ts # Payment/transaction state
│   ├── types/              # TypeScript type definitions
│   │   ├── web3.ts         # Blockchain-related types
│   │   └── payment.ts      # Payment-related types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension (for Web3 features)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd blockchain-payment-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📱 Pages & Features

### 1. Dashboard (Risk Analytics)

**Path**: `/dashboard`

**Features**:

- Real-time transaction monitoring
- Risk score visualization
- Fraud detection statistics
- False decline metrics
- Transaction table with filters
- Status indicators (Completed, Pending, Failed)
- Risk level color coding (Low, Medium, High, Critical)

**Key Metrics**:

- Total transactions
- Average risk score
- Fraud detection count
- False decline count

### 2. Payment Gateway

**Path**: `/payment`

**Features**:

- Blockchain payment toggle
- Multiple payment methods:
  - Cryptocurrency (ETH, MATIC, BNB)
  - Credit/Debit Card
  - Bank Transfer
- Real-time fee calculation
- Order summary with breakdown
- Security badges
- Connected wallet integration

**Payment Flow**:

1. Select payment method
2. Choose cryptocurrency (if crypto selected)
3. Enter payment amount
4. Complete payment details
5. Review order summary
6. Submit payment

### 3. Merchant Analytics

**Path**: `/analytics`

**Features**:

- Revenue metrics with trends
- Approval rate tracking
- Fraud rate monitoring
- False decline rate analysis
- Revenue impact calculator
- Risk score distribution
- Payment method performance
- Optimization recommendations

**Corgi Labs Highlights**:

- Net revenue protection calculation
- Prevented fraud loss estimation
- False decline revenue impact
- AI model performance insights

### 4. ML System Architecture

**Path**: `/ml-system`

**Features**:

- Complete ML pipeline visualization
- Feature engineering demonstration (100+ features)
- XGBoost/LightGBM model simulation
- SHAP explainability engine
- False Decline optimizer
- Real-time inference demo
- Model performance metrics
- Live transaction analysis

**Tech Stack Simulation**:

- **Data Layer**: Feature Store, Redis Cache (simulated)
- **Feature Engineering**: User behavior, velocity, device fingerprinting
- **Model**: Gradient Boosting Trees (simplified implementation)
- **Explainability**: SHAP values for interpretable predictions
- **Optimization**: False Decline reduction algorithm
- **Monitoring**: Real-time statistics and model drift detection

**Key Demonstrations**:

1. Select any transaction to see ML analysis
2. View SHAP feature contributions
3. Understand risk factors and protective signals
4. See False Decline optimization in action
5. Compare model confidence levels

## 🔑 Key Components

### WalletButton

Located in navigation bar, handles:

- MetaMask installation check
- Wallet connection
- Account display
- Balance display
- Disconnect functionality

### useWeb3 Hook

Custom hook for Web3 management:

- Wallet connection state
- Account changes
- Network changes
- Balance updates
- Error handling

### Transaction Generation

Mock data generator creates realistic transactions with:

- Random risk scores
- Multiple payment methods
- Fraud/non-fraud classification
- False decline simulation
- Blockchain transaction hashes (for crypto)

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#2563EB)
- **Success**: Green (#16A34A)
- **Warning**: Orange (#EA580C)
- **Danger**: Red (#DC2626)
- **Risk Levels**:
  - Low: Green
  - Medium: Yellow
  - High: Orange
  - Critical: Red

### Typography

- Headings: Semibold
- Body: Regular
- Mono: Used for addresses and transaction IDs

## 📊 Mock Data

The application uses realistic mock data for demonstration:

- **50-100 transactions** with varied risk profiles
- **6 supported merchants**
- **3 payment methods**
- **6 blockchain networks**
- **6 cryptocurrencies**

## 🔐 Security Features (Simulated)

- AI fraud detection (simulated scores)
- Real-time risk analysis
- Transaction monitoring
- False decline prevention
- Encrypted transactions (UI only)
- 24/7 fraud monitoring badge

## 🌐 Supported Networks

- **Ethereum Mainnet** (0x1)
- **Ethereum Sepolia** (0xaa36a7) - Testnet
- **Polygon Mainnet** (0x89)
- **Polygon Mumbai** (0x13881) - Testnet
- **BSC Mainnet** (0x38)
- **BSC Testnet** (0x61)

## 💰 Supported Tokens

**Native Tokens**:

- ETH (Ethereum)
- MATIC (Polygon)
- BNB (Binance Smart Chain)

**Stablecoins** (ERC-20):

- USDT (Tether)
- USDC (USD Coin)
- DAI (Dai Stablecoin)

## 📝 Interview Talking Points

### For SmartPay Position:

1. **Web3 Integration**: Experience with ethers.js, wallet connections, multi-chain support
2. **Payment UX**: Clean, Apple Pay-grade checkout interface
3. **State Management**: Zustand for efficient state handling
4. **TypeScript**: Strongly typed throughout the application
5. **Responsive Design**: Mobile-first approach with TailwindCSS

### For Corgi Labs Position:

1. **Risk Analytics**: Real-time risk scoring and visualization
2. **Data Presentation**: Clear metrics for fraud, false declines, revenue impact
3. **ML Model Interpretation**: Explainable AI concepts (feature importance)
4. **Performance Metrics**: Approval rates, fraud rates, revenue protection
5. **Business Value**: ROI calculation, revenue optimization recommendations

## 🎯 Demo Scenario

1. **Connect Wallet**: Click "Connect Wallet" to connect MetaMask
2. **View Dashboard**: See real-time transaction monitoring with risk scores
3. **Analyze Metrics**: Review fraud detection and false decline statistics
4. **Process Payment**: Navigate to Payment page, select method, enter amount
5. **View Analytics**: Check merchant analytics for revenue insights

## 🚧 Future Enhancements

- [ ] Real blockchain integration (currently simulated)
- [ ] Backend API integration
- [ ] Real-time websocket updates
- [ ] Advanced charting (Recharts integration)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export reports (CSV/PDF)
- [ ] Custom date range filtering
- [ ] Transaction search/filtering
- [ ] Email notifications

## 📄 License

This project is created for demonstration purposes.

## 👨‍💻 Author

**Chris Du (Hailong Du)**

Created as a portfolio demonstration project showcasing:

- Web3 payment integration
- AI-powered risk analytics
- Modern React development
- Professional UI/UX design
- TypeScript best practices

---

**Note**: This is a frontend demonstration project. All blockchain interactions and AI risk scores are simulated for demo purposes. For production use, backend integration and real ML models would be required.
