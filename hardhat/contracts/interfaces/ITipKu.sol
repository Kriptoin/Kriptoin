// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITipKu {
    struct Tip {
        address recipientAddress;
        address senderAddress;
        string senderName;
        string message;
        uint256 amount;
        uint8 feePercentage;
        uint256 timestamp;
    }

    event TipReceived(
        address indexed recipientAddress,
        address indexed senderAddress,
        bool indexed fakeTip,
        string senderName,
        string message,
        uint256 amount,
        uint8 feePercentage,
        uint256 timestamp
    );
}
