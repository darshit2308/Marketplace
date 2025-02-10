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
    event Contributed(bytes32 commitment, uint256 amount);
    event Claimed(bytes32 commitment, bytes32 amount);

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

    VerifyZKProof private immutable i_verifyZKProof;

    mapping(bytes32 contributerHash => bool hasContributed) public s_contributers;
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

    // modifiers
    modifier _unlocked() {
        if (block.timestamp < i_launchTime || block.timestamp > i_saleDeadline) {
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
     * @param amount Amount to contribute
     * @param attestationId Attestation ID
     * @param merklePath Merkle path
     * @param leafCount Leaf count
     * @param index Index
     * NOTE: 1. Only the owner can call this function, so that the addresses of the users cannot get traced or leaked
     *       2. Requires a valid ZK proof of the user being whitelisted, verifies the proof on the zkVerify contract
     *          and then adds the hash of the user and contribution to the merkle tree off-chain
     *       3. Can only be called when the instance is unlocked
     *       4. The amount must be greater than or equal to the minimum fee and lesser than or equal to the maximum fee
     */
    function conribute(
        bytes32 nullifier,
        uint256 amount,
        uint256 attestationId,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index,
        bytes32 merkleRoot,
        uint256 treeDepth
    ) external payable onlyOwner _unlocked {
        if (amount < i_minFee) revert Insufficient_Amount();
        if (amount > i_maxFee) revert Exceeds_Contribution_Limit();
        if (msg.value != amount) revert Insufficient_Amount();

        if (s_contributers[nullifier]) revert Already_Contributed();
        i_verifyZKProof.verifyZKProof(attestationId, merkleRoot, treeDepth, merklePath, leafCount, index);

        s_contributers[nullifier] = true;
        s_totalContrib += amount;

        emit Contributed(nullifier, amount);
    }

    /**
     * @dev Function used to claim the tokens after the sale period is over
     * @param nullifier Nullifier hash
     * @param amount Amount to claim
     * @param attestationId Attestation ID
     * @param merklePath Merkle path
     * @param leafCount Leaf count
     * @param index Index
     * NOTE: 1. Only the owner can call this function, so that the addresses of the users cannot get traced or leaked
     *       2. Requires a valid ZK proof of the user being in the contributors merkle tree, verifies the proof on the zkVerify contract
     *          and then calculates the amount of tokens to be claimed by the user based on their contribution and transfers them to the
     *          user's address off-chain
     *       3. Can only be called after the sale period is over
     *       4. The user must have contributed to the instance
     *       5. The user can only claim once
     */
    function claim(
        bytes32 nullifier,
        bytes32 amount,
        uint256 attestationId,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index,
        bytes32 merkleRoot,
        uint256 treeDepth
    ) external onlyOwner {
        if (block.timestamp < i_launchTime) revert Not_Reached_Launch_Time();
        if (block.timestamp < i_saleDeadline) {
            revert Contribution_Phase_Ongoing();
        }
        if (s_claimers[nullifier]) revert Already_Claimed();

        i_verifyZKProof.verifyZKProof(attestationId, merkleRoot, treeDepth, merklePath, leafCount, index);
        s_claimers[nullifier] = true;

        emit Claimed(nullifier, amount);
    }
}
