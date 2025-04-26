import { useGetCreatorInfo } from "./use-get-creator-info";

export const useGetCreatorContractAddress = () => {
  const creatorInfo = useGetCreatorInfo();

  const contractAddress =
    creatorInfo.status === "success" ? creatorInfo.contractAddress : undefined;

  return contractAddress;
};