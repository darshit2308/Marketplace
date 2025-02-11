// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Whitelist} from "./whitelist.sol";
import {Instance} from "./instance.sol";

contract Factory {
    // custom errors
    error Invalid_Name();
    error Invalid_Symbol();

    // events
    event NewInstance(
        string name,
        string symbol,
        address instance,
        address whitelist
    );

    //mappings
    mapping(string name => InstanceParams) s_nameToParams;
    mapping(string symbol => InstanceParams) s_symbolToParams;

    // state variables
    InstanceParams[] public s_instances;
    uint256 public s_instanceCount;

    bytes32 private immutable i_whitelistVKHash;
    bytes32 private immutable i_contributionVKHash;

    constructor(bytes32 _whitelistVKHash, bytes32 _contributionVKHash) {
        s_instanceCount = 0;
        i_whitelistVKHash = _whitelistVKHash;
        i_contributionVKHash = _contributionVKHash;
    }

    /**
     * @dev Struct to store instance parameters
     * @param name Name of the instance
     * @param symbol Symbol of the instance
     * @param tokenAddr Address of the token contract
     * @param whitelistAddr Address of the whitelist contract
     * @param instanceAddr Address of the instance contract
     */
    struct InstanceParams {
        string name;
        string symbol;
        address tokenAddr;
        address whitelistAddr;
        address instanceAddr;
    }

    /**
     * @dev Creates a new instance and whitelist contract
     * @param name Name of the token
     * @param symbol Symbol of the token
     * @param tokenAddr Address of the token contract
     * @param totalSupply Total supply of the token that is to be sold
     * @param supportPeriod Duration of the whitelisting period
     * @param minContrib Minimum contribution amount
     * @param maxContrib Maximum contribution amount
     * @param salePeriod Duration of the sale period
     * @param zkVerifyAddr Address of the zkVerify contract
     */
    function newInstance(
        string memory name,
        string memory symbol,
        address tokenAddr,
        uint256 totalSupply,
        uint256 supportPeriod,
        uint256 minContrib,
        uint256 maxContrib,
        uint256 salePeriod,
        address zkVerifyAddr
    ) public returns (address, address) {
        Whitelist whitelist = new Whitelist(
            name,
            symbol,
            tokenAddr,
            supportPeriod,
            totalSupply / maxContrib,
            msg.sender
        );
        Instance instance = new Instance(
            name,
            symbol,
            tokenAddr,
            address(whitelist),
            totalSupply,
            minContrib,
            maxContrib,
            supportPeriod,
            salePeriod,
            msg.sender,
            zkVerifyAddr,
            i_whitelistVKHash,
            i_contributionVKHash
        );

        InstanceParams memory params = InstanceParams({
            name: name,
            symbol: symbol,
            tokenAddr: tokenAddr,
            whitelistAddr: address(whitelist),
            instanceAddr: address(instance)
        });
        s_nameToParams[name] = params;
        s_symbolToParams[symbol] = params;
        s_instances.push(params);

        emit NewInstance(name, symbol, address(instance), address(whitelist));
        return (address(instance), address(whitelist));
    }

    /**
     * @dev Returns the instance parameters from the name
     * @param name Name of the token
     */
    function getDetailsFromName(
        string memory name
    ) public view returns (InstanceParams memory) {
        if (s_nameToParams[name].instanceAddr == address(0)) {
            revert Invalid_Name();
        }
        return s_nameToParams[name];
    }

    /**
     * @dev Returns the instance parameters from the symbol
     * @param symbol Symbol of the token
     */
    function getDetailsFromSymbol(
        string memory symbol
    ) public view returns (InstanceParams memory) {
        if (s_symbolToParams[symbol].instanceAddr == address(0)) {
            revert Invalid_Symbol();
        }
        return s_symbolToParams[symbol];
    }
}
