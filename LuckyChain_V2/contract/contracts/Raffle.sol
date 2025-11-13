// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Raffle {
    struct RaffleInfo {
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

    uint256 public nextRaffleId;

    uint16 public constant MAX_CREATOR_PCT = 10_000; // 100%
    uint256 public constant MAX_TICKETS_PER_TRANSACTION = 1000; // Maximum tickets per transaction (prevents DoS)
    uint256 public constant MAX_TICKETS_PER_RAFFLE = 10_000; // Maximum tickets per raffle
    
    // Finalization reward: 0.001 ETH or 0.1% of pool (whichever is higher, capped at 0.01 ETH)
    // This incentivizes anyone to finalize expired raffles by covering gas costs
    uint256 public constant MIN_FINALIZATION_REWARD = 0.001 ether; // 0.001 ETH
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
            require(_maxTickets <= MAX_TICKETS_PER_RAFFLE, "Max tickets too large");
        }

        uint256 raffleId = nextRaffleId++;

        // Initialize total pool with any ETH sent with the transaction (seed amount)
        uint256 seedAmount = msg.value;

        raffles[raffleId] = RaffleInfo({
            creator: msg.sender,
            title: _title,
            description: _description,
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

    function buyTickets(uint256 _raffleId, uint256 _ticketCount) public payable {
        require(_ticketCount > 0, "Ticket count must be > 0");
        require(_ticketCount <= MAX_TICKETS_PER_TRANSACTION, "Too many tickets per transaction");

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

    // Anyone can finalize an expired raffle, but only creator can finalize early when max tickets reached
    function finalizeRaffle(uint256 _raffleId) external {
        RaffleInfo storage raffle = raffles[_raffleId];
        bool isExpired = block.timestamp >= raffle.endTime;
        
        // If raffle has expired, anyone can finalize (with reward from pool)
        if (isExpired) {
            _finalizeRaffle(_raffleId, true); // true = expired, pay reward
            return;
        }
        
        // If max tickets reached but not expired, only creator can finalize early (no reward)
        if (raffle.maxTickets > 0 && 
            raffleParticipants[_raffleId].length >= raffle.maxTickets) {
            require(raffle.creator == msg.sender, "Only creator can finalize early");
            _finalizeRaffle(_raffleId, false); // false = early finalization, no reward
            return;
        }
        
        revert("Raffle ongoing");
    }

    // Legacy functions for backwards compatibility
    function selectWinner(uint256 _raffleId) external {
        this.finalizeRaffle(_raffleId);
    }

    function endRaffle(uint256 _raffleId) external {
        this.finalizeRaffle(_raffleId);
    }

    function getRaffleInfo(uint256 _raffleId)
        external
        view
        returns (RaffleInfo memory)
    {
        return raffles[_raffleId];
    }

    function getRaffleConfig(uint256 _raffleId)
        external
        view
        returns (RaffleConfig memory)
    {
        return raffleSettings[_raffleId];
    }

    function getParticipants(uint256 _raffleId)
        external
        view
        returns (address[] memory)
    {
        return raffleParticipants[_raffleId];
    }

    function getUserTickets(uint256 _raffleId, address _user)
        external
        view
        returns (uint256[] memory)
    {
        return userTickets[_raffleId][_user];
    }

    function getWinners(uint256 _raffleId)
        external
        view
        returns (address[] memory)
    {
        return raffleWinners[_raffleId];
    }

    function getRaffles(uint256 start, uint256 count)
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

    function raffleCount() external view returns (uint256) {
        return nextRaffleId;
    }

    function _finalizeRaffle(uint256 _raffleId, bool _isExpired) internal {
        RaffleInfo storage raffle = raffles[_raffleId];
        require(raffle.isActive, "Raffle not active");
        require(!raffle.isCompleted, "Raffle completed");
        
        uint256 totalPlayers = raffleParticipants[_raffleId].length;
        require(totalPlayers > 0, "No participants");

        // Get config and determine winner count (cannot exceed participants)
        uint8 numWinners = raffleSettings[_raffleId].numWinners;
        uint256 winnersCount = numWinners > totalPlayers ? totalPlayers : numWinners;

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
        
        // Calculate finalization reward (only for expired raffles)
        uint256 finalizationReward = 0;
        if (_isExpired) {
            uint256 rewardFromPool = (pool * FINALIZATION_REWARD_BPS) / 10_000;
            finalizationReward = rewardFromPool > MIN_FINALIZATION_REWARD 
                ? (rewardFromPool > MAX_FINALIZATION_REWARD ? MAX_FINALIZATION_REWARD : rewardFromPool)
                : MIN_FINALIZATION_REWARD;
            if (finalizationReward > pool) {
                finalizationReward = pool;
            }
        }

        // Calculate creator reward
        uint256 creatorReward = (pool * creatorPct) / MAX_CREATOR_PCT;
        
        // Ensure rewards don't exceed pool (safety check)
        uint256 totalRewards = creatorReward + finalizationReward;
        if (totalRewards >= pool) {
            if (_isExpired && finalizationReward > 0) {
                creatorReward = pool > finalizationReward ? pool - finalizationReward : 0;
            } else {
                finalizationReward = 0;
                creatorReward = pool;
            }
        }
        
        // Calculate prize pool and distribution
        uint256 prizePool = pool - creatorReward - finalizationReward;
        uint256 prizePerWinner = winnersCount > 0 ? prizePool / winnersCount : 0;
        uint256 remainder = winnersCount > 0 ? prizePool % winnersCount : prizePool;

        // Pay finalization reward (if expired raffle)
        if (finalizationReward > 0) {
            payable(msg.sender).transfer(finalizationReward);
        }

        // Pay creator reward
        if (creatorReward > 0) {
            payable(raffle.creator).transfer(creatorReward);
        }

        // Pay winners
        if (prizePerWinner > 0) {
            for (uint256 i = 0; i < winnersCount; i++) {
                payable(winners[i]).transfer(prizePerWinner);
            }
        }
        
        // Send remainder to first winner to avoid fund loss
        if (remainder > 0 && winnersCount > 0) {
            payable(winners[0]).transfer(remainder);
        }

        emit WinnersSelected(_raffleId, winners, prizePerWinner, creatorReward, finalizationReward, msg.sender);
    }
}
