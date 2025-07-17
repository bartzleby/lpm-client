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

export { Pot, PlayerWin };