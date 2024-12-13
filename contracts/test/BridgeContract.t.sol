// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {BridgeContract} from "../src/BridgeContract.sol"; // Adjust path based on your setup
import {MockERC20} from "../src/MockERC20.sol"; // Adjust path based on your setup

contract BridgeContractTest is Test {
    BridgeContract bridgeContract;
    MockERC20 token;

    address owner = address(1); // Contract owner
    address user = address(2);  // Test user
    address recipient = address(3); // Redeem recipient

    function setUp() public {
        vm.prank(owner); // Deploy contract as the owner
        bridgeContract = new BridgeContract();

        token = new MockERC20(); // Deploy a mock ERC20 token

        // Assign tokens to the user
        token.transfer(user, 1_000 * 10 ** token.decimals());
    }

    /// @dev Test the `bridge` function: Success scenario
    function testBridge_Success() public {
        uint256 amount = 100 * 10 ** token.decimals();

        // User approves the BridgeContract to spend tokens
        vm.prank(user);
        token.approve(address(bridgeContract), amount);

        // Verify allowance
        assertEq(token.allowance(user, address(bridgeContract)), amount);

        // Perform the bridge operation
        vm.prank(user);
        bridgeContract.bridge(token, amount);

        // Check contract balance
        assertEq(token.balanceOf(address(bridgeContract)), amount);

        // Check user balance
        assertEq(token.balanceOf(user), 900 * 10 ** token.decimals());
    }

    /// @dev Test the `bridge` function: Insufficient allowance
    function testBridge_InsufficientAllowance() public {
        uint256 amount = 100 * 10 ** token.decimals();

        // User does not approve the BridgeContract
        vm.prank(user);

        vm.expectRevert(BridgeContract.BridgeContract__Insufficient_Allowance.selector);
        bridgeContract.bridge(token, amount);
    }

    /// @dev Test the `bridge` function: Transfer failure
    function testBridge_TransferFailed() public {
        uint256 amount = 100 * 10 ** token.decimals();

        // User approves the contract
        vm.prank(user);
        token.approve(address(bridgeContract), amount);

        // Simulate transfer failure by toggling the failure flag
        vm.prank(owner);
        token.setFailTransfers(true);

        // Expect transfer failure
        vm.prank(user);
        vm.expectRevert(BridgeContract.BridgeContract__Transaction_Failed.selector);
        bridgeContract.bridge(token, amount);
    }

    /// @dev Test the `redeem` function: Success scenario
    function testRedeem_Success() public {
        uint256 amount = 100 * 10 ** token.decimals();

        // User approves and bridges tokens
        vm.startPrank(user);
        token.approve(address(bridgeContract), amount);
        bridgeContract.bridge(token, amount);
        vm.stopPrank();

        // Verify contract balance before redeem
        assertEq(token.balanceOf(address(bridgeContract)), amount);

        // Owner redeems tokens to the recipient
        vm.prank(owner);
        bridgeContract.redeem(token, recipient, amount, 1);

        // Check recipient balance
        assertEq(token.balanceOf(recipient), amount);

        // Verify updated nonce
        assertEq(bridgeContract.nonce(), 1);
    }

    /// @dev Test the `redeem` function: Invalid nonce
    function testRedeem_InvalidNonce() public {
        uint256 amount = 100 * 10 ** token.decimals();

        // Owner tries redeeming with an incorrect nonce
        vm.prank(owner);
        vm.expectRevert("Invalid nonce");
        bridgeContract.redeem(token, recipient, amount, 2);
    }

    // /// @dev Test the `redeem` function: Transfer failure
    // function testRedeem_TransferFailed() public {
    //     uint256 amount = 100 * 10 ** token.decimals();

    //     // User bridges tokens
    //     vm.startPrank(user);
    //     token.approve(address(bridgeContract), amount);
    //     bridgeContract.bridge(token, amount);
    //     vm.stopPrank();

    //     // Simulate transfer failure by toggling the failure flag
    //     vm.prank(owner);
    //     token.setFailTransfers(true);

    //     // Attempt to redeem (expect transfer failure)
    //     vm.prank(owner);
    //     vm.expectRevert(BridgeContract.BridgeContract__Transaction_Failed.selector);
    //     bridgeContract.redeem(token, recipient, amount, 1);
    // }
}
