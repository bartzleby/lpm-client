// src/hooks/useHandManager.js - Simplified and refactored

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getActivePlayerPosition, 
  streetNames,
  getCurrentPlayer,
  getRemainingPlayersCount,
  isHandOver,
  getWinningPlayer
} from '../utils/gameLogic';
import { 
  isBettingRoundComplete, 
  calculateBetAmounts 
} from '../utils/bettingLogic';
import { 
  initializeForcedBets, 
  createInitialBettingRound, 
  resetPlayersForNewStreet 
} from '../utils/handStateManager';
import { 
  createActionObject,
  handleFoldAction,
  processMoneyAction,
  processCheckAction,
  handleBettingRoundCompletion
} from '../utils/actionHandlers';
import { saveHand } from '../services/apilivepokermate';
import { isAuthenticated } from '../utils/auth';

export const useHandManager = (gameConfig, players, setPlayers) => {
  const navigate = useNavigate();
  
  // Core state
  const [currentBet, setCurrentBet] = useState(0);
  const [lastRaiseSize, setLastRaiseSize] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [currentStreet, setCurrentStreet] = useState('preflop');
  const [actionNumber, setActionNumber] = useState(1);
  const [currentBettingRound, setCurrentBettingRound] = useState({
    id: 0,
    street: "preflop",
    actions: [],
    cards: []
  });
  const [pot, setPot] = useState(0);

  // Clear all action badges
  const clearActionBadges = () => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        lastAction: null
      }))
    );
  };

  // Start new street
  const startNewStreet = () => {
    console.log(`🎯 Ending ${currentStreet}, starting next street`);
    
    // Save current round
    setRounds(prevRounds => [...prevRounds, currentBettingRound]);
    
    // Move to next street
    const currentStreetIndex = streetNames.indexOf(currentStreet);
    const nextStreet = streetNames[currentStreetIndex + 1];
    
    if (!nextStreet) {
      console.log('🎯 No more streets - hand should be over');
      return;
    }
    
    console.log(`🎯 Starting ${nextStreet}`);
    setCurrentStreet(nextStreet);
    
    // Reset betting for new street
    setCurrentBet(0);
    setLastRaiseSize(0);
    
    // Reset players for new street
    setPlayers(prevPlayers => 
      resetPlayersForNewStreet(prevPlayers, gameConfig.dealerPosition, nextStreet)
    );
    
    // Create new betting round
    setCurrentBettingRound({
      id: currentBettingRound.id + 1,
      street: nextStreet,
      actions: [],
      cards: []
    });
    
    setActionNumber(1);
  };

  // Deal cards to a player
  const dealCardsToPlayer = (playerId, cards) => {
    const actionObj = {
      action_number: actionNumber,
      player_id: playerId,
      action: "Dealt Cards",
      amount: 0,
      is_allin: false,
      cards: cards
    };

    setCurrentBettingRound(prevBettingRound => ({
      ...prevBettingRound,
      actions: [...prevBettingRound.actions, actionObj]
    }));

    setActionNumber(prev => prev + 1);

    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId 
          ? { ...player, hand: cards }
          : player
      )
    );

    console.log(`🎯 Dealt cards ${cards.join(', ')} to player ${playerId}`);
  };

  // Deal community cards
  const dealCommunityCards = (street, cards) => {
    console.log(`🎯 Dealing community cards for ${street}: ${cards.join(', ')}`);
    
    setCurrentBettingRound(prevBettingRound => ({
      ...prevBettingRound,
      cards: cards
    }));
  };

  // Start recording a new hand
  const startNewHand = () => {
    console.log('🎯 Starting new hand');
    
    setCurrentStreet('preflop');
    setCurrentBet(gameConfig.bigBlind);
    setLastRaiseSize(0);
    setRounds([]);
    clearActionBadges();
    
    // Initialize forced bets and player states
    const { updatedPlayers, forcedBetActions, nextActionNum } = initializeForcedBets(players, gameConfig);
    
    // Set players with forced bets
    setPlayers(updatedPlayers);
    
    // Create initial betting round
    const initialBettingRound = createInitialBettingRound(forcedBetActions, nextActionNum);
    setCurrentBettingRound(initialBettingRound);
    setActionNumber(nextActionNum + 1);

    // Set initial active player (UTG for preflop)
    const firstActivePosition = getActivePlayerPosition(gameConfig.dealerPosition, 'preflop');
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        isActive: player.position === firstActivePosition && !player.isFolded
      }))
    );

    // Calculate initial pot
    const initialPot = gameConfig.smallBlind + gameConfig.bigBlind + 
                      (gameConfig.ante * players.filter(p => p.starting_stack > 0).length) +
                      (gameConfig.isTournament ? gameConfig.bigBlindAnte : 0);
    setPot(initialPot);
  };

  // Handle player actions
  const handleAction = (action) => {
    const activePlayer = players.find(p => p.isActive && !p.isFolded);
    if (!activePlayer) return;

    console.log(`🎯 Handling action: ${action.type} for ${activePlayer.name}`, action);

    // Calculate bet amounts
    const { actualAmount, totalProffered } = calculateBetAmounts(action, activePlayer, currentBet);

    // Update current bet and raise size for betting actions
    if (action.type === 'bet') {
      setCurrentBet(action.amount);
      setLastRaiseSize(action.amount);
    } else if (action.type === 'raise') {
      const raiseSize = action.amount - currentBet;
      setCurrentBet(action.amount);
      setLastRaiseSize(raiseSize);
    }

    // Create and record action
    const actionObj = createActionObject(action, activePlayer, actionNumber, totalProffered);
    
    setCurrentBettingRound(prevBettingRound => ({
      ...prevBettingRound,
      actions: [...prevBettingRound.actions, actionObj]
    }));

    setActionNumber(prev => prev + 1);

    // Handle fold action
    if (action.type === 'fold') {
      handleFoldAction(activePlayer, action, players, setPlayers, isBettingRoundComplete, startNewStreet);
      return;
    }

    // Handle money actions (call, raise, bet)
    if (['call', 'raise', 'bet'].includes(action.type)) {
      setPot(prev => prev + actualAmount);
      
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === activePlayer.id 
            ? processMoneyAction(action, player, actualAmount, totalProffered)
            : player
        )
      );
    } 
    // Handle check action
    else if (action.type === 'check') {
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === activePlayer.id 
            ? processCheckAction(player, action, currentStreet, gameConfig, startNewStreet)
            : player
        )
      );
    }

    // Check for betting round completion after a delay
    setTimeout(() => {
      setPlayers(currentPlayers => 
        handleBettingRoundCompletion(
          currentPlayers, 
          isBettingRoundComplete, 
          startNewStreet,
          (pos, players) => {
            // Find next active player
            let nextPosition = (pos + 1) % 9;
            let attempts = 0;
            
            while (attempts < 9) {
              const nextPlayer = players.find(p => p.position === nextPosition);
              if (nextPlayer && !nextPlayer.isFolded && !nextPlayer.isAnimatingFold) {
                return nextPosition;
              }
              nextPosition = (nextPosition + 1) % 9;
              attempts++;
            }
            return pos;
          }
        )
      );
    }, 150);
  };

  // Save current hand
  const saveCurrentHand = () => {
    if (!isAuthenticated()) {
      navigate('/login', {
        state: {
          from: { pathname: '/' },
          message: 'Please log in to save your poker hands.'
        }
      });
      return;
    }

    const allRounds = [...rounds];
    if (currentBettingRound.actions.length > 0) {
      allRounds.push(currentBettingRound);
    }

    const hand = {
      spec_version: "1.4.6",
      network_name: gameConfig.networkName || "Live Game",
      site_name: gameConfig.siteName,
      game_type: "Holdem",
      table_name: "Live Table",
      table_size: 9,
      game_number: Date.now().toString(),
      start_date_utc: new Date().toISOString(),
      currency: "USD",
      ante_amount: gameConfig.ante,
      small_blind_amount: gameConfig.smallBlind,
      big_blind_amount: gameConfig.bigBlind,
      bet_limit: { bet_cap: 0, bet_type: "NL" },
      dealer_seat: gameConfig.dealerPosition + 1,
      hero_player_id: 1,
      players: players.map(player => ({
        name: player.name,
        id: player.id,
        player_bounty: 0,
        starting_stack: player.starting_stack,
        seat: player.position + 1
      })),
      rounds: allRounds,
      pots: [{
        number: 0,
        amount: pot,
        rake: 0,
        player_wins: getWinningPlayer(players) ? [{
          player_id: getWinningPlayer(players).id,
          win_amount: pot,
          contributed_rake: 0
        }] : []
      }]
    };
    
    saveHand(hand)
      .then(() => {
        console.log('🎯 Hand saved successfully');
        startNewHand();
      })
      .catch(error => {
        console.error('❌ Error saving hand:', error);
        if (error.message?.includes('log in')) {
          navigate('/login', {
            state: { from: { pathname: '/' }, message: error.message }
          });
        }
      });
  };

  return {
    currentBet,
    currentStreet,
    pot,
    rounds,
    currentBettingRound,
    actionNumber,
    lastRaiseSize,
    startNewHand,
    handleAction,
    saveCurrentHand,
    dealCardsToPlayer,
    dealCommunityCards,
    getCurrentPlayer: () => getCurrentPlayer(players),
    getRemainingPlayersCount: () => getRemainingPlayersCount(players),
    isHandOver: () => isHandOver(players),
    getWinningPlayer: () => getWinningPlayer(players)
  };
};