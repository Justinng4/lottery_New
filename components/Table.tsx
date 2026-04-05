import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useAppContext } from "../context/context";
import style from "../styles/Table.module.css";
import TableRow from "./TableRow";

interface Props {
  lotteryId?: number;     // ← 新增：支援指定輪次
  contract?: any;
}

const Table = ({ lotteryId: propLotteryId }: Props) => {
  const { lotteryPlayers } = useAppContext();

  const [parent] = useAutoAnimate();

  return (
    <div className={style.wrapper}>
      <div className={style.tableHeader}>
        <div className={style.addressTitle}>💳 User Address</div>
        <div className={style.amountTitle}>Amount</div>
      </div>
      <div className={style.rows} ref={parent}>
        {!!lotteryPlayers.length ? (
          lotteryPlayers.map((player, index) => (
            <TableRow key={index} player={player} />
          ))
        ) : (
          <div className={style.noPlayers}>No players yet</div>
        )}
      </div>
    </div>
  );
};

export default Table;