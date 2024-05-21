import { OffChainSession, SessionParams, createSessionRequest, openSession } from "@argent/x-sessions";
import { FC, useState } from "react";
import { Account, Signature, ec } from "starknet";
import { allowedMethods, expiry, metaData, dappKey } from "@/helpers/openSessionHelper";
import { Status } from "@/helpers/status";
import { StarknetWindowObject } from "starknetkit";

interface SessionKeysSignProps {
  wallet: StarknetWindowObject;
  setTransactionStatus: (status: Status) => void;
  setAccountSessionSignature: (signature: string[] | Signature) => void;
  setSessionRequest: (sessionRequest: OffChainSession) => void;
}

const SessionKeysSign: FC<SessionKeysSignProps> = ({
  wallet,
  setTransactionStatus,
  setAccountSessionSignature,
  setSessionRequest,
}) => {
  const [isStarkFeeToken, setIsStarkFeeToken] = useState(false);

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setTransactionStatus("approve");

      const sessionParams: SessionParams = {
        allowedMethods,
        expiry,
        metaData: metaData(isStarkFeeToken),
        publicDappKey: dappKey.publicKey,
      };

      const sessionRequest = createSessionRequest(allowedMethods, expiry, metaData(isStarkFeeToken), dappKey.publicKey);
      setSessionRequest(sessionRequest);

      const accountSessionSignature = await openSession({
        account: wallet.account as Account,
        wallet: wallet as any,
        sessionParams,
      });

      setAccountSessionSignature(accountSessionSignature);

      setTransactionStatus("success");
    } catch (e) {
      console.error(e);
      setTransactionStatus("idle");
    }
  };

  return (
    <form onSubmit={handleCreateSessionSubmit} className="flex flex-col p-4 gap-3">
      <h2 className="text-white">Create session keys</h2>

      <div className="flex items-center text-white gap-1">
        Use STRK fee token
        <input
          type="checkbox"
          onChange={() => {
            setIsStarkFeeToken((prev) => !prev);
          }}
        />
      </div>

      <button className="bg-blue-300 p-2 rounded-lg" type="submit">
        Authorize session
      </button>
    </form>
  );
};

export { SessionKeysSign };
