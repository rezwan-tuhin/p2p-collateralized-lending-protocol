import React, { useState } from "react";
import { useLoans } from "../context/LoanContext";

export const CreateLoanForm = () => {
  const { createLoan, lastMintedId } = useLoans();

  const [nftAddress, setNftAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [durationDays, setDurationDays] = useState("7");

  const handleSubmit = (e) => {
    e.preventDefault();
    createLoan({ nftAddress, tokenId, amount, interest, durationDays });
    setTokenId("");
    setAmount("");
    setInterest("");
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Request New Loan (Pawn NFT)
        </h2>
        {lastMintedId && (
          <button
            type="button"
            onClick={() => setTokenId(lastMintedId)}
            className="text-xs text-indigo-600 hover:underline"
          >
            Auto-fill Token ID #{lastMintedId}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end">
        
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-600">NFT Contract Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={nftAddress}
            onChange={(e) => setNftAddress(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Token ID</label>
          <input
            type="number"
            placeholder="e.g. 0"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Loan (ETH)</label>
          <input
            type="text"
            placeholder="0.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Interest (ETH)</label>
          <input
            type="text"
            placeholder="0.05"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Create Loan
        </button>
      </form>
    </div>
  );
};