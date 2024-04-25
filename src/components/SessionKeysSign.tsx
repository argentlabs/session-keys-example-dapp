import { SessionParams, createSessionAccount } from "@argent/x-sessions";
import { FC, useState } from "react";
import { Account } from "starknet";

import { ETHTokenAddress, provider } from "@/constants";
import { Status } from "@/helpers/status";
import { parseUnits } from "@/helpers/token";
import { StarknetWindowObject } from "starknetkit";

interface SessionKeysSignProps {
  wallet: StarknetWindowObject;
  setTransactionStatus: (status: Status) => void;
  setSessionAccount: (account: Account) => void;
}

const ETHFees = [
  {
    tokenAddress: ETHTokenAddress,
    maxAmount: parseUnits("0.1", 18).value.toString(),
  },
];

const STRKFees = [
  {
    tokenAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    maxAmount: "100000000000000000",
  },
  {
    tokenAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    maxAmount: "200000000000000000000",
  },
];

const SessionKeysSign: FC<SessionKeysSignProps> = ({ wallet, setTransactionStatus, setSessionAccount }) => {
  const [isStarkFeeToken, setIsStarkFeeToken] = useState(false);

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setTransactionStatus("approve");

      const sessionParams: SessionParams = {
        allowedMethods: [
          {
            "Contract Address": ETHTokenAddress,
            selector: "transfer",
          },
        ],
        expiry: Math.floor((Date.now() + 1000 * 60 * 60 * 24) / 1000) as any,
        metaData: {
          projectID: "test-dapp",
          txFees: isStarkFeeToken ? STRKFees : ETHFees,
        },
      };

      /* const options: CreateSessionOptions = { wallet: wallet as StarknetWindowObjectSN, useWalletRequestMethods: true }; */

      setSessionAccount(
        await createSessionAccount({
          provider,
          account: wallet.account,
          sessionParams,
          /* options, */
        })
      );

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
