import { createContext, useContext, useState, useEffect, Children, useCallback } from "react";
import { ethers } from "ethers";

import {TEST_NFT_ADDRESS, LENDING_PROTOCOL_ADDRESS, TEST_NFT_ABI, LENDING_PROTOCOL_ABI} from '../constants/constant.json';

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

      const loanPromises = Array.from({length: count}, (_, i) => lendingContract.lonas(i));

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


  const createLoan = async ({}) => {
    if(!signer) return;
    const lendingContract = new ethers.Contract(LENDING_PROTOCOL_ADDRESS, LENDING_PROTOCOL_ABI, signer);
    try{
      const tx = await lendingContract.createLoan()
      tx.wait();
    }catch{

    }
  }

  const fundLoan = async (loanId) => {
    if(!signer) return;
    const lendingContract = new ethers.Contract(LENDING_PROTOCOL_ADDRESS, LENDING_PROTOCOL_ABI, singer);
    try{
      const tx =  await lendingContract.fundLoan(loanId, {value: ethers.parseEther(totalDue)})
    }catch{

    }
  }

  const repayLoan = async (loanId) => {

  }


  return(
    <LoanContext.Provider value={{loans, account, loading, lastMintedId}}>
      {children}
    </LoanContext.Provider>
  )
}

export const useLoans = () => useContext(LoanContext);