// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Instance {
    string public NAME;
    string public SYMBOL;

    address private immutable i_tokenAddr;
    address private immutable i_whitelistAddr;

    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenAddr,
        address _whitelistAddr
    ) {
        NAME = _name;
        SYMBOL = _symbol;
        i_tokenAddr = _tokenAddr;
        i_whitelistAddr = _whitelistAddr;
    }
}
