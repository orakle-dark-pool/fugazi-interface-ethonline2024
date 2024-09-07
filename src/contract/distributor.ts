import { useState } from "react";
import { ethers } from "ethers";
import { DISTRIBUTOR_ABI } from "../abi/distributor";
import { executeContractCall, getProviderAndSigner } from "./util";
import { DISTRIBUTOR_ADDRESS } from "../assets/address";

export const useDistributor = () => {
  const distributorAddress = DISTRIBUTOR_ADDRESS;
  const [isPending, setIsPending] = useState(false);

  const claimTestToken = async (tokenAddress: string) => {
    return executeContractCall(setIsPending, async () => {
      const { signer } = await getProviderAndSigner();
      const contract = new ethers.Contract(
        distributorAddress,
        DISTRIBUTOR_ABI,
        signer
      );
      const result = await contract.claim(tokenAddress);
      console.log("result", `claim`, result);
      return result;
    });
  };

  return {
    claimTestToken,
    isPending,
  };
};
