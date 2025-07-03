
class TournamentInfo {
    constructor(name, number, buyin, starting_stack) {
      this.tournament_number = number;
      this.name = name;
      this.start_date_utc = "";
      this.currency = "USD";
      this.buyin_amount = buyin;
      this.fee_amount = 0.0;
      this.bounty_fee_amount = 0.0;
      this.initial_stack = starting_stack;
      this.type = "";
      this.flags = [];
      this.speed = null;
    }
}

class TournamentBounty {
    constructor(pid, bounty_won, defeated_player_id) {
	    this.player_id = pid;
	    this.bounty_won = bounty_won;
	    this.defeated_player_id = defeated_player_id;
    }
}

class Speed {
    constructor(type, round_time) {
        this.type = type; // string
        this.round_time = this.round_time; // integer
    }
}

export default {TournamentInfo, TournamentBounty, Speed};