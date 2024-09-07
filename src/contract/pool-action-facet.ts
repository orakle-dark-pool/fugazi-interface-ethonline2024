import { POOL_ACTION_FACET_ABI } from "../abi/pool-action-facet";
import { POOL_REGISTRY_FACET_ABI } from "../abi/pool-registry-facet";
import { VIEWER_ABI } from "../abi/viewer";
import { FhenixClient, EncryptionTypes, EncryptedUint32 } from "fhenixjs";
import { BrowserProvider, ethers } from "ethers";
import { useState } from "react";
import {
  CORE_ADDRESS,
  EUR_ADDRESS,
  FUGAZI_ADDRESS,
  USD_ADDRESS,
} from "../assets/address";
import { executeContractCall, getProviderAndSigner } from "./util";

export const usePoolActionFacet = () => {
  const [isPending, setIsPending] = useState(false);
  const provider = new BrowserProvider(window.ethereum);
  const client = new FhenixClient({ provider });

  const settleSwapBatch = async (poolId: string) => {
    return executeContractCall(setIsPending, async () => {
      const { signer } = await getProviderAndSigner();
      const actionContract = new ethers.Contract(
        CORE_ADDRESS,
        POOL_ACTION_FACET_ABI,
        signer
      );
      const result = await actionContract.settleBatch(poolId);
      console.log("settle order result", result);
      return result;
    });
  };

  const claimOrder = async (poolId: string, epoch: string) => {
    const { signer } = await getProviderAndSigner();
    let unlaimedOrdersLength;
    let unclaimedOrder;
    const actionContract = new ethers.Contract(
      CORE_ADDRESS,
      POOL_ACTION_FACET_ABI,
      signer
    );
    const viewerContract = new ethers.Contract(
      CORE_ADDRESS,
      VIEWER_ABI,
      signer
    );

    setIsPending(true);
    try {
      unlaimedOrdersLength = Number(
        await viewerContract.getUnclaimedOrdersLength()
      );
      console.log("unlaimedOrdersLength", unlaimedOrdersLength);
      unclaimedOrder = await viewerContract.getUnclaimedOrder(
        unlaimedOrdersLength - 1
      );
      console.log("unclaimedOrder", unclaimedOrder);
    } catch (error) {
      console.error("Error in get unclaimed order", error);
      return "error";
    } finally {
      setIsPending(false);
    }

    setIsPending(true);
    try {
      const result = await actionContract.claim(
        //unclaimedOrder[0],
        //unclaimedOrder[1],
        poolId,
        epoch
      );
      console.log("claim order result", result);
      return result;
    } catch (error) {
      console.error(" Claim Error", error);
      return "error";
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    settleSwapBatch,
    claimOrder,
  };
};
