// src/hooks/useHandManager.js - Fixed street progression logic

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getActivePlayerPosition, 
  getSmallBlindPosition, 
  getBigBlindPosition,
  getNextActivePlayerPosition,
  getFirstActivePlayerFromDealer,
  isBigBlindOption,
  calculateInitialPot,
  mapActionTypeToOHH,
  streetNames,
  getCurrentPlayer,
  getRemainingPlayersCount,
  isHandOver,
  getWinningPlayer
} from '../utils/gameLogic';
import { saveHand } from '../services/apilivepokermate';
import { isAuthenticated } from '../utils/auth';

export const useHandManager = (gameConfig, players, setPlayers) => {
  const navigate = useNavigate();
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

  // Clear all action badges (for new hand/street)
  const clearActionBadges = () => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        lastAction: null
      }))
    );
  };

  // Check if betting round is complete
  const isBettingRoundComplete = (currentPlayers) => {
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

  // Start new street
  const startNewStreet = () => {
    console.log(`🎯 Ending ${currentStreet}, starting next street`);
    console.log(`🎯 Current pot when ending street: ${pot}`);
    
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
    
    // Reset players for new street - proffered amounts reset but pot remains
    setPlayers(prevPlayers => {
      // Find first active player for new street (must check current player states)
      const activePlayers = prevPlayers.filter(p => !p.isFolded && !p.isAnimatingFold);
      console.log(`🎯 Active players for ${nextStreet}:`, activePlayers.map(p => `${p.name}(${p.position})`));
      
      let firstActivePosition = null;
      
      // Start from small blind position and find first non-folded player
      let position = (gameConfig.dealerPosition + 1) % 9; // Small blind position
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
        firstActivePosition = gameConfig.dealerPosition; // Fallback
      }
      
      return prevPlayers.map(player => ({
        ...player,
        proffered: 0,
        lastAction: null,
        isActive: player.position === firstActivePosition && !player.isFolded && !player.isAnimatingFold
      }));
    });
    
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

  // Deal community cards for a street
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
    
    const initialBettingRound = {
      id: 0,
      street: "preflop",
      actions: [],
      cards: []
    };
    
    const sbPos = getSmallBlindPosition(gameConfig.dealerPosition);
    const bbPos = getBigBlindPosition(gameConfig.dealerPosition);
    
    let nextActionNum = 1;
    const forcedBetActions = [];
    
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
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

    forcedBetActions.push({
      action_number: nextActionNum++,
      player_id: 1,
      action: "Dealt Cards",
      amount: 0,
      is_allin: false,
      cards: []
    });

    setCurrentBettingRound({
      ...initialBettingRound,
      actions: forcedBetActions
    });

    setActionNumber(nextActionNum);

    const firstActivePosition = getActivePlayerPosition(gameConfig.dealerPosition, 'preflop');
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        isActive: player.position === firstActivePosition && !player.isFolded
      }))
    );

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

    console.log(`🎯 Handling action: ${action.type} for ${activePlayer.name}`, action);
    console.log(`🎯 Current street: ${currentStreet}, Current bet: ${currentBet}`);

    let actualAmount = action.amount || 0;
    let totalProffered = activePlayer.proffered;

    if (action.type === 'bet') {
      actualAmount = action.amount;
      totalProffered = action.amount;
      setCurrentBet(action.amount);
      setLastRaiseSize(action.amount);
      console.log(`🎯 BET: Setting current bet to ${action.amount}, raise size to ${action.amount}`);
    } else if (action.type === 'raise') {
      const previousBet = currentBet;
      totalProffered = action.amount;
      actualAmount = action.amount - activePlayer.proffered;
      const raiseSize = action.amount - previousBet;
      setCurrentBet(action.amount);
      setLastRaiseSize(raiseSize);
      console.log(`🎯 RAISE: Setting current bet to ${action.amount}, previous bet was ${previousBet}, raise size: ${raiseSize}, actual amount deducted: ${actualAmount}`);
    } else if (action.type === 'call') {
      actualAmount = currentBet - activePlayer.proffered;
      totalProffered = currentBet;
      console.log(`🎯 CALL: Current bet is ${currentBet}, actual amount deducted: ${actualAmount}`);
    }

    const actionObj = {
      action_number: actionNumber,
      player_id: activePlayer.id,
      action: action.type,
      amount: action.type === 'call' ? totalProffered : (action.type === 'bet' || action.type === 'raise' ? totalProffered : (action.amount || 0)),
      is_allin: action.allIn || false
    };

    console.log('🎯 Recording action:', actionObj);

    setCurrentBettingRound(prevBettingRound => {
      const updatedRound = {
        ...prevBettingRound,
        actions: [...prevBettingRound.actions, actionObj]
      };
      console.log('🎯 Updated betting round after adding action:', updatedRound);
      return updatedRound;
    });

    setActionNumber(prev => prev + 1);

    // Handle fold action - SPECIAL CASE: Check for betting completion immediately after fold
    if (action.type === 'fold') {
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

        // Check if betting is complete after this fold (before setting next active player)
        const activePlayers = updatedPlayers.filter(p => !p.isFolded && !p.isAnimatingFold);
        console.log(`🎯 After fold, ${activePlayers.length} players remain`);
        
        if (activePlayers.length <= 1) {
          console.log('🎯 Hand over after fold - only one player remaining');
          return updatedPlayers;
        }
        
        // Check if betting round is complete after this fold
        const highestBet = Math.max(...activePlayers.map(p => p.proffered || 0));
        const bettingComplete = activePlayers.every(player => {
          const hasActed = player.lastAction !== null;
          const hasMatchedBet = player.proffered === highestBet;
          const isAllIn = player.chips === 0;
          return hasActed && (hasMatchedBet || isAllIn);
        });

        console.log(`🎯 After fold - betting complete: ${bettingComplete}`);
        console.log(`🎯 Active players status:`, activePlayers.map(p => ({
          name: p.name,
          proffered: p.proffered,
          hasActed: p.lastAction !== null,
          chips: p.chips
        })));

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

      // Complete the fold animation
      setTimeout(() => {
        setPlayers(prevPlayers => 
          prevPlayers.map(player => 
            player.id === activePlayer.id 
              ? { ...player, isFolded: true, isAnimatingFold: false }
              : player
          )
        );
      }, 800);
      
      return;
    }

    // Handle actions that involve money (call, raise, bet)
    if (['call', 'raise', 'bet'].includes(action.type)) {
      setPot(prev => prev + actualAmount);
      
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === activePlayer.id 
            ? { 
                ...player, 
                chips: Math.max(0, player.chips - actualAmount),
                proffered: totalProffered,
                lastAction: { ...action, amount: actualAmount }
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
      if (isBigBlindOption(activePlayer, action.type, currentStreet, gameConfig.dealerPosition, gameConfig.bigBlind)) {
        console.log('🎯 BB checked their option - moving to flop');
        setTimeout(() => startNewStreet(), 100);
        return;
      }
    }

    // Check if betting round is complete after this action
    setTimeout(() => {
      setPlayers(currentPlayers => {
        const currentActivePlayers = currentPlayers.filter(p => !p.isFolded && !p.isAnimatingFold);
        
        if (currentActivePlayers.length <= 1) {
          console.log('🎯 Hand over - only one player remaining');
          return currentPlayers.map(player => ({ ...player, isActive: false }));
        }
        
        // Check if betting round is complete
        const bettingComplete = isBettingRoundComplete(currentPlayers);
        console.log(`🎯 Checking if betting round complete: ${bettingComplete}`);
        console.log(`🎯 Player status for betting check:`, currentActivePlayers.map(p => ({
          name: p.name,
          proffered: p.proffered,
          hasActed: p.lastAction !== null,
          chips: p.chips,
          isAllIn: p.chips === 0
        })));
        
        if (bettingComplete) {
          console.log('🎯 Betting round complete - moving to next street');
          setTimeout(() => startNewStreet(), 50);
          return currentPlayers.map(player => ({ ...player, isActive: false }));
        } else {
          console.log('🎯 Betting round not complete - moving to next player');
          
          // Find current active player and move to next
          const currentActivePlayer = currentPlayers.find(p => p.isActive);
          if (currentActivePlayer) {
            const nextPosition = getNextActivePlayerPosition(currentActivePlayer.position, currentPlayers);
            console.log(`🎯 Moving action from position ${currentActivePlayer.position} to position ${nextPosition}`);
            
            return currentPlayers.map(player => ({
              ...player,
              isActive: player.position === nextPosition && !player.isFolded && !player.isAnimatingFold
            }));
          }
        }
        
        return currentPlayers;
      });
    }, 150);
  };

  // Save current hand - with authentication check
  const saveCurrentHand = () => {
    if (!isAuthenticated()) {
      console.log('🔒 User not authenticated, redirecting to login...');
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
    
    console.log('🎯 Saving hand with rounds:', allRounds);
    
    saveHand(hand).then(() => {
      console.log('🎯 Hand saved successfully');
      startNewHand();
    }).catch(error => {
      console.error('❌ Error saving hand:', error);
      
      if (error.message?.includes('log in')) {
        navigate('/login', {
          state: {
            from: { pathname: '/' },
            message: error.message
          }
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