import express from "express";
import cors from "cors";
import { config } from "dotenv";
config();

import { Contract, ethers, Interface, JsonRpcProvider, Wallet } from "ethers";
import Web3 from "web3";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Success",
  });
});
const ABI = [
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

interface REEDEMTYPE {
  to: string;
  value: string;
}
app.post("/api/v1/redeem/sepolia", async (req, res) => {
  // console.log("sepolia");

  const web3 = new Web3();

  const logData = req?.body?.logs?.[0];

 try {
  if (logData) {
    const decodedData = web3.eth.abi.decodeParameters(
      ["address", "uint256", "address"],
      logData.data
    );
    // console.log(
    //   "Decoded Log:",
    //   decodedData[0],
    //   decodedData[1]?.toString(),
    //   decodedData[2]
    // );

    const to = decodedData[2]?.toString() as string;
    const tokenAddress: string = decodedData[0] as string;

    if (tokenAddress && decodedData[1] && decodedData[2]) {
      if (
        tokenAddress?.toLocaleLowerCase() ==
        process.env.TESTTOKEN_SEPOLIA?.toLocaleLowerCase()
      ) {
        await transferToken(true, {
          to,
          value: decodedData[1]?.toString(),
        });
      }
    }
  }
 } catch (error) {
  console.log(error);
 }

  res.status(200).json({
    message: "successfully send",
  });
});

app.post("/api/v1/redeem/bnb", async (req, res) => {
  // console.log("bnb");

  const web3 = new Web3();

  const logData = req?.body?.logs?.[0];

  // console.log(logData);

  
  if (logData) {
    const decodedData = web3.eth.abi.decodeParameters(
      ["address", "uint256", "address"],
      logData.data
    );

    // console.log(
    //   "Decoded Log:",
    //   decodedData[0],
    //   decodedData[1]?.toString(),
    //   decodedData[2]
    // );

    const to = decodedData[2]?.toString() as string;
    const tokenAddress: string = decodedData[0] as string;

    if (tokenAddress && decodedData[1] && decodedData[2]) {
      if (
        tokenAddress?.toLocaleLowerCase() ==
        process.env.TESTTOKEN_BNB?.toLocaleLowerCase()
      ) {
        await transferToken(false, {
          to,
          value: decodedData[1]?.toString(),
        });
      }
    }
  }

  res.status(200).json({
    message: "successfully send",
  });
});

const transferToken = async (issepolia: boolean, transferData: REEDEMTYPE) => {
  try {
    // console.log(
    //   "********************************************************transferToken",
    //   issepolia,
    //   transferData
    // );

    const RPC = issepolia ? process.env.BNB_RPC : process.env.SEPOLIA_RPC; //process.env.AVALANCE;
    const pk = process.env.PK!;
    const contractAddress = issepolia
      ? process.env.BRIDGE_CONTRACT_ADDRESS_BNB!
      : process.env.BRIDGE_CONTRACT_ADDRESS_SEPOLIA!;
    const testToken = issepolia
      ? process.env.TESTTOKEN_BNB!
      : process.env.TESTTOKEN_SEPOLIA!;
    const provider = new JsonRpcProvider(RPC);
    const wallet = new Wallet(pk, provider);
    const contractInstance = new Contract(contractAddress, ABI, wallet);

    const tx = await contractInstance.redeem(
      testToken,
      transferData.to,
      transferData.value
    );
    await tx.wait();

    console.log(
      tx,
      "**********************************************************"
    );
  } catch (error) {
    console.log(error);
  }
};

app.listen(PORT, () => {
  console.log(` listening on http://localhost:${PORT}`);
});
