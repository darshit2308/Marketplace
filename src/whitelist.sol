// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Whitelist {
    error Deadline_Reached();
    error Insufficient_Amount();
    error Exceeds_Contribution_Limit();
    error Supporter_Limit_Reached();
    error Already_Contributed();

    string public NAME;
    string public SYMBOL;

    address private immutable i_tokenAddr;

    uint256 public immutable i_deadline;
    uint256 public immutable i_minSupportContrib;
    uint256 public immutable i_maxSupportContrib;
    uint256 public immutable i_maxSupporters;

    uint256 public s_supporterCount;

    bytes32 private s_merkleRoot;

    mapping(bytes32 addressHash => bool hasContributed) public s_contributed;

    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenAddr,
        uint256 _supportPeriod,
        uint256 _minSupportContrib,
        uint256 _maxSupportContrib,
        uint256 _maxSupporters
    ) {
        NAME = _name;
        SYMBOL = _symbol;
        i_tokenAddr = _tokenAddr;
        i_deadline = block.timestamp + _supportPeriod;
        i_minSupportContrib = _minSupportContrib;
        i_maxSupportContrib = _maxSupportContrib;
        s_merkleRoot = bytes32("");
        i_maxSupporters = _maxSupporters;
        s_supporterCount = 0;
    }

    function support() public payable {
        if (block.timestamp > i_deadline) revert Deadline_Reached();
        if (msg.value < i_minSupportContrib) revert Insufficient_Amount();
        if (msg.value > i_maxSupportContrib)
            revert Exceeds_Contribution_Limit();
        if (s_supporterCount == i_maxSupporters)
            revert Supporter_Limit_Reached();

        bytes32 userHash = bytes32(keccak256(abi.encode(msg.sender)));
        if (s_contributed[userHash]) revert Already_Contributed();
        s_contributed[userHash] = true;
        s_supporterCount++;
    }
}
