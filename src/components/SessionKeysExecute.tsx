import { ETHTokenAddress, provider } from "@/constants";
import { dappKey } from "@/helpers/openSessionHelper";
import { Status } from "@/helpers/status";
import { parseInputAmountToUint256 } from "@/helpers/token";
import { OffChainSession, buildSessionAccount } from "@argent/x-sessions";
import { FC, useState } from "react";
import { Abi, Contract, Signature, stark } from "starknet";
import Erc20Abi from "../abi/ERC20.json";

interface SessionKeysExecuteProps {
  address: string;
  accountSessionSignature?: string[] | Signature;
  sessionRequest?: OffChainSession;
  setTransactionStatus: (status: Status) => void;
  setLastTransactionHash: (tx: string) => void;
  transactionStatus: Status;
}

const SessionKeysExecute: FC<SessionKeysExecuteProps> = ({
  address,
  accountSessionSignature,
  sessionRequest,
  setTransactionStatus,
  transactionStatus,
  setLastTransactionHash,
}) => {
  const [amount, setAmount] = useState("");

  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus) || !accountSessionSignature;

  const handleOffchainSessionTransaction = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setTransactionStatus("pending");
      if (!accountSessionSignature || !sessionRequest) {
        throw new Error("No open session");
      }

      // this could be stored instead of creating each time
      const sessionAccount = await buildSessionAccount({
        accountSessionSignature: stark.formatSignature(accountSessionSignature),
        sessionRequest,
        provider,
        address,
        dappKey,
      });

      const erc20Contract = new Contract(Erc20Abi as Abi, ETHTokenAddress, sessionAccount as any);

      // https://www.starknetjs.com/docs/guides/use_erc20/#interact-with-an-erc20
      // check .populate
      const transferCallData = erc20Contract.populate("transfer", {
        recipient: address,
        amount: parseInputAmountToUint256(amount),
      });

      // https://www.starknetjs.com/docs/guides/estimate_fees/#estimateinvokefee
      const { suggestedMaxFee } = await sessionAccount.estimateInvokeFee({
        contractAddress: ETHTokenAddress,
        entrypoint: "transfer",
        calldata: transferCallData.calldata,
      });

      // https://www.starknetjs.com/docs/guides/estimate_fees/#fee-limitation
      const maxFee = (suggestedMaxFee * BigInt(15)) / BigInt(10);
      // send to same account
      const result = await erc20Contract.transfer(transferCallData.calldata, {
        maxFee,
      });

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
        disabled={!accountSessionSignature}
        onChange={(e) => setAmount(e.target.value)}
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

export { SessionKeysExecute };
