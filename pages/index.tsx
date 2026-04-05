import Header from "../components/Header";
import LotteryCard from "../components/LotteryCard";
import Table from "../components/Table";
import style from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import Web3 from "web3";
import { CONTRACT_ADDRESS, CONTRACT_ABI, getCurrentLotteryId, getLotteryDetails } from "../utils/constants";

const Home = () => {
  const [selectedLotteryId, setSelectedLotteryId] = useState<number>(2); 
  const [maxLotteryId, setMaxLotteryId] = useState<number>(2);
  const [web3, setWeb3] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);

  // Initialize web3 + contract
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI as any, CONTRACT_ADDRESS);
      setWeb3(web3Instance);
      setContract(contractInstance);

      // Get current maximum round
      getCurrentLotteryId(contractInstance).then((id: string) => {
        const numId = parseInt(id);
        setMaxLotteryId(numId);
        setSelectedLotteryId(numId); // Default to the latest round
      });
    }
  }, []);

  // Generate dropdown options (from 1 to maxLotteryId)
  const lotteryOptions = Array.from({ length: maxLotteryId }, (_, i) => i + 1);

  return (
    <div className={style.wrapper}>
      <Header />

      {/* Multi-round lottery switch dropdown */}
      <div style={{ margin: "20px auto", textAlign: "center", maxWidth: "600px" }}>
        <label style={{ marginRight: "10px", fontSize: "18px" }}>
          Select Round:
        </label>
        <select
          value={selectedLotteryId}
          onChange={(e) => setSelectedLotteryId(parseInt(e.target.value))}
          style={{
            padding: "8px 16px",
            fontSize: "18px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          {lotteryOptions.map((id) => (
            <option key={id} value={id}>
              Lottery #{id}
            </option>
          ))}
        </select>
      </div>

      {/* Pass selectedLotteryId to the main components */}
      <LotteryCard lotteryId={selectedLotteryId} contract={contract} />
      <Table lotteryId={selectedLotteryId} contract={contract} />

      <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
        There are currently {maxLotteryId} lottery rounds • Switch the dropdown above to view history
      </p>
    </div>
  );
};

export default Home;