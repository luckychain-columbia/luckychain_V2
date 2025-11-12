// Auto-generated from Hardhat compilation
// Run "npm run export:abi" after compiling contracts
export const LOTTERY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "lotteryId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ticketPrice",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxTickets",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "numWinners",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "creatorPct",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "allowMultipleEntries",
        "type": "bool"
      }
    ],
    "name": "LotteryCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "lotteryId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "participant",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "ticketNumbers",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountPaid",
        "type": "uint256"
      }
    ],
    "name": "TicketsPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "lotteryId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "winners",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "prizePerWinner",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "creatorReward",
        "type": "uint256"
      }
    ],
    "name": "WinnersSelected",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_CREATOR_PCT",
    "outputs": [
      {
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lotteryId",
        "type": "uint256"
      }
    ],
    "name": "buyTicket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lotteryId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_ticketCount",
        "type": "uint256"
      }
    ],
    "name": "buyTickets",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_ticketPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_endDateTime",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_numWinners",
        "type": "uint8"
      },
      {
        "internalType": "uint16",
        "name": "_creatorPct",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "_maxTickets",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_allowMultipleEntries",
        "type": "bool"
      }
    ],
    "name": "createLottery",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lotteryId",
        "type": "uint256"
      }
    ],
    "name": "endLottery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "start",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "count",
        "type": "uint256"
      }
    ],
    "name": "getLotteries",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "ticketPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxTickets",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isCompleted",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "winner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "totalPool",
            "type": "uint256"
          }
        ],
        "internalType": "struct Lottery.LotteryInfo[]",
        "name": "infos",
        "type": "tuple[]"
      },
      {
        "components": [
          {
            "internalType": "uint8",
            "name": "numWinners",
            "type": "uint8"
          },
          {
            "internalType": "uint16",
            "name": "creatorPct",
            "type": "uint16"
          },
          {
            "internalType": "bool",
            "name": "allowMultipleEntries",
            "type": "bool"
          }
        ],
        "internalType": "struct Lottery.LotteryConfig[]",
        "name": "configs",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lotteryId",
        "type": "uint256"
      }
    ],
    "name": "getLotteryConfig",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint8",
            "name": "numWinners",
            "type": "uint8"
          },
          {
            "internalType": "uint16",
            "name": "creatorPct",
            "type": "uint16"
          },
          {
            "internalType": "bool",
            "name": "allowMultipleEntries",
            "type": "bool"
          }
        ],
        "internalType": "struct Lottery.LotteryConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lotteryId",
        "type": "uint256"
      }
    ],
    "name": "getLotteryInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "ticketPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxTickets",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isCompleted",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "winner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "totalPool",
            "type": "uint256"
          }
        ],
        "internalType": "struct Lottery.LotteryInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lotteryId",
        "type": "uint256"
      }
    ],
    "name": "getParticipants",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lotteryId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserTickets",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lotteryId",
        "type": "uint256"
      }
    ],
    "name": "getWinners",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lotteryCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextLotteryId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lotteryId",
        "type": "uint256"
      }
    ],
    "name": "selectWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
