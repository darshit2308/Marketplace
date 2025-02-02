// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract Instance is Ownable {
    error Locked();
    error Insufficient_Amount();
    error Exceeds_Contribution_Limit();
    error Already_Contributed();

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

    mapping(bytes32 contributerHash => bool hasContributed)
        public s_contributers;

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
        address _owner
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
        s_status = Status.LOCKED;
        s_totalContrib = 0;
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
        if (block.timestamp > i_saleDeadline || block.timestamp < i_launchTime)
            revert();
        s_status = Status.UNLOCKED;
    }

    function _conribute(
        bytes32 commitment,
        uint256 amount
    ) internal returns (bool) {
        if (amount < i_minFee) revert Insufficient_Amount();
        if (amount > i_maxFee) revert Exceeds_Contribution_Limit();

        if (s_contributers[commitment]) revert Already_Contributed();
        s_contributers[commitment] = true;
        s_totalContrib += amount;

        return true;
    }
}
