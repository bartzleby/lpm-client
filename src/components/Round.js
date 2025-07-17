// Street (betting round)
// {
// 	"id": integer,
// 	"street": street_string
// 	"cards": [
// 		string,
// 		string,
// 		string
// 	],
// 	"actions": [
// 		<action_obj>,
// 		<action_obj>
// 	]
// }

class Round {
  constructor(name) {
    this.street = name; // preflop, flop, turn, river
    this.actions = []; // 
    this.cards = []; // Community cards dealt this street

    this.id = 0;
  }

  addAction(action) {
    this.actions.push(action);
  }

  addCard(card) {
    this.cards.push(card);
  }
}

export { Round };