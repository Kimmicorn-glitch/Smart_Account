// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Count {
    uint256 public count;
    address public calledBy;

    function increment(uint256 value) public {
        count += value;
        calledBy = msg.sender;
    }
}