// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {Factory} from "../src/factory.sol";
import {VerifyZKProof} from "../src/verifyZKProof.sol";

contract DeployVeilPad is Script {
    Factory factory;
    VerifyZKProof verifyZKProof;

    address zkvAddr = 0x82941a739E74eBFaC72D0d0f8E81B1Dac2f586D5;
    bytes32 vkHash;

    function run() external returns (Factory, VerifyZKProof) {
        vm.startBroadcast();
        verifyZKProof = new VerifyZKProof(zkvAddr, vkHash);
        factory = new Factory();
        vm.stopBroadcast();

        return (factory, verifyZKProof);
    }
}
