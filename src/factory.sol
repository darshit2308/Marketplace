// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Whitelist} from "./whitelist.sol";
import {Instance} from "./instance.sol";

contract Factory {
    error Invalid_Name();
    error Invalid_Symbol();

    event NewInstance(
        string name,
        string symbol,
        address instance,
        address whitelist
    );

    mapping(string name => InstanceParams) s_nameToParams;
    mapping(string symbol => InstanceParams) s_symbolToParams;

    InstanceParams[] public s_instances;
    uint256 public s_instanceCount;

    constructor() {
        s_instanceCount = 0;
    }

    struct InstanceParams {
        string name;
        string symbol;
        address tokenAddr;
        address whitelistAddr;
        address instanceAddr;
    }

    function newInstance(
        string memory name,
        string memory symbol,
        address tokenAddr,
        uint256 totalSupply,
        uint256 supportPeriod,
        uint256 minSupportContrib,
        uint256 maxSupportContrib,
        uint256 minContrib,
        uint256 maxContrib,
        uint256 salePeriod,
        uint256 maxSupporters
    ) public returns (address, address) {
        Whitelist whitelist = new Whitelist(
            name,
            symbol,
            tokenAddr,
            supportPeriod,
            minSupportContrib,
            maxSupportContrib,
            maxSupporters
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
            msg.sender
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

    function getDetailsFromName(
        string memory name
    ) public view returns (InstanceParams memory) {
        if (s_nameToParams[name].instanceAddr == address(0)) {
            revert Invalid_Name();
        }
        return s_nameToParams[name];
    }

    function getDetailsFromSymbol(
        string memory symbol
    ) public view returns (InstanceParams memory) {
        if (s_symbolToParams[symbol].instanceAddr == address(0)) {
            revert Invalid_Symbol();
        }
        return s_symbolToParams[symbol];
    }
}
