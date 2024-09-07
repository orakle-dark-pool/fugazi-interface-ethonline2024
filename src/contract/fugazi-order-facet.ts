import { FUGAZI_ORDER_FACET_ABI } from "../abi/fugazi-order-facet";
import { POOL_REGISTRY_FACET_ABI } from "../abi/pool-registry-facet";

import { VIEWER_ABI } from "../abi/viewer";
import {
  FhenixClient,
  EncryptionTypes,
  EncryptedUint32,
  getPermit,
} from "fhenixjs";
import { BrowserProvider, ethers } from "ethers";
import { useState } from "react";
import {
  CORE_ADDRESS,
  EUR_ADDRESS,
  FUGAZI_ADDRESS,
  USD_ADDRESS,
} from "../assets/address";
import { executeContractCall, getProviderAndSigner } from "./util";

export const useFugaziOrderFacetContract = () => {
  const [isPending, setIsPending] = useState(false);
  const provider = new BrowserProvider(window.ethereum);
  const client = new FhenixClient({ provider });

  const submitSwapOrder = async (
    typedAmount: number,
    inputToken: string,
    outputToken: string,
    noiseAmplitude?: number
  ) => {
    return executeContractCall(setIsPending, async () => {
      const { signer } = await getProviderAndSigner();
      let poolId;
      let inputTokenAddress;
      let outputTokenAddress;
      switch (inputToken) {
        case "FGZ":
          inputTokenAddress = FUGAZI_ADDRESS;
          break;
        case "USD":
          inputTokenAddress = USD_ADDRESS;
          break;
        case "EUR":
          inputTokenAddress = EUR_ADDRESS;
          break;
      }
      switch (outputToken) {
        case "FGZ":
          outputTokenAddress = FUGAZI_ADDRESS;
          break;
        case "USD":
          outputTokenAddress = USD_ADDRESS;
          break;
        case "EUR":
          outputTokenAddress = EUR_ADDRESS;
          break;
      }

      const viewerContract = new ethers.Contract(
        CORE_ADDRESS,
        VIEWER_ABI,
        signer
      );
      poolId = await viewerContract.getPoolId(
        inputTokenAddress,
        outputTokenAddress
      );

      await executeContractCall(setIsPending, async () => {
        const actionContract = new ethers.Contract(
          CORE_ADDRESS,
          FUGAZI_ORDER_FACET_ABI,
          signer
        );

        const amountIn = typedAmount;
        let inputAmount =
          inputTokenAddress < outputTokenAddress // is inputToken == tokenX?
            ? (2 << 30) * 0 + (amountIn << 15)
            : (2 << 30) * 0 + amountIn;

        const payPrivacyFeeInX =
          inputTokenAddress < outputTokenAddress ? true : false;

        inputAmount = payPrivacyFeeInX
          ? inputAmount + (noiseAmplitude << 32)
          : inputAmount + 2147483648 + (noiseAmplitude << 32);

        const encryptedAmountIn = await client.encrypt(
          inputAmount,
          EncryptionTypes.uint64
        );
        const amountX = inputTokenAddress < outputTokenAddress ? amountIn : 0;
        const amountY = inputTokenAddress < outputTokenAddress ? 0 : amountIn;
        const isNoiseReferenceX = inputTokenAddress < outputTokenAddress;
        const isSwap = true;

        const encryptedPackedOrder = await packAndEncryptOrder(
          amountX,
          amountY,
          noiseAmplitude,
          isNoiseReferenceX,
          isSwap
        );

        const result = await actionContract.submitOrder(
          poolId,
          encryptedPackedOrder
        );
        console.log("swap order result", result);
        return result;
      });
    });
  };

  const addLiquidity = async (
    typedAmount0: number,
    inputToken0: string,
    typedAmount1: number,
    inputToken1: string,
    noiseAmplitude?: number
  ) => {
    const { signer } = await getProviderAndSigner();
    let poolId;
    let inputTokenAddress;
    let outputTokenAddress;
    switch (inputToken0) {
      case "FGZ":
        inputTokenAddress = FUGAZI_ADDRESS;
        break;
      case "USD":
        inputTokenAddress = USD_ADDRESS;
        break;
      case "EUR":
        inputTokenAddress = EUR_ADDRESS;
        break;
    }
    switch (inputToken1) {
      case "FGZ":
        outputTokenAddress = FUGAZI_ADDRESS;
        break;
      case "USD":
        outputTokenAddress = USD_ADDRESS;
        break;
      case "EUR":
        outputTokenAddress = EUR_ADDRESS;
        break;
    }

    const viewerContract = new ethers.Contract(
      CORE_ADDRESS,
      VIEWER_ABI,
      signer
    );
    setIsPending(true);
    try {
      const permit = await getPermit(CORE_ADDRESS, provider);
      client.storePermit(permit);
      poolId = await viewerContract.getPoolId(
        inputTokenAddress,
        outputTokenAddress,
        permit
      );
      console.log("poolId", poolId);
    } catch (error) {
      console.error("Error", error);
      return "error";
    } finally {
      setIsPending(false);
    }

    const actionContract = new ethers.Contract(
      CORE_ADDRESS,
      FUGAZI_ORDER_FACET_ABI,
      signer
    );

    const amount0 = typedAmount0;
    const amount1 = typedAmount1;

    let inputAmount =
      inputTokenAddress < outputTokenAddress
        ? (amount0 << 15) + amount1 + 1073741824
        : (amount1 << 15) + amount0 + 1073741824;

    const payPrivacyFeeInX =
      inputTokenAddress < outputTokenAddress ? true : false;

    inputAmount = payPrivacyFeeInX
      ? inputAmount + (noiseAmplitude << 32)
      : inputAmount + 2147483648 + (noiseAmplitude << 32);

    const isNoiseReferenceX = inputTokenAddress < outputTokenAddress;
    const isSwap = false;

    const encryptedPackedOrder = await packAndEncryptOrder(
      amount0,
      amount1,
      noiseAmplitude,
      isNoiseReferenceX,
      isSwap
    );

    setIsPending(true);
    try {
      const result = await actionContract.submitOrder(
        poolId,
        encryptedPackedOrder
      );
      console.log("swap order result", result);
      return result;
    } catch (error) {
      console.error("Error", error);
      return "error";
    } finally {
      setIsPending(false);
    }
  };

  const removeLiquidity = async (
    tokenAddress1: string,
    tokenAddress2: string
  ) => {
    const { signer } = await getProviderAndSigner();

    const viewerContract = new ethers.Contract(
      CORE_ADDRESS,
      VIEWER_ABI,
      signer
    );

    const actionContract = new ethers.Contract(
      CORE_ADDRESS,
      FUGAZI_ORDER_FACET_ABI,
      signer
    );
    setIsPending(true);
    try {
      const permit = await getPermit(CORE_ADDRESS, provider);
      client.storePermit(permit);

      const poolId = await viewerContract.getPoolId(
        tokenAddress1,
        tokenAddress2,
        permit
      );

      const encrypted: EncryptedUint32 = await client.encrypt(
        100,
        EncryptionTypes.uint32
      );

      const result = await actionContract.removeLiquidity(poolId, encrypted);
      console.log("remove liquidity result", result);
      return result;
    } catch (error) {
      console.error("Remove Liquidity Error", error);
      return "error";
    } finally {
      setIsPending(false);
    }
  };

  const packAndEncryptOrder = async (
    amountX: number,
    amountY: number,
    noiseAmplitude?: number,
    isNoiseReferenceX?: boolean,
    isSwap?: boolean
  ) => {
    // Validate the input values to ensure they fit in their respective bit sizes
    if (amountX < 0 || amountX > 32767) {
      throw new Error("amountX must be between 0 and 32767 (15 bits)");
    }
    if (amountY < 0 || amountY > 32767) {
      throw new Error("amountY must be between 0 and 32767 (15 bits)");
    }
    if (noiseAmplitude < 0 || noiseAmplitude > 2047) {
      throw new Error("noiseAmplitude must be between 0 and 2047 (11 bits)");
    }

    // Pack the values into a single bigint
    let packedAmount: bigint = BigInt(0);

    // Pack amountY (15 bits)
    packedAmount |= BigInt(amountY);

    // Pack amountX (15 bits), shift it by 15
    packedAmount |= BigInt(amountX) << BigInt(15);

    // Pack isSwap (1 bit), shift by 30 (isSwap = true means 0 for swap, 1 for addLiquidity)
    packedAmount |= BigInt(isSwap ? 0 : 1) << BigInt(30);

    // Pack isNoiseReferenceX (1 bit), shift by 31
    packedAmount |= BigInt(isNoiseReferenceX ? 1 : 0) << BigInt(31);

    // Pack noiseAmplitude (11 bits), shift by 32
    packedAmount |= BigInt(noiseAmplitude) << BigInt(32);

    // Log the packed amount in binary
    console.log("Packed amount in binary: ", packedAmount.toString(2));

    // Encrypt the packed amount using fhenixjs.encrypt_euint64()
    const encryptedPackedAmount = await client.encrypt(
      Number(packedAmount),
      EncryptionTypes.uint64
    );

    return encryptedPackedAmount;
  };

  return { isPending, submitSwapOrder, addLiquidity, removeLiquidity };
};
