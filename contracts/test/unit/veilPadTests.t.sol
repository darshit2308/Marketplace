// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {Factory} from "../../src/factory.sol";
import {VerifyZKProof} from "../../src/verifyZKProof.sol";
import {Whitelist} from "../../src/whitelist.sol";
import {Instance} from "../../src/instance.sol";
import {DeployVeilPad} from "../../script/deployVeilPad.s.sol";
import {MockToken} from "../mocks/mockToken.sol";
import {Test} from "forge-std/Test.sol";

contract VeilPadTests is Test {
    Factory factory;
    Whitelist whitelist;
    Instance instance;
    VerifyZKProof verifyZKProof;
    MockToken token;

    function setUp() external {
        DeployVeilPad deployer = new DeployVeilPad();
        (factory, verifyZKProof) = deployer.run();
        token = new MockToken("Token", "TKN", 1000 * 1e18);
        (address instanceAddr, address whitelistAddr) = factory.newInstance(
            token.name(),
            token.symbol(),
            address(token),
            token.totalSupply(),
            7 days,
            0.5 ether,
            2 ether,
            7 days,
            0x82941a739E74eBFaC72D0d0f8E81B1Dac2f586D5
        );

        instance = Instance(instanceAddr);
        whitelist = Whitelist(whitelistAddr);
    }

    function testMaxSupporters() external view {
        uint256 maxSupporters = 1000 / 2;
        assertEq(whitelist.getMaxSupporters(), maxSupporters);
    }
}
