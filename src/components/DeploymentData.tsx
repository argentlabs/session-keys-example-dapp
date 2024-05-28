import { StarknetWindowObject } from "starknetkit";
import { FC, useState } from "react";
import { GetDeploymentDataResult } from "starknet-types";

interface DeploymentDataProps {
  wallet: StarknetWindowObject;
}

const DeploymentData: FC<DeploymentDataProps> = ({ wallet }) => {
  const [data, setData] = useState<GetDeploymentDataResult | undefined>();

  const handleGetDeploymentData = async () => {
    try {
      setData(
        await wallet.request({
          type: "wallet_deploymentData",
        })
      );
    } catch (e) {
      console.error(e);
      alert((e as any).message);
    }
  };

  const copyData = () => {
    navigator.clipboard.writeText(JSON.stringify(data));
  };

  return (
    <>
      {!data && (
        <button className="bg-green-200 p-2 rounded-lg text-black" onClick={handleGetDeploymentData}>
          Get deployment data
        </button>
      )}
      {data && (
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-white">Account deployment data:</h2>
            <button className={`bg-slate-300 text-black p-2 rounded-lg`} onClick={copyData}>
              Copy data
            </button>
          </div>
          <div className="text-white" style={{ overflowWrap: "break-word" }}>
            {JSON.stringify(data)}
          </div>
        </div>
      )}
    </>
  );
};

export { DeploymentData };
