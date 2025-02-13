// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 _totalSupply,
        address _owner
    ) ERC20(name, symbol) Ownable(_owner) {
        _mint(_owner, _totalSupply);
    }

    function transferTokens(
        address recipient,
        uint256 amount
    ) external onlyOwner {
        transfer(recipient, amount);
    }
}
