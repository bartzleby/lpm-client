import React, { useState } from 'react';

const PokerTable = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'You', chips: 1500, position: 0, isActive: true },
    { id: 2, name: 'Player 2', chips: 2300, position: 1, isActive: true },
    { id: 3, name: 'Player 3', chips: 1800, position: 2, isActive: false },
    { id: 4, name: 'Player 4', chips: 950, position: 3, isActive: true },
    { id: 5, name: 'Player 5', chips: 3200, position: 4, isActive: true },
    { id: 6, name: 'Player 6', chips: 1650, position: 5, isActive: true },
    { id: 7, name: 'Player 7', chips: 780, position: 6, isActive: false },
    { id: 8, name: 'Player 8', chips: 2100, position: 7, isActive: true },
    { id: 9, name: 'Player 9', chips: 1425, position: 8, isActive: true }
  ]);

  const [pot, setPot] = useState(450);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm mx-auto aspect-[3/4] poker-table-container">
        {/* Poker Table */}
        <div className="absolute inset-4 bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-full shadow-2xl border-8 border-stone-600">
          {/* Table felt pattern */}
          <div className="absolute inset-2 bg-emerald-700 rounded-full opacity-90"></div>
          
          {/* Table edge highlight */}
          <div className="absolute inset-1 border-2 border-stone-500 rounded-full opacity-60"></div>
          
          {/* Center pot area */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-900 rounded-full w-20 h-16 border-2 border-stone-600 flex flex-col items-center justify-center shadow-inner">
            <div className="text-stone-300 text-xs font-bold">POT</div>
            <div className="text-white text-sm font-bold">${pot}</div>
          </div>
          
          {/* Community cards area */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-y-8 flex space-x-1">
            {[1, 2, 3, 4, 5].map((card) => (
              <div 
                key={card} 
                className="w-6 h-8 bg-white border border-gray-300 rounded-sm shadow-md flex items-center justify-center"
              >
                <div className="text-xs text-gray-400">?</div>
              </div>
            ))}
          </div>
        </div>

        {/* Players */}
        {players.map((player, index) => (
          <div
            key={player.id}
            className="absolute"
            style={getPlayerPosition(index)}
          >
            {/* Player circle */}
            <div className={`
              w-14 h-14 rounded-full border-4 flex flex-col items-center justify-center text-center relative
              ${player.isActive 
                ? 'bg-slate-600 border-slate-400 shadow-lg shadow-slate-500/30' 
                : 'bg-slate-700 border-slate-500'
              }
              ${index === 0 ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
            `}>
              {/* Player avatar */}
              <div className="text-white text-xs font-bold mb-1">
                {player.name === 'You' ? '👤' : '🎭'}
              </div>
              
              {/* Chips indicator */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-stone-600 text-white text-xs px-1 py-0.5 rounded-full border border-stone-500 min-w-max">
                ${player.chips}
              </div>
              
              {/* Player name */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-xs font-semibold whitespace-nowrap bg-black bg-opacity-50 px-1 rounded">
                {player.name}
              </div>
              
              {/* Action indicator */}
              {player.isActive && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </div>
            
            {/* Player cards */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-4 h-6 bg-red-600 border border-red-700 rounded-sm shadow-sm"></div>
              <div className="w-4 h-6 bg-red-600 border border-red-700 rounded-sm shadow-sm"></div>
            </div>
          </div>
        ))}

        {/* Dealer button */}
        <div 
          className={`absolute w-6 h-6 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-xs font-bold shadow-lg cursor-pointer select-none transition-transform duration-150 ${isDragging ? 'scale-110 shadow-xl z-50' : 'hover:scale-105'}`}
          style={getDealerButtonPosition(dealerPosition)}
          onMouseDown={handleDealerStart}
          onTouchStart={handleDealerStart}
        >
          D
        </div>
        
        {/* Action buttons for user */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-colors">
            Fold
          </button>
          <button className="bg-stone-600 hover:bg-stone-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-colors">
            Call
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-colors">
            Raise
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokerTable;