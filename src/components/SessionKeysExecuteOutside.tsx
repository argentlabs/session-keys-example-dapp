import { ARGENT_SESSION_SERVICE_BASE_URL, ETHTokenAddress, provider } from "@/constants";
import { dappKey } from "@/helpers/openSessionHelper";
import { Status } from "@/helpers/status";
import { parseInputAmountToUint256 } from "@/helpers/token";
import { ArgentSessionService, OffChainSession, SessionDappService, buildSessionAccount } from "@argent/x-sessions";
import { FC, useState } from "react";
import { Abi, Calldata, Contract, RawArgs, Signature, shortString, stark } from "starknet";
import Erc20Abi from "../abi/ERC20.json";

interface SessionKeysExecuteOutsideProps {
  address: string;
  accountSessionSignature?: string[] | Signature;
  sessionRequest?: OffChainSession;
  transactionStatus: Status;
}

type OutsideExecution = {
  contractAddress: string;
  entrypoint: string;
  calldata?: Calldata | RawArgs;
};

const SessionKeysExecuteOutside: FC<SessionKeysExecuteOutsideProps> = ({
  address,
  accountSessionSignature,
  sessionRequest,
  transactionStatus,
}) => {
  const [amount, setAmount] = useState("");
  const [outsideExecution, setOutsideExecution] = useState<OutsideExecution | undefined>();
  const [error, setError] = useState<string | null>(null);
  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus) || !accountSessionSignature;

  const submitSessionTransaction = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      if (!accountSessionSignature || !sessionRequest) {
        throw new Error("No open session");
      }

      // this could be stored instead of creating each time
      // in this specific example a standard account is fine, since it's passed to erc20Contract
      const sessionAccount = await buildSessionAccount({
        accountSessionSignature: stark.formatSignature(accountSessionSignature),
        sessionRequest,
        provider,
        chainId: await provider.getChainId(),
        address,
        dappKey,
        argentSessionServiceBaseUrl: ARGENT_SESSION_SERVICE_BASE_URL,
      });

      const erc20Contract = new Contract(Erc20Abi as Abi, ETHTokenAddress, sessionAccount as any);

      // https://www.starknetjs.com/docs/guides/use_erc20/#interact-with-an-erc20
      // check .populate
      const transferCallData = erc20Contract.populate("transfer", {
        recipient: address,
        amount: parseInputAmountToUint256(amount),
      });

      const beService = new ArgentSessionService(
        dappKey.publicKey,
        accountSessionSignature,
        ARGENT_SESSION_SERVICE_BASE_URL
      );

      const sessionDappService = new SessionDappService(beService, await provider.getChainId(), dappKey);

      const { contractAddress, entrypoint, calldata } = await sessionDappService.getOutsideExecutionCall(
        sessionRequest,
        stark.formatSignature(accountSessionSignature),
        false,
        [transferCallData],
        address,
        await provider.getChainId(),
        shortString.encodeShortString("ANY_CALLER")
      );

      setOutsideExecution({ contractAddress, entrypoint, calldata });

      console.log("execute from outside response", JSON.stringify({ contractAddress, entrypoint, calldata }));
    } catch (e) {
      console.error(e);
      setError((e as any).message);
    }
  };

  const copyData = () => {
    navigator.clipboard.writeText(JSON.stringify(outsideExecution));
  };

  return (
    <form className="flex flex-col p-4 gap-3" onSubmit={submitSessionTransaction}>
      <h2 className="text-white">Get outside execution call</h2>
      <input
        className="p-2 rounded-lg max-w-96"
        type="text"
        id="transfer-amount"
        name="fname"
        placeholder="Amount"
        value={amount}
        disabled={!accountSessionSignature}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        className={`${buttonsDisabled ? "opacity-30 text-white" : "bg-blue-300"} p-2 rounded-lg max-w-96`}
        type="submit"
        disabled={buttonsDisabled}
      >
        Get execution data
      </button>

      {outsideExecution && (
        <div className="flex gap-2 text-white">
          <button
            className={`bg-slate-300 text-black p-2 rounded-lg min-w-24 max-w-fit`}
            onClick={copyData}
            disabled={buttonsDisabled}
          >
            Copy data
          </button>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
};

export { SessionKeysExecuteOutside };
