import React, { useState, useEffect } from 'react';
import HeroBox from './HeroBox';
import ActionBar from './ActionBar';
import './PokerTable.css';

import {saveHand} from './services/lmpapi';

const PokerTable = () => {

  const [networkName, setNetworkName] = useState("");
  const [siteName, setSiteName] = useState("Bellagio");
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

  // Players state
  const [players, setPlayers] = useState([
    { id: 1, name: 'Hero', starting_stack: 1000, position: 0, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 2, name: 'Player 2', starting_stack: 1000, position: 1, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 3, name: 'Player 3', starting_stack: 1000, position: 2, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 4, name: 'Player 4', starting_stack: 1000, position: 3, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 5, name: 'Player 5', starting_stack: 1000, position: 4, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 6, name: 'Player 6', starting_stack: 1000, position: 5, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 7, name: 'Player 7', starting_stack: 1000, position: 6, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 8, name: 'Player 8', starting_stack: 1000, position: 7, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 },
    { id: 9, name: 'Player 9', starting_stack: 1000, position: 8, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false, lastAction: null, proffered: 0.0, chips: 1000 }
  ]);

  const [pot, setPot] = useState(0);
  const [dealerPosition, setDealerPosition] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  
  // Betting configuration
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [ante, setAnte] = useState(0);
  const [bigBlindAnte, setBigBlindAnte] = useState(0);
  const [isTournament, setIsTournament] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  // UI state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Check for mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate positions
  const getActivePlayerPosition = (dealerPos) => {
    if (currentStreet === 'preflop') {
      // Preflop: action starts with UTG (dealer + 3)
      return (dealerPos + 3) % 9;
    } else {
      // Post-flop: action starts with first active player clockwise from dealer
      return getFirstActivePlayerFromDealer(dealerPos);
    }
  };

  const getSmallBlindPosition = (dealerPos) => (dealerPos + 1) % 9;
  const getBigBlindPosition = (dealerPos) => (dealerPos + 2) % 9;

  // Get current active player
  const getCurrentPlayer = () => {
    const activePlayer = players.find(player => player.isActive && !player.isFolded);
    if (activePlayer) {
      console.log(`Current active player: ${activePlayer.name} at position ${activePlayer.position}`);
    } else {
      console.log('No current active player found');
    }
    return activePlayer;
  };

  // Get remaining players count
  const getRemainingPlayersCount = () => {
    return players.filter(player => !player.isFolded).length;
  };

  // Check if hand is over (only one player remaining)
  const isHandOver = () => {
    return getRemainingPlayersCount() <= 1;
  };

  // Get the winning player (last remaining player)
  const getWinningPlayer = () => {
    const remainingPlayers = players.filter(player => !player.isFolded);
    return remainingPlayers.length === 1 ? remainingPlayers[0] : null;
  };

  // Helper function to find next active player position
  const getNextActivePlayerPosition = (currentPosition) => {
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

  // Helper function to find first active player clockwise from dealer (for post-flop)
  const getFirstActivePlayerFromDealer = (dealerPos = dealerPosition) => {
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

  // Check if betting round is complete
  const isBettingRoundComplete = () => {
    const activePlayers = players.filter(p => !p.isFolded);
    
    if (activePlayers.length <= 1) return true;
    
    // Find the highest bet amount
    const highestBet = Math.max(...activePlayers.map(p => p.proffered || 0));
    
    // Check if all active players have either:
    // 1. Matched the highest bet, or
    // 2. Are all-in with less than the highest bet
    const allPlayersActed = activePlayers.every(player => {
      const hasActed = player.lastAction !== null;
      const hasMatchedBet = player.proffered === highestBet;
      const isAllIn = player.chips === 0;
      
      return hasActed && (hasMatchedBet || isAllIn);
    });
    
    return allPlayersActed;
  };

  // Check if this is BB checking during their option (end of preflop)
  const isBigBlindCheckingOption = (activePlayer, actionType) => {
    if (actionType !== 'check' || currentStreet !== 'preflop') return false;
    
    const bigBlindPosition = getBigBlindPosition(dealerPosition);
    const playerIsBigBlind = activePlayer.position === bigBlindPosition;
    
    // BB checking their option when they face no raises
    return playerIsBigBlind && activePlayer.proffered === currentBet;
  };

  // Calculate initial pot from forced bets
  const calculateInitialPot = () => {
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

  // Clear all action badges (for new hand/street)
  const clearActionBadges = () => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        lastAction: null
      }))
    );
  };

  // Street progression
  const streetMap = {
    0: "preflop",
    1: "flop", 
    2: "turn",
    3: "river"
  };

  const streetNames = ["preflop", "flop", "turn", "river"];

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
    
    setCurrentStreet(nextStreet);
    
    // Reset betting for new street
    setCurrentBet(0);
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        proffered: 0,
        lastAction: null
      }))
    );
    
    // Create new betting round
    setCurrentBettingRound({
      id: currentBettingRound.id + 1,
      street: nextStreet,
      actions: [],
      cards: []
    });
    
    // Set first active player for new street (first active player clockwise from dealer)
    const firstActivePosition = getFirstActivePlayerFromDealer();
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        isActive: player.position === firstActivePosition && !player.isFolded
      }))
    );
    
    console.log(`Started ${nextStreet}, action on position ${firstActivePosition}`);
  };

  // Start recording a new hand
  const startNewHand = () => {
    console.log('Starting new hand');
    
    // Reset everything for new hand
    setCurrentStreet('preflop');
    setCurrentBet(bigBlind);
    setActionNumber(1);
    setRounds([]);
    clearActionBadges();
    
    // Create initial betting round
    setCurrentBettingRound({
      id: 0,
      street: "preflop",
      actions: [],
      cards: []
    });
    
    // Post forced bets and deduct from chip stacks
    const sbPos = getSmallBlindPosition(dealerPosition);
    const bbPos = getBigBlindPosition(dealerPosition);
    
    let nextActionNum = 1;
    
    // Update chip stacks for forced bets
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
        
        // Deduct small blind
        if (player.position === sbPos && smallBlind > 0) {
          newChips -= smallBlind;
          newProffered += smallBlind;
          newForcedBet = { type: 'SB', amount: smallBlind };
        }
        
        // Deduct big blind
        if (player.position === bbPos && bigBlind > 0) {
          newChips -= bigBlind;
          newProffered += bigBlind;
          newForcedBet = { type: 'BB', amount: bigBlind };
        }
        
        // Deduct ante
        if (ante > 0 && player.starting_stack > 0) {
          newChips -= ante;
          newProffered += ante;
          if (newForcedBet) {
            newForcedBet.ante = ante;
          } else {
            newForcedBet = { type: 'ANTE', amount: ante };
          }
        }
        
        // Deduct big blind ante
        if (isTournament && bigBlindAnte > 0 && player.position === bbPos) {
          newChips -= bigBlindAnte;
          newProffered += bigBlindAnte;
          if (newForcedBet) {
            newForcedBet.bbAnte = bigBlindAnte;
          } else {
            newForcedBet = { type: 'BB_ANTE', amount: bigBlindAnte };
          }
        }
        
        return {
          ...resetPlayer,
          chips: Math.max(0, newChips),
          proffered: newProffered,
          forcedBet: newForcedBet
        };
      })
    );

    // Set initial active player (UTG for preflop)
    const firstActivePosition = getActivePlayerPosition(dealerPosition);
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        isActive: player.position === firstActivePosition && !player.isFolded
      }))
    );

    // Set initial pot with forced bets
    setPot(calculateInitialPot());
  };

  // Auto-start recording when dealer button is moved
  useEffect(() => {
    if (dealerPosition !== null) {
      startNewHand();
    }
  }, [dealerPosition]);

  // Update player data
  const updatePlayer = (playerId, updates) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId ? { ...player, ...updates } : player
      )
    );
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
      // Find next player position before updating state
      const nextPlayerPosition = getNextActivePlayerPosition(activePlayer.position);
      
      // Start fold animation, mark as folded, add action badge, and move to next player
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
            // Hand is over, deactivate all players
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
      
      // Update pot and player's chip stack and proffered amount
      setPot(prev => prev + actionAmount);
      
      // Update current bet if this is a raise or bet
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
      // For check actions, just add the action badge
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === activePlayer.id 
            ? { ...player, lastAction: action }
            : player
        )
      );

      // Special case: BB checking their option ends preflop
      if (isBigBlindCheckingOption(activePlayer, action.type)) {
        console.log('BB checked their option - moving to flop');
        startNewStreet();
        return;
      }
    }

    // Check if betting round is complete after this action
    setTimeout(() => {
      if (isBettingRoundComplete()) {
        console.log('Betting round complete - moving to next street');
        startNewStreet();
      } else {
        // Move to next player
        moveToNextPlayer();
      }
    }, 100);
  };

  // Map action types to OHH format
  const mapActionTypeToOHH = (actionType) => {
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

  // Move to next active player
  const moveToNextPlayer = () => {
    setPlayers(prevPlayers => {
      const currentActiveIndex = prevPlayers.findIndex(player => player.isActive);
      if (currentActiveIndex === -1) return prevPlayers;

      // Find next non-folded player
      let nextPosition = (prevPlayers[currentActiveIndex].position + 1) % 9;
      let attempts = 0;
      
      // Keep looking for next active player (not folded)
      while (attempts < 9) {
        const nextPlayer = prevPlayers.find(p => p.position === nextPosition);
        if (nextPlayer && !nextPlayer.isFolded) {
          break;
        }
        nextPosition = (nextPosition + 1) % 9;
        attempts++;
      }
      
      return prevPlayers.map(player => ({
        ...player,
        isActive: player.position === nextPosition && !player.isFolded
      }));
    });
  };

  const saveCurrentHand = () => {
    // Create OHH format hand
    const hand = {
      spec_version: "1.4.6",
      network_name: networkName || "Live Game",
      site_name: siteName,
      game_type: "Holdem",
      table_name: "Live Table",
      table_size: 9,
      game_number: Date.now().toString(),
      start_date_utc: new Date().toISOString(),
      currency: "USD",
      ante_amount: ante,
      small_blind_amount: smallBlind,
      big_blind_amount: bigBlind,
      bet_limit: {
        bet_cap: 0,
        bet_type: "NL"
      },
      dealer_seat: dealerPosition + 1, // OHH uses 1-indexed seats
      hero_player_id: 1,
      players: players.map(player => ({
        name: player.name,
        id: player.id,
        player_bounty: 0,
        starting_stack: player.starting_stack,
        seat: player.position + 1 // OHH uses 1-indexed seats
      })),
      rounds: [...rounds, currentBettingRound],
      pots: [{
        number: 0,
        amount: pot,
        rake: 0,
        player_wins: getWinningPlayer() ? [{
          player_id: getWinningPlayer().id,
          win_amount: pot,
          contributed_rake: 0
        }] : []
      }]
    };
    
    console.log('Saving hand:', hand);
    
    saveHand(hand).then(() => {
      console.log('Hand saved successfully');
      // Reset for new hand
      startNewHand();
    }).catch(error => {
      console.error('Error saving hand:', error);
    });
  };

  // Handle dealer button drag
  const handleDealerDrag = (e) => {
    if (!isDragging) return;

    const tableContainer = document.querySelector('.poker-table-container');
    if (!tableContainer) return;

    const rect = tableContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX, clientY;
    if (e.type.includes('touch')) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle - 90 + 360) % 360;
    
    const newPosition = Math.round(angle / 40) % 9;
    
    if (newPosition !== dealerPosition) {
      setDealerPosition(newPosition);
    }
  };

  const handleDealerStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDealerEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Event listeners for dealer drag
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => handleDealerDrag(e);
      const handleEnd = (e) => handleDealerEnd(e);

      document.addEventListener('mousemove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, dealerPosition]);

  const getDealerButtonPosition = () => {
    const angle = (dealerPosition * 360) / 9 + 90;
    const radians = (angle * Math.PI) / 180;
    const radiusX = 140;
    const radiusY = 200;
    
    const x = Math.cos(radians) * radiusX;
    const y = Math.sin(radians) * radiusY;
    
    return {
      left: `calc(50% + ${x}px + 25px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)'
    };
  };

  const applyGameConfig = () => {
    setShowConfig(false);
  };

  return (
    <div className={`poker-wrapper ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Configuration Panel */}
      {showConfig && (
        <div className="config-panel">
          <div className="config-header">Game Configuration</div>
          
          <div className="config-group">
            <label>Small Blind:</label>
            <input
              type="number"
              value={smallBlind}
              onChange={(e) => setSmallBlind(Number(e.target.value))}
            />
          </div>
          
          <div className="config-group">
            <label>Big Blind:</label>
            <input
              type="number"
              value={bigBlind}
              onChange={(e) => setBigBlind(Number(e.target.value))}
            />
          </div>
          
          <div className="config-group">
            <label>Ante:</label>
            <input
              type="number"
              value={ante}
              onChange={(e) => setAnte(Number(e.target.value))}
            />
          </div>
          
          <div className="config-group">
            <label>Big Blind Ante:</label>
            <input
              type="number"
              value={bigBlindAnte}
              onChange={(e) => setBigBlindAnte(Number(e.target.value))}
            />
          </div>
          
          <div className="config-group">
            <label>
              <input
                type="checkbox"
                checked={isTournament}
                onChange={(e) => setIsTournament(e.target.checked)}
              />
              Tournament
            </label>
          </div>
          
          <button
            onClick={applyGameConfig}
            className="config-apply-btn"
          >
            Apply & Close
          </button>
        </div>
      )}

      {/* Main content wrapper */}
      <div className={`main-content ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
        {/* Table section */}
        <div className="table-section">
          {/* Settings button */}
          {!showConfig && (
            <button
              onClick={() => setShowConfig(true)}
              className="settings-btn"
            >
              ⚙️ Settings
            </button>
          )}

          <div className="poker-table-container">
            {/* Poker Table */}
            <div className="poker-table">
              <div className="table-felt"></div>
              <div className="table-edge"></div>
              
              <div className="pot-area">
                <div className="pot-label">POT</div>
                <div className="pot-amount">${pot}</div>
              </div>
              
              <div className="community-cards">
                {[1, 2, 3, 4, 5].map((card) => (
                  <div key={card} className="community-card">
                    <div className="community-card-placeholder">?</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Players */}
            {players.map((player, index) => (
              <HeroBox
                key={player.id}
                player={player}
                isHero={index === 0}
                isDealer={false}
                position={index}
                onPlayerUpdate={(updates) => updatePlayer(player.id, updates)}
              />
            ))}

            {/* Draggable dealer button */}
            <div 
              className={`draggable-dealer-button ${isDragging ? 'dragging' : ''}`}
              style={getDealerButtonPosition()}
              onMouseDown={handleDealerStart}
              onTouchStart={handleDealerStart}
            >
              D
            </div>
          </div>

          {/* Game info display */}
          <div className="game-info">
            {isTournament ? 'Tournament' : 'Cash Game'}<br/>
            SB: ${smallBlind} | BB: ${bigBlind}<br/>
            Street: {currentStreet}<br/>
            Players: {getRemainingPlayersCount()}
            {ante > 0 && <><br/>Ante: ${ante}</>}
            {isTournament && bigBlindAnte > 0 && <><br/>BB Ante: ${bigBlindAnte}</>}
          </div>
        </div>

        {/* Action section - responsive placement */}
        <div className={isMobile ? 'action-section-mobile' : 'action-section-desktop'}>
          <ActionBar
            dealerSeat={dealerPosition + 1}
            bigBlindAmount={bigBlind}
            currentPlayer={getCurrentPlayer()}
            currentBet={currentBet}
            currentStreet={currentStreet}
            playersInHand={players}
            onAction={handleAction}
            isHandOver={isHandOver()}
            winningPlayer={getWinningPlayer()}
            onSaveHand={saveCurrentHand}
          />
        </div>
      </div>
    </div>
  );
};

export default PokerTable;