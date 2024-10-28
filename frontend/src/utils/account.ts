// export const bnb
// export const bridge
export const BNB_BRIDGE = "0x539092e5fb1506Ff8B935C3F9e2E8b99Abd0f682";
// export const token
export const BNB_TOKEN = "0x5bf65Df18EF641F8bF0Bed5138Ee0dE95B4e6701";

// export const sepolia
// export const bridge
// export const SEPOLIA_BRIDGE = "0xd9442221dDfC61Bd779a89C4138f786d1e90ADf2";
export const AVA_BRIDGE = "0xd2b67e826936ABDc5Fd7caFa32F8d0ce1C94ed62";
// export const token
// export const SEPOLIA_TOKEN = "0x50263406D3eCf4d5e0c4D7a52Dca2f926699BFF7";
export const AVA_TOKEN = "0xf93c0f3aA7dbBEAeB106914414F366264D47bAe0";



export const TOKEN_ALLOWANCE_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const BRIDGE_ABI = [
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "bridge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
