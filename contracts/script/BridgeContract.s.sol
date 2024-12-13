// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {BridgeContract} from "../src/BridgeContract.sol";

contract CounterScript is Script {
    BridgeContract public bridgeContract;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        bridgeContract = new BridgeContract();

        vm.stopBroadcast();
    }
}
