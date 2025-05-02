import dotenv from "dotenv";
dotenv.config();

import { JsonRpcProvider, Contract } from "ethers";
import { ABI } from "../contract/ABI";
import { listenToBridgeEvents } from "./eventListener";
import { startProcessingQueue } from "./processor";

const providerBNB = new JsonRpcProvider(process.env.BNB_RPC!);
const providerAVA = new JsonRpcProvider(process.env.AVA_RPC!);

const contractBNB = new Contract(
  process.env.BRIDGE_CONTRACT_ADDRESS_BNB!,
  ABI,
  providerBNB
);
const contractAVA = new Contract(
  process.env.BRIDGE_CONTRACT_ADDRESS_AVA!,
  ABI,
  providerAVA
);

// Start Event Listeners
setInterval(() => listenToBridgeEvents(providerBNB, contractBNB, "BNB"), 5000);
setInterval(() => listenToBridgeEvents(providerAVA, contractAVA, "Avalanche"), 5000);

// Start Queue Processor
startProcessingQueue();
