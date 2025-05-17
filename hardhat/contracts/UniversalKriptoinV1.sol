// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import "./libraries/StringUtils.sol";
import "./KriptoinV1.sol";
import "./interfaces/IKriptoin.sol";
import "./libraries/KriptoinLib.sol";

contract UniversalKriptoinV1 is Ownable, IKriptoin {
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
    
    address public backendSigner;

    event ContractDeployed(
        address indexed creatorAddress,
        address indexed creatorContractAddress
    );

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
        minimumTipAmount = 1000 * 100; // 1000 IDRX
        feePercentage = 1;
        
        backendSigner = 0x77DEA859659ef832872F7d274B4dFc8a5B1e0431;
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
            _amount < 50000 * 100,
            "Minimum tip amount must be less than 50000 IDR"
        );

        minimumTipAmount = _amount;
    }

    /// @dev Function to set the fee percentage
    /// @param _feePercentage - The fee percentage to set
    function setFeePercentage(uint8 _feePercentage) external onlyOwner {
        require(
            _feePercentage <= 5,
            "Fee percentage must be less than or equal to 5"
        );

        feePercentage = _feePercentage;
    }
    
    /// @dev Function to set the backend signer address
    /// @param _backendSigner - The backend signer address to set
    function setBackendSigner(address _backendSigner) external onlyOwner {
        backendSigner = _backendSigner;
    }

    /// @dev Function to deploy a new Kriptoin contract
    /// @param username - The username of the creator
    function deployContract(
        string calldata username
    ) external returns (address) {
        require(
            bytes(username).length >= 2 && bytes(username).length <= 15,
            "Username must be between 2 and 15 characters"
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
        
        KriptoinV1 kriptoin = new KriptoinV1(
            address(this),
            totalTipsReceived[msg.sender],
            minimumTipAmount
        );
        
        kriptoin.transferOwnership(msg.sender);
        
        CreatorInfo memory creatorInfo = CreatorInfo({
            username: username,
            name: username,
            creatorAddress: msg.sender,
            contractAddress: address(kriptoin)
        });
        
        creatorInfoByAddress[msg.sender] = creatorInfo;
        creatorInfoByUsername[username] = creatorInfo;
        usernameToAddress[username] = msg.sender;
        addressToUsername[msg.sender] = username;
        isRegistered[msg.sender] = true;
        
        emit ContractDeployed(msg.sender, address(kriptoin));
        
        return address(kriptoin);
    }
    
    /// @dev Function to check if a message has been approved by the backend
    /// @param message - The message to check
    /// @param expiry - The expiry time of the approval
    /// @param signature - The signature of the approval
    function checkApproval(string calldata message, uint256 expiry, bytes calldata signature) public view {
        require (block.timestamp < expiry, "Approval expired");
    
        bytes32 messageHash = keccak256(abi.encodePacked(message, expiry));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        
        address recovered = ECDSA.recover(ethSignedMessageHash, signature);
        require(recovered == backendSigner, "Invalid signature");
    }

    /// @dev Function to send a tip to an unregistered creator
    /// @param creatorAddress - The address of the creator
    /// @param senderName - The name of the sender
    /// @param message - The message sent with the tip
    /// @param amount - The amount of the tip
    /// @param expiry - The expiry time of the approval
    /// @param signature - The signature of the approval
    function sendTip(
        address creatorAddress,
        string calldata senderName,
        string calldata message,
        uint256 amount,
        uint256 expiry,
        bytes calldata signature
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
        
        require(bytes(senderName).length > 0 && bytes(senderName).length <= 20, "Sender name must be between 1 and 20 characters");

        require(
            bytes(message).length >= 1 && bytes(message).length <= 250,
            "Message must be between 1 and 250 characters"
        );
        
        checkApproval(message, expiry, signature);

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

        bool sent = IERC20(token).transferFrom(address(this), owner(), balance);

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

        paginatedTips = KriptoinLib.getTipHistory(
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
