// useHandManager.js - Custom hook for managing hand state and actions

import { useState, useEffect } from 'react';
import { 
  getActivePlayerPosition, 
  getSmallBlindPosition, 
  getBigBlindPosition,
  getNextActivePlayerPosition,
  getFirstActivePlayerFromDealer,
  isBigBlindCheckingOption,
  calculateInitialPot,
  mapActionTypeToOHH,
  streetNames,
  getCurrentPlayer,
  getRemainingPlayersCount,
  isHandOver,
  getWinningPlayer
} from '../utils/gameLogic';
import { saveHand } from '../services/apilivepokermate';

export const useHandManager = (gameConfig, players, setPlayers) => {
  const [currentBet, setCurrentBet] = useState(0);
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

  // Clear all action badges (for new hand/street)
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
    console.log(`Ending ${currentStreet}, starting next street`);
    
    // Save current round
    setRounds(prevRounds => [...prevRounds, currentBettingRound]);
    
    // Move to next street
    const currentStreetIndex = streetNames.indexOf(currentStreet);
    const nextStreet = streetNames[currentStreetIndex + 1];
    
    if (!nextStreet) {
      console.log('No more streets - hand should be over');
      return;
    }
    
    console.log(`Starting ${nextStreet}`);
    setCurrentStreet(nextStreet);
    
    // Reset betting for new street
    setCurrentBet(0);
    
    // Find first active player for new street
    const firstActivePosition = getFirstActivePlayerFromDealer(gameConfig.dealerPosition, players);
    console.log(`Setting first active player for ${nextStreet} to position ${firstActivePosition}`);
    
    // Reset players for new street
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        proffered: 0,
        lastAction: null,
        isActive: player.position === firstActivePosition && !player.isFolded
      }))
    );
    
    // Create new betting round
    setCurrentBettingRound({
      id: currentBettingRound.id + 1,
      street: nextStreet,
      actions: [],
      cards: []
    });
    
    // Reset action number for new street
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

    // Record the dealt cards action
    setCurrentBettingRound(prevBettingRound => ({
      ...prevBettingRound,
      actions: [...prevBettingRound.actions, actionObj]
    }));

    setActionNumber(prev => prev + 1);

    // Update player's hand
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId 
          ? { ...player, hand: cards }
          : player
      )
    );

    console.log(`Dealt cards ${cards.join(', ')} to player ${playerId}`);
  };

  // Deal community cards for a street
  const dealCommunityCards = (street, cards) => {
    console.log(`Dealing community cards for ${street}: ${cards.join(', ')}`);
    
    // Update current betting round with community cards
    setCurrentBettingRound(prevBettingRound => ({
      ...prevBettingRound,
      cards: cards
    }));
  };

  // Start recording a new hand
  const startNewHand = () => {
    console.log('Starting new hand');
    
    // Reset everything for new hand
    setCurrentStreet('preflop');
    setCurrentBet(gameConfig.bigBlind);
    setRounds([]);
    clearActionBadges();
    
    // Create initial betting round
    const initialBettingRound = {
      id: 0,
      street: "preflop",
      actions: [],
      cards: []
    };
    
    // Post forced bets and deduct from chip stacks
    const sbPos = getSmallBlindPosition(gameConfig.dealerPosition);
    const bbPos = getBigBlindPosition(gameConfig.dealerPosition);
    
    let nextActionNum = 1;
    const forcedBetActions = [];
    
    // Update chip stacks for forced bets and record actions
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        let newChips = player.starting_stack;
        let newProffered = 0;
        let newForcedBet = null;
        
        // Reset player state
        const resetPlayer = {
          ...player,
          chips: player.starting_stack,
          proffered: 0,
          isFolded: false,
          isAnimatingFold: false,
          lastAction: null,
          isActive: false
        };
        
        // Post small blind
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
        
        // Post big blind
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
        
        // Post ante
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
        
        // Post big blind ante
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
      })
    );

    // Record dealt cards actions for hero
    forcedBetActions.push({
      action_number: nextActionNum++,
      player_id: 1, // Hero's ID
      action: "Dealt Cards",
      amount: 0,
      is_allin: false,
      cards: []
    });

    // Set the initial betting round with forced bet actions
    setCurrentBettingRound({
      ...initialBettingRound,
      actions: forcedBetActions
    });

    // Set action number for next action
    setActionNumber(nextActionNum);

    // Set initial active player (UTG for preflop)
    const firstActivePosition = getActivePlayerPosition(gameConfig.dealerPosition, 'preflop');
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        isActive: player.position === firstActivePosition && !player.isFolded
      }))
    );

    // Set initial pot with forced bets
    setPot(calculateInitialPot(
      gameConfig.smallBlind, 
      gameConfig.bigBlind, 
      gameConfig.ante, 
      gameConfig.bigBlindAnte, 
      players, 
      gameConfig.isTournament
    ));
  };

  // Handle action buttons
  const handleAction = (action) => {
    const activePlayer = players.find(p => p.isActive && !p.isFolded);
    if (!activePlayer) return;

    console.log(`Handling action: ${action.type} for ${activePlayer.name}`);

    // Create proper action object for recording
    const actionObj = {
      action_number: actionNumber,
      player_id: activePlayer.id,
      action: mapActionTypeToOHH(action.type),
      amount: action.amount || 0,
      is_allin: action.allIn || false
    };

    // Record action in current betting round
    setCurrentBettingRound(prevBettingRound => ({
      ...prevBettingRound,
      actions: [...prevBettingRound.actions, actionObj]
    }));

    setActionNumber(prev => prev + 1);

    // Handle fold action
    if (action.type === 'fold') {
      const nextPlayerPosition = getNextActivePlayerPosition(activePlayer.position, players);
      
      setPlayers(prevPlayers => 
        prevPlayers.map(player => {
          if (player.id === activePlayer.id) {
            return { 
              ...player, 
              isAnimatingFold: true, 
              isActive: false,
              lastAction: action
            };
          } else if (player.position === nextPlayerPosition) {
            return { ...player, isActive: true };
          } else {
            return { ...player, isActive: false };
          }
        })
      );

      // Complete the fold after animation
      setTimeout(() => {
        setPlayers(prevPlayers => {
          const updatedPlayers = prevPlayers.map(player => 
            player.id === activePlayer.id 
              ? { ...player, isFolded: true, isAnimatingFold: false }
              : player
          );
          
          // Check if hand is over after this fold
          const remainingCount = updatedPlayers.filter(p => !p.isFolded).length;
          if (remainingCount <= 1) {
            return updatedPlayers.map(player => ({ ...player, isActive: false }));
          }
          
          return updatedPlayers;
        });
      }, 800);
      
      return;
    }

    // Handle actions that involve money (call, raise, bet)
    if (['call', 'raise', 'bet'].includes(action.type)) {
      const actionAmount = action.amount || 0;
      const newTotalProffered = activePlayer.proffered + actionAmount;
      
      setPot(prev => prev + actionAmount);
      
      if (action.type === 'raise' || action.type === 'bet') {
        setCurrentBet(newTotalProffered);
      }
      
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === activePlayer.id 
            ? { 
                ...player, 
                chips: Math.max(0, player.chips - actionAmount),
                proffered: newTotalProffered,
                lastAction: action
              }
            : player
        )
      );
    } else if (action.type === 'check') {
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === activePlayer.id 
            ? { ...player, lastAction: action }
            : player
        )
      );

      // Special case: BB checking their option ends preflop
      if (isBigBlindCheckingOption(activePlayer, action.type, currentStreet, gameConfig.dealerPosition, gameConfig.bigBlind)) {
        console.log('BB checked their option - moving to flop');
        setTimeout(() => startNewStreet(), 100);
        return;
      }
    }

    // Check if betting round is complete after this action
    setTimeout(() => {
      const currentActivePlayers = players.filter(p => !p.isFolded);
      if (currentActivePlayers.length <= 1) {
        console.log('Hand over - only one player remaining');
        return;
      }
      
      setPlayers(currentPlayers => {
        const activePlayers = currentPlayers.filter(p => !p.isFolded);
        const highestBet = Math.max(...activePlayers.map(p => p.proffered || 0));
        
        const allPlayersReady = activePlayers.every(player => {
          const hasActed = player.lastAction !== null;
          const hasMatchedBet = player.proffered === highestBet;
          const isAllIn = player.chips === 0;
          
          return hasActed && (hasMatchedBet || isAllIn);
        });
        
        if (allPlayersReady) {
          console.log('Betting round complete - moving to next street');
          setTimeout(() => startNewStreet(), 50);
        } else {
          console.log('Betting round not complete - moving to next player');
          const currentActiveIndex = currentPlayers.findIndex(player => player.isActive);
          if (currentActiveIndex !== -1) {
            let nextPosition = (currentPlayers[currentActiveIndex].position + 1) % 9;
            let attempts = 0;
            
            while (attempts < 9) {
              const nextPlayer = currentPlayers.find(p => p.position === nextPosition);
              if (nextPlayer && !nextPlayer.isFolded) {
                break;
              }
              nextPosition = (nextPosition + 1) % 9;
              attempts++;
            }
            
            setTimeout(() => {
              setPlayers(prevPlayers => 
                prevPlayers.map(player => ({
                  ...player,
                  isActive: player.position === nextPosition && !player.isFolded
                }))
              );
            }, 50);
          }
        }
        
        return currentPlayers;
      });
    }, 150);
  };

  // Save current hand
  const saveCurrentHand = () => {
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
      bet_limit: {
        bet_cap: 0,
        bet_type: "NL"
      },
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
    
    console.log('Saving hand with rounds:', allRounds);
    
    saveHand(hand).then(() => {
      console.log('Hand saved successfully');
      startNewHand();
    }).catch(error => {
      console.error('Error saving hand:', error);
    });
  };

  return {
    currentBet,
    currentStreet,
    pot,
    rounds,
    currentBettingRound,
    actionNumber,
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