import React from "react";
import { useLoans } from "../context/LoanContext";

const Navbar = ({count}) => {
  const { account } = useLoans();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight text-indigo-600">
          P2P Lending <span className="text-slate-400 font-normal">| Protocol</span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
            {account ? account : "Not Connected"}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;