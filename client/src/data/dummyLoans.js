export const DUMMY_LOANS = [
    {
      loanId: 0,
      borrower: "0x71C2A89...3a9B",
      lender: "0x0000000...0000",
      nftAddress: "0xMockNFTContractAddress",
      tokenId: 101,
      loanAmount: "0.5",
      interestAmount: "0.05",
      durationDays: 7,
      startTime: 0,
      status: "PENDING", // PENDING, ACTIVE, REPAID, DEFAULTED
    },
    {
      loanId: 1,
      borrower: "0x98AF311...4e2C",
      lender: "0x44BC782...99f1",
      nftAddress: "0xMockNFTContractAddress",
      tokenId: 102,
      loanAmount: "1.2",
      interestAmount: "0.12",
      durationDays: 3,
      startTime: Date.now() - 86400000, // ১ দিন আগে শুরু হয়েছে
      status: "ACTIVE",
    },
    {
      loanId: 2,
      borrower: "0x12FE990...7b3A",
      lender: "0x77CB451...11a2",
      nftAddress: "0xMockNFTContractAddress",
      tokenId: 103,
      loanAmount: "0.8",
      interestAmount: "0.08",
      durationDays: 5,
      startTime: Date.now() - 500000000,
      status: "REPAID",
    },
  ];