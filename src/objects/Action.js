// 
// Action.js -- 
// 
// 
// {
// 	"action_number": integer,
// 	"player_id": integer,
// 	"action": string,
// 	"amount": decimal,
// 	"is_allin": boolean,
// 	"cards": [
// 		card string,
// 		card string
// 	]
// }

class Action {
  constructor(number, playerId, action, amount, isAllin, cards) {
    this.number = number;
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