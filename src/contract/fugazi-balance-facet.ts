import { FUGAZI_BALANCE_FACET_ABI } from "../abi/fugazi-balance-facet";
import { EncryptedUint32, FhenixClient, EncryptionTypes } from "fhenixjs";
import { JsonRpcProvider, ethers } from "ethers";
import { useState } from "react";
import { CORE_ADDRESS } from "../assets/address";
import { FUGAZI_ABI } from "../abi/fugazi";
import { executeContractCall, getProviderAndSigner } from "./util";

export const useFugaziBalanceFacetContract = () => {
  const provider = new JsonRpcProvider("https://api.helium.fhenix.zone/");
  const client = new FhenixClient({ provider });

  const [isPending, setIsPending] = useState(false);

  const withdraw = async (typedAmount: number, tokenAddress: string) => {
    return executeContractCall(setIsPending, async () => {
      const { signer } = await getProviderAndSigner();
      const recipient = await signer.getAddress();
      const contract = new ethers.Contract(
        CORE_ADDRESS,
        FUGAZI_BALANCE_FACET_ABI,
        signer
      );
      const encrypted: EncryptedUint32 = await client.encrypt(
        typedAmount,
        EncryptionTypes.uint32
      );
      const result = await contract.withdraw(
        recipient,
        tokenAddress,
        encrypted
      );
      console.log("Result", result);
      return result;
    });
  };

  const deposit = async (typedAmount: number, tokenAddress: string) => {
    return executeContractCall(setIsPending, async () => {
      const { signer } = await getProviderAndSigner();
      const contract = new ethers.Contract(
        CORE_ADDRESS,
        FUGAZI_BALANCE_FACET_ABI,
        signer
      );
      const tokenContract = new ethers.Contract(
        tokenAddress,
        FUGAZI_ABI,
        signer
      );
      console.log("Token Contract", tokenAddress);

      const encrypted: EncryptedUint32 = await client.encrypt(
        typedAmount,
        EncryptionTypes.uint32
      );
      // Approve the token transfer
      await executeContractCall(setIsPending, async () => {
        const approve = await tokenContract.approveEncrypted(
          CORE_ADDRESS,
          encrypted
        );
        console.log("Approve", approve);
      });

      const result = await contract.deposit(
        signer.getAddress(),
        tokenAddress,
        encrypted
      );
      console.log("Result", result);
      return result;
    });
  };

  return {
    isPending,
    withdraw,
    deposit,
  };
};
