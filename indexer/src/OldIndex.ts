import { Contract, JsonRpcProvider, Wallet } from "ethers";
import Bull from "bull";
import dotenv from "dotenv";
import { ABI } from "./contract";

dotenv.config();

const providerBNB = new JsonRpcProvider(process.env.BNB_RPC);
const providerAVA = new JsonRpcProvider(process.env.AVA_RPC);

const contractBNB = new Contract(process.env.BRIDGE_CONTRACT_ADDRESS_BNB!, ABI, providerBNB);

const contractAVA = new Contract(process.env.BRIDGE_CONTRACT_ADDRESS_AVA!, ABI, providerAVA);

// Configure Redis connection for Bull
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
};
const bridgeQueue = new Bull("bridgeQueue", redisConfig);

// Listen for Bridge events
contractBNB.on("Bridge", async (tokenAddress, amount, sender) => {
  console.log(`Bridge event detected: ${amount} tokens from ${sender}`);

  const data = {
    tokenAddress: tokenAddress.toString(),
    amount: amount.toString(),
    sender: sender.toString(),
    isBNB: false,
  };

  // Add event data to queue
  await bridgeQueue.add(data);
});

// Listen for Bridge events
contractAVA.on("Bridge", async (tokenAddress, amount, sender) => {
  console.log(`Bridge event detected: ${amount} tokens from ${sender}`);

  const data = {
    tokenAddress: tokenAddress.toString(),
    amount: amount.toString(),
    sender: sender.toString(),
    isBNB: true,
  };

  // Add event data to queue
  await bridgeQueue.add(data);
});

bridgeQueue.process(async (job) => {
  const { tokenAddress, amount, sender, isBNB } = job.data;

  console.log(
    `Processing bridge event for ${amount} tokens from ${sender} ${tokenAddress} ${isBNB}`
  );

  try {
    // Attempt the transfer
    await transferToken(isBNB, tokenAddress, amount, sender);

    // Remove job from queue on successful completion
    return { success: true };
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);

    // If an error occurs, rethrow it for Bull to handle retries
    throw error;
  }
});

const transferToken = async (
  isBNB: boolean,
  tokenAddress: string,
  amount: string,
  sender: string
) => {
  try {
    const RPC = isBNB ? process.env.BNB_RPC : process.env.AVA;
    const pk = process.env.PK!;
    const contractAddress = isBNB
      ? process.env.BRIDGE_CONTRACT_ADDRESS_BNB!
      : process.env.BRIDGE_CONTRACT_ADDRESS_AVA!;

    const provider = new JsonRpcProvider(RPC);
    const wallet = new Wallet(pk, provider);
    const contractInstance = new Contract(contractAddress, ABI, wallet);

    const testToken = isBNB? process.env.TESTTOKEN_BNB!: process.env.TESTTOKEN_AVA!;

    const tx = await contractInstance.redeem(testToken, sender,amount);
    await tx.wait();
  } catch (error) {
    console.log("Transfer token error:", error);
    throw error; // Re-throw to trigger retry
  }
};