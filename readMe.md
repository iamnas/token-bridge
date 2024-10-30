# Token Bridge

A cross-chain token bridge allowing users to deposit and retrieve tokens across the Avalanche and BNB networks. This project includes smart contracts, an indexer, and a React-based frontend to facilitate seamless token transfers between blockchains.

## Project Structure

- **contracts**: Contains the `BridgeContract.sol` smart contract, which defines the locking and unlocking logic for tokens across networks.
- **indexer**: Listens for events from the smart contract, handles token transfers, and manages a queue with retry mechanisms for robust transaction processing.
- **frontend**: A React application utilizing `wagmi` to interact with the smart contract. Supports both read and write functionalities for a smooth user experience.

## Features

- **Cross-Chain Transfers**: Lock tokens on Avalanche and release the equivalent amount on BNB, and vice versa.
- **Event Indexing**: Reliable indexing service to monitor contract events and initiate token transfers.
- **User Interface**: Simple, intuitive UI built with React, using `wagmi` for contract interaction.

## Demo Video

[Watch the Demo Video](https://res.cloudinary.com/debysbb33/video/upload/v1730282338/upxzgh6p3yle8ui7ihyc.mp4) to see the Token Bridge in action.

## Getting Started

### Prerequisites

- Node.js and npm installed
- Solidity compiler
- Avalanche and BNB network setup

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iamnas/token-bridge.git
   cd token-bridge
   ```

2. **Install Dependencies:**
   - For the `indexer`:
     ```bash
     cd indexer
     npm install
     ```
   - For the `frontend`:
     ```bash
     cd frontend
     npm install
     ```

### Usage

1. **Deploy Smart Contract**: Deploy `BridgeContract.sol` on Avalanche and BNB networks.
   
2. **Run Indexer**: Start the indexer to monitor events and handle transfers.
   ```bash
   cd indexer
   npm start
   ```

3. **Start Frontend**: Launch the frontend to interact with the bridge.
   ```bash
   cd frontend
   npm run dev
   ```

## Technologies Used

- Solidity
- Node.js
- React and `wagmi`
- Avalanche and BNB blockchains
