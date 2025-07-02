// Hand.js - Complete hand history data structure based on https://hh-specs.handhistory.org/

// Card representation
class Card {
  constructor(rank, suit) {
    this.rank = rank; // 2-9, T, J, Q, K, A
    this.suit = suit; // c, d, h, s
  }

  toString() {
    return `${this.rank}${this.suit}`;
  }

  static fromString(str) {
    if (!str || str.length !== 2) return null;
    return new Card(str[0], str[1]);
  }
}

// Player in a hand
class Player {
  constructor(name, seatNumber, startingChips) {
    this.name = name;
    this.seatNumber = seatNumber;
    this.startingChips = startingChips;
    this.cards = [];
    this.showCards = false;
  }
}

// Individual action
class Action {
  constructor(playerName, type, amount = null, allIn = false) {
    this.playerName = playerName;
    this.type = type; // fold, check, call, bet, raise
    this.amount = amount;
    this.allIn = allIn;
    this.timestamp = new Date().toISOString();
  }
}

// Pot information
class Pot {
  constructor(number, amount, rake = 0) {
    this.number = number;
    this.amount = amount;
    this.rake = rake;
    this.eligiblePlayers = [];
    this.winners = [];
  }
}

// Street (betting round)
class Street {
  constructor(name) {
    this.name = name; // preflop, flop, turn, river
    this.actions = [];
    this.cards = []; // Community cards dealt this street
    this.pot = 0;
  }

  addAction(action) {
    this.actions.push(action);
  }
}

// Main Hand class
class Hand {
  constructor() {
    // Basic info
    this.id = this.generateId();
    this.timestamp = new Date().toISOString();
    this.handNumber = null;
    
    // Game info
    this.siteName = "Live Game";
    this.tableName = "";
    this.gameType = "NLH"; // NLH, PLO, etc.
    this.tableSize = 9;
    this.currency = "USD";
    
    // Stakes
    this.smallBlind = 0;
    this.bigBlind = 0;
    this.ante = 0;
    this.bigBlindAnte = 0;
    this.straddles = [];
    
    // Players
    this.players = [];
    this.heroName = null;
    this.dealerSeat = null;
    
    // Streets
    this.streets = {
      preflop: new Street('preflop'),
      flop: new Street('flop'),
      turn: new Street('turn'),
      river: new Street('river')
    };
    this.currentStreet = 'preflop';
    
    // Community cards
    this.communityCards = [];
    
    // Pots
    this.pots = [];
    this.totalPot = 0;
    this.rake = 0;
    
    // Showdown
    this.showdown = [];
    
    // Results
    this.winners = [];
  }

  generateId() {
    return `hand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Player management
  addPlayer(name, seatNumber, startingChips) {
    const player = new Player(name, seatNumber, startingChips);
    this.players.push(player);
    return player;
  }

  setHero(playerName) {
    this.heroName = playerName;
  }

  setDealerSeat(seatNumber) {
    this.dealerSeat = seatNumber;
  }

  // Deal cards
  dealHoleCards(playerName, cards) {
    const player = this.players.find(p => p.name === playerName);
    if (player) {
      player.cards = cards.map(c => typeof c === 'string' ? Card.fromString(c) : c);
    }
  }

  dealCommunityCards(street, cards) {
    const streetCards = cards.map(c => typeof c === 'string' ? Card.fromString(c) : c);
    this.streets[street].cards = streetCards;
    this.communityCards.push(...streetCards);
  }

  // Actions
  addAction(playerName, type, amount = null, allIn = false) {
    const action = new Action(playerName, type, amount, allIn);
    this.streets[this.currentStreet].addAction(action);
    
    // Update pot
    if (amount) {
      this.streets[this.currentStreet].pot += amount;
      this.totalPot += amount;
    }
    
    return action;
  }

  // Move to next street
  nextStreet() {
    const streetOrder = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = streetOrder.indexOf(this.currentStreet);
    if (currentIndex < streetOrder.length - 1) {
      this.currentStreet = streetOrder[currentIndex + 1];
    }
  }

  // Forced bets
  postSmallBlind(playerName) {
    this.addAction(playerName, 'post', this.smallBlind);
  }

  postBigBlind(playerName) {
    this.addAction(playerName, 'post', this.bigBlind);
  }

  postAnte(playerName) {
    this.addAction(playerName, 'post', this.ante);
  }

  postBigBlindAnte(playerName) {
    this.addAction(playerName, 'post', this.bigBlindAnte);
  }

  // Showdown
  addShowdown(playerName, cards, handRank = null) {
    this.showdown.push({
      playerName,
      cards: cards.map(c => typeof c === 'string' ? Card.fromString(c) : c),
      handRank
    });
  }

  // Winners
  addWinner(playerName, amount, potNumber = 0) {
    this.winners.push({
      playerName,
      amount,
      potNumber
    });
  }

  // Export to standard format
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      handNumber: this.handNumber,
      site: {
        name: this.siteName,
        currency: this.currency
      },
      table: {
        name: this.tableName,
        size: this.tableSize
      },
      game: {
        type: this.gameType,
        limit: "NL",
        stakes: {
          smallBlind: this.smallBlind,
          bigBlind: this.bigBlind,
          ante: this.ante,
          bigBlindAnte: this.bigBlindAnte,
          straddles: this.straddles
        }
      },
      players: this.players.map(p => ({
        name: p.name,
        seat: p.seatNumber,
        startingChips: p.startingChips,
        cards: p.cards.map(c => c.toString()),
        isHero: p.name === this.heroName
      })),
      dealerSeat: this.dealerSeat,
      actions: this.getFormattedActions(),
      communityCards: {
        flop: this.streets.flop.cards.map(c => c.toString()),
        turn: this.streets.turn.cards.map(c => c.toString()),
        river: this.streets.river.cards.map(c => c.toString())
      },
      pots: this.pots,
      totalPot: this.totalPot,
      rake: this.rake,
      showdown: this.showdown.map(s => ({
        player: s.playerName,
        cards: s.cards.map(c => c.toString()),
        handRank: s.handRank
      })),
      winners: this.winners
    };
  }

  getFormattedActions() {
    const formatted = {};
    Object.keys(this.streets).forEach(street => {
      if (this.streets[street].actions.length > 0) {
        formatted[street] = this.streets[street].actions.map(a => ({
          player: a.playerName,
          action: a.type,
          amount: a.amount,
          allIn: a.allIn
        }));
      }
    });
    return formatted;
  }

  // Validate hand
  validate() {
    const errors = [];
    
    if (this.players.length < 2) {
      errors.push("Hand must have at least 2 players");
    }
    
    if (!this.dealerSeat) {
      errors.push("Dealer seat must be set");
    }
    
    if (this.smallBlind <= 0 || this.bigBlind <= 0) {
      errors.push("Blinds must be set");
    }
    
    if (this.bigBlind <= this.smallBlind) {
      errors.push("Big blind must be larger than small blind");
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export { Hand, Card, Player, Action, Pot, Street };