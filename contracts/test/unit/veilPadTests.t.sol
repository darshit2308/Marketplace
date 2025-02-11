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
import {Token} from "../../src/token.sol";
import {Ownable} from "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract VeilPadTests is Test {
    Factory factory;
    Whitelist whitelist;
    Instance instance;
    VerifyZKProof verifyZKProof;
    Token token;

    function setUp() external {
        DeployVeilPad deployer = new DeployVeilPad();
        (factory, verifyZKProof) = deployer.run();
        (
            address instanceAddr,
            address whitelistAddr,
            address tokenAddr
        ) = factory.newInstance(
                "TOKEN",
                "TKN",
                100 ether,
                7 days,
                0.5 ether,
                2 ether,
                7 days,
                0x82941a739E74eBFaC72D0d0f8E81B1Dac2f586D5
            );

        token = Token(tokenAddr);
        instance = Instance(instanceAddr);
        whitelist = Whitelist(whitelistAddr);
    }

    //helpers

    function getCommitment(
        string memory secret,
        address userAddr
    ) internal pure returns (bytes32) {
        bytes32 commitment = bytes32(
            keccak256(abi.encodePacked(userAddr, secret))
        );
        return commitment;
    }

    // tests

    function testMaxSupporters() external view {
        uint256 maxSupporters = 100 / 2;
        assertEq(whitelist.getMaxSupporters(), maxSupporters);
    }

    function testRegistering() external {
        address userAddr = address(1000);
        string memory secret = "secret";
        bytes32 commitment = getCommitment(secret, userAddr);

        whitelist.register(commitment);
        assertEq(whitelist.s_supporterCount(), 1);
        assertTrue(whitelist.s_registered(commitment));
        assertFalse(
            whitelist.s_registered(
                bytes32(keccak256(abi.encodePacked(userAddr)))
            )
        );
    }

    function testMoreThanMaxSupportersCannotRegister() external {
        string memory secret = "secret";

        for (uint256 i = 0; i < whitelist.getMaxSupporters(); i++) {
            address userAddr = address(uint160(1000 + i));
            bytes32 commitment = getCommitment(secret, userAddr);

            whitelist.register(commitment);
        }

        address newUserAddr = address(10);
        bytes32 newCommitment = getCommitment(secret, newUserAddr);

        vm.expectRevert(Whitelist.Supporter_Limit_Reached.selector);
        whitelist.register(newCommitment);
    }

    function testCannotRegisterMoreThanOnce() external {
        string memory secret = "secret";
        address userAddr = address(uint160(1000));
        bytes32 commitment = getCommitment(secret, userAddr);
        whitelist.register(commitment);

        vm.expectRevert(Whitelist.Already_Registered.selector);
        whitelist.register(commitment);
    }

    function testCannotRegisterAfterDeadline() external {
        string memory secret = "secret";
        address userAddr = address(uint160(1000));
        bytes32 commitment = getCommitment(secret, userAddr);
        whitelist.register(commitment);

        address newUserAddr = address(10);
        bytes32 newCommitment = getCommitment(secret, newUserAddr);

        vm.warp(block.timestamp + whitelist.i_deadline() + 1);
        vm.expectRevert(Whitelist.Deadline_Reached.selector);
        whitelist.register(newCommitment);
    }

    function testCantContributeBeforeLaunchTime() external {
        vm.expectRevert(Instance.Locked.selector);
        instance.conribute{value: 1 ether}(
            bytes32(0),
            0,
            new bytes32[](0),
            0,
            0,
            ""
        );
    }

    function testCantContributeAfterSaleDeadline() external {
        vm.warp(instance.i_saleDeadline() + 1);
        vm.expectRevert(Instance.Locked.selector);
        instance.conribute{value: 1 ether}(
            bytes32(0),
            0,
            new bytes32[](0),
            0,
            0,
            ""
        );
    }

    function testCantContributeWhenLocked() external {
        vm.warp(instance.i_launchTime() + 1);
        instance.lock();
        vm.expectRevert(Instance.Locked.selector);
        instance.conribute{value: 1 ether}(
            bytes32(0),
            0,
            new bytes32[](0),
            0,
            0,
            ""
        );
    }

    function testRevertsWhenAmountIsLessThanMinFee() external {
        vm.warp(instance.i_launchTime() + 1);
        vm.expectRevert(Instance.Insufficient_Amount.selector);
        instance.conribute{value: 0.4 ether}(
            bytes32(0),
            0,
            new bytes32[](0),
            0,
            0,
            ""
        );
    }

    function testRevertsWhenAmountIsGreaterThanMaxFee() external {
        vm.warp(instance.i_launchTime() + 1);
        vm.expectRevert(Instance.Exceeds_Contribution_Limit.selector);
        instance.conribute{value: 2.1 ether}(
            bytes32(0),
            0,
            new bytes32[](0),
            0,
            0,
            ""
        );
    }

    function testOnlyOwnerCanLockAndUnlock() external {
        vm.startPrank(address(100));
        vm.expectRevert();
        instance.lock();

        vm.expectRevert();
        instance.unlock();
        vm.stopPrank();
    }

    function testCantUnlcockBeforeLaunchTime() external {
        vm.expectRevert(Instance.Not_Reached_Launch_Time.selector);
        instance.unlock();
    }

    function testCantUnlockAfterSaleDeadline() external {
        vm.warp(instance.i_saleDeadline() + 1);
        vm.expectRevert(Instance.Reached_Deadline.selector);
        instance.unlock();
    }

    function testCantClaimBeforeSaleDeadline() external {
        vm.expectRevert(Instance.Not_Reached_Launch_Time.selector);
        instance.claim(bytes32(0), bytes32(0), 0, new bytes32[](0), 0, 0, "");

        vm.warp(instance.i_launchTime() + 1);
        vm.expectRevert(Instance.Contribution_Phase_Ongoing.selector);
        instance.claim(bytes32(0), bytes32(0), 0, new bytes32[](0), 0, 0, "");
    }
}
