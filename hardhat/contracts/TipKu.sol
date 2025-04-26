// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./UniversalTipKu.sol";
import "./interfaces/ITipKu.sol";
import "./libraries/TipKuLib.sol";
import "./libraries/StringUtils.sol";

contract TipKu is Ownable, ITipKu {
    using StringUtils for string;

    Tip[] private tips;
    uint256 public totalTipsReceived;
    string public bio;
    address factoryAddress;
    uint8 public messageDuration;

    mapping(string => string) public colors;

    uint256 public minimumTipAmount;

    bool public isEnabled;

    constructor(
        address _factoryAddress,
        uint256 _totalTipsReceived,
        Tip[] memory _tips,
        uint256 _minimumTipAmount
    ) Ownable(msg.sender) {
        factoryAddress = _factoryAddress;
        totalTipsReceived = _totalTipsReceived;

        colors["background"] = "#209bb9";
        colors["primary"] = "#ffffff";
        colors["secondary"] = "#c1fc29";

        messageDuration = 5;

        if (_tips.length > 0) {
            for (uint256 i = 0; i < _tips.length; i++) {
                tips.push(_tips[i]);
            }
        }

        minimumTipAmount = _minimumTipAmount;
        isEnabled = true;
    }

    /// @dev Function to get the token
    function _getToken() internal view returns (IERC20) {
        return UniversalTipKu(factoryAddress).token();
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

    // @dev Function to set the enabled status
    // @param _status - The enabled status
    function setEnabled(bool _status) external onlyOwner {
        isEnabled = _status;
    }

    /// @dev Function to send a test tip
    function sendTestTip() external onlyOwner {
        emit TipReceived({
            recipientAddress: owner(),
            senderAddress: owner(),
            fakeTip: true,
            senderName: "TipKu",
            message: "This is a test tip",
            amount: 10000 ether,
            feePercentage: 1,
            timestamp: block.timestamp
        });
    }

    /// @dev Function to store a new tip
    /// @param senderName - The name of the sender
    /// @param message - The message sent with the tip
    /// @param amount - The amount of the tip
    function sendTip(
        string calldata senderName,
        string calldata message,
        uint256 amount
    ) external {
        require(
            isEnabled,
            "Tipping is disabled"
        );

        require(
            _getToken().balanceOf(msg.sender) >= amount,
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

        uint8 feePercentage = UniversalTipKu(factoryAddress).feePercentage();

        uint256 fee = (amount * feePercentage) / 100;

        uint256 amountAfterFee = amount - fee;

        bool sent1 = _getToken().transferFrom(msg.sender, owner(), amountAfterFee);

        require(sent1, "Failed to send tip");

        bool sent2 = _getToken().transferFrom(msg.sender, factoryAddress, fee);

        require(sent2, "Failed to send fee");

        Tip memory tip = Tip({
            recipientAddress: owner(),
            senderAddress: msg.sender,
            senderName: senderName,
            message: message,
            amount: amount,
            feePercentage: feePercentage,
            timestamp: block.timestamp
        });

        tips.push(tip);

        totalTipsReceived += amount;

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

    /// @dev Function to emit a tip event
    /// @param senderName - The name of the sender
    /// @param message - The message sent with the tip
    /// @param amount - The amount of the tip
    function emitTipEvent(
        string calldata senderName,
        string calldata message,
        uint256 amount
    ) external onlyOwner {
        emit TipReceived({
            recipientAddress: owner(),
            senderAddress: owner(),
            fakeTip: true,
            senderName: senderName,
            message: message,
            amount: amount,
            feePercentage: 1,
            timestamp: block.timestamp
        });
    }

    /// @dev Function to get tip history with pagination using page numbers
    /// @param pageIndex - Page index
    /// @param pageSize - Page size
    /// @return paginatedTips - Array of tips in the specified page range
    function getTipHistory(
        uint256 pageIndex,
        uint256 pageSize
    ) external view returns (Tip[] memory paginatedTips, uint256 totalTips) {
        totalTips = tips.length;

        paginatedTips = TipKuLib.getTipHistory(
            tips,
            totalTips,
            pageIndex,
            pageSize
        );
    }

    /// @dev Function to get the total number of tips
    /// @return tipCount - Total number of tips
    function getTipCount() external view returns (uint256 tipCount) {
        tipCount = tips.length;
    }

    /// @dev Function to set the bio of the creator
    /// @param newBio - The bio
    function setBio(string calldata newBio) external onlyOwner {
        require(
            bytes(newBio).length >= 1 && bytes(newBio).length <= 130,
            "Bio must be between 1 and 130 characters"
        );
        bio = newBio;
    }

    /// @dev Function to set the message duration
    /// @param _seconds - The duration in seconds
    function setMessageDuration(uint8 _seconds) external onlyOwner {
        require(
            _seconds >= 1 && _seconds <= 120,
            "Duration must be between 1 and 120 seconds"
        );
        messageDuration = _seconds;
    }

    /// @dev Function to get the colors of the widget
    /// @return primary - The primary color
    /// @return secondary - The secondary color
    /// @return background - The background color
    function getColors()
        external
        view
        returns (string memory, string memory, string memory)
    {
        return (colors["primary"], colors["secondary"], colors["background"]);
    }

    /// @dev Function to set the color of the widget
    /// @param colorType - The color type
    /// @param colorHex - The color hex
    function setColor(
        string memory colorType,
        string memory colorHex
    ) external onlyOwner {
        require(
            colorType.isEqual("primary") ||
                colorType.isEqual("secondary") ||
                colorType.isEqual("background"),
            "Invalid color type"
        );
        require(colorHex.isColorHex(), "Invalid color hex");

        colors[colorType] = colorHex;
    }

    /// @dev Function to set the colors of the widget
    /// @param primary - The primary color
    /// @param secondary - The secondary color
    /// @param background - The background color
    function setColors(
        string memory primary,
        string memory secondary,
        string memory background
    ) external onlyOwner {
        uint256 primaryLength = bytes(primary).length;
        uint256 secondaryLength = bytes(secondary).length;
        uint256 backgroundLength = bytes(background).length;

        require(
            primary.isColorHex() || primaryLength == 0,
            "Invalid primary color hex"
        );
        require(
            secondary.isColorHex() || secondaryLength == 0,
            "Invalid secondary color hex"
        );
        require(
            background.isColorHex() || backgroundLength == 0,
            "Invalid background color hex"
        );

        if (primaryLength > 0) colors["primary"] = primary;
        if (secondaryLength > 0) colors["secondary"] = secondary;
        if (backgroundLength > 0) colors["background"] = background;
    }
}
