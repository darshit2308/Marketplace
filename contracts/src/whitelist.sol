// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract Whitelist is Ownable {
    error Deadline_Reached();
    error Supporter_Limit_Reached();
    error Already_Registered();

    event Registered(bytes32 commitment);

    string public NAME;
    string public SYMBOL;

    address private immutable i_tokenAddr;

    uint256 public immutable i_deadline;
    uint256 public immutable i_maxSupporters;

    uint256 public s_supporterCount;

    bytes32 private s_merkleRoot;

    mapping(bytes32 commitment => bool hasregistered) public s_registered;

    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenAddr,
        uint256 _supportPeriod,
        uint256 _maxSupporters,
        address _owner
    ) Ownable(_owner) {
        NAME = _name;
        SYMBOL = _symbol;
        i_tokenAddr = _tokenAddr;
        i_deadline = block.timestamp + _supportPeriod;
        s_merkleRoot = bytes32("");
        i_maxSupporters = _maxSupporters;
        s_supporterCount = 0;
    }

    function register(bytes32 _commitment) public onlyOwner returns (bool) {
        if (block.timestamp > i_deadline) revert Deadline_Reached();
        if (s_supporterCount == i_maxSupporters)
            revert Supporter_Limit_Reached();

        if (s_registered[_commitment]) revert Already_Registered();
        s_registered[_commitment] = true;
        s_supporterCount++;

        emit Registered(_commitment);
        return true;
    }

    function getMaxSupporters() public view returns (uint256) {
        return i_maxSupporters;
    }
}
