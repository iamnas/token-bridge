import { Contract, Wallet, JsonRpcProvider } from "ethers";
import { ABI } from "../contract/ABI";

export const transferToken = async (
  isBNB: boolean,
  amount: string,
  sender: string,
  nonce: number
) => {
  const RPC = !isBNB ? process.env.BNB_RPC! : process.env.AVA_RPC!;
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

  const tx = await contractInstance.redeem(testToken, sender, amount, nonce);
  await tx.wait();
};
