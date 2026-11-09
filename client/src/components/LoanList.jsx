import React from "react";
import { useLoans } from "../context/LoanContext";
import { LoanCard } from "./LoanTable";

export const LoanList = () => {
  const { loans, loading } = useLoans();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-slate-900">Marketplace Listings</h2>
        <span className="text-xs text-slate-500">{loans.length} total loans</span>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading marketplace data...</p>
      ) : loans.length === 0 ? (
        <p className="text-xs text-slate-400">No active loans.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loans.map((loan) => (
            <LoanCard key={loan.loanId} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
};