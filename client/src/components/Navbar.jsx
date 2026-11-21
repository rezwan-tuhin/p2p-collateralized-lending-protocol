import React from "react";
import { useLoans } from "../context/LoanContext";

const Navbar = () => {
  const { account, connectWallet, mintNft, lastMintedId, loading } = useLoans();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
        
      
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
            P2P
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Lending <span className="text-indigo-600">Protocol</span>
          </h1>
        </div>

       
        <div className="flex items-center gap-3">
          
         
          {lastMintedId !== null && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Minted NFT: #{lastMintedId}
            </div>
          )}

        
          {account && (
            <button
              onClick={mintNft}
              disabled={loading}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-3.5 py-2 rounded-lg font-medium transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>+</span>
              <span>{loading ? "Minting..." : "Mint Test NFT"}</span>
            </button>
          )}

         
          {account ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono font-medium text-slate-700">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg font-semibold transition shadow-sm"
            >
              Connect MetaMask
            </button>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;