// Hand.js - Complete hand history data structure based on https://hh-specs.handhistory.org/
import { Action } from "./Action";
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

export { Hand };