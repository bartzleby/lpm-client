// gameLogic.js - Game logic utilities extracted from PokerTable

export const getActivePlayerPosition = (dealerPos, currentStreet) => {
  if (currentStreet === 'preflop') {
    // Preflop: action starts with UTG (dealer + 3)
    return (dealerPos + 3) % 9;
  } else {
    // Post-flop: action starts with first active player clockwise from dealer
    return getFirstActivePlayerFromDealer(dealerPos);
  }
};

export const getSmallBlindPosition = (dealerPos) => (dealerPos + 1) % 9;
export const getBigBlindPosition = (dealerPos) => (dealerPos + 2) % 9;

export const getNextActivePlayerPosition = (currentPosition, players) => {
  let nextPosition = (currentPosition + 1) % 9;
  let attempts = 0;
  
  // Keep looking for next non-folded player
  while (attempts < 9) {
    const nextPlayer = players.find(p => p.position === nextPosition);
    if (nextPlayer && !nextPlayer.isFolded) {
      return nextPosition;
    }
    nextPosition = (nextPosition + 1) % 9;
    attempts++;
  }
  
  return currentPosition; // Fallback if no active players found
};

export const getFirstActivePlayerFromDealer = (dealerPos, players) => {
  let position = (dealerPos + 1) % 9; // Start with small blind position
  let attempts = 0;
  
  // Keep looking for first non-folded player clockwise from dealer
  while (attempts < 9) {
    const player = players.find(p => p.position === position);
    if (player && !player.isFolded) {
      console.log(`Found first active player clockwise from dealer: ${player.name} at position ${position}`);
      return position;
    }
    position = (position + 1) % 9;
    attempts++;
  }
  
  console.log('No active players found, falling back to dealer position');
  return dealerPos; // Fallback
};

export const isBigBlindCheckingOption = (activePlayer, actionType, currentStreet, dealerPosition, bigBlind) => {
  if (!activePlayer || actionType !== 'check' || currentStreet !== 'preflop') return false;
  
  const bigBlindPosition = getBigBlindPosition(dealerPosition);
  const playerIsBigBlind = activePlayer.position === bigBlindPosition;
  
  if (!playerIsBigBlind) return false;
  
  // BB gets their option when they are BB and facing only calls/folds (no raises)
  const facingNoRaise = activePlayer.proffered === bigBlind;
  
  return playerIsBigBlind && facingNoRaise;
};

export const calculateInitialPot = (smallBlind, bigBlind, ante, bigBlindAnte, players, isTournament) => {
  let totalPot = 0;
  
  // Add small blind and big blind
  totalPot += smallBlind + bigBlind;
  
  // Add antes (one ante per player)
  const activePlayers = players.filter(player => player.starting_stack > 0);
  totalPot += ante * activePlayers.length;
  
  // Add big blind ante if tournament
  if (isTournament && bigBlindAnte > 0) {
    totalPot += bigBlindAnte;
  }
  
  return totalPot;
};

export const mapActionTypeToOHH = (actionType) => {
  const mapping = {
    'fold': 'Fold',
    'check': 'Check',
    'call': 'Call',
    'bet': 'Bet',
    'raise': 'Raise',
    'allin': 'Raise' // All-in is handled by is_allin flag
  };
  return mapping[actionType] || actionType;
};

export const streetNames = ["preflop", "flop", "turn", "river"];

export const getCurrentPlayer = (players) => {
  const activePlayer = players.find(player => player.isActive && !player.isFolded);
  if (activePlayer) {
    console.log(`Current active player: ${activePlayer.name} at position ${activePlayer.position}`);
  } else {
    console.log('No current active player found');
  }
  return activePlayer;
};

export const getRemainingPlayersCount = (players) => {
  return players.filter(player => !player.isFolded).length;
};

export const isHandOver = (players) => {
  return getRemainingPlayersCount(players) <= 1;
};

export const getWinningPlayer = (players) => {
  const remainingPlayers = players.filter(player => !player.isFolded);
  return remainingPlayers.length === 1 ? remainingPlayers[0] : null;
};