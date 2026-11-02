//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract P2PLendingProtocol is IERC721Receiver, ReentrancyGuard {
    //state machine
    enum LoanStatus {PENDING, ACTIVE, REPAID, DEFAULTED, CANCELLED}

    struct Loan {
        uint256 loanId;
        address payable borrower;
        address payable lender;
        address nftAddress;
        uint256 tokenId;
        uint256 loanAmount;
        uint256 interestAmount;
        uint256 duration;
        uint256 startTime;
        LoanStatus status;
    }

    uint256 public nextLoanId;

    mapping (uint256 => Loan) public loans;

    //mongodb tracking

    event LoanCreated (uint256 indexed loanId, address indexed borrower, address nftAddress, uint256 tokenId, uint256 loanAmount);
    event LoanFunded (uint256 indexed loanId, address indexed lender, uint256 startTime);
    event LoanRepaid (uint256 indexed loanId, address indexed borrower);
    event LoanLiquidated (uint256 indexed loanId, address indexed lender);
    event LoanCancelled (uint256 indexed loanId);


    /**
    * @notice borrower calls this function to request loan with nft
     */

     function createLoan(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _loanAmount,
        uint256 _interestAmount,
        uint256 _duration
     ) external nonReentrant returns(uint256 ) {
        require(_loanAmount > 0, "Loan amount must be greater than zero");
        require(_duration > 0, "Duration must be greater than zero");

        IERC721(_nftAddress).safeTransferFrom(msg.sender, address(this), _tokenId);

        uint256 loanId = nextLoanId++;

        loans[loanId] = Loan({
            loanId: loanId,
            borrower: payable(msg.sender),
            lender: payable(address(0)),
            nftAddress: _nftAddress,
            tokenId: _tokenId,
            loanAmount: _loanAmount,
            interestAmount: _interestAmount,
            duration: _duration,
            startTime: 0,
            status: LoanStatus.PENDING
        });

        emit LoanCreated(loanId, msg.sender, _nftAddress, _tokenId, _loanAmount);

        return loanId;

     }

     /**
     @notice lender will release fund and active 
      */

      function fundLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan =loans[_loanId];

        //CEI pattern

        require(loan.status == LoanStatus.PENDING, "Protocol: Loan is not pending");
        require(msg.value == loan.loanAmount, "Protocol: Incorrect ETH sent");
        require(msg.sender != loan.borrower, "Protocol: Borrower cannot fun own loan");

        loan.lender = payable(msg.sender);
        loan.startTime = block.timestamp;
        loan.status = LoanStatus.ACTIVE;

        (bool success, ) = loan.borrower.call{value: msg.value}("");
        require(success, "Protocol: Transfer to borrower failed");

        emit LoanFunded(_loanId, msg.sender, loan.startTime);
      }


      //============================================================
      // Homework
      //============================================================

      function repayLoan(uint _loanId) external payable nonReentrant {
        // is it active? 
        // if the duration exceeded
        // right amoutn
        //
      }

      function cancelLoan(uint256 _loanId) external nonReentrant {
        //if it is pending 
        //if msg.sender is borrower
        //
      }

      // to receive ERC721 token, this function is required

      function onERC721Received(address,
         address,
         uint256,
         bytes calldata) external pure override returns(bytes4) {
            return this.onERC721Received.selector;
         }
}