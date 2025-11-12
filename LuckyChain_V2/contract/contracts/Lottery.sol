// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Lottery {
    struct LotteryInfo {
        address creator;
        string title;
        string description;
        uint256 ticketPrice;
        uint256 maxTickets; // 0 = unlimited
        uint256 endTime;
        bool isActive;
        bool isCompleted;
        address winner; // Primary winner (first winner in list if multiple)
        uint256 totalPool;
    }

    struct LotteryConfig {
        uint8 numWinners;
        uint16 creatorPct; // basis points (1% = 100)
        bool allowMultipleEntries;
    }

    mapping(uint256 => LotteryInfo) private lotteries;
    mapping(uint256 => LotteryConfig) private lotterySettings;
    mapping(uint256 => address[]) private lotteryParticipants;
    mapping(uint256 => address[]) private lotteryWinners;
    mapping(uint256 => mapping(address => uint256[])) private userTickets;

    uint256 public nextLotteryId;

    uint16 public constant MAX_CREATOR_PCT = 10_000; // 100%

    event LotteryCreated(
        uint256 indexed lotteryId,
        address indexed creator,
        string title,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 endTime,
        uint8 numWinners,
        uint16 creatorPct,
        bool allowMultipleEntries
    );

    event TicketsPurchased(
        uint256 indexed lotteryId,
        address indexed participant,
        uint256[] ticketNumbers,
        uint256 amountPaid
    );

    event WinnersSelected(
        uint256 indexed lotteryId,
        address[] winners,
        uint256 prizePerWinner,
        uint256 creatorReward
    );

    modifier onlyCreator(uint256 _lotteryId) {
        require(lotteries[_lotteryId].creator == msg.sender, "Not creator");
        _;
    }

    function createLottery(
        string memory _title,
        string memory _description,
        uint256 _ticketPrice,
        uint256 _endDateTime,
        uint8 _numWinners,
        uint16 _creatorPct,
        uint256 _maxTickets,
        bool _allowMultipleEntries
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Empty title");
        require(_ticketPrice > 0, "Ticket price must be > 0");
        require(_endDateTime > block.timestamp, "End must be in future");
        require(_numWinners > 0, "Invalid winner count");
        require(_creatorPct <= MAX_CREATOR_PCT, "Creator pct > 100%");

        uint256 lotteryId = nextLotteryId++;

        lotteries[lotteryId] = LotteryInfo({
            creator: msg.sender,
            title: _title,
            description: _description,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            endTime: _endDateTime,
            isActive: true,
            isCompleted: false,
            winner: address(0),
            totalPool: 0
        });

        lotterySettings[lotteryId] = LotteryConfig({
            numWinners: _numWinners,
            creatorPct: _creatorPct,
            allowMultipleEntries: _allowMultipleEntries
        });

        emit LotteryCreated(
            lotteryId,
            msg.sender,
            _title,
            _ticketPrice,
            _maxTickets,
            _endDateTime,
            _numWinners,
            _creatorPct,
            _allowMultipleEntries
        );

        return lotteryId;
    }

    function buyTicket(uint256 _lotteryId) external payable {
        buyTickets(_lotteryId, 1);
    }

    function buyTickets(uint256 _lotteryId, uint256 _ticketCount) public payable {
        require(_ticketCount > 0, "Ticket count must be > 0");

        LotteryInfo storage lottery = lotteries[_lotteryId];
        LotteryConfig memory config = lotterySettings[_lotteryId];

        require(lottery.isActive, "Lottery is not active");
        require(block.timestamp < lottery.endTime, "Lottery closed");

        uint256 currentTickets = lotteryParticipants[_lotteryId].length;

        if (lottery.maxTickets > 0) {
            require(
                currentTickets + _ticketCount <= lottery.maxTickets,
                "Max entrants reached"
            );
        }

        uint256[] storage purchasedTickets = userTickets[_lotteryId][msg.sender];
        if (!config.allowMultipleEntries) {
            require(purchasedTickets.length == 0, "Already entered");
            require(_ticketCount == 1, "Multiple tickets disabled");
        }

        uint256 totalCost = lottery.ticketPrice * _ticketCount;
        require(msg.value == totalCost, "Incorrect ETH sent");

        uint256[] memory ticketNumbers = new uint256[](_ticketCount);
        for (uint256 i = 0; i < _ticketCount; i++) {
            uint256 ticketNumber = lotteryParticipants[_lotteryId].length;
            lotteryParticipants[_lotteryId].push(msg.sender);
            purchasedTickets.push(ticketNumber);
            ticketNumbers[i] = ticketNumber;
        }

        lottery.totalPool += msg.value;

        emit TicketsPurchased(_lotteryId, msg.sender, ticketNumbers, msg.value);
    }

    function selectWinner(uint256 _lotteryId) external onlyCreator(_lotteryId) {
        _finalizeLottery(_lotteryId);
    }

    function endLottery(uint256 _lotteryId) external onlyCreator(_lotteryId) {
        _finalizeLottery(_lotteryId);
    }

    function getLotteryInfo(uint256 _lotteryId)
        external
        view
        returns (LotteryInfo memory)
    {
        return lotteries[_lotteryId];
    }

    function getLotteryConfig(uint256 _lotteryId)
        external
        view
        returns (LotteryConfig memory)
    {
        return lotterySettings[_lotteryId];
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

    function getWinners(uint256 _lotteryId)
        external
        view
        returns (address[] memory)
    {
        return lotteryWinners[_lotteryId];
    }

    function getLotteries(uint256 start, uint256 count)
        external
        view
        returns (LotteryInfo[] memory infos, LotteryConfig[] memory configs)
    {
        uint256 total = nextLotteryId;
        if (start >= total) {
            return (new LotteryInfo[](0), new LotteryConfig[](0));
        }

        uint256 end = start + count;
        if (end > total) {
            end = total;
        }

        uint256 length = end - start;
        infos = new LotteryInfo[](length);
        configs = new LotteryConfig[](length);

        for (uint256 i = start; i < end; i++) {
            infos[i - start] = lotteries[i];
            configs[i - start] = lotterySettings[i];
        }
    }

    function lotteryCount() external view returns (uint256) {
        return nextLotteryId;
    }

    function _finalizeLottery(uint256 _lotteryId) private {
        LotteryInfo storage lottery = lotteries[_lotteryId];
        LotteryConfig memory config = lotterySettings[_lotteryId];

        require(lottery.isActive, "Lottery not active");
        require(!lottery.isCompleted, "Lottery completed");
        require(
            block.timestamp >= lottery.endTime ||
                (lottery.maxTickets > 0 &&
                    lotteryParticipants[_lotteryId].length >= lottery.maxTickets),
            "Lottery ongoing"
        );

        uint256 totalPlayers = lotteryParticipants[_lotteryId].length;
        require(totalPlayers > 0, "No participants");

        // Determine winner count (cannot exceed participants)
        uint256 winnersCount = config.numWinners;
        if (winnersCount > totalPlayers) {
            winnersCount = totalPlayers;
        }

        delete lotteryWinners[_lotteryId];
        address[] storage winners = lotteryWinners[_lotteryId];
        address[] memory participants = lotteryParticipants[_lotteryId];
        uint256 remaining = totalPlayers;

        for (uint256 i = 0; i < winnersCount; i++) {
            uint256 randomIndex = uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        participants.length,
                        i
                    )
                )
            ) % remaining;

            address winner = participants[randomIndex];
            winners.push(winner);

            // Move selected participant to the end to avoid reselection
            participants[randomIndex] = participants[remaining - 1];
            remaining--;
        }

        lottery.isActive = false;
        lottery.isCompleted = true;
        lottery.winner = winners.length > 0 ? winners[0] : address(0);

        uint256 creatorReward = (lottery.totalPool * config.creatorPct) /
            MAX_CREATOR_PCT;
        uint256 prizePool = lottery.totalPool - creatorReward;
        uint256 prizePerWinner = winners.length > 0
            ? prizePool / winners.length
            : 0;

        if (creatorReward > 0) {
            payable(lottery.creator).transfer(creatorReward);
        }

        if (prizePerWinner > 0) {
            for (uint256 i = 0; i < winners.length; i++) {
                payable(winners[i]).transfer(prizePerWinner);
            }
        }

        emit WinnersSelected(_lotteryId, winners, prizePerWinner, creatorReward);
    }
}
