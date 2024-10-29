import { Contract, JsonRpcProvider, Wallet, Interface } from "ethers";
import Bull from "bull";
import dotenv from "dotenv";
import { ABI } from "./contract";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const providerBNB = new JsonRpcProvider(process.env.BNB_RPC);
const providerAVA = new JsonRpcProvider(process.env.AVA_RPC);

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

const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || "",
  },
};
const bridgeQueue = new Bull("bridgeQueue", redisConfig);

const bridgeInterface = new Interface(ABI);

const listenToBridgeEvents = async (
  provider: JsonRpcProvider,
  contract: Contract,
  network: "BNB" | "Avalanche"
) => {
  try {
    let lastProcessedBlock = await prisma.networkStatus.findUnique({
      where: { network },
    });
    const latestBlock = await provider.getBlockNumber();

    if (!lastProcessedBlock) {
      const data = await prisma.networkStatus.create({
        data: { network, lastProcessedBlock: latestBlock },
      });
      lastProcessedBlock = { ...data };
    }

    if (lastProcessedBlock.lastProcessedBlock >= latestBlock) {
      return;
    }

    const filter = contract.filters.Bridge();
    const logs = await provider.getLogs({
      ...filter,
      fromBlock: lastProcessedBlock.lastProcessedBlock + 1,
      toBlock: "latest",
    });

    logs.forEach(async (log) => {
      const parsedLog = bridgeInterface.parseLog(log);

      if (parsedLog) {
        const txhash = log.transactionHash;
        const tokenAddress = parsedLog.args[0].toString();
        const amount = parsedLog.args[1].toString();
        const sender = parsedLog.args[2].toString();

        bridgeQueue.add({
          txhash: txhash.toLowerCase(),
          tokenAddress: tokenAddress,
          amount: amount,
          sender: sender,
          network,
        });
      }
    });

    await prisma.networkStatus.update({
      where: { network },
      data: { lastProcessedBlock: latestBlock },
    });
  } catch (error) {
    throw error;
  }
};

// Set up polling listeners
setInterval(() => listenToBridgeEvents(providerBNB, contractBNB, "BNB"), 5000);
setInterval(
  () => listenToBridgeEvents(providerAVA, contractAVA, "Avalanche"),
  5000
);

bridgeQueue.process(async (job) => {
  const { txhash, tokenAddress, amount, sender, network } = job.data;

  try {
    let transaction = await prisma.transactionData.findUnique({
      where: { txHash: txhash },
    });

    if (!transaction) {
      transaction = await prisma.transactionData.create({
        data: {
          txHash: txhash,
          tokenAddress,
          amount,
          sender,
          network,
          isDone: false,
        },
      });
    }

    if (transaction.isDone) {
      return { success: true, message: "Transaction already processed" };
    }

    await transferToken(network === "BNB", tokenAddress, amount, sender);
    await prisma.transactionData.update({
      where: { txHash: txhash },
      data: { isDone: true },
    });

    return { success: true };
  } catch (error) {
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
    const RPC = !isBNB ? process.env.BNB_RPC : process.env.AVA_RPC;
    const pk = process.env.PK!;
    const contractAddress = !isBNB
      ? process.env.BRIDGE_CONTRACT_ADDRESS_BNB!
      : process.env.BRIDGE_CONTRACT_ADDRESS_AVA!;

    const provider = new JsonRpcProvider(RPC);
    const wallet = new Wallet(pk, provider);
    const contractInstance = new Contract(contractAddress, ABI, wallet);

    const testToken = !isBNB
      ? process.env.TESTTOKEN_BNB!
      : process.env.TESTTOKEN_AVA!;

    const tx = await contractInstance.redeem(testToken, sender, amount);
    await tx.wait();
  } catch (error) {
    throw error;
  }
};
