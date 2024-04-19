import { FC, useState } from "react";
import { Abi, Account, AccountInterface, Contract } from "starknet";

import Erc20Abi from "../abi/ERC20.json";

import { ETHTokenAddress } from "@/constants";
import { Status } from "@/helpers/status";
import { parseInputAmountToUint256 } from "@/helpers/token";

interface HybridSessionKeysExecuteProps {
  account: AccountInterface;
  sessionAccount: Account | undefined;
  setTransactionStatus: (status: Status) => void;
  setLastTransactionHash: (tx: string) => void;
  transactionStatus: Status;
}

const HybridSessionKeysExecute: FC<HybridSessionKeysExecuteProps> = ({
  account,
  setTransactionStatus,
  transactionStatus,
  setLastTransactionHash,
  sessionAccount,
}) => {
  const [transferOffchainSessionAmount, setTransferOffchainSessionAmount] = useState("");

  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus) || !sessionAccount;

  const handleOffchainSessionTransaction = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setTransactionStatus("pending");
      if (!sessionAccount) {
        throw new Error("No open session");
      }

      const erc20Contract = new Contract(Erc20Abi as Abi, ETHTokenAddress, sessionAccount as any);

      // send to same account
      const result = await erc20Contract.transfer(
        account.address,
        parseInputAmountToUint256(transferOffchainSessionAmount)
      );

      setLastTransactionHash(result.transaction_hash);
      setTransactionStatus("success");
    } catch (e) {
      console.error(e);
      setTransactionStatus("idle");
    }
  };

  return (
    <form className="flex flex-col p-4 gap-3" onSubmit={handleOffchainSessionTransaction}>
      <h2 className="text-white">Use session keys</h2>
      <input
        className="p-2 rounded-lg"
        type="text"
        id="transfer-amount"
        name="fname"
        placeholder="Amount"
        value={transferOffchainSessionAmount}
        disabled={!sessionAccount}
        onChange={(e) => setTransferOffchainSessionAmount(e.target.value)}
      />
      <button
        className={`${buttonsDisabled ? "opacity-30 text-white" : "bg-blue-300"} p-2 rounded-lg`}
        type="submit"
        disabled={buttonsDisabled}
      >
        Transfer with session
      </button>
    </form>
  );
};

export { HybridSessionKeysExecute };
