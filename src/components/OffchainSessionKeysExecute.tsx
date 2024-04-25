import { OffchainSessionAccountV5 } from "@argent/x-sessions";
import { FC, useState } from "react";
import { Abi, AccountInterface, CallData, Contract, constants } from "starknet";

import Erc20Abi from "../abi/ERC20.json";

import { ETHTokenAddress } from "@/constants";
import { parseInputAmountToUint256 } from "@/helpers/token";
import { Status } from "@/helpers/status";

interface OffchainSessionKeysExecuteProps {
  account: AccountInterface;
  setTransactionStatus: (status: Status) => void;
  setLastTransactionHash: (tx: string) => void;
  transactionStatus: Status;
  offchainSessionAccount: OffchainSessionAccountV5 | undefined;
}

const OffchainSessionKeysExecute: FC<OffchainSessionKeysExecuteProps> = ({
  account,
  setTransactionStatus,
  transactionStatus,
  setLastTransactionHash,
  offchainSessionAccount,
}) => {
  const [amount, setAmount] = useState("");

  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus) || !offchainSessionAccount;

  const handleOffchainSessionTransaction = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setTransactionStatus("pending");
      if (!offchainSessionAccount) {
        throw new Error("No open session");
      }

      const erc20Contract = new Contract(Erc20Abi as Abi, ETHTokenAddress, offchainSessionAccount as any);

      // send to same account
      const result = await erc20Contract.transfer(account.address, parseInputAmountToUint256(amount));

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
        value={amount}
        disabled={!offchainSessionAccount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className="bg-blue-300 p-2 rounded-lg" type="submit" disabled={buttonsDisabled}>
        Transfer with session keys
      </button>
    </form>
  );
};

export { OffchainSessionKeysExecute };
