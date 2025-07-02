import React, { useState, useEffect } from 'react';
import HeroBox from './HeroBox';
import './PokerTable.css';

const PokerTable = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'You', chips: 1500, position: 0, isActive: false, hand: [], forcedBet: null },
    { id: 2, name: 'Player 2', chips: 2300, position: 1, isActive: false, hand: [], forcedBet: null },
    { id: 3, name: 'Player 3', chips: 1800, position: 2, isActive: false, hand: [], forcedBet: null },
    { id: 4, name: 'Player 4', chips: 950, position: 3, isActive: false, hand: [], forcedBet: null },
    { id: 5, name: 'Player 5', chips: 3200, position: 4, isActive: false, hand: [], forcedBet: null },
    { id: 6, name: 'Player 6', chips: 1650, position: 5, isActive: false, hand: [], forcedBet: null },
    { id: 7, name: 'Player 7', chips: 780, position: 6, isActive: false, hand: [], forcedBet: null },
    { id: 8, name: 'Player 8', chips: 2100, position: 7, isActive: false, hand: [], forcedBet: null },
    { id: 9, name: 'Player 9', chips: 1425, position: 8, isActive: false, hand: [], forcedBet: null }
  ]);

  const [pot, setPot] = useState(0);
  const [dealerPosition, setDealerPosition] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  
  // Betting configuration
  const [smallBlind, setSmallBlind] = useState(25);
  const [bigBlind, setBigBlind] = useState(50);
  const [ante, setAnte] = useState(0);
  const [bigBlindAnte, setBigBlindAnte] = useState(0);
  const [isTournament, setIsTournament] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  // Calculate which player should be active (3 positions clockwise from dealer)
  const getActivePlayerPosition = (dealerPos) => {
    return (dealerPos + 3) % 9;
  };

  // Calculate forced bet positions
  const getSmallBlindPosition = (dealerPos) => (dealerPos + 1) % 9;
  const getBigBlindPosition = (dealerPos) => (dealerPos + 2) % 9;

  // Update active player and forced bets when dealer position or betting config changes
  useEffect(() => {
    const activePosition = getActivePlayerPosition(dealerPosition);
    const sbPosition = getSmallBlindPosition(dealerPosition);
    const bbPosition = getBigBlindPosition(dealerPosition);
    
    // Calculate total pot from forced bets
    let totalPot = 0;
    
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        let forcedBet = null;
        
        // Assign forced bets
        if (player.position === sbPosition && smallBlind > 0) {
          forcedBet = { type: 'SB', amount: smallBlind };
          totalPot += smallBlind;
        } else if (player.position === bbPosition && bigBlind > 0) {
          forcedBet = { type: 'BB', amount: bigBlind };
          totalPot += bigBlind;
        }
        
        // Add ante if applicable
        if (ante > 0) {
          if (forcedBet) {
            forcedBet.ante = ante;
          } else {
            forcedBet = { type: 'ANTE', amount: ante };
          }
          totalPot += ante;
        }
        
        // Add big blind ante if tournament and this is BB position
        if (isTournament && bigBlindAnte > 0 && player.position === bbPosition) {
          if (forcedBet) {
            forcedBet.bbAnte = bigBlindAnte;
          } else {
            forcedBet = { type: 'BB_ANTE', amount: bigBlindAnte };
          }
          totalPot += bigBlindAnte;
        }
        
        return {
          ...player,
          isActive: player.position === activePosition,
          forcedBet
        };
      })
    );
    
    setPot(totalPot);
  }, [dealerPosition, smallBlind, bigBlind, ante, bigBlindAnte, isTournament]);

  // Update player data
  const updatePlayer = (playerId, updates) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId ? { ...player, ...updates } : player
      )
    );
  };

  // Move to next active player
  const moveToNextPlayer = () => {
    setPlayers(prevPlayers => {
      const currentActiveIndex = prevPlayers.findIndex(player => player.isActive);
      if (currentActiveIndex === -1) return prevPlayers;

      // Find next player position (clockwise)
      const nextPosition = (prevPlayers[currentActiveIndex].position + 1) % 9;
      
      return prevPlayers.map(player => ({
        ...player,
        isActive: player.position === nextPosition
      }));
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
    
    // Calculate angle from center to mouse/touch position
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Adjust angle to match our player positioning (starting from bottom going clockwise)
    angle = (angle - 90 + 360) % 360;
    
    // Convert to player position (9 positions around the table)
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

  // Add event listeners for mouse/touch move and up
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

  // Calculate dealer button position (for draggable dealer button)
  const getDealerButtonPosition = () => {
    const angle = (dealerPosition * 360) / 9 + 90;
    const radians = (angle * Math.PI) / 180;
    const radiusX = 140;
    const radiusY = 200;
    
    const x = Math.cos(radians) * radiusX;
    const y = Math.sin(radians) * radiusY;
    
    return {
      left: `calc(50% + ${x}px + 25px)`, // Offset to right of player
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)'
    };
  };

  // Handle action buttons - move to next player after action
  const handleAction = (action) => {
    console.log(`Player performed action: ${action}`);
    // Move to next player after action
    moveToNextPlayer();
  };

  return (
    <div className="poker-wrapper" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      touchAction: 'none'
    }}>
      {/* Configuration Panel */}
      {showConfig && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 100,
          minWidth: '200px'
        }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Game Configuration</div>
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Small Blind:</label>
            <input
              type="number"
              value={smallBlind}
              onChange={(e) => setSmallBlind(Number(e.target.value))}
              style={{ width: '80px', padding: '2px 4px', color: 'black' }}
            />
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Big Blind:</label>
            <input
              type="number"
              value={bigBlind}
              onChange={(e) => setBigBlind(Number(e.target.value))}
              style={{ width: '80px', padding: '2px 4px', color: 'black' }}
            />
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Ante:</label>
            <input
              type="number"
              value={ante}
              onChange={(e) => setAnte(Number(e.target.value))}
              style={{ width: '80px', padding: '2px 4px', color: 'black' }}
            />
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Big Blind Ante:</label>
            <input
              type="number"
              value={bigBlindAnte}
              onChange={(e) => setBigBlindAnte(Number(e.target.value))}
              style={{ width: '80px', padding: '2px 4px', color: 'black' }}
            />
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Apply & Close
          </button>
        </div>
      )}

      {/* Settings button to reopen config */}
      {!showConfig && (
        <button
          onClick={() => setShowConfig(true)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#374151',
            color: 'white',
            border: '1px solid #6b7280',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 100
          }}
        >
          ⚙️ Settings
        </button>
      )}

      <div className="poker-table-container">
        {/* Poker Table */}
        <div className="poker-table">
          {/* Table felt pattern */}
          <div className="table-felt"></div>
          
          {/* Table edge highlight */}
          <div className="table-edge"></div>
          
          {/* Center pot area */}
          <div className="pot-area">
            <div className="pot-label">POT</div>
            <div className="pot-amount">${pot}</div>
          </div>
          
          {/* Community cards area */}
          <div className="community-cards">
            {[1, 2, 3, 4, 5].map((card) => (
              <div key={card} className="community-card">
                <div className="community-card-placeholder">?</div>
              </div>
            ))}
          </div>
        </div>

        {/* Players using HeroBox component */}
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
        
        {/* Action buttons section - moved below players */}
        <div className="action-section">
          <div className="active-player-display">
            Action: {players.find(p => p.isActive)?.name || 'None'}
          </div>
          <div className="action-buttons">
            <button 
              className="action-button fold"
              onClick={() => handleAction('fold')}
            >
              Fold
            </button>
            <button 
              className="action-button call"
              onClick={() => handleAction('call')}
            >
              Call
            </button>
            <button 
              className="action-button raise"
              onClick={() => handleAction('raise')}
            >
              Raise
            </button>
          </div>
        </div>
        
        {/* Game info display */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          color: 'white',
          fontSize: '12px',
          background: 'rgba(0,0,0,0.7)',
          padding: '5px',
          borderRadius: '3px',
          textAlign: 'right'
        }}>
          {isTournament ? 'Tournament' : 'Cash Game'}<br/>
          SB: ${smallBlind} | BB: ${bigBlind}
          {ante > 0 && <><br/>Ante: ${ante}</>}
          {isTournament && bigBlindAnte > 0 && <><br/>BB Ante: ${bigBlindAnte}</>}
        </div>
      </div>
    </div>
  );
};

export default PokerTable;