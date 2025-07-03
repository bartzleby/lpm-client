import React, { useState, useEffect } from 'react';
import HeroBox from './HeroBox';
import ActionBar from './ActionBar';
import { Hand } from './Hand';
import './PokerTable.css';

const PokerTable = () => {
  // Hand recording state
  const [currentHand, setCurrentHand] = useState(null);
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [handHistory, setHandHistory] = useState([]);

  // Players state
  const [players, setPlayers] = useState([
    { id: 1, name: 'Hero', chips: 1500, position: 0, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false },
    { id: 2, name: 'Player 2', chips: 2300, position: 1, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false },
    { id: 3, name: 'Player 3', chips: 1800, position: 2, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false },
    { id: 4, name: 'Player 4', chips: 950, position: 3, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false },
    { id: 5, name: 'Player 5', chips: 3200, position: 4, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false },
    { id: 6, name: 'Player 6', chips: 1650, position: 5, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false },
    { id: 7, name: 'Player 7', chips: 780, position: 6, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false },
    { id: 8, name: 'Player 8', chips: 2100, position: 7, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false },
    { id: 9, name: 'Player 9', chips: 1425, position: 8, isActive: false, hand: [], forcedBet: null, isFolded: false, isAnimatingFold: false }
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
  const [showExport, setShowExport] = useState(false);

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
    return (dealerPos + 3) % 9;
  };

  const getSmallBlindPosition = (dealerPos) => (dealerPos + 1) % 9;
  const getBigBlindPosition = (dealerPos) => (dealerPos + 2) % 9;

  // Get current active player
  const getCurrentPlayer = () => {
    return players.find(player => player.isActive && !player.isFolded);
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

  // Calculate initial pot from forced bets
  const calculateInitialPot = () => {
    let totalPot = 0;
    
    // Add small blind and big blind
    totalPot += smallBlind + bigBlind;
    
    // Add antes (one ante per player)
    const activePlayers = players.filter(player => player.chips > 0);
    totalPot += ante * activePlayers.length;
    
    // Add big blind ante if tournament
    if (isTournament && bigBlindAnte > 0) {
      totalPot += bigBlindAnte;
    }
    
    return totalPot;
  };

  // Start recording a new hand
  const startNewHand = () => {
    const hand = new Hand();
    
    // Set game info
    hand.tableName = "Live Game Table 1";
    hand.gameType = "NLH";
    hand.smallBlind = smallBlind;
    hand.bigBlind = bigBlind;
    hand.ante = ante;
    hand.bigBlindAnte = bigBlindAnte;
    hand.tableSize = 9;
    
    // Add active players to hand
    players.forEach(player => {
      if (player.chips > 0) {
        hand.addPlayer(player.name, player.position + 1, player.chips);
      }
    });
    
    // Set hero and dealer
    hand.setHero('Hero');
    hand.setDealerSeat(dealerPosition + 1);
    
    // Post forced bets and deduct from chip stacks
    const sbPos = getSmallBlindPosition(dealerPosition);
    const bbPos = getBigBlindPosition(dealerPosition);
    
    const sbPlayer = players.find(p => p.position === sbPos);
    const bbPlayer = players.find(p => p.position === bbPos);
    
    // Update chip stacks for forced bets
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        let newChips = player.chips;
        
        // Deduct small blind
        if (player.position === sbPos && smallBlind > 0) {
          newChips -= smallBlind;
        }
        
        // Deduct big blind
        if (player.position === bbPos && bigBlind > 0) {
          newChips -= bigBlind;
        }
        
        // Deduct ante
        if (ante > 0 && player.chips > 0) {
          newChips -= ante;
        }
        
        // Deduct big blind ante
        if (isTournament && bigBlindAnte > 0 && player.position === bbPos) {
          newChips -= bigBlindAnte;
        }
        
        return {
          ...player,
          chips: Math.max(0, newChips),
          isFolded: false,
          isAnimatingFold: false
        };
      })
    );
    
    if (sbPlayer && smallBlind > 0) {
      hand.postSmallBlind(sbPlayer.name);
    }
    if (bbPlayer && bigBlind > 0) {
      hand.postBigBlind(bbPlayer.name);
      if (isTournament && bigBlindAnte > 0) {
        hand.postBigBlindAnte(bbPlayer.name);
      }
    }
    
    // Post antes if applicable
    if (ante > 0) {
      players.forEach(player => {
        if (player.chips > 0) {
          hand.postAnte(player.name);
        }
      });
    }
    
    setCurrentHand(hand);
    setRecordingStarted(true);
  };

  // Auto-start recording when dealer button is moved
  useEffect(() => {
    if (!recordingStarted && dealerPosition !== null) {
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

  // Update active player and forced bets
  useEffect(() => {
    const activePosition = getActivePlayerPosition(dealerPosition);
    const sbPosition = getSmallBlindPosition(dealerPosition);
    const bbPosition = getBigBlindPosition(dealerPosition);
    
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        let forcedBet = null;
        
        if (player.position === sbPosition && smallBlind > 0) {
          forcedBet = { type: 'SB', amount: smallBlind };
        } else if (player.position === bbPosition && bigBlind > 0) {
          forcedBet = { type: 'BB', amount: bigBlind };
        }
        
        if (ante > 0) {
          if (forcedBet) {
            forcedBet.ante = ante;
          } else {
            forcedBet = { type: 'ANTE', amount: ante };
          }
        }
        
        if (isTournament && bigBlindAnte > 0 && player.position === bbPosition) {
          if (forcedBet) {
            forcedBet.bbAnte = bigBlindAnte;
          } else {
            forcedBet = { type: 'BB_ANTE', amount: bigBlindAnte };
          }
        }
        
        return {
          ...player,
          isActive: player.position === activePosition && !player.isFolded,
          forcedBet
        };
      })
    );
    
    // Set initial pot with forced bets
    setPot(calculateInitialPot());
  }, [dealerPosition, smallBlind, bigBlind, ante, bigBlindAnte, isTournament]);

  // Handle action buttons
  const handleAction = (actionType, amount = null) => {
    if (!currentHand || !recordingStarted) {
      alert('Please start recording a hand first');
      return;
    }

    const activePlayer = players.find(p => p.isActive && !p.isFolded);
    if (!activePlayer) return;

    // Record action in hand
    currentHand.addAction(activePlayer.name, actionType, amount);

    // Handle fold action
    if (actionType === 'fold') {
      // Find next player position before updating state
      const nextPlayerPosition = getNextActivePlayerPosition(activePlayer.position);
      
      // Start fold animation, mark as folded, and move to next player all at once
      setPlayers(prevPlayers => 
        prevPlayers.map(player => {
          if (player.id === activePlayer.id) {
            return { ...player, isAnimatingFold: true, isActive: false };
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
    if (actionType === 'call' || actionType === 'raise' || actionType === 'bet') {
      const actionAmount = amount || 0;
      
      // Update pot and player's chip stack
      setPot(prev => prev + actionAmount);
      
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === activePlayer.id 
            ? { ...player, chips: Math.max(0, player.chips - actionAmount) }
            : player
        )
      );
    }

    // Move to next player for all other actions
    moveToNextPlayer();
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

  // Export hand history
  const exportHand = () => {
    if (!currentHand) return;
    
    const validation = currentHand.validate();
    if (!validation.valid) {
      alert('Hand validation failed: ' + validation.errors.join(', '));
      return;
    }

    const handJson = currentHand.toJSON();
    const blob = new Blob([JSON.stringify(handJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hand_${currentHand.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Add to history
    setHandHistory(prev => [...prev, currentHand]);
    
    // Reset for new hand
    setCurrentHand(null);
    setRecordingStarted(false);
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
            onClick={() => setShowConfig(false)}
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

          {/* Recording controls */}
          <div className="recording-controls">
            {recordingStarted && currentHand ? (
              <>
                <span className="recording-status">Recording Hand #{handHistory.length + 1}</span>
                <button 
                  onClick={exportHand}
                  className="save-hand-btn"
                >
                  💾 Save Hand
                </button>
                <button 
                  onClick={() => {
                    setCurrentHand(null);
                    setRecordingStarted(false);
                  }}
                  className="cancel-hand-btn"
                >
                  ✕ Cancel
                </button>
              </>
            ) : (
              <span className="recording-hint">Move dealer button to start recording</span>
            )}
          </div>

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
            Players: {getRemainingPlayersCount()}
            {ante > 0 && <><br/>Ante: ${ante}</>}
            {isTournament && bigBlindAnte > 0 && <><br/>BB Ante: ${bigBlindAnte}</>}
          </div>
        </div>

        {/* Action section - responsive placement */}
        <div className={isMobile ? 'action-section-mobile' : 'action-section-desktop'}>
          <ActionBar
            hand={currentHand}
            currentPlayer={getCurrentPlayer()}
            onAction={handleAction}
            pot={pot}
            bigBlind={bigBlind}
            smallBlind={smallBlind}
            isHandOver={isHandOver()}
            winningPlayer={getWinningPlayer()}
            onSaveHand={exportHand}
          />
        </div>
      </div>
    </div>
  );
};

export default PokerTable;