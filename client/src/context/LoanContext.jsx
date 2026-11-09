import React, { createContext, useContext, useState, useEffect } from "react";
import { DUMMY_LOANS } from "../data/dummyLoans";

export const LoanContext = createContext();

 export const LoanProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [account, setAccount] = useState("0x71C2A89...3a9B"); 
  const [loading, setLoading] = useState(false);

  const fetchLoans = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoans(DUMMY_LOANS);
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

 
  const createLoan = async ({ nftAddress, tokenId, amount, interest, durationDays }) => {
    const newLoan = {
      loanId: loans.length,
      borrower: account,
      lender: "0x0000000...0000",
      nftAddress: nftAddress,
      tokenId: Number(tokenId),
      loanAmount: amount,
      interestAmount: interest,
      durationDays: Number(durationDays),
      startTime: 0,
      status: "PENDING",
    };
    setLoans((prev) => [newLoan, ...prev]);
  };


  // const createLoan = async ({ nftAddress, tokenId, amount, interest, durationDays }) => {
  //   if (!signer) return alert("Connect Wallet First!");
  //   try {
  //     setLoading(true);

    
  //     const nftContract = new ethers.Contract(nftAddress, ERC721_ABI, signer);
  //     const lendingContract = new ethers.Contract(LENDING_CONTRACT_ADDRESS, LENDING_ABI, signer);


  //     console.log(`Approving NFT ${tokenId} from collection ${nftAddress}...`);
  //     const approveTx = await nftContract.approve(LENDING_CONTRACT_ADDRESS, tokenId);
  //     await approveTx.wait();

   
  //     console.log("Creating Loan...");
  //     const durationSeconds = BigInt(durationDays) * 86400n;
  //     const loanAmountWei = ethers.parseEther(amount);
  //     const interestAmountWei = ethers.parseEther(interest);

  //     const tx = await lendingContract.createLoan(
  //       nftAddress, 
  //       tokenId,
  //       loanAmountWei,
  //       interestAmountWei,
  //       durationSeconds
  //     );
  //     await tx.wait();

  //     alert("🎉 Loan Created & Collateral Locked On-Chain!");
  //     fetchLoans();
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error: " + (err.reason || err.message));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  
  const fundLoan = async (loanId) => {
    setLoans((prev) =>
      prev.map((loan) =>
        loan.loanId === loanId
          ? { ...loan, status: "ACTIVE", lender: account, startTime: Date.now() }
          : loan
      )
    );
  };

 
  const repayLoan = async (loanId) => {
    setLoans((prev) =>
      prev.map((loan) =>
        loan.loanId === loanId ? { ...loan, status: "REPAID" } : loan
      )
    );
  };

  return (
    <LoanContext.Provider
      value={{
        loans,
        account,
        loading,
        fetchLoans,
        createLoan,
        fundLoan,
        repayLoan,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoans = () => useContext(LoanContext);
