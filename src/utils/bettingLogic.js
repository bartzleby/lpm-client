// src/utils/bettingLogic.js - Betting round management logic

export const isBettingRoundComplete = (currentPlayers) => {
  const activePlayers = currentPlayers.filter(p => !p.isFolded && !p.isAnimatingFold);
  
  console.log(`🔍 Checking betting completion with ${activePlayers.length} active players`);
  
  if (activePlayers.length <= 1) {
    console.log(`🔍 Hand over - only ${activePlayers.length} players left`);
    return true; // Hand is over
  }
  
  const highestBet = Math.max(...activePlayers.map(p => p.proffered || 0));
  console.log(`🔍 Highest bet is: ${highestBet}`);
  
  const playersStatus = activePlayers.map(player => {
    const hasActed = player.lastAction !== null;
    const hasMatchedBet = player.proffered === highestBet;
    const isAllIn = player.chips === 0;
    const isReady = hasActed && (hasMatchedBet || isAllIn);
    
    console.log(`🔍 ${player.name}: acted=${hasActed}, matched=${hasMatchedBet} (${player.proffered}/${highestBet}), allIn=${isAllIn}, ready=${isReady}`);
    
    return isReady;
  });
  
  const allReady = playersStatus.every(status => status === true);
  console.log(`🔍 All players ready: ${allReady}`);
  
  return allReady;
};

export const calculateBetAmounts = (action, activePlayer, currentBet) => {
  let actualAmount = action.amount || 0;
  let totalProffered = activePlayer.proffered;

  switch (action.type) {
    case 'bet':
      actualAmount = action.amount;
      totalProffered = action.amount;
      break;
    case 'raise':
      totalProffered = action.amount;
      actualAmount = action.amount - activePlayer.proffered;
      break;
    case 'call':
      actualAmount = currentBet - activePlayer.proffered;
      totalProffered = currentBet;
      break;
    default:
      break;
  }

  return { actualAmount, totalProffered };
};

export const findFirstActivePlayerForStreet = (dealerPosition, activePlayers) => {
  // Start from small blind position and find first non-folded player
  let position = (dealerPosition + 1) % 9; // Small blind position
  let attempts = 0;
  
  while (attempts < 9) {
    const player = activePlayers.find(p => p.position === position);
    if (player) {
      console.log(`🎯 Found first active player: ${player.name} at position ${position}`);
      return position;
    }
    position = (position + 1) % 9;
    attempts++;
  }
  
  console.log('🎯 ERROR: No active players found for new street!');
  return dealerPosition; // Fallback
};