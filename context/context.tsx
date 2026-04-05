import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback
} from "react";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import toast from "react-hot-toast";
import { createLotteryContract } from "../utils/lotteryContract";

export interface Context {
  connectWallet: () => void;
  enterLottery: () => void;
  pickWinner: () => void;
  withdrawPot: () => void;
  address: string;
  lotteryPot: string;
  lotteryPlayers: string[];
  lastWinner: string;
  lotteryId: number;
  selectedLotteryId: number;
  setSelectedLotteryId: (id: number) => void;
  withdrawalEndTime: number;
  transactionHistory: any[];
}

export const AppContext = createContext<Context | null>(null);

export const AppProvider = ({ children }) => {
  const [address, setAddress] = useState<string>("");
  const [lotteryContract, setLotteryContract] = useState<Contract>(null);
  const [lotteryPot, setLotteryPot] = useState<string>("");
  const [lotteryPlayers, setLotteryPlayers] = useState<string[]>([]);
  const [lastWinner, setLastWinner] = useState<string>("");
  const [lotteryId, setLotteryId] = useState<number>(1);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number>(1);
  const [withdrawalEndTime, setWithdrawalEndTime] = useState<number>(0);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0xaa36a7",
            chainName: "Sepolia",
            nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          }],
        });
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await switchToSepolia();
        await window.ethereum.request({ method: "eth_requestAccounts" });
        fetchConnectedWallet();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const fetchConnectedWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]);
        const contract = createLotteryContract(web3);
        setLotteryContract(contract);
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const loadLotteryData = useCallback(async (id: number) => {
    if (!lotteryContract) return;
    try {
      const potInWEI = await lotteryContract.methods.getBalance().call();
      setLotteryPot(Web3.utils.fromWei(potInWEI, "ether"));

      const players = await lotteryContract.methods.getPlayers().call();
      setLotteryPlayers(players);

      const winners = await lotteryContract.methods.getWinners().call();
      setLastWinner(winners.length > 0 ? winners[winners.length - 1] : "");

      const endTime = await lotteryContract.methods.potWidthdrawalEndTime().call();
      setWithdrawalEndTime(parseInt(endTime));
    } catch (error) {
      console.error(error);
    }
  }, [lotteryContract]);

  const addToHistory = (type: string, txHash: string) => {
    setTransactionHistory(prev => [{
      id: Date.now(),
      type,
      txHash,
      lotteryId,
      timestamp: Date.now()
    }, ...prev].slice(0, 10));
  };

  const enterLottery = async () => {
    if (!lotteryContract) return;
    try {
      const tx = await lotteryContract.methods.enter().send({
        from: address,
        value: Web3.utils.toWei("0.01", "ether"),
        gas: 3000000,
      });
      toast.success(`🎟️ 成功進入 Lottery #${lotteryId}`);
      addToHistory("Enter", tx.transactionHash);
      await loadLotteryData(lotteryId);
    } catch (error) {
      toast.error("交易被拒絕");
    }
  };

    const pickWinner = async () => {
    if (!lotteryContract || selectedLotteryId !== lotteryId) return;

    try {
      const tx = await lotteryContract.methods.startPickingWinner().send({
        from: address,
        gas: 3000000,
        gasPrice: null
      });

      toast.success(`🔥 Lottery #${lotteryId} 正在抽獎...`);

      // 加強版輪詢 + 強制更新 UI
      let attempts = 0;
      const pollWinner = setInterval(async () => {
        attempts++;
        try {
          const events = await lotteryContract.getPastEvents("WinnerPicked", {
            fromBlock: "latest",
            toBlock: "latest"
          });

          if (events.length > 0) {
            clearInterval(pollWinner);
            toast.success(`🏆 Lottery #${lotteryId} 抽獎完成！`);

            // 強制更新所有狀態
            await updateCurrentLottery();
            await loadLotteryData(lotteryId);

            // 額外保險：強制重新渲染
            setTimeout(() => {
              updateCurrentLottery();
            }, 1500);
          }
        } catch (e) {}

        // 最多輪詢 30 秒
        if (attempts > 15) {
          clearInterval(pollWinner);
          toast.error("輪詢超時，請手動 F5 刷新");
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("只有合約擁有者才能抽獎");
    }
  };

  const withdrawPot = async () => {
    if (!lotteryContract) return;
    try {
      const tx = await lotteryContract.methods.withdrawPot().send({
        from: address,
        gas: 3000000,
      });
      toast.success(`💰 Lottery #${lotteryId} 獎金已提領！`);
      addToHistory("Withdraw", tx.transactionHash);
      await loadLotteryData(lotteryId);
    } catch (error) {
      toast.error("交易被拒絕");
    }
  };

  useEffect(() => {
    if (lotteryContract) loadLotteryData(selectedLotteryId);
  }, [lotteryContract, selectedLotteryId]);

  return (
    <AppContext.Provider
      value={{
        connectWallet,
        enterLottery,
        pickWinner,
        withdrawPot,
        address,
        lotteryPot,
        lotteryPlayers,
        lastWinner,
        lotteryId,
        selectedLotteryId,
        setSelectedLotteryId,
        withdrawalEndTime,
        transactionHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

function updateCurrentLottery() {
  throw new Error("Function not implemented.");
}
