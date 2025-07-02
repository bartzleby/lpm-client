import React, { useState } from 'react';
import HeroBox from './HeroBox';
import './PokerTable.css';

const PokerTable = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'You', chips: 1500, position: 0, isActive: true, hand: [] },
    { id: 2, name: 'Player 2', chips: 2300, position: 1, isActive: true, hand: [] },
    { id: 3, name: 'Player 3', chips: 1800, position: 2, isActive: false, hand: [] },
    { id: 4, name: 'Player 4', chips: 950, position: 3, isActive: true, hand: [] },
    { id: 5, name: 'Player 5', chips: 3200, position: 4, isActive: true, hand: [] },
    { id: 6, name: 'Player 6', chips: 1650, position: 5, isActive: true, hand: [] },
    { id: 7, name: 'Player 7', chips: 780, position: 6, isActive: false, hand: [] },
    { id: 8, name: 'Player 8', chips: 2100, position: 7, isActive: true, hand: [] },
    { id: 9, name: 'Player 9', chips: 1425, position: 8, isActive: true, hand: [] }
  ]);

  const [pot, setPot] = useState(450);
  const [dealerPosition, setDealerPosition] = useState(2);
  const [isDragging, setIsDragging] = useState(false);

  // Update player data
  const updatePlayer = (playerId, updates) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId ? { ...player, ...updates } : player
      )
    );
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

  return (
    <div className="poker-wrapper">
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

        {/* Players using HeroBox component - Note: No dealer button here */}
        {players.map((player, index) => (
          <HeroBox
            key={player.id}
            player={player}
            isHero={index === 0}
            isDealer={false} // We don't show dealer in HeroBox since we have draggable
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