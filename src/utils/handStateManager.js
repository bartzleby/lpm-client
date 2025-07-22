// src/utils/handStateManager.js - Hand state initialization and management

import { 
  getActivePlayerPosition, 
  getSmallBlindPosition, 
  getBigBlindPosition,
  calculateInitialPot,
  streetNames
} from './gameLogic';

export const initializeForcedBets = (players, gameConfig) => {
  const sbPos = getSmallBlindPosition(gameConfig.dealerPosition);
  const bbPos = getBigBlindPosition(gameConfig.dealerPosition);
  
  let nextActionNum = 1;
  const forcedBetActions = [];
  
  const updatedPlayers = players.map(player => {
    let newChips = player.starting_stack;
    let newProffered = 0;
    let newForcedBet = null;
    
    const resetPlayer = {
      ...player,
      chips: player.starting_stack,
      proffered: 0,
      isFolded: false,
      isAnimatingFold: false,
      lastAction: null,
      isActive: false
    };
    
    // Small blind
    if (player.position === sbPos && gameConfig.smallBlind > 0) {
      newChips -= gameConfig.smallBlind;
      newProffered += gameConfig.smallBlind;
      newForcedBet = { type: 'SB', amount: gameConfig.smallBlind };
      
      forcedBetActions.push({
        action_number: nextActionNum++,
        player_id: player.id,
        action: "Post SB",
        amount: gameConfig.smallBlind,
        is_allin: false
      });
    }
    
    // Big blind
    if (player.position === bbPos && gameConfig.bigBlind > 0) {
      newChips -= gameConfig.bigBlind;
      newProffered += gameConfig.bigBlind;
      newForcedBet = { type: 'BB', amount: gameConfig.bigBlind };
      
      forcedBetActions.push({
        action_number: nextActionNum++,
        player_id: player.id,
        action: "Post BB",
        amount: gameConfig.bigBlind,
        is_allin: false
      });
    }
    
    // Ante
    if (gameConfig.ante > 0 && player.starting_stack > 0) {
      newChips -= gameConfig.ante;
      newProffered += gameConfig.ante;
      if (newForcedBet) {
        newForcedBet.ante = gameConfig.ante;
      } else {
        newForcedBet = { type: 'ANTE', amount: gameConfig.ante };
      }
      
      forcedBetActions.push({
        action_number: nextActionNum++,
        player_id: player.id,
        action: "Post Ante",
        amount: gameConfig.ante,
        is_allin: false
      });
    }
    
    // Big blind ante (tournament only)
    if (gameConfig.isTournament && gameConfig.bigBlindAnte > 0 && player.position === bbPos) {
      newChips -= gameConfig.bigBlindAnte;
      newProffered += gameConfig.bigBlindAnte;
      if (newForcedBet) {
        newForcedBet.bbAnte = gameConfig.bigBlindAnte;
      } else {
        newForcedBet = { type: 'BB_ANTE', amount: gameConfig.bigBlindAnte };
      }
      
      forcedBetActions.push({
        action_number: nextActionNum++,
        player_id: player.id,
        action: "Post BB Ante",
        amount: gameConfig.bigBlindAnte,
        is_allin: false
      });
    }
    
    return {
      ...resetPlayer,
      chips: Math.max(0, newChips),
      proffered: newProffered,
      forcedBet: newForcedBet
    };
  });

  return { updatedPlayers, forcedBetActions, nextActionNum };
};

export const createInitialBettingRound = (forcedBetActions, nextActionNum) => {
  // Add dealt cards action for hero
  const actionsWithDealtCards = [...forcedBetActions, {
    action_number: nextActionNum,
    player_id: 1, // Hero's ID
    action: "Dealt Cards",
    amount: 0,
    is_allin: false,
    cards: []
  }];

  return {
    id: 0,
    street: "preflop",
    actions: actionsWithDealtCards,
    cards: []
  };
};

export const resetPlayersForNewStreet = (players, dealerPosition, nextStreet) => {
  // Find active players (excluding folded and animating)
  const activePlayers = players.filter(p => !p.isFolded && !p.isAnimatingFold);
  console.log(`🎯 Active players for ${nextStreet}:`, activePlayers.map(p => `${p.name}(${p.position})`));
  
  // Find first active player for new street
  let firstActivePosition = null;
  let position = (dealerPosition + 1) % 9; // Start from small blind
  let attempts = 0;
  
  while (attempts < 9) {
    const player = activePlayers.find(p => p.position === position);
    if (player) {
      firstActivePosition = position;
      console.log(`🎯 Found first active player for ${nextStreet}: ${player.name} at position ${position}`);
      break;
    }
    position = (position + 1) % 9;
    attempts++;
  }
  
  if (firstActivePosition === null) {
    console.log('🎯 ERROR: No active players found for new street!');
    firstActivePosition = dealerPosition; // Fallback
  }
  
  return players.map(player => ({
    ...player,
    proffered: 0,
    lastAction: null,
    isActive: player.position === firstActivePosition && !player.isFolded && !player.isAnimatingFold
  }));
};