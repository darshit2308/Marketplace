// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {VerifyZKProof} from "./verifyZKProof.sol";

contract Instance is Ownable {
    // custom errors
    error Locked();
    error Insufficient_Amount();
    error Exceeds_Contribution_Limit();
    error Already_Contributed();
    error Already_Claimed();
    error Contribution_Phase_Ongoing();
    error Reached_Deadline();
    error Not_Reached_Launch_Time();

    // events
    event Contributed(uint256 indexed nullifier, uint256 amount);
    event Claimed(uint256 indexed nullifier, uint256 indexed claimCommitment);

    // enums
    enum Status {
        LOCKED,
        UNLOCKED
    }

    // state variables
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

    bytes32 private immutable i_whitelistVKHash;
    bytes32 private immutable i_contributionVKHash;

    VerifyZKProof private immutable i_verifyZKProof;

    mapping(uint256 contributerHash => bool hasContributed)
        public s_contributers;
    mapping(uint256 claimerHash => bool hasClaimed) public s_claimers;

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
        address _verifyZKProofAddr,
        bytes32 _whitelistVKHash,
        bytes32 _contributionVKHash
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
        i_whitelistVKHash = _whitelistVKHash;
        i_contributionVKHash = _contributionVKHash;
    }

    // modifiers
    modifier _unlocked() {
        if (
            block.timestamp < i_launchTime || block.timestamp > i_saleDeadline
        ) {
            revert Locked();
        }
        if (s_status == Status.LOCKED) revert Locked();
        _;
    }

    /**
     * @dev Locks the instance, preventing any contributions
     * NOTE: Only the owner can call this function
     */
    function lock() public onlyOwner _unlocked {
        s_status = Status.LOCKED;
    }

    /**
     * @dev Unlocks the instance, allowing contributions
     * NOTE: Only the owner can call this function
     */
    function unlock() public onlyOwner {
        if (block.timestamp > i_saleDeadline) revert Reached_Deadline();
        if (block.timestamp < i_launchTime) revert Not_Reached_Launch_Time();
        s_status = Status.UNLOCKED;
    }

    /**
     * @dev Function used to contribute ETH to the instance.
     * @param nullifier Nullifier hash
     * @param attestationId Attestation ID
     * @param merklePath Merkle path
     * @param leafCount Leaf count
     * @param index Index
     * NOTE: 1. Requires a valid ZK proof of the user being whitelisted, verifies the proof on the zkVerify contract
     *          and then adds the hash of the user and contribution to the merkle tree off-chain
     *       2. Can only be called when the instance is unlocked
     *       3. The amount must be greater than or equal to the minimum fee and lesser than or equal to the maximum fee
     */
    function conribute(
        uint256 nullifier,
        uint256 attestationId,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index,
        uint256 merkleRoot
    ) public payable _unlocked {
        if (msg.value < i_minFee) revert Insufficient_Amount();
        if (msg.value > i_maxFee) revert Exceeds_Contribution_Limit();

        if (s_contributers[nullifier]) revert Already_Contributed();
        i_verifyZKProof.verifyZKProof(
            attestationId,
            merkleRoot,
            merklePath,
            leafCount,
            index,
            i_whitelistVKHash
        );

        s_contributers[nullifier] = true;
        s_totalContrib += msg.value;

        emit Contributed(nullifier, msg.value);
    }

    /**
     * @dev Function used to claim the tokens after the sale period is over
     * @param nullifier Nullifier hash
     * @param claimCommitment Hash of claim amount and user's nullifier
     * @param attestationId Attestation ID
     * @param merklePath Merkle path
     * @param leafCount Leaf count
     * @param index Index
     * NOTE: 1. Requires a valid ZK proof of the user being in the contributors merkle tree, verifies the proof on the zkVerify contract
     *          and then calculates the amount of tokens to be claimed by the user based on their contribution and transfers them to the
     *          user's address off-chain
     *       2. Can only be called after the sale period is over
     *       3. The user must have contributed to the instance
     *       4. The user can only claim once
     */
    function claim(
        uint256 nullifier,
        uint256 claimCommitment,
        uint256 attestationId,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index,
        uint256 merkleRoot
    ) public {
        if (block.timestamp < i_launchTime) revert Not_Reached_Launch_Time();
        if (block.timestamp < i_saleDeadline) {
            revert Contribution_Phase_Ongoing();
        }
        if (s_claimers[nullifier]) revert Already_Claimed();

        i_verifyZKProof.verifyZKProof(
            attestationId,
            merkleRoot,
            merklePath,
            leafCount,
            index,
            i_contributionVKHash
        );
        s_claimers[nullifier] = true;

        emit Claimed(nullifier, claimCommitment);
    }

    function getTotalContrib() external view returns (uint256) {
        return s_totalContrib;
    }

    function getTotalSupply() external view returns (uint256) {
        return i_totalSupply;
    }
}
