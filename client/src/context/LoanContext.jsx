
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";

import { ethers } from "ethers";

import {
  TEST_NFT_ADDRESS,
  LENDING_PROTOCOL_ADDRESS,
  TEST_NFT_ABI,
  LENDING_PROTOCOL_ABI
} from "../constants/constant";

const LoanContext = createContext();

export const LoanProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastMintedId, setLastMintedId] = useState(null);

  const STATUS = [
    "PENDING",
    "ACTIVE",
    "REPAID",
    "DEFAULTED",
    "CANCELLED"
  ];

  const formatLoan = (loan) => ({
    loanId: Number(loan.loanId),
    borrower: loan.borrower,
    lender: loan.lender,
    nftAddress: loan.nftAddress,
    tokenId: Number(loan.tokenId),
    loanAmount: ethers.formatEther(loan.loanAmount),
    interestAmount: ethers.formatEther(loan.interestAmount),
    durationDays: Number(loan.duration) / 86400,
    startTime: Number(loan.startTime),
    status: STATUS[Number(loan.status)]
  });

  const init = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      const browserProvider = new ethers.BrowserProvider(
        window.ethereum
      );

      setProvider(browserProvider);

      const accounts = await browserProvider.send(
        "eth_accounts",
        []
      );

      if (accounts.length > 0) {
        const userSigner = await browserProvider.getSigner();

        setAccount(accounts[0]);
        setSigner(userSigner);
      }
    } catch (err) {
      console.error("Wallet initialization failed:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    init();

    const handleAccountChange = async (accounts) => {
      try {
        if (accounts.length > 0) {
          const browserProvider = new ethers.BrowserProvider(
            window.ethereum
          );

          const userSigner = await browserProvider.getSigner();

          setProvider(browserProvider);
          setAccount(accounts[0]);
          setSigner(userSigner);
        } else {
          setAccount(null);
          setSigner(null);
        }
      } catch (err) {
        console.error("Account change failed:", err);
      }
    };

    const handleChainChange = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountChange);
    window.ethereum.on("chainChanged", handleChainChange);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountChange
      );

      window.ethereum.removeListener(
        "chainChanged",
        handleChainChange
      );
    };
  }, [init]);

  const connectWallet = async () => {
    if (!provider) {
      alert("Please install MetaMask");
      return;
    }

    try {
      const accounts = await provider.send(
        "eth_requestAccounts",
        []
      );

      const userSigner = await provider.getSigner();

      setAccount(accounts[0]);
      setSigner(userSigner);
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const fetchLoans = useCallback(async () => {
    if (!provider) return;

    try {
      setLoading(true);

      const lendingContract = new ethers.Contract(
        LENDING_PROTOCOL_ADDRESS,
        LENDING_PROTOCOL_ABI,
        provider
      );

      const totalLoans = await lendingContract.nextLoanId();
      const count = Number(totalLoans);

      if (count === 0) {
        setLoans([]);
        return;
      }

      const loanPromises = Array.from(
        { length: count },
        (_, i) => lendingContract.loans(i)
      );

      const rawLoans = await Promise.all(loanPromises);

      const formattedLoans = rawLoans.map(formatLoan);

      setLoans(formattedLoans);
    } catch (err) {
      console.error("Fetch loans failed:", err);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    if (provider) {
      fetchLoans();
    }
  }, [provider, fetchLoans]);

  const createLoan = async ({
    nftAddress,
    tokenId,
    amount,
    interest,
    durationDays
  }) => {
    if (!signer) {
      alert("Please connect MetaMask first");
      return;
    }

    try {
      setLoading(true);

      const nftContract = new ethers.Contract(
        TEST_NFT_ADDRESS,
        TEST_NFT_ABI,
        signer
      );

      const lendingContract = new ethers.Contract(
        LENDING_PROTOCOL_ADDRESS,
        LENDING_PROTOCOL_ABI,
        signer
      );

      const approveTx = await nftContract.approve(
        LENDING_PROTOCOL_ADDRESS,
        tokenId
      );

      await approveTx.wait();

      const tx = await lendingContract.createLoan(
        nftAddress,
        tokenId,
        ethers.parseEther(amount.toString()),
        ethers.parseEther(interest.toString()),
        BigInt(durationDays) * 86400n
      );

      const receipt = await tx.wait();

      console.log("Create loan receipt:", receipt);

      const parsedEvents = receipt.logs
        .map((log) => {
          try {
            return lendingContract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      console.log("Create loan events:", parsedEvents);

      alert("Loan created successfully");
    } catch (err) {
      console.error("Create loan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fundLoan = async (loanId) => {
    if (!signer) {
      alert("Please connect MetaMask first");
      return;
    }

    try {
      setLoading(true);

      const targetLoan = loans.find(
        (loan) => loan.loanId === Number(loanId)
      );

      if (!targetLoan) {
        throw new Error("Loan not found");
      }

      const lendingContract = new ethers.Contract(
        LENDING_PROTOCOL_ADDRESS,
        LENDING_PROTOCOL_ABI,
        signer
      );

      const tx = await lendingContract.fundLoan(
        loanId,
        {
          value: ethers.parseEther(targetLoan.loanAmount)
        }
      );

      const receipt = await tx.wait();

      console.log("Fund loan receipt:", receipt);

      await fetchLoans();
    } catch (err) {
      console.error("Fund loan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const repayLoan = async (loanId) => {
    if (!signer) {
      alert("Please connect MetaMask first");
      return;
    }

    try {
      setLoading(true);

      const targetLoan = loans.find(
        (loan) => loan.loanId === Number(loanId)
      );

      if (!targetLoan) {
        throw new Error("Loan not found");
      }

      const totalDue =
        ethers.parseEther(targetLoan.loanAmount) +
        ethers.parseEther(targetLoan.interestAmount);

      const lendingContract = new ethers.Contract(
        LENDING_PROTOCOL_ADDRESS,
        LENDING_PROTOCOL_ABI,
        signer
      );

      const tx = await lendingContract.repayLoan(
        loanId,
        { value: totalDue }
      );

      const receipt = await tx.wait();

      console.log("Repay loan receipt:", receipt);

      await fetchLoans();
    } catch (err) {
      console.error("Repay loan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const liquidate = async (loanId) => {
    if (!signer) {
      alert("Please connect MetaMask first");
      return;
    }

    try {
      setLoading(true);

      const lendingContract = new ethers.Contract(
        LENDING_PROTOCOL_ADDRESS,
        LENDING_PROTOCOL_ABI,
        signer
      );

      const tx = await lendingContract.liquidate(loanId);
      const receipt = await tx.wait();

      console.log("Liquidation receipt:", receipt);

      await fetchLoans();

      alert("Loan liquidated");
    } catch (err) {
      console.error("Liquidation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelLoan = async (loanId) => {
    if (!signer) {
      alert("Please connect MetaMask first");
      return;
    }

    try {
      setLoading(true);

      const lendingContract = new ethers.Contract(
        LENDING_PROTOCOL_ADDRESS,
        LENDING_PROTOCOL_ABI,
        signer
      );

      const tx = await lendingContract.cancelLoan(loanId);
      const receipt = await tx.wait();

      console.log("Cancel loan receipt:", receipt);

      await fetchLoans();

      alert("Loan cancelled");
    } catch (err) {
      console.error("Cancel loan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const mintNft = async () => {
    if (!signer) {
      alert("Please connect MetaMask");
      return;
    }

    try {
      setLoading(true);

      const nftContract = new ethers.Contract(
        TEST_NFT_ADDRESS,
        TEST_NFT_ABI,
        signer
      );

      const tx = await nftContract.makeNft(account);
      const receipt = await tx.wait();

      console.log("Mint receipt:", receipt);

      const transferEvent = receipt.logs
        .map((log) => {
          try {
            return nftContract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(
          (event) =>
            event && event.name === "Transfer"
        );

      if (transferEvent) {
        const mintedId = transferEvent.args.tokenId.toString();

        setLastMintedId(mintedId);

        alert(`NFT mint successful, Token ID: #${mintedId}`);
      }
    } catch (err) {
      console.error("Mint NFT failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!provider) return;

    const lendingContract = new ethers.Contract(
      LENDING_PROTOCOL_ADDRESS,
      LENDING_PROTOCOL_ABI,
      provider
    );

    const handleLoanCreated = async (loanId) => {
      try {
        console.log("LoanCreated RECEIVED:", loanId);

        const id = Number(loanId);
        const loan = await lendingContract.loans(id);

        const newLoan = formatLoan(loan);

        setLoans((prev) => {
          if (prev.some((item) => item.loanId === id)) {
            return prev.map((item) =>
              item.loanId === id ? newLoan : item
            );
          }

          return [newLoan, ...prev];
        });
      } catch (err) {
        console.error("LoanCreated handler failed:", err);
      }
    };

    const handleLoanFunded = (
      loanId,
      lender,
      startTime
    ) => {
      console.log(
        "LoanFunded RECEIVED:",
        loanId,
        lender,
        startTime
      );

      const id = Number(loanId);

      setLoans((prev) =>
        prev.map((loan) =>
          loan.loanId === id
            ? {
                ...loan,
                lender,
                startTime: Number(startTime),
                status: "ACTIVE"
              }
            : loan
        )
      );
    };

    const handleLoanRepaid = (loanId) => {
      console.log("LoanRepaid RECEIVED:", loanId);

      const id = Number(loanId);

      setLoans((prev) =>
        prev.map((loan) =>
          loan.loanId === id
            ? { ...loan, status: "REPAID" }
            : loan
        )
      );
    };

    const handleError = (error) => {
      console.error("Contract event error:", error);
    };

    lendingContract.on("LoanCreated", handleLoanCreated);
    lendingContract.on("LoanFunded", handleLoanFunded);
    lendingContract.on("LoanRepaid", handleLoanRepaid);

    lendingContract.on("error", handleError);

    console.log("All event listeners registered");

    lendingContract.getAddress().then((address) => {
      console.log("Listening to contract:", address);
    });

    return () => {
      lendingContract.off("LoanCreated", handleLoanCreated);
      lendingContract.off("LoanFunded", handleLoanFunded);
      lendingContract.off("LoanRepaid", handleLoanRepaid);
      lendingContract.off("error", handleError);

      console.log("All event listeners removed");
    };
  }, [provider]);

  return (
    <LoanContext.Provider
      value={{
        loans,
        account,
        loading,
        lastMintedId,
        connectWallet,
        fetchLoans,
        createLoan,
        fundLoan,
        repayLoan,
        cancelLoan,
        liquidate,
        mintNft
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoans = () => useContext(LoanContext);
