// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Raffle {
    struct RaffleInfo {
        address creator;
        string title;
        string description;
        string category;
        uint256 ticketPrice;
        uint256 maxTickets; // 0 = unlimited
        uint256 endTime;
        bool isActive;
        bool isCompleted;
        address winner; // Primary winner (first winner in list if multiple)
        uint256 totalPool;
    }

    struct RaffleConfig {
        uint8 numWinners;
        uint16 creatorPct; // basis points (1% = 100)
        bool allowMultipleEntries;
    }

    mapping(uint256 => RaffleInfo) private raffles;
    mapping(uint256 => RaffleConfig) private raffleSettings;
    mapping(uint256 => address[]) private raffleParticipants;
    mapping(uint256 => address[]) private raffleWinners;
    mapping(uint256 => mapping(address => uint256[])) private userTickets;

    // User raffle tracking (from their contract - more efficient)
    mapping(address => uint256[]) private userRaffles;
    mapping(uint256 => mapping(address => bool)) private userEnteredRaffle;

    uint256 public nextRaffleId;

    uint16 public constant MAX_CREATOR_PCT = 10_000; // 100%
    uint256 public constant MAX_TICKETS_PER_TRANSACTION = 1000; // Maximum tickets per transaction (prevents DoS)
    uint256 public constant MAX_TICKETS_PER_RAFFLE = 10_000; // Maximum tickets per raffle

    // Finalization reward: 0.1% of pool (min 0.005 ETH, max 0.01 ETH)
    // This incentivizes anyone to finalize expired raffles by covering gas costs
    // Minimum 0.005 ETH ensures gas costs are always covered (typical gas ~0.005 ETH)
    uint256 public constant MIN_FINALIZATION_REWARD = 0.005 ether; // 0.005 ETH (covers typical gas)
    uint256 public constant MAX_FINALIZATION_REWARD = 0.01 ether; // 0.01 ETH
    uint16 public constant FINALIZATION_REWARD_BPS = 10; // 0.1% of pool (10 basis points)

    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed creator,
        string title,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 endTime,
        uint8 numWinners,
        uint16 creatorPct,
        bool allowMultipleEntries,
        uint256 seedAmount
    );

    event TicketsPurchased(
        uint256 indexed raffleId,
        address indexed participant,
        uint256[] ticketNumbers,
        uint256 amountPaid
    );

    event WinnersSelected(
        uint256 indexed raffleId,
        address[] winners,
        uint256 prizePerWinner,
        uint256 creatorReward,
        uint256 finalizationReward,
        address finalizer
    );

    modifier onlyCreator(uint256 _raffleId) {
        require(raffles[_raffleId].creator == msg.sender, "Not creator");
        _;
    }

    function createRaffle(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _ticketPrice,
        uint256 _endDateTime,
        uint8 _numWinners,
        uint16 _creatorPct,
        uint256 _maxTickets,
        bool _allowMultipleEntries
    ) external payable returns (uint256) {
        require(bytes(_title).length > 0, "Empty title");
        require(bytes(_title).length <= 100, "Title too long");
        require(_ticketPrice > 0, "Ticket price must be > 0");
        require(_endDateTime > block.timestamp, "End must be in future");
        require(_numWinners > 0, "Invalid winner count");
        require(_numWinners <= 100, "Too many winners");
        require(_creatorPct <= MAX_CREATOR_PCT, "Creator pct > 100%");
        // Validate max tickets if set
        if (_maxTickets > 0) {
            require(_maxTickets >= _numWinners, "Max tickets < num winners");
            require(
                _maxTickets <= MAX_TICKETS_PER_RAFFLE,
                "Max tickets too large"
            );
        }

        uint256 raffleId = nextRaffleId++;

        // Initialize total pool with any ETH sent with the transaction (seed amount)
        uint256 seedAmount = msg.value;
        
        // Require minimum seed amount to ensure raffle can cover finalization reward
        // This prevents raffles from being too small to finalize properly
        require(
            seedAmount >= MIN_FINALIZATION_REWARD,
            "Seed amount must be at least MIN_FINALIZATION_REWARD to cover finalization costs"
        );

        raffles[raffleId] = RaffleInfo({
            creator: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            endTime: _endDateTime,
            isActive: true,
            isCompleted: false,
            winner: address(0),
            totalPool: seedAmount
        });

        raffleSettings[raffleId] = RaffleConfig({
            numWinners: _numWinners,
            creatorPct: _creatorPct,
            allowMultipleEntries: _allowMultipleEntries
        });

        emit RaffleCreated(
            raffleId,
            msg.sender,
            _title,
            _ticketPrice,
            _maxTickets,
            _endDateTime,
            _numWinners,
            _creatorPct,
            _allowMultipleEntries,
            seedAmount
        );

        return raffleId;
    }

    function buyTicket(uint256 _raffleId) external payable {
        buyTickets(_raffleId, 1);
    }

    function buyTickets(
        uint256 _raffleId,
        uint256 _ticketCount
    ) public payable {
        require(_ticketCount > 0, "Ticket count must be > 0");
        require(
            _ticketCount <= MAX_TICKETS_PER_TRANSACTION,
            "Too many tickets per transaction"
        );

        RaffleInfo storage raffle = raffles[_raffleId];
        RaffleConfig memory config = raffleSettings[_raffleId];

        require(raffle.isActive, "Raffle is not active");
        require(block.timestamp < raffle.endTime, "Raffle closed");

        uint256 currentTickets = raffleParticipants[_raffleId].length;

        if (raffle.maxTickets > 0) {
            require(
                currentTickets + _ticketCount <= raffle.maxTickets,
                "Max entrants reached"
            );
        }

        uint256[] storage purchasedTickets = userTickets[_raffleId][msg.sender];
        if (!config.allowMultipleEntries) {
            require(purchasedTickets.length == 0, "Already entered");
            require(_ticketCount == 1, "Multiple tickets disabled");
        }

        uint256 totalCost = raffle.ticketPrice * _ticketCount;
        require(msg.value == totalCost, "Incorrect ETH sent");

        // Track user raffles (from their contract - more efficient)
        if (!userEnteredRaffle[_raffleId][msg.sender]) {
            userEnteredRaffle[_raffleId][msg.sender] = true;
            userRaffles[msg.sender].push(_raffleId);
        }

        uint256[] memory ticketNumbers = new uint256[](_ticketCount);
        for (uint256 i = 0; i < _ticketCount; i++) {
            uint256 ticketNumber = raffleParticipants[_raffleId].length;
            raffleParticipants[_raffleId].push(msg.sender);
            purchasedTickets.push(ticketNumber);
            ticketNumbers[i] = ticketNumber;
        }

        raffle.totalPool += msg.value;

        emit TicketsPurchased(_raffleId, msg.sender, ticketNumbers, msg.value);
    }

    // Anyone can finalize an expired raffle or when max tickets are reached
    // The finalizer always receives a reward for covering gas costs (our improvement)
    function finalizeRaffle(uint256 _raffleId) public {
        RaffleInfo storage raffle = raffles[_raffleId];
        
        // Early validation to prevent unnecessary gas usage and provide clear errors
        require(raffle.isActive, "Raffle not active");
        require(!raffle.isCompleted, "Raffle already completed");
        
        // Check participants early to fail fast with clear error
        uint256 participantCount = raffleParticipants[_raffleId].length;
        require(participantCount > 0, "Cannot finalize: no participants");
        
        // Check expiration
        bool isExpired = block.timestamp >= raffle.endTime;
        
        // Check if max tickets reached
        // maxTickets = 0 means unlimited, so we only check if maxTickets > 0
        bool maxTicketsReached = false;
        if (raffle.maxTickets > 0) {
            // Max tickets reached when participant count equals or exceeds max tickets
            // Note: participantCount represents total tickets sold (each ticket = one entry in array)
            maxTicketsReached = participantCount >= raffle.maxTickets;
        }

        // Raffle can be finalized if:
        // 1. It has expired (regardless of ticket count), OR
        // 2. Max tickets have been reached (even if not expired)
        require(isExpired || maxTicketsReached, "Raffle ongoing - not expired and max tickets not reached");

        // Anyone can finalize and will always receive a reward (our improvement)
        _finalizeRaffle(_raffleId);
    }

    // Legacy functions for backwards compatibility
    function selectWinner(uint256 _raffleId) external {
        finalizeRaffle(_raffleId);
    }

    function endRaffle(uint256 _raffleId) external {
        finalizeRaffle(_raffleId);
    }

    function getRaffleInfo(
        uint256 _raffleId
    ) external view returns (RaffleInfo memory) {
        return raffles[_raffleId];
    }

    function getRaffleConfig(
        uint256 _raffleId
    ) external view returns (RaffleConfig memory) {
        return raffleSettings[_raffleId];
    }

    function getParticipants(
        uint256 _raffleId
    ) external view returns (address[] memory) {
        return raffleParticipants[_raffleId];
    }

    function getUserTickets(
        uint256 _raffleId,
        address _user
    ) external view returns (uint256[] memory) {
        return userTickets[_raffleId][_user];
    }

    function getWinners(
        uint256 _raffleId
    ) external view returns (address[] memory) {
        return raffleWinners[_raffleId];
    }

    function getRaffles(
        uint256 start,
        uint256 count
    )
        external
        view
        returns (RaffleInfo[] memory infos, RaffleConfig[] memory configs)
    {
        uint256 total = nextRaffleId;
        if (start >= total) {
            return (new RaffleInfo[](0), new RaffleConfig[](0));
        }

        uint256 end = start + count;
        if (end > total) {
            end = total;
        }

        uint256 length = end - start;
        infos = new RaffleInfo[](length);
        configs = new RaffleConfig[](length);

        for (uint256 i = start; i < end; i++) {
            infos[i - start] = raffles[i];
            configs[i - start] = raffleSettings[i];
        }
    }

    // Additional function from their contract - more efficient
    function getRafflesWithWinners(
        uint256 start,
        uint256 count
    )
        external
        view
        returns (
            RaffleInfo[] memory infos,
            RaffleConfig[] memory configs,
            address[][] memory winners,
            uint256[] memory participantCounts
        )
    {
        uint256 total = nextRaffleId;
        if (start >= total) {
            return (
                new RaffleInfo[](0),
                new RaffleConfig[](0),
                new address[][](0),
                new uint256[](0)
            );
        }

        uint256 end = start + count;
        if (end > total) {
            end = total;
        }

        uint256 length = end - start;

        infos = new RaffleInfo[](length);
        configs = new RaffleConfig[](length);
        winners = new address[][](length);
        participantCounts = new uint256[](length);

        for (uint256 i = start; i < end; i++) {
            uint256 localIndex = i - start;

            infos[localIndex] = raffles[i];
            configs[localIndex] = raffleSettings[i];
            winners[localIndex] = raffleWinners[i];
            participantCounts[localIndex] = raffleParticipants[i].length;
        }
    }

    // User raffle tracking function from their contract - more efficient
    function getUserEnteredRaffles(
        address user
    ) external view returns (uint256[] memory) {
        return userRaffles[user];
    }

    function raffleCount() external view returns (uint256) {
        return nextRaffleId;
    }

    function _finalizeRaffle(uint256 _raffleId) internal {
        RaffleInfo storage raffle = raffles[_raffleId];
        require(raffle.isActive, "Raffle not active");
        require(!raffle.isCompleted, "Raffle completed");

        uint256 totalPlayers = raffleParticipants[_raffleId].length;
        require(totalPlayers > 0, "No participants");

        // Get config and determine winner count (cannot exceed participants)
        uint8 numWinners = raffleSettings[_raffleId].numWinners;
        uint256 winnersCount = numWinners > totalPlayers
            ? totalPlayers
            : numWinners;

        // Select winners using indices to avoid modifying participants array
        address[] storage winners = raffleWinners[_raffleId];
        delete raffleWinners[_raffleId];
        address[] storage participants = raffleParticipants[_raffleId];

        uint256[] memory indices = new uint256[](totalPlayers);
        for (uint256 i = 0; i < totalPlayers; i++) {
            indices[i] = i;
        }

        for (uint256 i = 0; i < winnersCount; i++) {
            uint256 remaining = totalPlayers - i;
            uint256 randomIndex = uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        block.number,
                        _raffleId,
                        i
                    )
                )
            ) % remaining;

            uint256 selectedIndex = indices[randomIndex];
            winners.push(participants[selectedIndex]);

            // Swap with last element to avoid reselection
            indices[randomIndex] = indices[remaining - 1];
        }

        raffle.isActive = false;
        raffle.isCompleted = true;
        raffle.winner = winners.length > 0 ? winners[0] : address(0);

        // Calculate rewards - get config values
        uint16 creatorPct = raffleSettings[_raffleId].creatorPct;
        uint256 pool = raffle.totalPool;

        // Calculate finalization reward - from their contract (0.1% with min/max)
        // Always paid (our improvement - reward for all finalizations)
        uint256 rewardFromPool = (pool * FINALIZATION_REWARD_BPS) / 10_000;
        uint256 finalizationReward = rewardFromPool > MIN_FINALIZATION_REWARD
            ? (
                rewardFromPool > MAX_FINALIZATION_REWARD
                    ? MAX_FINALIZATION_REWARD
                    : rewardFromPool
            )
            : MIN_FINALIZATION_REWARD;
        
        // Safety check: reward cannot exceed pool
        if (finalizationReward > pool) {
            finalizationReward = pool;
        }

        // Calculate creator reward
        uint256 creatorReward = (pool * creatorPct) / MAX_CREATOR_PCT;

        // Ensure rewards don't exceed pool (safety check)
        // Priority: Finalization reward first (incentivizes finalization), then creator reward
        uint256 totalRewards = creatorReward + finalizationReward;
        if (totalRewards > pool) {
            // If pool can't cover both, prioritize finalization reward
            if (pool >= finalizationReward) {
                creatorReward = pool - finalizationReward;
            } else {
                // Pool too small - finalization reward takes all
                finalizationReward = pool;
                creatorReward = 0;
            }
        }

        // Calculate prize pool and distribution
        // Ensure prizePool doesn't underflow (safety check after reward adjustments)
        uint256 prizePool = pool - creatorReward - finalizationReward;
        uint256 prizePerWinner = winnersCount > 0
            ? prizePool / winnersCount
            : 0;
        uint256 remainder = winnersCount > 0
            ? prizePool % winnersCount
            : prizePool;

        // Pay finalization reward to finalizer (always paid - our improvement)
        // Using .call() with error checking for safety
        if (finalizationReward > 0) {
            (bool success1, ) = payable(msg.sender).call{value: finalizationReward}("");
            require(success1, "Failed to transfer finalization reward");
        }

        // Pay creator reward
        if (creatorReward > 0) {
            (bool success2, ) = payable(raffle.creator).call{value: creatorReward}("");
            require(success2, "Failed to transfer creator reward");
        }

        // Pay winners
        if (prizePerWinner > 0) {
            for (uint256 i = 0; i < winnersCount; i++) {
                (bool success3, ) = payable(winners[i]).call{value: prizePerWinner}("");
                require(success3, "Failed to transfer winner prize");
            }
        }

        // Send remainder to first winner to avoid fund loss
        if (remainder > 0 && winnersCount > 0) {
            (bool success4, ) = payable(winners[0]).call{value: remainder}("");
            require(success4, "Failed to transfer remainder");
        }

        emit WinnersSelected(
            _raffleId,
            winners,
            prizePerWinner,
            creatorReward,
            finalizationReward,
            msg.sender
        );
    }
}
