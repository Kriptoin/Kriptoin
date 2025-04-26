// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./libraries/StringUtils.sol";
import "./TipKu.sol";
import "./interfaces/ITipKu.sol";
import "./libraries/TipKuLib.sol";

contract UniversalTipKu is Ownable, ITipKu {
    using StringUtils for string;

    struct CreatorInfo {
        string username;
        string name;
        address creatorAddress;
        address contractAddress;
    }

    mapping(address => CreatorInfo) public creatorInfoByAddress;
    mapping(string => CreatorInfo) public creatorInfoByUsername;
    mapping(string => address) public usernameToAddress;
    mapping(address => string) public addressToUsername;
    mapping(address => bool) public isRegistered;
    mapping(address => Tip[]) private tips;
    mapping(address => uint256) public totalTipsReceived;

    IERC20 public token;
    uint256 public minimumTipAmount;
    uint8 public feePercentage;

    event ContractDeployed(
        address indexed creatorAddress,
        address indexed creatorContractAddress
    );

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
        minimumTipAmount = 1000 ether;
        feePercentage = 1;
    }

    // @dev Function to set the token address
    // @param _token - The address of the token contract
    function setToken(address _token) external onlyOwner {
        token = IERC20(_token);
    }

    // @dev Function to set the minimum tip amount
    // @param _amount - The minimum tip amount in wei
    function setMinimumTipAmount(uint256 _amount) external onlyOwner {
        require(
            _amount < 50000 ether,
            "Minimum tip amount must be less than 50000 IDR"
        );

        minimumTipAmount = _amount;
    }

    /// @dev Function to set the fee percentage
    /// @param _feePercentage - The fee percentage to set
    function setFeePercentage(uint8 _feePercentage) external onlyOwner {
        require(_feePercentage <= 5, "Fee percentage must be less than or equal to 5");

        feePercentage = _feePercentage;
    }

    /// @dev Function to deploy a new TipKu contract
    /// @param username - The username of the creator
    function deployContract(
        string calldata username
    ) external returns (address) {
        require(
            bytes(username).length >= 3 && bytes(username).length <= 10,
            "Username must be between 3 and 10 characters"
        );
        require(username.isAlphanumeric(), "Username must be alphanumeric");
        require(
            creatorInfoByAddress[msg.sender].contractAddress == address(0),
            "Contract already deployed"
        );
        require(
            usernameToAddress[username] == address(0),
            "Username already registered"
        );
        TipKu tipKu = new TipKu(
            address(this),
            totalTipsReceived[msg.sender],
            tips[msg.sender],
            minimumTipAmount
        );
        tipKu.transferOwnership(msg.sender);
        CreatorInfo memory creatorInfo = CreatorInfo({
            username: username,
            name: username,
            creatorAddress: msg.sender,
            contractAddress: address(tipKu)
        });
        creatorInfoByAddress[msg.sender] = creatorInfo;
        creatorInfoByUsername[username] = creatorInfo;
        usernameToAddress[username] = msg.sender;
        addressToUsername[msg.sender] = username;
        isRegistered[msg.sender] = true;
        emit ContractDeployed(msg.sender, address(tipKu));
        return address(tipKu);
    }

    /// @dev Function to send a tip to an unregistered creator
    /// @param creatorAddress - The address of the creator
    /// @param senderName - The name of the sender
    /// @param message - The message sent with the tip
    /// @param amount - The amount of the tip
    function sendTip(
        address creatorAddress,
        string calldata senderName,
        string calldata message,
        uint256 amount
    ) external {
        require(
            !isRegistered[creatorAddress],
            "Creator is already registered. Please tip them through their username"
        );

        require(
            IERC20(token).balanceOf(msg.sender) >= amount,
            "Insufficient balance"
        );

        require(
            amount >= minimumTipAmount,
            "Tip amount must be greater than or equal to minimumTipAmount"
        );

        require(
            bytes(message).length >= 1 && bytes(message).length <= 250,
            "Message must be between 1 and 250 characters"
        );

        uint256 fee = (amount * feePercentage) / 100;

        uint256 amountAfterFee = amount - fee;

        bool sent = IERC20(token).transferFrom(
            msg.sender,
            creatorAddress,
            amountAfterFee
        );

        require(sent, "Failed to send tip");

        Tip memory tip = Tip({
            recipientAddress: creatorAddress,
            senderAddress: msg.sender,
            senderName: senderName,
            message: message,
            amount: amount,
            feePercentage: feePercentage,
            timestamp: block.timestamp
        });

        tips[creatorAddress].push(tip);

        totalTipsReceived[creatorAddress] += amount;

        emit TipReceived({
            recipientAddress: tip.recipientAddress,
            senderAddress: tip.senderAddress,
            fakeTip: false,
            senderName: tip.senderName,
            message: tip.message,
            amount: tip.amount,
            feePercentage: tip.feePercentage,
            timestamp: tip.timestamp
        });
    }

    /// @dev Function to withdraw fees to the owner's address
    function withdrawFees() external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));

        require(balance > 0, "No fees to withdraw");

        bool sent = IERC20(token).transferFrom(
            address(this),
            owner(),
            balance
        );

        require(sent, "Failed to send fees");
    }

    /// @dev Function to emit a tip event
    /// @param creatorAddress - The address of the creator
    /// @param senderName - The name of the sender
    /// @param message - The message sent with the tip
    /// @param amount - The amount of the tip
    function emitTipEvent(
        address creatorAddress,
        string calldata senderName,
        string calldata message,
        uint256 amount
    ) external {
        require(
            msg.sender == creatorAddress,
            "Only creator can emit tip event"
        );

        emit TipReceived({
            recipientAddress: creatorAddress,
            senderAddress: creatorAddress,
            fakeTip: true,
            senderName: senderName,
            message: message,
            amount: amount,
            feePercentage: feePercentage,
            timestamp: block.timestamp
        });
    }

    /// @dev Function to get tip history with pagination using page numbers
    /// @param pageIndex - Page index
    /// @param pageSize - Page size
    /// @return paginatedTips - Array of tips in the specified page range
    function getTipHistory(
        address creatorAddress,
        uint256 pageIndex,
        uint256 pageSize
    ) external view returns (Tip[] memory paginatedTips, uint256 totalTips) {
        totalTips = tips[creatorAddress].length;

        paginatedTips = TipKuLib.getTipHistory(
            tips[creatorAddress],
            totalTips,
            pageIndex,
            pageSize
        );
    }

    /// @dev Function to get the total number of tips
    /// @return tipCount - Total number of tips
    function getTipCount(
        address creatorAddress
    ) external view returns (uint256 tipCount) {
        tipCount = tips[creatorAddress].length;
    }

    /// @dev Function to change the creator username
    /// @param newUsername - New username to be set
    function changeUsername(string memory newUsername) external {
        require(isRegistered[msg.sender], "User is not registered");

        require(
            usernameToAddress[newUsername] == address(0),
            "Username already exist"
        );

        require(
            bytes(newUsername).length >= 3 && bytes(newUsername).length <= 10,
            "Username must be between 3 and 10 characters"
        );

        CreatorInfo storage creatorInfo = creatorInfoByAddress[msg.sender];

        delete usernameToAddress[creatorInfo.username];
        usernameToAddress[newUsername] = msg.sender;

        delete creatorInfoByUsername[creatorInfo.username];
        creatorInfo.username = newUsername;
        creatorInfoByUsername[newUsername] = creatorInfo;
    }

    /// @dev Function to change the creator name
    /// @param newName - New name to be set
    function changeName(string memory newName) external {
        require(isRegistered[msg.sender], "User is not registered");

        require(
            bytes(newName).length >= 3 && bytes(newName).length <= 35,
            "Name must be between 3 and 35 characters"
        );

        require(
            newName.isLetterOrSpace(),
            "Name must contain only letters and spaces"
        );

        CreatorInfo storage creatorInfo = creatorInfoByAddress[msg.sender];

        creatorInfo.name = newName;

        creatorInfoByUsername[creatorInfo.username] = creatorInfo;
    }
}
