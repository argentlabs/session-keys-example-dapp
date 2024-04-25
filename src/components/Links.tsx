import { usePathname } from "next/navigation";

const Links = () => {
  const pathname = usePathname();
  return (
    <div className="flex gap-4">
      <a href="/session" className={`${pathname.includes("session") ? "border-slate-200 border-b-2" : ""}`}>
        Session Keys
      </a>
      <a
        href="/offchainSession"
        className={`${pathname.includes("offchainSession") ? "border-slate-200 border-b-2" : ""}`}
      >
        Offchain Session Keys
      </a>
    </div>
  );
};

export { Links };
