"use client";

import { ConnectButton } from "@/components/ConnectButton";
import { HybridSessionKeysExecute } from "@/components/HybridSessionKeysExecute";
import { HybridSessionKeysSign } from "@/components/HybridSessionKeysSign";
import { Links } from "@/components/Links";
import { provider } from "@/constants";
import { Status } from "@/helpers/status";
import { useEffect, useState } from "react";
import { Account, GatewayError, constants } from "starknet";
import { StarknetWindowObject } from "starknetkit";

export default function HybridSession() {
  const [connectedWallet, setConnectedWallet] = useState<StarknetWindowObject | undefined | null>(null);
  const [chainId, setChainId] = useState<string>();

  const [lastTransactionHash, setLastTransactionHash] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<Status>("idle");
  const [transactionError, setTransactionError] = useState("");
  const [hybridSessionAccount, setHybridSessionAccount] = useState<Account | undefined>();

  useEffect(() => {
    const waitTx = async () => {
      if (lastTransactionHash && transactionStatus === "pending") {
        setTransactionError("");
        try {
          await provider.waitForTransaction(lastTransactionHash);
          setTransactionStatus("success");
        } catch (error) {
          setTransactionStatus("failure");
          let message = error ? `${error}` : "No further details";
          if (error instanceof GatewayError) {
            message = JSON.stringify(error.message, null, 2);
          }
          setTransactionError(message);
        }
      }
    };
    waitTx();
  }, [transactionStatus, lastTransactionHash]);

  return (
    <main className="flex min-h-screen flex-col p-24 gap-4">
      <Links />

      <div>{!connectedWallet && <ConnectButton setConnectedWallet={setConnectedWallet} setChainId={setChainId} />}</div>

      {connectedWallet && connectedWallet.account && (
        <>
          <div>Account: {connectedWallet.account?.address}</div>
          <div>Chain: {chainId === constants.StarknetChainId.SN_SEPOLIA ? "SN_SEPOLIA" : "SN_MAIN"}</div>
          <div
            className={`${lastTransactionHash ? "cursor-pointer hover:underline" : "default"}`}
            onClick={() => {
              if (!lastTransactionHash) return;
              window.open(`https://sepolia.starkscan.co/tx/${lastTransactionHash}`, "_blank");
            }}
          >
            Last tx hash: {lastTransactionHash || "---"}
          </div>
          <div>Tx status: {transactionStatus}</div>
          <div color="##ff4848">{transactionError.toString()}</div>

          <div className="flex flex-col text-black max-w-96">
            <HybridSessionKeysSign
              wallet={connectedWallet}
              setTransactionStatus={setTransactionStatus}
              setHybridSessionAccount={setHybridSessionAccount}
            />
          </div>

          <div className="flex flex-col text-black max-w-96">
            <HybridSessionKeysExecute
              account={connectedWallet.account as any}
              setTransactionStatus={setTransactionStatus}
              setLastTransactionHash={setLastTransactionHash}
              transactionStatus={transactionStatus}
              sessionAccount={hybridSessionAccount}
            />
          </div>
        </>
      )}
    </main>
  );
}
