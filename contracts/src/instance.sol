// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {VerifyZKProof} from "./verifyZKProof.sol";

contract Instance is Ownable {
    error Locked();
    error Insufficient_Amount();
    error Exceeds_Contribution_Limit();
    error Already_Contributed();
    error Already_Claimed();
    error Contribution_Phase_Ongoing();
    error Reached_Deadline();
    error Not_Reached_Launch_Time();

    event Contributed(bytes32 commitment, uint256 amount);
    event Claimed(bytes32 commitment, bytes32 amount);

    enum Status {
        LOCKED,
        UNLOCKED
    }

    string public NAME;
    string public SYMBOL;

    address private immutable i_tokenAddr;
    address private immutable i_whitelistAddr;

    uint256 public immutable i_totalSupply;
    uint256 public immutable i_minFee;
    uint256 public immutable i_maxFee;
    uint256 public immutable i_launchTime;
    uint256 public immutable i_saleDeadline;

    uint256 public s_totalContrib;

    VerifyZKProof private immutable i_verifyZKProof;

    mapping(bytes32 contributerHash => bool hasContributed)
        public s_contributers;
    mapping(bytes32 claimerHash => bool hasClaimed) public s_claimers;

    Status public s_status;

    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenAddr,
        address _whitelistAddr,
        uint256 _totalSupply,
        uint256 _minFee,
        uint256 _maxFee,
        uint256 _supportPeriod,
        uint256 _salePeriod,
        address _owner,
        address _verifyZKProofAddr
    ) Ownable(_owner) {
        NAME = _name;
        SYMBOL = _symbol;
        i_tokenAddr = _tokenAddr;
        i_whitelistAddr = _whitelistAddr;
        i_totalSupply = _totalSupply;
        i_minFee = _minFee;
        i_maxFee = _maxFee;
        i_launchTime = block.timestamp + _supportPeriod;
        i_saleDeadline = i_launchTime + _salePeriod;
        s_status = Status.UNLOCKED;
        s_totalContrib = 0;
        i_verifyZKProof = VerifyZKProof(_verifyZKProofAddr);
    }

    modifier _unlocked() {
        if (block.timestamp < i_launchTime || block.timestamp > i_saleDeadline)
            revert Locked();
        if (s_status == Status.LOCKED) revert Locked();
        _;
    }

    function lock() public onlyOwner _unlocked {
        s_status = Status.LOCKED;
    }

    function unlock() public onlyOwner {
        if (block.timestamp > i_saleDeadline) revert Reached_Deadline();
        if (block.timestamp < i_launchTime) revert Not_Reached_Launch_Time();
        s_status = Status.UNLOCKED;
    }

    function conribute(
        bytes32 commitment,
        uint256 amount,
        uint256 attestationId,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index
    ) external payable onlyOwner _unlocked {
        if (amount < i_minFee) revert Insufficient_Amount();
        if (amount > i_maxFee) revert Exceeds_Contribution_Limit();
        if (msg.value != amount) revert Insufficient_Amount();

        if (s_contributers[commitment]) revert Already_Contributed();
        i_verifyZKProof.verifyZKProof(
            attestationId,
            merklePath,
            leafCount,
            index,
            msg.sender
        );

        s_contributers[commitment] = true;
        s_totalContrib += amount;

        emit Contributed(commitment, amount);
    }

    function claim(
        bytes32 commitment,
        bytes32 amount,
        uint256 attestationId,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index
    ) external onlyOwner {
        if (block.timestamp < i_launchTime) revert Not_Reached_Launch_Time();
        if (block.timestamp < i_saleDeadline)
            revert Contribution_Phase_Ongoing();
        if (s_claimers[commitment]) revert Already_Claimed();

        i_verifyZKProof.verifyZKProof(
            attestationId,
            merklePath,
            leafCount,
            index,
            msg.sender
        );

        s_claimers[commitment] = true;

        emit Claimed(commitment, amount);
    }
}
