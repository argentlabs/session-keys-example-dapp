import { provider } from "@/constants";
import { allowedMethods, dappKey, expiry, metaData } from "@/helpers/openSessionHelper";
import { Status } from "@/helpers/status";
import { OffChainSession, SessionParams, createSessionRequest, openSession } from "@argent/x-sessions";
import { FC, useState } from "react";
import { Signature } from "starknet";
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

      const accountSessionSignature = await openSession({
        chainId: await provider.getChainId(),
        wallet: wallet as any,
        sessionParams,
      });

      const sessionRequest = createSessionRequest(allowedMethods, expiry, metaData(isStarkFeeToken), dappKey.publicKey);
      setSessionRequest(sessionRequest);
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
          className="max-w-96"
          type="checkbox"
          onChange={() => {
            setIsStarkFeeToken((prev) => !prev);
          }}
        />
      </div>

      <button className="bg-blue-300 p-2 rounded-lg max-w-96" type="submit">
        Authorize session
      </button>
    </form>
  );
};

export { SessionKeysSign };
