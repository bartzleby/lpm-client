// Hand.js - Complete hand history data structure based on https://hh-specs.handhistory.org/
import { Player } from "./Player";

// Main Hand class
class Hand {
  constructor() {
    this.specVersion = "1.4.6";
    this.siteName = "Bellagio"; // TODO: user input
    this.networkName = "Live Game";
    this.internalVersion = "";
    this.tournament = false;
    this.tournamentInfo = null;
    this.GameNumber = 0;
    this.startDateUtc = "";
    this.tableName = "";
    this.tableHandle = "";
    this.tableSkin = "";
    this.gameType = "NLH"; // NLH, PLO, etc.
    this.betLimit = null;
    this.tableSize = 9;
    this.currency = "USD";
    this.dealerSeat = 0;
    this.smallBlindAmount = 0;
    this.bigBlindAmount = 0;
    this.anteAmount = 0;
    this.bigBlindAnteAmount = 0;

    this.heroPlayerId = 0;
    this.flags = [];
    this.players = [];
    this.rounds = [];
    this.pots = [];

    this.tournamentBounties = [];
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

  // Actions
  addAction(action) {
    
    return;
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
  postSmallBlind() {
    this.addAction({action: "post_sb"});
  }

  postBigBlind() {
    this.addAction({action: "post_bb"});
  }

  postAnte() {
    this.addAction({action: "post_ante"});
  }

  postBigBlindAnte() {
    this.addAction({action: "post_bba"});
  }


  // Export to standard format
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      siteName: this.siteName,
      currency: this.currency,
      tableName: this.tableName,
      gameType: this.gameType,
      smallBlindAmount: this.smallBlindAmount,
      bigBlindAmount: this.bigBlindAmount,
      anteAmount: this.anteAmount,
      bigBlindAnteAmount: this.bigBlindAnteAmount,
      players: this.players.map(p => ({
        name: p.name,
        seat: p.seatNumber,
        startingStack: p.startingStack,
        cards: p.cards.map(c => c.toString())
      })),
      pots: this.pots
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

// Individual action
class Action {
  constructor(actionNumber, playerId, action, amount, isAllin, cards) {
    this.actionNumber = actionNumber;
    this.playerId = playerId;
    this.action = action; // fold, check, call, bet, raise, post sb, post bb, post ante, dealt cards, post bb ante
    this.amount = amount;
    this.isAllin = isAllin;
    this.cards = cards;
  }
}

class BetLimit {
  constructor(betType, betCap) {
    this.betType = betType;
    this.betCap = betCap;
  }
}

// Pot information
class Pot {
  constructor(number, amount, rake = 0) {
    this.number = number;
    this.amount = amount;
    this.rake = rake;
    this.jackpot = 0.0;
    this.playerWins = [];
  }
}

class PlayerWin {
  constructor(pid, amt) {
    this.player_id = pid;
	  this.win_amount = amt;
	  this.cashout_amount = 0.0;
	  this.cashout_fee = 0.0;
	  this.bonus_amount = 0.0;
	  this.contributed_rake = 0.0;
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



export { Hand, Action, BetLimit, Pot, Street };