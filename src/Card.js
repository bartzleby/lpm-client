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

export {Card};