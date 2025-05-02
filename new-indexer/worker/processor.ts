import { bridgeQueue } from "../shared/redis";
import { prisma } from "../shared/prisma";
import { transferToken } from "../shared/utils";

export const startProcessingQueue = () => {
  bridgeQueue.process(async (job) => {
    const { txhash, tokenAddress, amount, sender, network } = job.data;

    let transaction = await prisma.transactionData.findUnique({
      where: { txHash: txhash },
    });

    if (!transaction) {
      const nonceRecord = await prisma.nonce.upsert({
        where: { network },
        update: { nonce: { increment: 1 } },
        create: { network, nonce: 1 },
      });

      transaction = await prisma.transactionData.create({
        data: {
          txHash: txhash,
          tokenAddress,
          amount,
          sender,
          network,
          isDone: false,
          nonce: nonceRecord.nonce,
        },
      });
    }

    if (transaction.isDone) return;

    await transferToken(network === "BNB", amount, sender, transaction.nonce);

    await prisma.transactionData.update({
      where: { txHash: txhash },
      data: { isDone: true },
    });
  });
};
