import { OffchainSessionAccountV5 } from "@argent/x-sessions";
import { FC, useState } from "react";
import { AccountInterface, RpcProvider } from "starknet";

import { StarknetWindowObject } from "get-starknet-core";
import { getStarkKey, utils } from "micro-starknet";
import { createSessionKeys } from "@/helpers/createSessionKeys";
import { Status } from "@/helpers/status";
import { provider } from "@/constants";

interface OffchainSessionKeysSignProps {
  account: AccountInterface;
  setTransactionStatus: (status: Status) => void;
  setOffchainSessionAccount: (account: OffchainSessionAccountV5) => void;
}

const OffchainSessionKeysSign: FC<OffchainSessionKeysSignProps> = ({
  account,
  setTransactionStatus,
  setOffchainSessionAccount,
}) => {
  const [allowedFees, setAllowedFees] = useState("");
  const [sessionSigner] = useState(utils.randomPrivateKey());

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      setTransactionStatus("approve");
      const signedSession = await createSessionKeys(getStarkKey(sessionSigner), allowedFees, account);

      const sessionAccount = new OffchainSessionAccountV5(
        provider as any,
        account.address,
        sessionSigner,
        signedSession,
        account as any
      );

      setOffchainSessionAccount(sessionAccount);

      setTransactionStatus("success");
    } catch (e) {
      console.error(e);
      setTransactionStatus("idle");
    }
  };

  return (
    <form onSubmit={handleCreateSessionSubmit} className="flex flex-col p-4 gap-3">
      <h2 className="text-white">Create session keys</h2>
      <input
        className="p-2 rounded-lg"
        type="text"
        id="set-allowed-amount-fees"
        name="fname"
        value={allowedFees}
        placeholder="Allowed fees"
        onChange={(e) => setAllowedFees(e.target.value)}
      />
      <button className="bg-blue-300 p-2 rounded-lg" type="submit">
        Create session keys
      </button>
    </form>
  );
};

export { OffchainSessionKeysSign };
