import { BrowserProvider } from "ethers";

export const getProviderAndSigner = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
};

const handleError = (error: Error, message: string) => {
  console.error(message, error);
  throw error;
};

export const executeContractCall = async (
  setIsPending: (isPending: boolean) => void,
  callback: () => Promise<any>
) => {
  setIsPending(true);
  try {
    return await callback();
  } catch (error) {
    handleError(error, "Error during contract interaction");
  } finally {
    setIsPending(false);
  }
};
