// Player in a hand
class Player {
  constructor(name, seat, starting_stack) {
    this.ID = 0;
    this.seat = seat;
    this.name = name;
    this.display = "";
    this.starting_stack = starting_stack;
    this.player_bounty = 0.0;
    this.is_sitting_out = false;
    this.cards = [];
    this.showCards = false;
  }
}

export {Player};