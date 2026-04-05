import { useAppContext } from "../context/context";
import style from "../styles/PotCard.module.css";

const LotteryCard = () => {
  const {
    enterLottery,
    pickWinner,
    withdrawPot,
    lotteryPot,
    lastWinner,
    lotteryId,
    transactionHistory,
  } = useAppContext();

  return (
    <div className={style.wrapper}>
      <div className={style.title}>
        Lottery <span style={{ color: "#00ff88", fontSize: "32px" }}>#{lotteryId}</span>
      </div>

      <div className={style.pot}>
        Pot 🍯: <span className={style.potAmount}>{lotteryPot || "0"} ETH</span>
      </div>

      <div className={style.recentWinnerTitle}>Last Winner</div>
      <div className={style.winner}>
        {lastWinner 
          ? `${lastWinner.slice(0, 8)}...${lastWinner.slice(-6)}` 
          : "No winner yet"}
      </div>

      <div className={style.btn} onClick={enterLottery}>Enter (0.01 ETH)</div>
      <div className={style.btn} onClick={pickWinner}>Pick Winner!</div>
      <div className={style.btn} onClick={withdrawPot}>Withdraw Pot</div>

      {transactionHistory && transactionHistory.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "10px", color: "#aaa" }}>📜 最近交易</div>
          {transactionHistory.map((tx: any) => (
            <a
              key={tx.id}
              href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
              target="_blank"
              style={{ 
                display: "block", 
                color: "#66ccff", 
                marginBottom: "8px", 
                fontSize: "14px" 
              }}
            >
              {tx.type} • Lottery #{tx.lotteryId} • {new Date(tx.timestamp).toLocaleTimeString()}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default LotteryCard;