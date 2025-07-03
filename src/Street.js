// Street (betting round)
class Street {
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

export { Street };