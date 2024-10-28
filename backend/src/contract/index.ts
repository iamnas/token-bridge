

export const ABI = [
    {
      inputs: [
        {
          internalType: "contract IERC20",
          name: "_tokenAddress",
          type: "address",
        },
        {
          internalType: "address",
          name: "_to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
      ],
      name: "redeem",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];


export  interface REEDEMTYPE {
    to: string;
    value: string;
  }