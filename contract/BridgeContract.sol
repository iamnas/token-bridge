// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BridgeContract  is Ownable {
    error BridgeContract__Transaction_Failed();
    error BridgeContract__Insufficient_Allowance();

    event Bridge(IERC20 , uint256,address);
    event Redeem(IERC20 ,address, uint256);

    constructor() Ownable(_msgSender()){
    }

    function bridge(IERC20 _tokenAddress,uint256 _amount ) public  {
        
        require(_tokenAddress.allowance(_msgSender(),address(this)) >= _amount,BridgeContract__Insufficient_Allowance());
        require(_tokenAddress.transferFrom(_msgSender(), address(this), _amount),BridgeContract__Transaction_Failed());
        emit Bridge(_tokenAddress, _amount,_msgSender());
    }


    function redeem(IERC20 _tokenAddress,address _to,uint256 _amount) onlyOwner external  {
        require(_tokenAddress.transfer(_to, _amount),BridgeContract__Transaction_Failed());
        emit Redeem(_tokenAddress,_to,_amount);
    }
}