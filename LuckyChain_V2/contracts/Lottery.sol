// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Lottery {
    struct LotteryInfo {
        address creator;
        string title;
        string description;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 endTime;
        bool isActive;
        bool isCompleted;
        address winner;
        uint256 totalPool;
    }
    
    struct Ticket {
        address participant;
        uint256 lotteryId;
        uint256 ticketNumber;
    }
    
    mapping(uint256 => LotteryInfo) public lotteries;
    mapping(uint256 => address[]) public lotteryParticipants;
    mapping(uint256 => mapping(address => uint256[])) public userTickets;
    
    uint256 public lotteryCount;
    uint256 public constant PLATFORM_FEE = 2; // 2% platform fee
    
    event LotteryCreated(
        uint256 indexed lotteryId,
        address indexed creator,
        string title,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 endTime
    );
    
    event TicketPurchased(
        uint256 indexed lotteryId,
        address indexed participant,
        uint256 ticketNumber,
        uint256 amount
    );
    
    event WinnerSelected(
        uint256 indexed lotteryId,
        address indexed winner,
        uint256 prizeAmount
    );
    
    function createLottery(
        string memory _title,
        string memory _description,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration
    ) external returns (uint256) {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTickets > 0, "Max tickets must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        uint256 lotteryId = lotteryCount++;
        
        lotteries[lotteryId] = LotteryInfo({
            creator: msg.sender,
            title: _title,
            description: _description,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            endTime: block.timestamp + _duration,
            isActive: true,
            isCompleted: false,
            winner: address(0),
            totalPool: 0
        });
        
        emit LotteryCreated(
            lotteryId,
            msg.sender,
            _title,
            _ticketPrice,
            _maxTickets,
            block.timestamp + _duration
        );
        
        return lotteryId;
    }
    
    function buyTicket(uint256 _lotteryId) external payable {
        LotteryInfo storage lottery = lotteries[_lotteryId];
        
        require(lottery.isActive, "Lottery is not active");
        require(block.timestamp < lottery.endTime, "Lottery has ended");
        require(
            lotteryParticipants[_lotteryId].length < lottery.maxTickets,
            "Lottery is full"
        );
        require(msg.value == lottery.ticketPrice, "Incorrect ticket price");
        
        uint256 ticketNumber = lotteryParticipants[_lotteryId].length;
        lotteryParticipants[_lotteryId].push(msg.sender);
        userTickets[_lotteryId][msg.sender].push(ticketNumber);
        lottery.totalPool += msg.value;
        
        emit TicketPurchased(_lotteryId, msg.sender, ticketNumber, msg.value);
    }
    
    function selectWinner(uint256 _lotteryId) external {
        LotteryInfo storage lottery = lotteries[_lotteryId];
        
        require(lottery.isActive, "Lottery is not active");
        require(
            block.timestamp >= lottery.endTime ||
            lotteryParticipants[_lotteryId].length == lottery.maxTickets,
            "Lottery has not ended yet"
        );
        require(!lottery.isCompleted, "Winner already selected");
        require(lotteryParticipants[_lotteryId].length > 0, "No participants");
        
        // Generate pseudo-random number (Note: In production, use Chainlink VRF)
        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    lotteryParticipants[_lotteryId].length
                )
            )
        ) % lotteryParticipants[_lotteryId].length;
        
        address winner = lotteryParticipants[_lotteryId][randomIndex];
        lottery.winner = winner;
        lottery.isActive = false;
        lottery.isCompleted = true;
        
        // Calculate prize (total pool minus platform fee)
        uint256 platformFee = (lottery.totalPool * PLATFORM_FEE) / 100;
        uint256 prizeAmount = lottery.totalPool - platformFee;
        
        // Transfer prize to winner
        payable(winner).transfer(prizeAmount);
        
        emit WinnerSelected(_lotteryId, winner, prizeAmount);
    }
    
    function getLotteryInfo(uint256 _lotteryId)
        external
        view
        returns (LotteryInfo memory)
    {
        return lotteries[_lotteryId];
    }
    
    function getParticipants(uint256 _lotteryId)
        external
        view
        returns (address[] memory)
    {
        return lotteryParticipants[_lotteryId];
    }
    
    function getUserTickets(uint256 _lotteryId, address _user)
        external
        view
        returns (uint256[] memory)
    {
        return userTickets[_lotteryId][_user];
    }
}
