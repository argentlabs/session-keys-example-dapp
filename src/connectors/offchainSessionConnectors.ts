import { provider } from "@/constants";
import { WebWalletConnector } from "starknetkit/webwallet";

// offchain sessions are enabled only for argent webwallet
const webWalletConnector = new WebWalletConnector({
  provider,
  url: "https://web.hydrogen.argent47.net",
});

const connectors = [webWalletConnector];

export { connectors };
