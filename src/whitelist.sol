// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Whitelist {
    string public NAME;
    string public SYMBOL;

    address private immutable i_tokenAddr;

    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenAddr
    ) {
        NAME = _name;
        SYMBOL = _symbol;
        i_tokenAddr = _tokenAddr;
    }
}
