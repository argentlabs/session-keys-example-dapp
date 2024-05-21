"use client";

import { ConnectButton } from "@/components/ConnectButton";
import { SessionKeysExecute } from "@/components/SessionKeysExecute";
import { SessionKeysSign } from "@/components/SessionKeysSign";
import { provider } from "@/constants";
import { Status } from "@/helpers/status";
import { OffChainSession } from "@argent/x-sessions";
import { useEffect, useState } from "react";
import { GatewayError, Signature, constants } from "starknet";
import { StarknetWindowObject, disconnect } from "starknetkit";

export default function Session() {
  const [connectedWallet, setConnectedWallet] = useState<StarknetWindowObject | undefined | null>(null);
  const [chainId, setChainId] = useState<constants.StarknetChainId | undefined>(undefined);

  const [lastTransactionHash, setLastTransactionHash] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<Status>("idle");
  const [transactionError, setTransactionError] = useState("");
  const [accountSessionSignature, setAccountSessionSignature] = useState<string[] | Signature>();
  const [sessionRequest, setSessionRequest] = useState<OffChainSession>();

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
      <div>{!connectedWallet && <ConnectButton setConnectedWallet={setConnectedWallet} setChainId={setChainId} />}</div>

      {connectedWallet && connectedWallet.account && (
        <>
          <button
            className="bg-white text-black p-2 rounded-lg absolute top-4 right-4"
            onClick={() => {
              disconnect();
              setConnectedWallet(undefined);
            }}
          >
            Disconnect
          </button>
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
            <SessionKeysSign
              wallet={connectedWallet}
              setTransactionStatus={setTransactionStatus}
              setAccountSessionSignature={setAccountSessionSignature}
              setSessionRequest={setSessionRequest}
            />
          </div>

          <div className="flex flex-col text-black max-w-96">
            <SessionKeysExecute
              address={connectedWallet.account.address}
              accountSessionSignature={accountSessionSignature}
              sessionRequest={sessionRequest}
              setTransactionStatus={setTransactionStatus}
              setLastTransactionHash={setLastTransactionHash}
              transactionStatus={transactionStatus}
            />
          </div>
        </>
      )}
    </main>
  );
}
