import express from "express";
import cors from "cors";
import { config } from "dotenv";
config();

import { Contract, ethers, Interface, JsonRpcProvider, Wallet } from "ethers";
import Web3 from "web3";

import {ABI,REEDEMTYPE} from './contract';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Success",
  });
});

app.post("/api/v1/redeem/sepolia", async (req, res) => {

  const web3 = new Web3();

  const logData = req?.body?.logs?.[0];

 try {
  if (logData) {
    const decodedData = web3.eth.abi.decodeParameters(
      ["address", "uint256", "address"],
      logData.data
    );

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

  const web3 = new Web3();
  const logData = req?.body?.logs?.[0];

  if (logData) {
    const decodedData = web3.eth.abi.decodeParameters(
      ["address", "uint256", "address"],
      logData.data
    );

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

    const RPC = issepolia ? process.env.BNB_RPC : process.env.SEPOLIA_RPC; 
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
    
  } catch (error) {
    console.log(error);
  }
};

app.listen(PORT, () => {
  console.log(` listening on http://localhost:${PORT}`);
});
