// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract Game {

    address public authority;

    bytes public colors;

    uint public state;

    uint16 immutable public height;
    uint16 immutable public width;
    uint immutable public changeCost;

    event PixelChangedEvent(uint16 row, uint16 column, uint8 color);

    constructor(uint16 _height, uint16 _width, uint _changeCost) {
        require(_height > 0 && _width > 0);
        height = _height;
        width = _width;
        changeCost = _changeCost;
        authority = msg.sender;
        colors = new bytes(height * width);
    }

    function changePixel(uint16 row, uint16 column, uint8 newColor) public {
        require(row < height && column < width, "Index out of game bounds");
        uint index = (uint(row) * uint(width)) + uint(column);
        colors[index] = bytes1(newColor);
        emit PixelChangedEvent(row, column, newColor);
    }
}