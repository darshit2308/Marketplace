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
    ) internal pure returns (uint256) {
        uint256 commitment = uint256(
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
        uint256 commitment = getCommitment(secret, userAddr);

        whitelist.register(commitment);
        assertEq(whitelist.s_supporterCount(), 1);
        assertTrue(whitelist.s_registered(commitment));
        assertFalse(
            whitelist.s_registered(
                uint256(keccak256(abi.encodePacked(userAddr)))
            )
        );
    }

    function testMoreThanMaxSupportersCannotRegister() external {
        string memory secret = "secret";

        for (uint256 i = 0; i < whitelist.getMaxSupporters(); i++) {
            address userAddr = address(uint160(1000 + i));
            uint256 commitment = getCommitment(secret, userAddr);

            whitelist.register(commitment);
        }

        address newUserAddr = address(10);
        uint256 newCommitment = getCommitment(secret, newUserAddr);

        vm.expectRevert(Whitelist.Supporter_Limit_Reached.selector);
        whitelist.register(newCommitment);
    }

    function testCannotRegisterMoreThanOnce() external {
        string memory secret = "secret";
        address userAddr = address(uint160(1000));
        uint256 commitment = getCommitment(secret, userAddr);
        whitelist.register(commitment);

        vm.expectRevert(Whitelist.Already_Registered.selector);
        whitelist.register(commitment);
    }

    function testCannotRegisterAfterDeadline() external {
        string memory secret = "secret";
        address userAddr = address(uint160(1000));
        uint256 commitment = getCommitment(secret, userAddr);
        whitelist.register(commitment);

        address newUserAddr = address(10);
        uint256 newCommitment = getCommitment(secret, newUserAddr);

        vm.warp(block.timestamp + whitelist.i_deadline() + 1);
        vm.expectRevert(Whitelist.Deadline_Reached.selector);
        whitelist.register(newCommitment);
    }

    function testCantContributeBeforeLaunchTime() external {
        vm.expectRevert(Instance.Locked.selector);
        instance.conribute{value: 1 ether}(
            uint256(0),
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
            uint256(0),
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
            uint256(0),
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
            uint256(0),
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
            uint256(0),
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
        instance.claim(uint256(0), uint256(0), 0, new bytes32[](0), 0, 0, "");

        vm.warp(instance.i_launchTime() + 1);
        vm.expectRevert(Instance.Contribution_Phase_Ongoing.selector);
        instance.claim(uint256(0), uint256(0), 0, new bytes32[](0), 0, 0, "");
    }

    function testVerification() external {
        (address instanceAddr, , ) = factory.newInstance(
            "TOKEN",
            "TKN",
            100 ether,
            7 days,
            0.0001 ether,
            0.0003 ether,
            7 days,
            0x82941a739E74eBFaC72D0d0f8E81B1Dac2f586D5
        );
        instance = Instance(instanceAddr);
        vm.warp(instance.i_launchTime() + 1);
        bytes32[] memory path = new bytes32[](1);
        path[0] = bytes32(
            0x004ae0c0b9b30ba8c99e785e4c90fa215e287aece9954e5f9478b1b16b965f91
        );
        vm.prank(0xa53c827DA36eC381216a08339B5197202F51497E);
        instance.conribute{value: 0.0002 ether}(
            1149892245620469329129695825637394633465204516,
            44190,
            path,
            2,
            1,
            ""
        );
    }
}
