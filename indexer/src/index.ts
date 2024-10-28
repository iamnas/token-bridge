import { Contract, JsonRpcProvider, Wallet, Interface } from "ethers";
import Bull from "bull";
import dotenv from "dotenv";
import { ABI } from "./contract";

dotenv.config();


const providerBNB = new JsonRpcProvider(process.env.BNB_RPC);
const providerAVA = new JsonRpcProvider(process.env.AVA_RPC);
// const providerSepolia = new JsonRpcProvider(process.env.SEPOLIA_RPC);

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

// Define Redis connection for Bull queue
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
};
const bridgeQueue = new Bull("bridgeQueue", redisConfig);

// Define the contract ABI interface for log parsing
const bridgeInterface = new Interface(ABI);

// Define event listening function with `getLogs` and `parseLog`
const listenToBridgeEventsBNB = async (
  provider: JsonRpcProvider,
  contract: Contract,
  isBNB: boolean
) => {

  const filter =  contract.filters.Bridge();
    // console.log(filter);

  try {
    const logs = await provider.getLogs({ ...filter, fromBlock: "latest" });

    // console.log(logs);
    

    logs.forEach((log) => {
      const parsedLog = bridgeInterface.parseLog(log);

      if (parsedLog) {
        // console.log(parsedLog.args);

        const tokenAddress = parsedLog.args[0].toString();
        const amount = parsedLog.args[1].toString();
        const sender = parsedLog.args[2].toString();

        console.log(`Bridge event detected: ${amount} tokens from ${sender}`);

        bridgeQueue.add({
          tokenAddress: tokenAddress.toString(),
          amount: amount.toString(),
          sender: sender.toString(),
          isBNB,
        });
      }
    });
  } catch (error) {
    console.error("Error retrieving or parsing logs:", error);
    return;

  }
};

// Define event listening function with `getLogs` and `parseLog`
const listenToBridgeEventsAVA = async (
  provider: JsonRpcProvider,
  contract: Contract,
  isBNB: boolean
) => {
  // console.log("listenToBridgeEventsAVA",provider);

  const filter = contract.filters.Bridge();
  //   console.log(filter);

  try {
    const logs = await provider.getLogs({ ...filter, fromBlock: "latest" });

    logs.forEach((log) => {
      const parsedLog = bridgeInterface.parseLog(log);

      if (parsedLog) {
        console.log(parsedLog.args);

        const tokenAddress = parsedLog.args[0].toString();
        const amount = parsedLog.args[1].toString();
        const sender = parsedLog.args[2].toString();

        console.log(`Bridge event detected: ${amount} tokens from ${sender}`);

        bridgeQueue.add({
          tokenAddress: tokenAddress.toString(),
          amount: amount.toString(),
          sender: sender.toString(),
          isBNB,
        });
      }
    });
  } catch (error) {
    console.error("Error retrieving or parsing logs:", error);
    return;
  }
};

// Set up polling listeners
setInterval(
  () => listenToBridgeEventsBNB(providerBNB, contractBNB, false),
  2500
); // 10 sec polling
setInterval(
  () => listenToBridgeEventsAVA(providerAVA, contractAVA, true),
  9000
); // 10 sec polling

// Process jobs in bridgeQueue
bridgeQueue.process(async (job) => {
  const { tokenAddress, amount, sender, isBNB } = job.data;
  console.log(
    `Processing bridge event for ${amount} tokens from ${sender} ${tokenAddress} ${isBNB}`
  );

  try {
    await transferToken(isBNB, tokenAddress, amount, sender);
    return { success: true };
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    throw error;
  }
});

// Function to transfer token on respective chain
const transferToken = async (
  isBNB: boolean,
  tokenAddress: string,
  amount: string,
  sender: string
) => {
  try {
    const RPC = isBNB ? process.env.BNB_RPC : process.env.AVA_RPC;
    const pk = process.env.PK!;
    const contractAddress = isBNB
      ? process.env.BRIDGE_CONTRACT_ADDRESS_BNB!
      : process.env.BRIDGE_CONTRACT_ADDRESS_AVA!;

    const provider = new JsonRpcProvider(RPC);
    const wallet = new Wallet(pk, provider);
    const contractInstance = new Contract(contractAddress, ABI, wallet);

    const testToken = isBNB
      ? process.env.TESTTOKEN_BNB!
      : process.env.TESTTOKEN_AVA!;

    const tx = await contractInstance.redeem(testToken, sender, amount);
    await tx.wait();
    console.log(`Successfully transferred ${amount} tokens to ${sender}`);
  } catch (error) {
    console.log("Transfer token error:", error);
    throw error;
  }
};
