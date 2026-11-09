import React, { useContext } from "react";
import { useLoans } from "../context/LoanContext";
export const LoanTable = () => {

  const { loans, loading, fundLoan, repayLoan } = useLoans();

  const badgeStyles = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-300",
    ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-300",
    REPAID: "bg-blue-100 text-blue-800 border-blue-300",
    DEFAULTED: "bg-rose-100 text-rose-800 border-rose-300",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-base font-semibold text-slate-900">Loan Marketplace</h2>
        <span className="text-xs text-slate-500">{loans.length} Total Records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Collateral</th>
              <th className="py-3 px-4">Borrower</th>
              <th className="py-3 px-4">Principal</th>
              <th className="py-3 px-4">Interest</th>
              <th className="py-3 px-4">Total Due</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-slate-400">Loading data...</td>
              </tr>
            ) : loans.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-slate-400">No active loans found.</td>
              </tr>
            ) : (
              loans.map((loan) => {
                const totalDue = (
                  parseFloat(loan.loanAmount) + parseFloat(loan.interestAmount)
                ).toFixed(3);

                return (
                  <tr key={loan.loanId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-700">#{loan.loanId}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900">NFT #{loan.tokenId}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {loan.borrower}
                    </td>
                    <td className="py-3 px-4 font-medium">{loan.loanAmount} ETH</td>
                    <td className="py-3 px-4 text-slate-600">{loan.interestAmount} ETH</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{totalDue} ETH</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles[loan.status]}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {loan.status === "PENDING" && (
                        <button
                          onClick={() => fundLoan(loan.loanId)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          Fund
                        </button>
                      )}

                      {loan.status === "ACTIVE" && (
                        <button
                          onClick={() => repayLoan(loan.loanId)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          Repay
                        </button>
                      )}

                      {(loan.status === "REPAID" || loan.status === "DEFAULTED") && (
                        <span className="text-xs text-slate-400 font-medium">None</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};