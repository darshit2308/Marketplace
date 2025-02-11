// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {Factory} from "../src/factory.sol";
import {VerifyZKProof} from "../src/verifyZKProof.sol";

contract DeployVeilPad is Script {
    Factory factory;
    VerifyZKProof verifyZKProof;

    address zkvAddr = 0x82941a739E74eBFaC72D0d0f8E81B1Dac2f586D5;
    bytes32 private whitelistVKHash =
        0xb9ac857c84c2746d85fe47e921cc8d50a37aa8f543994f47bf9a6e19b588990d;
    bytes32 private contributionVKHash =
        0x54894f25b7cf372fe29b4439fee071fe8a2063794c9cf7dee50a2c161183e624;

    function run() external returns (Factory, VerifyZKProof) {
        vm.startBroadcast();
        verifyZKProof = new VerifyZKProof(zkvAddr);
        factory = new Factory(whitelistVKHash, contributionVKHash);
        vm.stopBroadcast();

        return (factory, verifyZKProof);
    }
}
