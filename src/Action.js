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

export { Action, BetLimit };