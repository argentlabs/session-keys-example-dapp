import { usePathname } from "next/navigation";

const Links = () => {
  const pathname = usePathname();
  return (
    <div className="flex gap-4">
      <a href="/hybridSession" className={`${pathname.includes("hybridSession") ? "border-slate-200 border-b-2" : ""}`}>
        Hybrid Session
      </a>
      <a
        href="/offchainSession"
        className={`${pathname.includes("offchainSession") ? "border-slate-200 border-b-2" : ""}`}
      >
        Offchain Session
      </a>
    </div>
  );
};

export { Links };
