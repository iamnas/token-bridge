import { JsonRpcProvider, Interface, Contract } from "ethers";
import { ABI } from "../contract/ABI";
import { prisma } from "../shared/prisma";
import { bridgeQueue } from "../shared/redis";

const bridgeInterface = new Interface(ABI);

export const listenToBridgeEvents = async (
  provider: JsonRpcProvider,
  contract: Contract,
  network: "BNB" | "Avalanche"
) => {
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

  if (lastProcessedBlock.lastProcessedBlock >= latestBlock) return;

  const filter = contract.filters.Bridge();
  const logs = await provider.getLogs({
    ...filter,
    fromBlock: lastProcessedBlock.lastProcessedBlock + 1,
    toBlock: "latest",
  });

  for (const log of logs) {
    const parsedLog = bridgeInterface.parseLog(log);

    const txhash = log.transactionHash.toLowerCase();
    const tokenAddress = parsedLog.args[0].toString();
    const amount = parsedLog.args[1].toString();
    const sender = parsedLog.args[2].toString();

    await bridgeQueue.add({
      txhash,
      tokenAddress,
      amount,
      sender,
      network,
    });
  }

  await prisma.networkStatus.update({
    where: { network },
    data: { lastProcessedBlock: latestBlock },
  });
};
