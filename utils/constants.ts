import lotteryABI from "./Lottery.json";

export const CONTRACT_ADDRESS = "0xB2bC35266Fd3236965e296EeFEA77B7782173Aa2";
export const CONTRACT_ABI = lotteryABI.abi;

export const getCurrentLotteryId = async (contract: any) => {
  return await contract.methods.lotteryId().call();
};

export const getLotteryDetails = async (contract: any, lotteryId: number) => {
  return await contract.methods.lotteries(lotteryId).call();
};