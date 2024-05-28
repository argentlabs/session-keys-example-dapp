import { Connector, connect } from "starknetkit";
import { constants } from "starknet";
import { FC, useEffect } from "react";

interface ConnectButtonProps {
  connectors?: Connector[];
  setConnectedWallet: (wallet: any) => void;
  setChainId: (chainId: constants.StarknetChainId | undefined) => void;
  setConnectorData: (connectorData: any) => void;
}

const ConnectButton: FC<ConnectButtonProps> = ({ setChainId, setConnectedWallet, connectors, setConnectorData }) => {
  const connectFn = async () => {
    const res = connectors
      ? await connect({ connectors })
      : await connect({
          modalMode: "alwaysAsk",
          webWalletUrl: "http://localhost:3005",
          argentMobileOptions: {
            dappName: "Argent | Portfolio",
            url: window.location.hostname,
            chainId: constants.NetworkName.SN_SEPOLIA,
            icons: [],
          },
        });

    const { wallet, connectorData } = res;

    setConnectedWallet(wallet);
    setConnectorData(connectorData);
    setChainId(connectorData?.chainId);
  };

  useEffect(() => {
    const autoConnect = async () => {
      const res = await connect({
        modalMode: "neverAsk",
        webWalletUrl: "http://localhost:3005",
        argentMobileOptions: {
          dappName: "Argent | Portfolio",
          url: window.location.hostname,
          chainId: constants.NetworkName.SN_SEPOLIA,
          icons: [],
        },
      });

      const { wallet, connectorData } = res;
      setConnectedWallet(wallet);
      setConnectorData(connectorData);
      setChainId(connectorData?.chainId);
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
