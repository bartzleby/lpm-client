// src/utils/actionHandlers.js - Action processing and validation

import { getNextActivePlayerPosition, isBigBlindOption } from './gameLogic';
import { isBettingRoundComplete } from './bettingLogic';

export const createActionObject = (action, activePlayer, actionNumber, totalProffered) => {
  return {
    action_number: actionNumber,
    player_id: activePlayer.id,
    action: action.type,
    amount: action.type === 'call' ? totalProffered : 
            (action.type === 'bet' || action.type === 'raise' ? totalProffered : 
            (action.amount || 0)),
    is_allin: action.allIn || false
  };
};

export const handleFoldAction = (activePlayer, action, players, setPlayers, isBettingRoundComplete, startNewStreet) => {
  // Immediately set the folding player as animating and inactive
  setPlayers(prevPlayers => {
    const updatedPlayers = prevPlayers.map(player => {
      if (player.id === activePlayer.id) {
        return { 
          ...player, 
          isAnimatingFold: true, 
          isActive: false,
          lastAction: action
        };
      }
      return { ...player, isActive: false };
    });

    // Check how many players will remain after this fold completes
    const remainingPlayers = updatedPlayers.filter(p => !p.isFolded && !p.isAnimatingFold);
    console.log(`🎯 After fold, ${remainingPlayers.length} players will remain`);
    
    if (remainingPlayers.length <= 1) {
      console.log('🎯 Hand over after fold - only one player remaining');
      // Set all players inactive since hand is over
      return updatedPlayers.map(player => ({ ...player, isActive: false }));
    }
    
    // Check if betting round is complete after this fold
    const highestBet = Math.max(...remainingPlayers.map(p => p.proffered || 0));
    const bettingComplete = remainingPlayers.every(player => {
      const hasActed = player.lastAction !== null;
      const hasMatchedBet = player.proffered === highestBet;
      const isAllIn = player.chips === 0;
      return hasActed && (hasMatchedBet || isAllIn);
    });

    console.log(`🎯 After fold - betting complete: ${bettingComplete}`);

    if (bettingComplete) {
      console.log('🎯 Betting complete after fold - advancing street');
      setTimeout(() => startNewStreet(), 100);
      return updatedPlayers;
    } else {
      // Find next active player for continued betting
      const nextPlayerPosition = getNextActivePlayerPosition(activePlayer.position, updatedPlayers);
      console.log(`🎯 Setting next active player to position ${nextPlayerPosition}`);
      
      return updatedPlayers.map(player => ({
        ...player,
        isActive: player.position === nextPlayerPosition && !player.isFolded && !player.isAnimatingFold
      }));
    }
  });

  // Complete the fold animation after delay
  setTimeout(() => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === activePlayer.id 
          ? { ...player, isFolded: true, isAnimatingFold: false }
          : player
      )
    );
  }, 800);
};

export const processMoneyAction = (action, activePlayer, actualAmount, totalProffered) => {
  return {
    ...activePlayer,
    chips: Math.max(0, activePlayer.chips - actualAmount),
    proffered: totalProffered,
    lastAction: { ...action, amount: actualAmount }
  };
};

export const processCheckAction = (activePlayer, action, currentStreet, gameConfig, startNewStreet) => {
  const updatedPlayer = { ...activePlayer, lastAction: action };
  
  // Special case: BB checking their option ends preflop
  if (isBigBlindOption(activePlayer, action.type, currentStreet, gameConfig.dealerPosition, gameConfig.bigBlind)) {
    console.log('🎯 BB checked their option - moving to flop');
    setTimeout(() => startNewStreet(), 100);
  }
  
  return updatedPlayer;
};

export const handleBettingRoundCompletion = (players, isBettingRoundComplete, startNewStreet, getNextActivePlayerPosition) => {
  const currentActivePlayers = players.filter(p => !p.isFolded && !p.isAnimatingFold);
  
  if (currentActivePlayers.length <= 1) {
    console.log('🎯 Hand over - only one player remaining');
    return players.map(player => ({ ...player, isActive: false }));
  }
  
  // Check if betting round is complete
  const bettingComplete = isBettingRoundComplete(players);
  console.log(`🎯 Checking if betting round complete: ${bettingComplete}`);
  
  if (bettingComplete) {
    console.log('🎯 Betting round complete - moving to next street');
    setTimeout(() => startNewStreet(), 50);
    return players.map(player => ({ ...player, isActive: false }));
  } else {
    console.log('🎯 Betting round not complete - moving to next player');
    
    // Find current active player and move to next
    const currentActivePlayer = players.find(p => p.isActive);
    if (currentActivePlayer) {
      const nextPosition = getNextActivePlayerPosition(currentActivePlayer.position, players);
      console.log(`🎯 Moving action from position ${currentActivePlayer.position} to position ${nextPosition}`);
      
      return players.map(player => ({
        ...player,
        isActive: player.position === nextPosition && !player.isFolded && !player.isAnimatingFold
      }));
    }
  }
  
  return players;
};