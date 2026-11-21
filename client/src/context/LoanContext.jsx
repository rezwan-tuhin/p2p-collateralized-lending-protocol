import { createContext, useContext, useState, useEffect, Children, useCallback } from "react";
import { ethers } from "ethers";

import {TEST_NFT_ADDRESS, LENDING_PROTOCOL_ADDRESS, TEST_NFT_ABI, LENDING_PROTOCOL_ABI} from '../constants/constant';

const LoanContext = createContext();

export const LoanProvider = ({children}) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loans, setLoans] = useState(null);
  const [loading, setLoading] = useState(null);
  const [lastMintedId, setLastMintedId] = useState(null);


  const STATUS = ["PENDING", "ACTIVE", "REPAID", "DEFAULTED", "CANCELLED"];


  const init = async () => {
    if(typeof window === 'undefined' || !window.ethereum) return;

    const browserProvider = new ethers.BrowserProvider(window.ethereum);  
    setProvider(browserProvider);

    //check if user already connected

    const accounts = await browserProvider.send('eth_accounts', []);

    if(accounts.length > 0) {
      const userSigner = await browserProvider.getSigner();
      setAccount(accounts[0]);
      setSigner(userSigner);
    }
  }

  useEffect(() => {


    init();

    const browserProvider = new ethers.BrowserProvider(window.ethereum);

    const handleAccountChange = async (accounts) => {
      if(accounts.length > 0) {
        const userSigner = await browserProvider.getSigner();
        setAccount(accounts[0]);
        setSigner(userSigner);
      }else {
        setAccount(null);
        setSigner(null);
      }
    }

    window.ethereum.on('accountsChanged', handleAccountChange);

    return() => {
      window.ethereum.removeListener('accountsChanged', handleAccountChange);
    }
  }, []);


  const connectWallet = async () => {
    if(!provider) return arlert('Please install Metamask');

    try {
      await provider.send('eth_requestAccounts', []);
      const userSigner = await provider.getSigner();
      setAccount(await userSigner.getAddress());
      setSigner(userSigner);
    }catch(err) {
      console.error("connection failed", err);
    }

  }


  const fetchLoans = useCallback(async () => {
    if(!provider) return;

    try{
      setLoading(true);
      const lendingContract = new ethers.Contract(LENDING_PROTOCOL_ADDRESS, LENDING_PROTOCOL_ABI, provider);

      const totalLoans = await lendingContract.nextLoanId();
      const count = Number(totalLoans);

      if(count === 0) {
        setLoans([]);
      }

      const loanPromises = Array.from({length: count}, (_, i) => lendingContract.loans(i));

      const rawLoans = await Promise.all(loanPromises);

      console.log(rawLoans);

      const formattedLoans = rawLoans.map((loan) => ({
        loanId: loan.loanId,
        borrower: loan.borrower,
        lender: loan.lender,
        nftAddress: loan.nftAddress,
        tokenId: Number(loan.tokenId),
        loanAmount: ethers.formatEther(loan.loanAmount),
        interestAmount: ethers.formatEther(loan.interestAmount),
        durationDays: Number(loan.duration)/86400,
        startTime: Number(loan.startTime),
        status: STATUS[loan.status]
      })
      );

      setLoans(formattedLoans);
    }catch(err) {
      console.error(err);
    }finally{
      setLoading(false);
    }
  }, [provider])

  useEffect(() => {
    if(provider) fetchLoans();
  }, [provider, fetchLoans])


  const createLoan = async ({nftAddress, tokenId, amount, interest, durationDays}) => {
    if(!signer) return;
    const lendingContract = new ethers.Contract(LENDING_PROTOCOL_ADDRESS, LENDING_PROTOCOL_ABI, signer);
    try{
      setLoading(true);
      const tx = await lendingContract.createLoan(nftAddress, tokenId, ethers.parseEther(amount), ethers.parseEther(interest), BigInt(durationDays) * 86400n);
      tx.wait();
      alert('Loan created');
      fetchLoans();
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  }

  const fundLoan = async (loanId) => {
    if(!signer) return alert('Please connect metamask first');
    const lendingContract = new ethers.Contract(LENDING_PROTOCOL_ADDRESS, LENDING_PROTOCOL_ABI, signer);
    try{
      setLoading(true);
      const targetLoan = loans.find((loan) => loan.loanId === loanId);
      const tx =  await lendingContract.fundLoan(loanId, {value: ethers.parseEther(targetLoan.amount)})
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  }

  const repayLoan = async (loanId) => {
    if(!signer) return alert("Please connect metamask first");

    try{
      setLoading(true);
      const targetLoan = loans.find((loan) => loan.loanId === loanId);
      const totalDue = parseFloat(targetLoan.amount) + parseFloat(targetLoan.interestAmount);
      const lendingContract = new ethers.Contract(LENDING_PROTOCOL_ADDRESS, LENDING_PROTOCOL_ABI, signer);
      
      const tx = await lendingContract.repayLoan(loanId, {value: ethers.parseEther(totalDue.toFixed(18))});
    }catch(err) {
      console.error(err);
    }finally{
      setLoading(false);
    }
  }

  const liquidate = async (loanId) => {
    if(!signer) return alert("please install metamask first");

    try{
      const lendingContract = new ethers.Contract(LENDING_PROTOCOL_ADDRESS, LENDING_PROTOCOL_ABI, signer);
      const tx = await lendingContract.liquidate(loanId);
      await tx.wait();
      alert("loan liquidated");
    }catch(err) {
      console.error(err);
    }
  }

  const cancelLoan = async (loanId) => {
    if(!signer) return alert("please install metamask first");

    try{
      const lendingContract = new ethers.Contract(LENDING_PROTOCOL_ADDRESS, LENDING_PROTOCOL_ABI, signer);

      const tx = await lendingContract.cancelLoan(loanId);
      await tx.wait();
      alert("loan cancelled");
    }catch(err) {
      console.error(err);
    }
  }

  const mintNft = async () => {
    if(!signer) return alert("please install metamask");
    
     try{
      setLoading(true);
      const nftContract  = new ethers.Contract(TEST_NFT_ADDRESS, TEST_NFT_ABI, signer);
      const tx = await nftContract.makeNft(account);
      await tx.wait();
     }catch(err) {
      console.error(err);
     }finally{
      setLoading(false);
     }
  }


  return(
    <LoanContext.Provider value={{loans, account, loading, lastMintedId, fundLoan, repayLoan, cancelLoan, liquidate, mintNft}}>
      {children}
    </LoanContext.Provider>
  )
}

export const useLoans = () => useContext(LoanContext);