import React, { useState } from 'react';
import './PokerTable.css';

const PokerTable = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Hero', chips: 1500, position: 0, isActive: true },
    { id: 2, name: 'Player 2', chips: 2300, position: 1, isActive: true },
    { id: 3, name: 'Player 3', chips: 1800, position: 2, isActive: false },
    { id: 4, name: 'Player 4', chips: 950, position: 3, isActive: true },
    { id: 5, name: 'Player 5', chips: 3200, position: 4, isActive: true },
    { id: 6, name: 'Player 6', chips: 1650, position: 5, isActive: true },
    { id: 7, name: 'Player 7', chips: 780, position: 6, isActive: false },
    { id: 8, name: 'Player 8', chips: 2100, position: 7, isActive: true },
    { id: 9, name: 'Player 9', chips: 1425, position: 8, isActive: true }
  ]);

  const [pot, setPot] = useState(0);
  const [dealerPosition, setDealerPosition] = useState(2);
  const [isDragging, setIsDragging] = useState(false);

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
  React.useEffect(() => {
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

  // Calculate position for each player around the oval
  const getPlayerPosition = (index) => {
    const angle = (index * 360) / 9 + 90; // Start from bottom, +90 degrees offset
    const radians = (angle * Math.PI) / 180;
    const radiusX = 140; // Horizontal radius
    const radiusY = 200; // Vertical radius (larger for oval)
    
    const x = Math.cos(radians) * radiusX;
    const y = Math.sin(radians) * radiusY;
    
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)'
    };
  };

  // Calculate dealer button position offset from player position
  const getDealerButtonPosition = (index) => {
    const playerPos = getPlayerPosition(index);
    
    // Start from center of player circle, then move directly right to edge
    const offsetX = 25; // Move right to the edge of the 28px radius circle (14px radius + some spacing)
    const offsetY = 0;  // No vertical offset
    
    return {
      left: `calc(${playerPos.left} + ${offsetX}px)`,
      top: `calc(${playerPos.top} + ${offsetY}px)`,
      transform: 'translate(-50%, -50%)'
    };
  };

  return (
    <div className="poker-container">
      <div className="poker-table-wrapper poker-table-container">
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

        {/* Players */}
        {players.map((player, index) => (
          <div
            key={player.id}
            className="player-position"
            style={getPlayerPosition(index)}
          >
            {/* Player circle */}
            <div className={`player-circle ${player.isActive ? 'active' : 'inactive'} ${index === 0 ? 'hero' : ''}`}>
              {/* Player avatar */}
              <div className="player-avatar">
                {player.name === 'You' ? '👤' : '🎭'}
              </div>
              
              {/* Chips indicator */}
              <div className="player-chips">
                ${player.chips}
              </div>
              
              {/* Player name */}
              <div className="player-name">
                {player.name}
              </div>
              
              {/* Action indicator */}
              {player.isActive && (
                <div className="action-indicator"></div>
              )}
            </div>
            
            {/* Player cards */}
            <div className="player-cards">
              <div className="player-card"></div>
              <div className="player-card"></div>
            </div>
          </div>
        ))}

        {/* Dealer button */}
        <div 
          className={`dealer-button ${isDragging ? 'dragging' : ''}`}
          style={getDealerButtonPosition(dealerPosition)}
          onMouseDown={handleDealerStart}
          onTouchStart={handleDealerStart}
        >
          D
        </div>
        
        {/* Action buttons for user */}
        <div className="action-buttons">
          <button className="action-button fold">
            Fold
          </button>
          <button className="action-button call">
            Call
          </button>
          <button className="action-button raise">
            Raise
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokerTable;