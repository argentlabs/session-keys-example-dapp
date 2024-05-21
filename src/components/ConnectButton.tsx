import { Connector, connect } from "starknetkit";
import { provider } from "@/constants";
import { constants } from "starknet";
import { FC, useEffect } from "react";

interface ConnectButtonProps {
  connectors?: Connector[];
  setConnectedWallet: (wallet: any) => void;
  setChainId: (chainId: constants.StarknetChainId | undefined) => void;
}

const ConnectButton: FC<ConnectButtonProps> = ({ setChainId, setConnectedWallet, connectors }) => {
  const connectFn = async () => {
    const { wallet } = connectors
      ? await connect({ provider, connectors })
      : await connect({
          provider,
          modalMode: "alwaysAsk",
          webWalletUrl: "https://web.hydrogen.argent47.net",
          argentMobileOptions: {
            dappName: "Argent | Portfolio",
            url: window.location.hostname,
            chainId: constants.NetworkName.SN_SEPOLIA,
            icons: [],
          },
        });

    setChainId((await wallet?.account?.getChainId()) as constants.StarknetChainId);
  };

  useEffect(() => {
    const autoConnect = async () => {
      const { wallet } = await connect({
        provider,
        modalMode: "neverAsk",
        webWalletUrl: "https://web.hydrogen.argent47.net",
        argentMobileOptions: {
          dappName: "Argent | Portfolio",
          url: window.location.hostname,
          chainId: constants.NetworkName.SN_SEPOLIA,
          icons: [],
        },
      });

      setConnectedWallet(wallet);
      setChainId((await wallet?.account?.getChainId()) as constants.StarknetChainId);
    };
    autoConnect();
  }, []);

  return (
    <button className="bg-white text-black p-2 radius rounded-md" onClick={connectFn}>
      connect wallet
    </button>
  );
};

export { ConnectButton };
