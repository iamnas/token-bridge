// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    bool public failTransfers;

    error BridgeContract__Transaction_Failed();

    constructor() ERC20("Mock Token", "MTK") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function setFailTransfers(bool _fail) external {
        failTransfers = _fail;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        if (failTransfers) revert BridgeContract__Transaction_Failed();
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        if (failTransfers) revert BridgeContract__Transaction_Failed();
        return super.transferFrom(from, to, amount);
    }
}
